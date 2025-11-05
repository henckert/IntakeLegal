import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { ENV } from './env.js';
import formsRouter from './routes/forms.js';
import intakeRouter from './routes/intake.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
app.use(
  cors({
    origin: ENV.APP_BASE_URL,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '2mb' }));

// Attach Clerk auth context if keys provided; otherwise noop
if (ENV.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware({ secretKey: ENV.CLERK_SECRET_KEY, publishableKey: ENV.CLERK_PUBLISHABLE_KEY } as any));
}

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

// Protect firm-side routes when Clerk is configured
const protectedOnly = ENV.CLERK_SECRET_KEY ? requireAuth() : (_req: any, _res: any, next: any) => next();
app.use(['/api/forms', '/api/forms/*', '/api/dashboard', '/api/dashboard/*', '/api/intakes', '/api/intakes/*'], protectedOnly);

app.use(formsRouter);
app.use(intakeRouter);
app.use(dashboardRouter);

process.on('unhandledRejection', (r) => console.error('UNHANDLED_REJECTION', r));
process.on('uncaughtException', (e) => console.error('UNCAUGHT_EXCEPTION', e));

const port = Number(new URL(ENV.SERVER_BASE_URL).port || process.env.PORT || 4000);
app.listen(port, '0.0.0.0', () => {
  console.log(`[server] listening on http://0.0.0.0:${port}`);
});
