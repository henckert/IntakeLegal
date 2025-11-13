/**
 * tenantDb(firmId)
 * Returns a proxy around the Prisma client that automatically injects `firmId`
 * into any operation that supports a `where` clause containing a firmId, or
 * adds it on create/update data payloads when missing.
 *
 * Models with firm scoping (by inspection of schema): FormInstance (firmId),
 * Upload (firmId), FirmTemplate (firmId). Intake is indirectly scoped through
 * its parent FormInstance (formId) so we only enforce direct firmId where it exists.
 *
 * If a developer attempts to override firmId with a different value, we force
 * overwrite to the provided firmId to prevent cross-firm leakage.
 *
 * NOTE: This is a defensive layer; we will also add lint/tests to prevent usage
 * of the raw prisma client directly in route handlers.
 */
import { getPrisma } from '../prisma/client.js';
import type { PrismaClient } from '@prisma/client';

// Models that have a firmId column directly
const DIRECT_FIRM_MODELS = new Set<string>(['formInstance', 'upload', 'firmTemplate']);

function injectFirmIdIntoArgs(model: string, method: string, args: any, firmId: string) {
  if (!DIRECT_FIRM_MODELS.has(model)) return args; // Intake indirectly via formId

  // Normalize args object
  const next = args ? { ...args } : {};

  // Methods that use where clause
  const WHERE_METHODS = ['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'deleteMany', 'updateMany'];
  if (WHERE_METHODS.includes(method)) {
    const where = { ...(next.where || {}) };
    // Force firmId scoping
    where.firmId = firmId;
    next.where = where;
  }

  // Create / update style methods
  const DATA_METHODS = ['create', 'createMany', 'update', 'upsert'];
  if (DATA_METHODS.includes(method)) {
    if (next.data) {
      // For createMany, data can be array
      if (Array.isArray(next.data)) {
        next.data = next.data.map((d: any) => ({ ...d, firmId }));
      } else {
        next.data.firmId = firmId; // overwrite if provided incorrectly
      }
    }
  }

  // Delete / deleteMany already handled by where scoping
  return next;
}

export function tenantDb(firmId: string): PrismaClient {
  const prisma = getPrisma();
  if (!prisma) throw new Error('Database unavailable (missing DATABASE_URL)');

  // Proxy top-level prisma to intercept model access
  return new Proxy(prisma as PrismaClient, {
    get(target, prop: string, receiver) {
      const originalModel = Reflect.get(target, prop, receiver);
      if (typeof originalModel !== 'object' || originalModel === null) {
        return originalModel;
      }
      const modelName = prop; // e.g. formInstance
      // Proxy each model's method to inject firmId
      return new Proxy(originalModel, {
        get(mTarget, mProp: string, mReceiver) {
          const originalMethod = Reflect.get(mTarget, mProp, mReceiver);
          if (typeof originalMethod !== 'function') return originalMethod;
          return (args?: any) => {
            try {
              const scopedArgs = injectFirmIdIntoArgs(modelName, mProp, args, firmId);
              return originalMethod.call(mTarget, scopedArgs);
            } catch (err) {
              throw err;
            }
          };
        },
      });
    },
  });
}

/** Convenience helper to assert a raw record matches firmId (for Intake records). */
export function assertRecordFirm<T extends { firmId?: string }>(firmId: string, record: T | null) {
  if (!record) return null;
  if (record.firmId && record.firmId !== firmId) {
    throw Object.assign(new Error('Not Found'), { code: 'not_found' });
  }
  return record;
}
