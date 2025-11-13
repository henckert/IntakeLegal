export const log = {
  info: (msg: string, meta?: any) => console.log(JSON.stringify({ level: 'info', msg, ...attachMeta(meta) })),
  warn: (msg: string, meta?: any) => console.warn(JSON.stringify({ level: 'warn', msg, ...attachMeta(meta) })),
  error: (msg: string, meta?: any) => console.error(JSON.stringify({ level: 'error', msg, ...attachMeta(meta) })),
};

function attachMeta(meta?: any) {
  try {
    const safe = { ...(meta || {}) } as any;
    maskPII(safe);
    return safe;
  } catch {
    return meta || {};
  }
}

// Basic masking; expand as needed
const PII_KEYS = ['name', 'firstName', 'lastName', 'address', 'phone', 'email', 'ppsn', 'nino', 'dob'];
function maskPII(obj: any) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (PII_KEYS.includes(key.toLowerCase())) obj[key] = '[REDACTED]';
    else if (typeof obj[key] === 'object') maskPII(obj[key]);
  }
}
