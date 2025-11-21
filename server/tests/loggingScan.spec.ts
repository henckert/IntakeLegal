import { log } from '../src/lib/log.js';

function capture(fn: () => void): string[] {
  const out: string[] = [];
  const origLog = console.log;
  const origWarn = console.warn;
  const origErr = console.error;
  console.log = ((m?: any) => { out.push(String(m)); }) as any;
  console.warn = ((m?: any) => { out.push(String(m)); }) as any;
  console.error = ((m?: any) => { out.push(String(m)); }) as any;
  try { fn(); } finally {
    console.log = origLog;
    console.warn = origWarn;
    console.error = origErr;
  }
  return out;
}

(function main(){
  const email = 'user@example.com';
  const phone = '+353 85 123 4567';
  const lines = capture(() => {
    log.info('test', { nested: { email, phone }, firstName: 'Jane', lastName: 'Doe' });
  });
  if (!lines.length) {
    console.error('No log output captured');
    process.exit(1);
  }
  const joined = lines.join('\n');
  const patterns = [email, phone, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, /\+?\d[\d\s\-]{7,}\d/];
  for (const p of patterns) {
    const matched = typeof p === 'string' ? joined.includes(p) : p.test(joined);
    if (matched) {
      console.error('PII pattern leaked into logs');
      console.error('Output:', joined);
      process.exit(1);
    }
  }
  if (!joined.includes('[REDACTED]')) {
    console.error('Expected redacted tokens not present');
    process.exit(1);
  }
  console.log('loggingScan.spec passed');
  process.exit(0);
})();
