import type { Response, Request } from 'express';

type ErrorCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'TOO_MANY_REQUESTS' | 'INTERNAL_ERROR' | 'UNSUPPORTED_MEDIA_TYPE';

function envelope(req: Request, code: ErrorCode, message: string, extra?: any) {
  const rid = (req as any).requestId;
  return { error: { code, message }, requestId: rid, ...(extra || {}) };
}

export const errors = {
  badRequest(res: Response, req: Request, message = 'Bad request', extra?: any) {
    return res.status(400).json(envelope(req, 'BAD_REQUEST', message, extra));
  },
  unauthorized(res: Response, req: Request, message = 'Unauthorized', extra?: any) {
    return res.status(401).json(envelope(req, 'UNAUTHORIZED', message, extra));
  },
  notFound(res: Response, req: Request, message = 'Not found', extra?: any) {
    return res.status(404).json(envelope(req, 'NOT_FOUND', message, extra));
  },
  tooMany(res: Response, req: Request, message = 'Rate limit exceeded', extra?: any) {
    return res.status(429).json(envelope(req, 'TOO_MANY_REQUESTS', message, extra));
  },
  unsupported(res: Response, req: Request, message = 'Unsupported media type', extra?: any) {
    return res.status(415).json(envelope(req, 'UNSUPPORTED_MEDIA_TYPE', message, extra));
  },
  internal(res: Response, req: Request, message = 'Internal Server Error', extra?: any) {
    return res.status(500).json(envelope(req, 'INTERNAL_ERROR', message, extra));
  },
};
