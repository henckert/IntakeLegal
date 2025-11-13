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
    await prisma.intake.upsert({
      where: { id },
      create: {
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
      update: {
        formId: data.formId,
        slug: data.slug,
        clientName: data.clientName,
        contactJSON: data.contactJSON,
        narrative: data.narrative,
        eventDatesJSON: data.eventDatesJSON ?? [],
        consent: data.consent ?? true,
        aiSummary: data.ai?.summary ?? undefined,
        aiClassification: data.ai?.classification ?? undefined,
        aiFollowUps: data.ai?.followUps ?? undefined,
        solExpiryDate: data.sol?.expiryDate ? new Date(data.sol.expiryDate) : undefined,
        solDaysRemaining: data.sol?.daysRemaining ?? undefined,
        solBadge: data.sol?.badge ?? undefined,
        solBasis: data.sol?.basis ?? undefined,
        solDisclaimer: data.sol?.disclaimer ?? undefined,
        status: data.status ?? undefined,
      },
    });
  }
  async values() {
    const prisma = getPrisma();
    if (!prisma) return Array.from(memory.intakes.values());
    const all = await prisma.intake.findMany();
    return all as any[];
  }
  async updateSummary(id: string, summary: string) {
    const prisma = getPrisma();
    if (!prisma) {
      const cur = memory.intakes.get(id);
      if (cur) {
        (cur as any).ai = { ...(cur as any).ai, summary };
        memory.intakes.set(id, cur);
      }
      return;
    }
    await prisma.intake.update({ where: { id }, data: { aiSummary: summary } });
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
