import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { db } from '../store/memory.js';
import { runAI } from '../services/ai.js';
import { computeSOL } from '../services/sol.js';
import { sendIntakePDF } from '../services/pdf.js';

const router = Router();

// Accept both the shared schema and the UI-friendly payload; map to internal
const UIShape = z.object({
  slug: z.string(),
  client: z.object({ firstName: z.string(), lastName: z.string(), email: z.string().email(), phone: z.string().optional().default('') }),
  case: z.object({ claimType: z.string().optional(), eventDate: z.string().optional(), location: z.string().optional().default(''), narrative: z.string() }),
  consent: z.object({ gdpr: z.boolean(), consentText: z.string().optional() }),
});

router.post('/api/intake/:slug/submit', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const form = db.findFormBySlug(slug) ?? { id: `form_${slug}`, slug, firmId: 'demo', templateId: 'demo', published: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any;

  let clientName = '';
  let contactJSON: Record<string, any> = {};
  let narrative = '';
  let eventDate: string | undefined;
  let claimType: string | undefined;
  let consent = false;

  const uiTry = UIShape.safeParse(req.body);
  if (!uiTry.success) return res.status(400).json({ error: 'Invalid intake payload' });
  const d = uiTry.data;
  clientName = `${d.client.firstName} ${d.client.lastName}`.trim();
  contactJSON = { email: d.client.email, phone: d.client.phone, location: d.case.location };
  narrative = d.case.narrative;
  eventDate = d.case.eventDate;
  claimType = d.case.claimType;
  consent = d.consent.gdpr;

  if (!consent) return res.status(400).json({ error: 'GDPR consent required' });

  const ai = await runAI(narrative);
  const sol = computeSOL(claimType ?? ai.classification, eventDate);

  const id = `intake_${Math.random().toString(36).slice(2, 10)}`;
  db.intakes.set(id, {
    id,
    formId: (form as any).id,
    slug,
    clientName,
    contactJSON,
    narrative,
    eventDatesJSON: eventDate ? [eventDate] : undefined,
    consent: true,
    ai,
    sol,
    status: 'new',
    createdAt: new Date().toISOString(),
  });

  return res.json({ intakeId: id });
});

router.get('/api/intakes/:id/export.pdf', async (req: Request, res: Response) => {
  const i = db.intakes.get(req.params.id);
  if (!i) return res.status(404).json({ error: 'Not found' });
  sendIntakePDF(res, {
    id: i.id,
    clientName: i.clientName,
    classification: i.ai.classification,
    expiryDate: i.sol.expiryDate,
    badge: i.sol.badge,
    narrative: i.narrative,
  });
});

router.get('/api/intakes/:id/export.docx', async (req: Request, res: Response) => {
  const i = db.intakes.get(req.params.id);
  if (!i) return res.status(404).json({ error: 'Not found' });
  return res.status(501).json({ message: 'DOCX export is not implemented in MVP' });
});

export default router;
