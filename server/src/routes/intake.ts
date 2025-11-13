import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { db } from '../store/index.js';
import { runAI } from '../services/ai.js';
import { computeSOL } from '../services/sol.js';
import { sendIntakePDF } from '../services/pdf.js';
import { sendEmail } from '../services/email.js';
import { withTimeout } from '../lib/withTimeout.js';
import { limitAiPerFirmUser } from '../middleware/rateLimit.js';
import { aiConsentGate } from '../middleware/consentGate.js';
import { OPENAI_TIMEOUT_MS, EMAIL_TIMEOUT_MS, PDF_TIMEOUT_MS, DRY_RUN, HAS_OPENAI, HAS_EMAIL } from '../env.js';
import { audit } from '../services/audit.js';
import { errors } from '../lib/errors.js';

const router = Router();

// Accept both the shared schema and the UI-friendly payload; map to internal
const UIShape = z.object({
  slug: z.string(),
  client: z.object({ firstName: z.string(), lastName: z.string(), email: z.string().email(), phone: z.string().optional().default('') }),
  case: z.object({ claimType: z.string().optional(), eventDate: z.string().optional(), location: z.string().optional().default(''), narrative: z.string() }),
  consent: z.object({ gdpr: z.boolean(), consentText: z.string().optional() }),
});

router.post('/api/intake/:slug/submit', limitAiPerFirmUser, aiConsentGate, async (req: Request, res: Response) => {
  const phase = (name: string) => console.log(`[submit] ${name}`);
  const t0 = Date.now();
  phase('start');

  // Body should be object if express.json ran; recover once if string:
  if (typeof req.body === 'string') {
    try { req.body = JSON.parse(req.body); phase('parsed string body'); }
    catch (e) { return errors.badRequest(res, req, 'Bad JSON', { detail: String(e) }); }
  }
  const body = req.body as any;

  // DEV fast path: if no keys or DRY_RUN, return a mock immediately.
  if (DRY_RUN || !HAS_OPENAI) {
    phase('dry-run mock');
    await audit(req, 'intake.submit', { slug: req.params.slug, dryRun: true });
    return res.status(200).json({
      summaryText: 'MOCK: summary unavailable in DRY_RUN / missing OPENAI_API_KEY',
      area: 'Personal Injury',
      limitation: { expires: '2026-01-01', daysRemaining: 365 },
      received: body,
      meta: { dryRun: true, durMs: Date.now() - t0 }
    });
  }

  try {
    phase('ai:start');
    const aiAllowed = (req as any).aiAllowed !== false;
    let ai: any = { summary: '', classification: 'Other', followUps: [], provenance: { source: 'mock', model: 'mock-embedded', promptVersion: '2025-01', redactionsApplied: 0 } };
    if (aiAllowed) {
      // runAI returns { summary, classification, followUps }
      ai = await withTimeout(runAI(body.case?.narrative || ''), OPENAI_TIMEOUT_MS, 'openai.summary');
      phase('ai:done');
    } else {
      phase('ai:skipped');
    }

    phase('sol:start');
    const sol = computeSOL(ai.classification, body.case?.eventDate);
    phase('sol:done');

    let emailId: string | undefined;
  if (HAS_EMAIL && body.client?.email) {
      phase('email:start');
      try {
        const to = body.client.email as string;
        const subject = `New intake: ${body.slug ?? 'submission'}`;
        const text = `${ai.summary}\n\nNarrative:\n${body.case?.narrative ?? ''}`;
        await withTimeout(sendEmail({ to, subject, text }), EMAIL_TIMEOUT_MS, 'email.send');
        emailId = `mock-email-${Date.now()}`;
      } catch (e) {
        console.warn('[submit] email failed', e);
      }
      phase('email:done');
    } else {
      phase('email:skipped');
    }

    // PDF export not implemented as URL in MVP; skip or generate on-demand in export endpoint
    phase('pdf:skipped');
    // Persist intake lifecycle and emit audits
    try {
      const form = await db.findFormBySlug(req.params.slug);
      const id = `intake_${Math.random().toString(36).slice(2,10)}`;
      const intakeRecord: any = {
        id,
        formId: form?.id ?? 'form_demo',
        slug: req.params.slug,
        clientName: `${body.client?.firstName ?? ''} ${body.client?.lastName ?? ''}`.trim() || 'Client',
        contactJSON: { email: body.client?.email, phone: body.client?.phone },
        narrative: body.case?.narrative ?? '',
        eventDatesJSON: body.case?.eventDate ? [body.case.eventDate] : [],
        consent: !!body?.consent?.gdpr,
        ai: aiAllowed ? { summary: ai.summary, classification: ai.classification, followUps: ai.followUps } : undefined,
        sol: sol,
        status: 'processed',
        createdAt: new Date().toISOString(),
      };
      await db.intakes.set(id, intakeRecord);
      await audit(req, 'intake.processed', { entityType: 'Intake', entityId: id, slug: req.params.slug, aiSkipped: !aiAllowed });
    } catch (e) { console.warn('[submit] persist failed (non-fatal)', e); }

    return res.status(200).json({ summaryText: ai.summary, area: ai.classification, limitation: sol, emailId, pdfUrl: undefined, meta: { durMs: Date.now() - t0, aiSkipped: !aiAllowed } });
  } catch (e: any) {
    console.error('[submit] failed', e);
    const isTimeout = String(e?.message || e).includes('[timeout]');
    return res.status(isTimeout ? 504 : 502).json({ error: isTimeout ? 'Gateway Timeout' : 'Upstream Error', detail: String(e) });
  }
});

