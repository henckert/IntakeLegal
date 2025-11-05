import { z } from 'zod';

export const CreateOrUpdateFormInput = z.object({
  id: z.string().optional(),
  firmId: z.string().min(1),
  templateId: z.string().min(1),
  slug: z.string().min(2),
  themeJSON: z.any().optional(),
  retentionPolicy: z.string().optional(),
});

export const PublishFormInput = z.object({ id: z.string().min(1) });

export const IntakeSubmitInput = z.object({
  slug: z.string().min(2),
  clientName: z.string().min(1),
  contactJSON: z.record(z.any()),
  narrative: z.string().min(1),
  eventDatesJSON: z.array(z.string()).optional(),
  consent: z.boolean().refine((v) => v === true, 'GDPR consent is required'),
});

export const FilterQuery = z.object({
  area: z.string().optional(),
  urgency: z.enum(['red', 'amber', 'green']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type TCreateOrUpdateFormInput = z.infer<typeof CreateOrUpdateFormInput>;
export type TPublishFormInput = z.infer<typeof PublishFormInput>;
export type TIntakeSubmitInput = z.infer<typeof IntakeSubmitInput>;
export type TFilterQuery = z.infer<typeof FilterQuery>;
