import type { Request } from 'express';

/**
 * Derive firmId from request context.
 * Priority: Clerk auth (req.auth?.orgId) → header X-Firm-Id → query → body
 * Returns string or null if missing.
 */
export function getFirmIdFromRequest(req: Request): string | null {
  const anyReq = req as any;
  const fromClerk = anyReq?.auth?.orgId || anyReq?.auth?.sessionClaims?.org_id || null;
  const fromHeader = (req.headers['x-firm-id'] as string) || null;
  const fromQuery = (req.query?.firmId as string) || null;
  const fromBody = (anyReq.body?.firmId as string) || null;
  return fromClerk || fromHeader || fromQuery || fromBody || null;
}

/**
 * Derive userId for rate limiting; prefer Clerk userId then header fallback.
 */
export function getUserIdFromRequest(req: Request): string | null {
  const anyReq = req as any;
  const fromClerk = anyReq?.auth?.userId || anyReq?.auth?.sessionClaims?.sub || null;
  const fromHeader = (req.headers['x-user-id'] as string) || null;
  return fromClerk || fromHeader || null;
}
