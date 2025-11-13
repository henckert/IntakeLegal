const DEV = process.env.NODE_ENV !== 'production';
const STARTUP_TIMEOUT = 15_000; // 15s max for startup async tasks
const startupTimer = Date.now();

let httpServer: any = null;

// Graceful shutdown handler
function gracefulShutdown(signal: string) {
  console.log(`[server] Received ${signal}, starting graceful shutdown...`);
  if (httpServer) {
    httpServer.close(() => {
      console.log('[server] HTTP server closed');
      process.exit(0);
    });
    // Force exit after 5 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('[server] Forced shutdown after timeout');
      process.exit(1);
    }, 5000);
  } else {
    process.exit(0);
  }
}

process.on('unhandledRejection', (r) => console.error('UNHANDLED_REJECTION', r));
process.on('uncaughtException', (e) => console.error('UNCAUGHT_EXCEPTION', e));
process.on('beforeExit', (code) => console.error('[server] BEFORE_EXIT', code));
process.on('exit', (code) => console.error('[server] EXIT', code));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Single keep-alive to prevent event-loop drain during debug
if (DEV) setInterval(() => {}, 1 << 30);

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { ENV } from './env.js';
import formsRouter from './routes/forms.js';
import intakeRouter from './routes/intake.js';
import dashboardRouter from './routes/dashboard.js';
import uploadsRouter from './routes/uploads.js';
import consentRouter from './routes/consent.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { getCommitHash } from './lib/version.js';
import { getSolDefaultVersion, DISCLAIMER_VERSION } from './services/sol.js';
import { getPromptVersion } from './services/ai.js';

const app = express();

// CORS: Allow both production APP_BASE_URL and localhost:3000 for dev
const allowedOrigins = [
  ENV.APP_BASE_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

// Rate limiting for uploads (10 requests per 15 minutes per IP)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many upload requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// JSON middleware FIRST and permissive (must be before routes)
app.use(express.json({ type: ['application/json', 'application/*+json'], limit: '1mb' }));
// Attach X-Request-Id for correlation
app.use(requestIdMiddleware);


app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    commit: getCommitHash(),
    sol: { defaultVersion: getSolDefaultVersion(), disclaimerVersion: DISCLAIMER_VERSION },
    ai: { promptVersion: getPromptVersion() },
  });
});

// Debug endpoint to show active handles (timers, sockets, etc.)
if (DEV) {
  app.get('/__debug/handles', (_req, res) => {
    const handles = (process as any)._getActiveHandles?.() || [];
    const requests = (process as any)._getActiveRequests?.() || [];
    res.json({
      handles: handles.map((h: any) => ({
        type: h.constructor?.name || 'Unknown',
        // Safe snapshot of handle metadata
        ...( h.address ? { address: h.address() } : {}),
      })),
      requests: requests.map((r: any) => r.constructor?.name || 'Unknown'),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  });
}

// Mount public routes first (health + public intake + uploads with rate limiting)
app.use(intakeRouter);
app.use('/api/uploads', uploadLimiter, uploadsRouter);
app.use(consentRouter);

// Dynamically load Clerk only when configured to avoid startup crashes when deps/env missing.
// Then mount protected firm routes (forms & dashboard) accordingly.
// IMPORTANT: no top-level await; wrap in timeout and invoke async.
function mountProtectedRoutes() {
  const hasClerk = !!ENV.CLERK_SECRET_KEY && !!ENV.CLERK_PUBLISHABLE_KEY;
  if (!hasClerk) {
    console.warn('[clerk] disabled (env missing)');
    // mount unprotected versions (no auth) so dev flows still work
    app.use(formsRouter);
    app.use(dashboardRouter);
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      console.error('[clerk] import timeout; mounting without auth');
      app.use(formsRouter);
      app.use(dashboardRouter);
      resolve();
    }, STARTUP_TIMEOUT);

    import('@clerk/express')
      .then((clerk) => {
        clearTimeout(timeout);
        console.log('[clerk] loaded successfully');
        app.use(clerk.clerkMiddleware({ secretKey: ENV.CLERK_SECRET_KEY, publishableKey: ENV.CLERK_PUBLISHABLE_KEY } as any));
        const protectedOnly = clerk.requireAuth();
        app.use(['/api/forms', '/api/forms/*', '/api/dashboard', '/api/dashboard/*', '/api/intakes', '/api/intakes/*'], protectedOnly);
        app.use(formsRouter);
        app.use(dashboardRouter);
        resolve();
      })
      .catch((e) => {
        clearTimeout(timeout);
        console.warn('[clerk] disabled due to import/init error:', e);
        // fallback: mount without auth so the server remains reachable
        app.use(formsRouter);
        app.use(dashboardRouter);
        resolve();
      });
  });
}

