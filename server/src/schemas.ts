import { z } from 'zod';

export const CreateOrUpdateFormInput = z.object({
  id: z.string().optional(),
  firmId: z.string().min(1),
  templateId: z.string().min(1),
  slug: z.string().min(2),
  themeJSON: z.any().optional(),
  retentionPolicy: z.string().optional(),
  schemaJSON: z.any().optional(),
});

export const FilterQuery = z.object({
  area: z.string().optional(),
  urgency: z.enum(['red', 'amber', 'green']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