router.get('/api/intakes/:id/export.pdf', async (req: Request, res: Response) => {
  const i = await db.intakes.get(req.params.id);
  if (!i) return res.status(404).json({ error: 'Not found' });
  // Retention enforcement: block export if beyond retention window
  try {
    const form = await db.forms.get((i as any).formId);
    const keepDays = Number((form as any)?.retentionPolicy ?? '90');
    const created = new Date((i as any).createdAt);
    const cutoff = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
    if (!(created >= cutoff)) {
      return res.status(410).json({ error: 'Export unavailable: data expired per retention policy.' });
    }
  } catch {}
  // Support both memory shape and Prisma shape
  const classification = (i as any).ai?.classification ?? (i as any).aiClassification;
  const expiryDate = (i as any).sol?.expiryDate ?? (i as any).solExpiryDate;
  const badge = (i as any).sol?.badge ?? (i as any).solBadge;
  const solBasis = (i as any).sol?.basis ?? (i as any).solBasis;
  const solDisclaimer = (i as any).sol?.disclaimer ?? (i as any).solDisclaimer;
  const followUps = (i as any).ai?.followUps ?? (i as any).aiFollowUps ?? [];
  sendIntakePDF(res, {
    id: (i as any).id,
    clientName: (i as any).clientName,
    classification,
    expiryDate: expiryDate ? String(expiryDate) : undefined,
    badge,
    solBasis,
    solDisclaimer,
    followUps,
    narrative: (i as any).narrative,
  });
  try { await audit(req, 'intake.export.pdf', { entityType: 'Intake', entityId: (i as any).id }); } catch {}
});

router.get('/api/intakes/:id/export.docx', async (req: Request, res: Response) => {
  const i = await db.intakes.get(req.params.id);
  if (!i) return res.status(404).json({ error: 'Not found' });
  // Retention enforcement: block export if beyond retention window
  try {
    const form = await db.forms.get((i as any).formId);
    const keepDays = Number((form as any)?.retentionPolicy ?? '90');
    const created = new Date((i as any).createdAt);
    const cutoff = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
    if (!(created >= cutoff)) {
      return res.status(410).json({ error: 'Export unavailable: data expired per retention policy.' });
    }
  } catch {}
  return res.status(501).json({ message: 'DOCX export is not implemented in MVP' });
});

export default router;

// Update AI summary (editable in dashboard)
router.post('/api/intakes/:id/summary', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { summary } = (req.body ?? {}) as { summary?: string };
  if (!summary || summary.trim().length < 5) {
    return res.status(400).json({ error: 'Summary must be at least 5 characters.' });
  }
  const exists = await db.intakes.get(id);
  if (!exists) return res.status(404).json({ error: 'Not found' });
  await db.intakes.updateSummary(id, summary.trim());
  return res.json({ ok: true, summary: summary.trim() });
});
