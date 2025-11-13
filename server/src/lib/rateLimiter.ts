type KeyFn = (req: any) => string;

type Bucket = {
  count: number;
  resetAt: number;
};

export function createFixedWindowLimiter(options: { limit: number; windowMs: number; keyFn: KeyFn; headerPrefix?: string; onLimit?: (req: any) => void }) {
  const buckets = new Map<string, Bucket>();
  const limit = options.limit;
  const windowMs = options.windowMs;
  const headerPrefix = options.headerPrefix || 'X-RateLimit';

  function cleanup() {
    const now = Date.now();
    for (const [k, b] of buckets.entries()) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  return function limiter(req: any, res: any, next: any) {
    try {
      const key = options.keyFn(req);
      const now = Date.now();
      let b = buckets.get(key);
      if (!b || b.resetAt <= now) {
        b = { count: 0, resetAt: now + windowMs };
        buckets.set(key, b);
      }
      b.count += 1;

      res.setHeader(`${headerPrefix}-Limit`, String(limit));
      res.setHeader(`${headerPrefix}-Remaining`, String(Math.max(0, limit - b.count)));
      res.setHeader(`${headerPrefix}-Reset`, String(Math.ceil(b.resetAt / 1000)));

      if (b.count > limit) {
        options.onLimit?.(req);
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      // opportunistic cleanup
      if (Math.random() < 0.01) cleanup();
      next();
    } catch (e) {
      next(e);
    }
  };
}
