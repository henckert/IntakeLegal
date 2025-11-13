import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { limitAiPerFirmUser } from '../middleware/rateLimit.js';
import { aiConsentGate } from '../middleware/consentGate.js';
import { errors } from '../lib/errors.js';
import { audit } from '../services/audit.js';
import { runAI } from '../services/ai.js';
import { computeSOL } from '../services/sol.js';
import { db } from '../store/index.js';

const router = Router();

const EmailIntakeSchema = z.object({
  fromEmail: z.string().email(),
  subject: z.string().optional().default(''),
  bodyText: z.string().min(1),
  attachments: z.array(z.object({
    filename: z.string(),
    mimeType: z.string().optional(),
    size: z.number().optional(),
  })).optional().default([]),
});

function mapFirmIdFromEmail(email: string): string | undefined {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  const MAP: Record<string, string> = {
    'demo.com': 'demo',
  };
  return MAP[domain];
}

router.post('/api/email-intake', limitAiPerFirmUser, aiConsentGate, async (req: Request, res: Response) => {
  const firmHeader = (req.headers['x-firm-id'] || req.headers['X-Firm-Id'] || '') as string;
  let firmId = firmHeader?.toString().trim();

  const parse = EmailIntakeSchema.safeParse(req.body);
  if (!parse.success) return errors.badRequest(res, req, 'Invalid email intake payload', { issues: parse.error.issues });
  const payload = parse.data;

  if (!firmId) {
    firmId = mapFirmIdFromEmail(payload.fromEmail) || '';
  }
  if (!firmId) return errors.unauthorized(res, req, 'Firm context required for email intake', { hint: 'Provide X-Firm-Id header or configure domain mapping' });

  try {
    await audit(req, 'intake.email.received', { fromEmail: payload.fromEmail, subject: payload.subject, firmId });

    const aiAllowed = (req as any).aiAllowed !== false;
    let ai: any = { summary: '', classification: 'Other', followUps: [] };
    if (aiAllowed) {
      ai = await runAI(payload.bodyText);
    }

    const sol = computeSOL(ai.classification, undefined);

    const id = `email_${Math.random().toString(36).slice(2, 10)}`;
    const intakeRecord: any = {
      id,
      formId: 'form_demo',
      slug: 'email',
      clientName: payload.fromEmail.split('@')[0],
      contactJSON: { email: payload.fromEmail },
      narrative: payload.bodyText,
      eventDatesJSON: [],
      consent: true,
      ai: aiAllowed ? { summary: ai.summary, classification: ai.classification, followUps: ai.followUps } : undefined,
      sol,
      status: 'processed',
      createdAt: new Date().toISOString(),
    };
    await db.intakes.set(id, intakeRecord);
    await audit(req, 'intake.email.processed', { entityType: 'Intake', entityId: id, aiSkipped: !aiAllowed, firmId });

    return res.status(200).json({
      id,
      summaryText: ai.summary,
      area: ai.classification,
      limitation: sol,
      meta: { source: 'email', aiSkipped: !aiAllowed }
    });
  } catch (e: any) {
    return errors.internal(res, req, 'Email intake failed', { detail: String(e?.message || e) });
  }
});

export default router;
