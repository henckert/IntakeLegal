import { Router, type Request, type Response } from 'express';
import { db } from '../store/index.js';
import { z } from 'zod';

const FilterQuery = z.object({
  area: z.string().optional(),
  urgency: z.enum(['red', 'amber', 'green']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  status: z.enum(['new', 'in-review', 'closed']).optional(),
});

const router = Router();

router.get('/api/dashboard/intakes', async (req: Request, res: Response) => {
  const parsed = FilterQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { area, urgency, from, to, status } = parsed.data;

  let items = await db.intakes.values();

  if (area) items = items.filter((i) => i.ai.classification.toLowerCase().includes(area.toLowerCase()));
  if (urgency) items = items.filter((i) => i.sol.badge === urgency);
  if (from) items = items.filter((i) => i.createdAt >= from);
  if (to) items = items.filter((i) => i.createdAt <= to);
  if (status) items = items.filter((i) => (i.status ?? 'new') === status);

  items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  return res.json({ items });
});

export default router;
