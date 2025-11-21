import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { limitAiPerFirmUser } from '../middleware/rateLimit.js';
import { aiConsentGate } from '../middleware/consentGate.js';
import { errors } from '../lib/errors.js';
import { audit } from '../services/audit.js';
import { transcribeAudio } from '../services/transcription.js';
import { runAI } from '../services/ai.js';
import { computeSOL } from '../services/sol.js';
import { db } from '../store/index.js';

const router = Router();

// Uploads dir
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.wav';
    cb(null, `voice-${unique}${ext}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ok = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a'].includes(file.mimetype) || ['.wav', '.mp3', '.m4a'].includes(path.extname(file.originalname).toLowerCase());
  if (ok) return cb(null, true);
  cb(new Error('Unsupported audio type'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/api/intake/:slug/voice', limitAiPerFirmUser, upload.single('audio'), aiConsentGate, async (req: Request, res: Response) => {
  try {
    if (!req.file) return errors.badRequest(res, req, 'No audio file uploaded', { hint: 'Provide field "audio"' });
    // Avoid logging PII or original filenames; log minimal metadata
    await audit(req, 'intake.voice.received', { slug: req.params.slug, size: req.file.size, ext: path.extname(req.file.originalname).toLowerCase() });

    const t = await transcribeAudio(req.file.path);
    const aiAllowed = (req as any).aiAllowed !== false;
    let ai: any = { summary: '', classification: 'Other', followUps: [] };
    if (aiAllowed) ai = await runAI(t.transcript);
    const sol = computeSOL(ai.classification, undefined);

    const id = `voice_${Math.random().toString(36).slice(2, 10)}`;
    const intakeRecord: any = {
      id,
      formId: 'form_demo',
      slug: req.params.slug,
      clientName: 'Voice Intake',
      contactJSON: {},
      narrative: t.transcript,
      eventDatesJSON: [],
      consent: true,
      ai: aiAllowed ? { summary: ai.summary, classification: ai.classification, followUps: ai.followUps } : undefined,
      sol,
      status: 'processed',
      createdAt: new Date().toISOString(),
    };
  await db.intakes.set(id, intakeRecord);
  await audit(req, 'intake.voice.processed', { entityType: 'Intake', entityId: id, aiSkipped: !aiAllowed });

    return res.status(200).json({ id, summaryText: ai.summary, area: ai.classification, limitation: sol, meta: { source: 'voice', aiSkipped: !aiAllowed } });
  } catch (e: any) {
    return errors.internal(res, req, 'Voice intake failed', { detail: String(e?.message || e) });
  } finally {
    try { if (req.file?.path) fs.unlinkSync(req.file.path); } catch {}
  }
});

export default router;
