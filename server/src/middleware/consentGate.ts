import type { Request, Response, NextFunction } from 'express';
import { getPrisma } from '../prisma/client.js';
import { getFirmIdFromRequest } from '../services/firmId.js';

// In-memory fallback for consent in local-first mode
const memConsent = new Map<string, boolean>();

export async function isFirmAiConsented(firmId: string): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) {
    // local-first: check memory map; default false if set, else true
    const v = memConsent.get(firmId);
    return v === undefined ? true : v;
  }
  try {
    const tmpl: any = await (prisma as any).firmTemplate.findUnique({ where: { firmId } });
    return !!tmpl?.aiConsentAt;
  } catch {
    return true;
  }
}

export async function setFirmAiConsent(firmId: string, consent: boolean): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) {
    memConsent.set(firmId, consent);
    return;
  }
  const data: any = consent ? { aiConsentAt: new Date() } : ({ aiConsentAt: null } as any);
  await (prisma as any).firmTemplate.upsert({
    where: { firmId },
    create: { firmId, name: 'Default', enabledLawAreas: [], customFields: {}, ...data },
    update: data,
  });
}

// marker type not used at runtime; avoid unique symbol to keep TS happy without generation
declare const __aiAllowedMarker: unique symbol;

export async function aiConsentGate(req: Request, res: Response, next: NextFunction) {
  try {
    const firmId = getFirmIdFromRequest(req);
    if (!firmId) {
      // No firmId context; default to allow to avoid blocking public forms
      (req as any).aiAllowed = true;
      return next();
    }
    const allowed = await isFirmAiConsented(firmId);
    (req as any).aiAllowed = allowed;
    next();
  } catch (e) {
    next(e);
  }
}