// Mount protected routes asynchronously (NO top-level await to avoid stalls)
mountProtectedRoutes().then(() => {
  const elapsed = Date.now() - startupTimer;
  console.log(`[server] route mounting complete (${elapsed}ms)`);
});

// Fallback error handler with friendly JSON parse error messages
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('EXPRESS_ERROR', err);
  
  // Detect body-parser JSON errors (SyntaxError from JSON.parse)
  const isSyntax = err instanceof SyntaxError && 'status' in err && ((err as any).status === 400 || (err as any).statusCode === 400);
  const parseFailed = (err?.type === 'entity.parse.failed') || isSyntax;
  
  if (parseFailed) {
    const detail = (err?.body && typeof err.body === 'string') ? err.body.slice(0, 500) : undefined;
    return res.status(400).json({
      error: 'Bad JSON',
      hint: 'Your client sent invalid JSON. In PowerShell, avoid inline curl JSON; use a file (-d "@file.json") or ConvertTo-Json with Invoke-RestMethod.',
      detail
    });
  }
  
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({ error: 'Internal Server Error', detail: String(err?.message || err) });
});

function resolvePort(): number {
  try {
    const url = new URL(ENV.SERVER_BASE_URL || 'http://localhost:4000');
    const p = Number(url.port);
    if (!Number.isNaN(p) && p > 0) return p;
  } catch {/* ignore */}
  const envP = Number(process.env.PORT);
  if (!Number.isNaN(envP) && envP > 0) return envP;
  return 4000;
}

async function attemptListen(startPort: number, maxAttempts = 10): Promise<{ server: any; port: number }> {
  return new Promise((resolve) => {
    let port = startPort;
    let attempts = 0;
    const tryStart = () => {
      const srv = app.listen(port, '0.0.0.0');
      // Timeouts / diagnostics
      srv.keepAliveTimeout = 60_000;
      try { (srv as any).headersTimeout = 65_000; } catch {}
      try { (srv as any).requestTimeout = 60_000; } catch {}

      const onError = (err: any) => {
        const code = err?.code || err?.message || String(err);
        console.error('[server] ERROR on listen', code, 'port=', port);
        if (code === 'EADDRINUSE' && attempts < maxAttempts) {
          attempts += 1;
          port += 1;
          console.warn(`[server] Port in use, retrying on :${port} (attempt ${attempts}/${maxAttempts})`);
          setTimeout(tryStart, 250);
        } else {
          // Resolve anyway so the process doesn't die silently
          resolve({ server: srv, port });
        }
      };
      srv.once('error', onError);
      srv.once('listening', () => {
        const addr = srv.address();
        console.log('[server] listening', addr);
        resolve({ server: srv, port });
      });
      srv.on('close', () => {
        console.error('[server] CLOSED');
      });
    };
    tryStart();
  });
}

const initialPort = resolvePort();

// IIFE to avoid top-level await and prevent startup stalls
(async () => {
  const { server, port } = await attemptListen(initialPort);
  httpServer = server; // Store for graceful shutdown
  const elapsed = Date.now() - startupTimer;
  console.log(`[server] startup complete in ${elapsed}ms on :${port}`);
  
  if (elapsed > STARTUP_TIMEOUT) {
    console.warn(`[server] SLOW_START detected (${elapsed}ms > ${STARTUP_TIMEOUT}ms threshold)`);
  }
})();
