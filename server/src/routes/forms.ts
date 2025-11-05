import { Router } from 'express';
import { z } from 'zod';
import { db } from '../store/index.js';
import { CreateOrUpdateFormInput } from '../schemas.js';

const router = Router();

router.post('/api/forms', async (req, res) => {
  const parsed = CreateOrUpdateFormInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const v = parsed.data;

  const now = new Date().toISOString();
  const id = v.id ?? `form_${Math.random().toString(36).slice(2, 10)}`;
  const existing = await db.forms.get(id);
  const form = {
    id,
    firmId: v.firmId,
    templateId: v.templateId,
    slug: v.slug,
    themeJSON: v.themeJSON,
    retentionPolicy: v.retentionPolicy,
    schemaJSON: (req.body as any).schemaJSON,
    published: existing?.published ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await db.forms.set(id, form);
  return res.json({ id });
});

router.post('/api/forms/:id/publish', async (req, res) => {
  const id = req.params.id;
  const form = await db.forms.get(id);
  if (!form) return res.status(404).json({ error: 'Form not found' });
  form.published = true;
  // Ensure a stable demo slug for local-first demo
  if (form.slug === 'draft-demo') form.slug = 'demo';
  await db.forms.set(id, form);
  return res.json({ slug: form.slug });
});

export default router;
