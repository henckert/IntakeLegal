import { Router } from 'express';
import { z } from 'zod';
import { setFirmAiConsent } from '../middleware/consentGate.js';
import { getFirmIdFromRequest } from '../services/firmId.js';
import { audit } from '../services/audit.js';
import { errors } from '../lib/errors.js';

const router = Router();

const Body = z.object({ consent: z.boolean() });

router.post('/api/consent/ai', async (req, res) => {
  try {
    const firmId = getFirmIdFromRequest(req);
    if (!firmId) return errors.badRequest(res, req as any, 'Missing firm context');
    const parsed = Body.safeParse(req.body ?? {});
    if (!parsed.success) return errors.badRequest(res, req as any, 'Bad body');
    await setFirmAiConsent(firmId, parsed.data.consent);
    await audit(req as any, 'consent.changed', { entityType: 'Firm', entityId: firmId, consent: parsed.data.consent });
    return res.json({ ok: true, consent: parsed.data.consent });
  } catch (e: any) {
    return errors.internal(res, req as any, 'Failed to set consent', { detail: String(e.message || e) });
  }
});

export default router;
