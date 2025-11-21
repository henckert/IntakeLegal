#!/usr/bin/env node
/**
 * E2E Test Runner with Server Management
 * Starts web + server, runs Playwright tests, cleans up
 */

import { spawn } from 'child_process';
import { createConnection } from 'net';

const DEV_SERVER_PORT = 4000;
const WEB_PORT = 3000;
const MAX_WAIT_MS = 60000; // 60 seconds
const POLL_INTERVAL_MS = 1000;

let serverProcess = null;
let webProcess = null;

// Check if a port is ready by attempting TCP connection
async function isPortReady(port, maxWaitMs = MAX_WAIT_MS) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      await new Promise((resolve, reject) => {
        const socket = createConnection({ port, host: 'localhost' }, () => {
          socket.destroy();
          resolve(true);
        });
        socket.on('error', reject);
        socket.setTimeout(1000);
      });
      console.log(`[e2e-runner] Port ${port} is ready`);
      return true;
    } catch {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
  
  console.error(`[e2e-runner] Port ${port} did not become ready in ${maxWaitMs}ms`);
  return false;
}

// Start both servers
async function startServers() {
  console.log('[e2e-runner] Starting servers...');
  
  // Start backend server
  serverProcess = spawn('npm', ['run', '--workspace', 'server', 'dev'], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  
  serverProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('listening') || msg.includes('startup complete')) {
      console.log('[server]', msg.trim());
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('ERROR') || msg.includes('startup complete')) {
      console.error('[server]', msg.trim());
    }
  });
  
  // Start web server
  webProcess = spawn('npm', ['run', '--workspace', 'web', 'dev'], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  
  webProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('Ready') || msg.includes('Local')) {
      console.log('[web]', msg.trim());
    }
  });
  
  webProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('ERROR')) {
      console.error('[web]', msg.trim());
    }
  });
  
  // Wait for both servers to be ready
  const serverReady = await isPortReady(DEV_SERVER_PORT);
  const webReady = await isPortReady(WEB_PORT);
  
  if (!serverReady || !webReady) {
    throw new Error('Servers failed to start in time');
  }
  
  console.log('[e2e-runner] Both servers are ready');
}

// Stop servers
async function stopServers() {
  console.log('[e2e-runner] Stopping servers...');
  
  const killProcess = (proc) => {
    if (!proc || proc.killed) return Promise.resolve();
    
    return new Promise((resolve) => {
      proc.on('exit', resolve);
      
      // Try SIGTERM first
      proc.kill('SIGTERM');
      
      // Force kill after 3 seconds
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
        resolve();
      }, 3000);
    });
  };
  
  await Promise.all([
    killProcess(serverProcess),
    killProcess(webProcess),
  ]);
  
  console.log('[e2e-runner] Servers stopped');
}

// Run Playwright tests
async function runTests() {
  console.log('[e2e-runner] Running Playwright tests...');
  
  return new Promise((resolve) => {
    const testProcess = spawn('npx', ['playwright', 'test', '--reporter=list'], {
      shell: true,
      stdio: 'inherit',
    });
    
    testProcess.on('exit', (code) => {
      console.log(`[e2e-runner] Tests completed with exit code ${code}`);
      resolve(code || 0);
    });
  });
}

// Main execution
async function main() {
  let exitCode = 1;
  
  try {
    await startServers();
    exitCode = await runTests();
  } catch (error) {
    console.error('[e2e-runner] Error:', error.message);
    exitCode = 1;
  } finally {
    await stopServers();
  }
  
  console.log(`[e2e-runner] Exiting with code ${exitCode}`);
  process.exit(exitCode);
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log('[e2e-runner] Received SIGINT');
  await stopServers();
  process.exit(130);
});

process.on('SIGTERM', async () => {
  console.log('[e2e-runner] Received SIGTERM');
  await stopServers();
  process.exit(143);
});

main();
