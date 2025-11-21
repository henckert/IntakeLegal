import type { Request } from 'express';
import { getPrisma } from '../prisma/client.js';
import { getFirmIdFromRequest, getUserIdFromRequest } from './firmId.js';

type AuditMeta = {
  entityType?: string;
  entityId?: string;
  [k: string]: any;
};

const mem: Array<{ eventType: string; actorUserId?: string; firmId?: string; entityType?: string; entityId?: string; metadata: any; createdAt: string } > = [];

export async function audit(req: Request, eventType: string, metadata: AuditMeta = {}) {
  const prisma = getPrisma();
  const firmId = getFirmIdFromRequest(req) || undefined;
  const actorUserId = getUserIdFromRequest(req) || undefined;
  const payload = {
    eventType,
    actorUserId,
    firmId,
    entityType: metadata.entityType || undefined,
    entityId: metadata.entityId || undefined,
    metadata: metadata,
  } as any;

  if (!prisma) {
    mem.push({ ...payload, createdAt: new Date().toISOString() });
    // keep last 200
    if (mem.length > 200) mem.shift();
    return;
  }
  await (prisma as any).auditLog.create({ data: payload });
}

export function getMemoryAuditLogs() {
  return mem.slice();
}
