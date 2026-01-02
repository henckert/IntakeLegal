import type { Request } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { getPrisma } from '../prisma/client.js';
import { getFirmIdFromRequest, getUserIdFromRequest } from './firmId.js';

type AuditMeta = {
  entityType?: string;
  entityId?: string;
  [k: string]: any;
};

const mem: Array<{ eventType: string; actorUserId?: string; firmId?: string; entityType?: string; entityId?: string; metadata: any; createdAt: string } > = [];

function appendAuditFileLine(line: unknown) {
  const filePath = process.env.AUDIT_LOG_FILE;
  if (!filePath) return;
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.appendFileSync(filePath, JSON.stringify(line) + '\n');
  } catch {
    // Best-effort only; never break request flow.
  }
}

export async function audit(req: Request, eventType: string, metadata: AuditMeta = {}) {
  let prisma = null;
  try {
    prisma = getPrisma();
  } catch {
    prisma = null;
  }
  const firmId = getFirmIdFromRequest(req) || undefined;
  const actorUserId = getUserIdFromRequest(req) || undefined;
  const createdAt = new Date().toISOString();
  const payload = {
    eventType,
    actorUserId,
    firmId,
    entityType: metadata.entityType || undefined,
    entityId: metadata.entityId || undefined,
    metadata: metadata,
  } as any;

  // Cross-process verification sink for tests/harness. Intentionally omits metadata.
  appendAuditFileLine({ eventType, firmId, actorUserId, entityType: payload.entityType, entityId: payload.entityId, createdAt });

  if (!prisma) {
    mem.push({ ...payload, createdAt });
    // keep last 200
    if (mem.length > 200) mem.shift();
    return;
  }
  await (prisma as any).auditLog.create({ data: payload });
}

export function getMemoryAuditLogs() {
  return mem.slice();
}
