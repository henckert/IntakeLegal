import { db as memory } from './memory.js';
import { getPrisma } from '../prisma/client.js';

// Minimal adapter to provide get/set/values-like API over Prisma
class PrismaForms {
  async get(id: string) {
    const prisma = getPrisma();
    if (!prisma) return memory.forms.get(id);
    const f = await prisma.formInstance.findUnique({ where: { id } });
    return f as any;
  }
  async set(id: string, data: any) {
    const prisma = getPrisma();
    if (!prisma) return memory.forms.set(id, data);
    await prisma.formInstance.upsert({
      where: { id },
      update: {
        firmId: data.firmId,
        templateId: data.templateId,
        slug: data.slug,
        published: data.published,
        themeJSON: data.themeJSON,
        retentionPolicy: data.retentionPolicy,
        schemaJSON: data.schemaJSON,
      },
      create: {
        id,
        firmId: data.firmId,
        templateId: data.templateId,
        slug: data.slug,
        published: data.published ?? false,
        themeJSON: data.themeJSON,
        retentionPolicy: data.retentionPolicy,
        schemaJSON: data.schemaJSON,
      },
    });
  }
  async values() {
    const prisma = getPrisma();
    if (!prisma) return Array.from(memory.forms.values());
    const all = await prisma.formInstance.findMany();
    return all as any[];
  }
}

class PrismaIntakes {
  async get(id: string) {
    const prisma = getPrisma();
    if (!prisma) return memory.intakes.get(id);
    const i = await prisma.intake.findUnique({ where: { id } });
    return i as any;
  }
  async set(id: string, data: any) {
    const prisma = getPrisma();
    if (!prisma) return memory.intakes.set(id, data);
    await prisma.intake.create({
      data: {
        id,
        formId: data.formId,
        slug: data.slug,
        clientName: data.clientName,
        contactJSON: data.contactJSON,
        narrative: data.narrative,
        eventDatesJSON: data.eventDatesJSON ?? [],
        consent: data.consent ?? true,
        aiSummary: data.ai?.summary ?? '',
        aiClassification: data.ai?.classification ?? 'Other',
        aiFollowUps: data.ai?.followUps ?? [],
        solExpiryDate: data.sol?.expiryDate ? new Date(data.sol.expiryDate) : null,
        solDaysRemaining: data.sol?.daysRemaining ?? null,
        solBadge: data.sol?.badge ?? null,
        solBasis: data.sol?.basis ?? null,
        solDisclaimer: data.sol?.disclaimer ?? null,
        status: data.status ?? 'new',
      },
    });
  }
  async values() {
    const prisma = getPrisma();
    if (!prisma) return Array.from(memory.intakes.values());
    const all = await prisma.intake.findMany();
    return all as any[];
  }
}

export const db = {
  forms: new PrismaForms(),
  intakes: new PrismaIntakes(),
  async findFormBySlug(slug: string) {
    const prisma = getPrisma();
    if (!prisma) return memory.findFormBySlug(slug);
    return (await prisma.formInstance.findUnique({ where: { slug } })) as any;
  },
};
