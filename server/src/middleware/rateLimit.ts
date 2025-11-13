import type { Request, Response, NextFunction } from 'express';
import { createFixedWindowLimiter } from '../lib/rateLimiter.js';
import { getFirmIdFromRequest, getUserIdFromRequest } from '../services/firmId.js';

function keyForFirmUser(req: Request) {
  const firm = getFirmIdFromRequest(req) || 'no-firm';
  const user = getUserIdFromRequest(req) || req.ip || 'anon';
  return `firm:${firm}|user:${user}|path:${req.baseUrl}${req.path}`;
}

export const limitUploadsPerFirmUser = createFixedWindowLimiter({
  limit: 5,
  windowMs: 60_000,
  keyFn: keyForFirmUser,
  headerPrefix: 'X-RateLimit-Uploads',
});

export const limitAiPerFirmUser = createFixedWindowLimiter({
  limit: 10,
  windowMs: 60_000,
  keyFn: keyForFirmUser,
  headerPrefix: 'X-RateLimit-AI',
});
