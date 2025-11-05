import { Router, type Request, type Response } from 'express';
import { db } from '../store/memory.js';
import { z } from 'zod';

const FilterQuery = z.object({
  area: z.string().optional(),
  urgency: z.enum(['red', 'amber', 'green']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const router = Router();

router.get('/api/dashboard/intakes', (req: Request, res: Response) => {
  const parsed = FilterQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { area, urgency, from, to } = parsed.data;

  let items = Array.from(db.intakes.values());

  if (area) items = items.filter((i) => i.ai.classification.toLowerCase().includes(area.toLowerCase()));
  if (urgency) items = items.filter((i) => i.sol.badge === urgency);
  if (from) items = items.filter((i) => i.createdAt >= from);
  if (to) items = items.filter((i) => i.createdAt <= to);

  items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  return res.json({ items });
});

export default router;
