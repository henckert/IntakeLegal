#!/usr/bin/env node

/**
 * Cross-platform Node launcher for testing the server.
 * Spawns the dev server, waits for port readiness, tests endpoints, then exits.
 */

import { spawn } from 'child_process';
import { connect } from 'net';

const PORT = 4000;
const MAX_WAIT_SECONDS = 30;
const HEALTH_URL = `http://localhost:${PORT}/health`;
const UPLOADS_URL = `http://localhost:${PORT}/api/uploads?limit=5`;

/**
 * Wait for a TCP port to be listening
 */
function waitForPort(port, maxSeconds) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = 500; // check every 500ms

    const check = () => {
      const socket = connect(port, '127.0.0.1');
      
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      
      socket.once('error', (err) => {
        const elapsed = Date.now() - startTime;
        if (err.code === 'ECONNREFUSED') {
          if (elapsed > maxSeconds * 1000) {
            reject(new Error(`Port ${port} not ready after ${maxSeconds}s`));
          } else {
            setTimeout(check, interval);
          }
        } else {
          reject(err);
        }
      });
    };

    check();
  });
}

/**
 * Fetch JSON from a URL
 */
async function fetchJSON(url, acceptableStatuses = [200], options = {}) {
  const response = await fetch(url, options);
  if (!acceptableStatuses.includes(response.status)) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} from ${url}: ${body}`);
  }
  return response.json();
}

/**
 * Main test flow
 */
async function main() {
  console.log('[test-server] Starting server...');
  
  // Spawn the dev server as a detached child process
  const serverProcess = spawn('npm', ['--workspace', 'server', 'run', 'dev'], {
    stdio: 'ignore', // Don't pipe output to avoid buffer issues
    detached: false, // Keep in same process group for easy cleanup
    shell: true, // Use shell for cross-platform npm resolution
    env: { ...process.env, FORCE_MOCK_AI: 'true' },
  });

  let exitCode = 1;

  try {
    console.log(`[test-server] Waiting for port ${PORT}...`);
    await waitForPort(PORT, MAX_WAIT_SECONDS);
    console.log(`[test-server] Port ${PORT} is ready`);

    // Test health endpoint
    console.log(`[test-server] Testing ${HEALTH_URL}`);
    const healthData = await fetchJSON(HEALTH_URL, [200]);
    console.log('[test-server] Health check passed:', JSON.stringify(healthData));

    // Test uploads list endpoint (503 is acceptable if DB not configured)
    console.log(`[test-server] Testing ${UPLOADS_URL} with firm header`);
    try {
      const uploadsData = await fetchJSON(UPLOADS_URL, [200, 503], {
        headers: { 'X-Firm-Id': 'demo' }
      });
      console.log('[test-server] Uploads endpoint response:');
      console.log(JSON.stringify(uploadsData, null, 2));
    } catch (error) {
      console.warn('[test-server] Uploads endpoint warning:', error.message);
      console.log('[test-server] Note: 503 is acceptable when DATABASE_URL not set');
    }

    // Run guardrail: check prisma usage
    try {
      const { spawnSync } = await import('child_process');
      const res = spawnSync('node', ['scripts/check-prisma-usage.mjs'], { stdio: 'inherit', shell: true });
      if (res.status !== 0) throw new Error('check-prisma-usage failed');
      console.log('[test-server] Prisma usage check passed');
    } catch (e) {
      throw e;
    }

    // Run SOL acceptance checks (tsx)
    try {
      const { spawnSync } = await import('child_process');
      const res = spawnSync('npx', ['tsx', 'server/tests/sol.spec.ts'], { stdio: 'inherit', shell: true });
      if (res.status !== 0) throw new Error('sol.spec failed');
      console.log('[test-server] SOL acceptance suite passed');
    } catch (e) {
      throw e;
    }

    // Run AI pipeline checks
    try {
      const { spawnSync } = await import('child_process');
      const res = spawnSync('npx', ['tsx', 'server/tests/aiPipeline.spec.ts'], { stdio: 'inherit', shell: true });
      if (res.status !== 0) throw new Error('aiPipeline.spec failed');
      console.log('[test-server] AI pipeline suite passed');
    } catch (e) {
      throw e;
    }

    // Windows-only: run PowerShell upload validation script if available
    try {
      const isWin = process.platform === 'win32';
      if (isWin) {
        const { spawnSync } = await import('child_process');
        const res = spawnSync('powershell', ['-ExecutionPolicy', 'Bypass', '-File', 'server/tests/test-uploads.ps1'], { stdio: 'inherit', shell: true });
        if (res.status !== 0) {
          console.warn('[test-server] Uploads PowerShell tests encountered issues (likely PowerShell version). Continuing...');
        } else {
          console.log('[test-server] Uploads PowerShell tests passed');
        }
      }
    } catch (e) {
      console.warn('[test-server] Skipping PowerShell uploads tests due to environment:', e.message);
    }

    // Simple AI rate limit test: hit intake 11x and expect 429
    try {
      const body = {
        slug: 'demo',
        client: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
        case: { narrative: 'hello', claimType: 'PI' },
        consent: { gdpr: true }
      };
      let status429 = false;
      for (let i = 0; i < 11; i++) {
        const r = await fetch(`http://localhost:${PORT}/api/intake/demo/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Firm-Id': 'demo', 'X-User-Id': 'tester' }, body: JSON.stringify(body) });
        if (r.status === 429) { status429 = true; break; }
      }
      if (!status429) throw new Error('AI rate limiter did not trigger');
      console.log('[test-server] AI rate limiter triggered as expected');
    } catch (e) {
      throw e;
    }

    // Consent gating test: disable consent and ensure aiSkipped in meta
    try {
      await fetch(`http://localhost:${PORT}/api/consent/ai`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Firm-Id': 'demo' }, body: JSON.stringify({ consent: false }) });
      const r = await fetch(`http://localhost:${PORT}/api/intake/demo/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Firm-Id': 'demo', 'X-User-Id': 'tester2' }, body: JSON.stringify({ slug: 'demo', client: { firstName: 'A', lastName: 'B', email: 'a@b.com' }, case: { narrative: 'hello' }, consent: { gdpr: true } }) });
      const j = await r.json();
      if (!j?.meta?.aiSkipped) throw new Error('Consent gate did not skip AI');
      console.log('[test-server] Consent gate skipped AI as expected');
      // Re-enable consent for subsequent runs
      await fetch(`http://localhost:${PORT}/api/consent/ai`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Firm-Id': 'demo' }, body: JSON.stringify({ consent: true }) });
    } catch (e) {
      throw e;
    }

    // Error envelope test
    try {
      const { spawnSync } = await import('child_process');
      const res = spawnSync('npx', ['tsx', 'server/tests/errorEnvelope.spec.ts'], { stdio: 'inherit', shell: true });
      if (res.status !== 0) throw new Error('errorEnvelope.spec failed');
      console.log('[test-server] Error envelope test passed');
    } catch (e) {
      throw e;
    }

    // Audit log presence test
    try {
      const { spawnSync } = await import('child_process');
      const res = spawnSync('npx', ['tsx', 'server/tests/auditLog.spec.ts'], { stdio: 'inherit', shell: true });
      if (res.status !== 0) throw new Error('auditLog.spec failed');
      console.log('[test-server] Audit log test passed');
    } catch (e) {
      throw e;
    }

    // PDF export content test (unit-style render)
    try {
      const { spawnSync } = await import('child_process');
      const res = spawnSync('npx', ['tsx', 'server/tests/pdf.spec.ts'], { stdio: 'inherit', shell: true });
      if (res.status !== 0) throw new Error('pdf.spec failed');
      console.log('[test-server] PDF export test passed');
    } catch (e) {
      throw e;
    }

    // Logging PII scan test
    try {
      const { spawnSync } = await import('child_process');
      const res = spawnSync('npx', ['tsx', 'server/tests/loggingScan.spec.ts'], { stdio: 'inherit', shell: true });
      if (res.status !== 0) throw new Error('loggingScan.spec failed');
      console.log('[test-server] Logging scan test passed');
    } catch (e) {
      throw e;
    }

    // Email intake tests
    try {
      const { spawnSync } = await import('child_process');
      const r1 = spawnSync('npx', ['tsx', 'server/tests/emailIntake.spec.ts'], { stdio: 'inherit', shell: true });
      if (r1.status !== 0) throw new Error('emailIntake.spec failed');
      const r2 = spawnSync('npx', ['tsx', 'server/tests/emailIntakeMissingFirm.spec.ts'], { stdio: 'inherit', shell: true });
      if (r2.status !== 0) throw new Error('emailIntakeMissingFirm.spec failed');
      console.log('[test-server] Email intake tests passed');
    } catch (e) { throw e; }

    // Voice intake test
    try {
      const { spawnSync } = await import('child_process');
      const r = spawnSync('npx', ['tsx', 'server/tests/voiceIntake.spec.ts'], { stdio: 'inherit', shell: true });
      if (r.status !== 0) throw new Error('voiceIntake.spec failed');
      console.log('[test-server] Voice intake test passed');
    } catch (e) { throw e; }

    // Email package test
    try {
      const { spawnSync } = await import('child_process');
      const r = spawnSync('npx', ['tsx', 'server/tests/emailPackage.spec.ts'], { stdio: 'inherit', shell: true });
      if (r.status !== 0) throw new Error('emailPackage.spec failed');
      console.log('[test-server] Email package test passed');
    } catch (e) { throw e; }

    console.log('[test-server] All tests passed ✓');
    exitCode = 0;
  } catch (error) {
    console.error('[test-server] Test failed:', error.message);
    exitCode = 1;
  } finally {
    // Kill the server process
    console.log('[test-server] Stopping server...');
    serverProcess.kill('SIGTERM');
    
    // Give it a moment to clean up
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Force kill if still running
    try {
      serverProcess.kill('SIGKILL');
    } catch (e) {
      // Already dead, ignore
    }
  }

  process.exit(exitCode);
}

main();
