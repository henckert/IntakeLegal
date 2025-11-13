export type FormInstance = {
  id: string;
  firmId: string;
  templateId: string;
  slug: string;
  published: boolean;
  themeJSON?: any;
  retentionPolicy?: string;
  schemaJSON?: any;
  createdAt: string;
  updatedAt: string;
};

export type Intake = {
  id: string;
  formId: string;
  slug: string;
  clientName: string;
  contactJSON: Record<string, any>;
  narrative: string;
  eventDatesJSON?: string[];
  consent: boolean;
  ai: {
    summary: string;
    classification: string;
    followUps: string[];
  };
  sol: {
    expiryDate?: string;
    daysRemaining?: number;
    badge?: 'red' | 'amber' | 'green';
    basis?: string;
    disclaimer?: string;
  };
  status: 'new' | 'in-review' | 'closed';
  createdAt: string;
};

class MemoryDB {
  forms = new Map<string, FormInstance>();
  intakes = new Map<string, Intake>();

  findFormBySlug(slug: string) {
    for (const f of this.forms.values()) if (f.slug === slug && f.published) return f;
    return undefined;
  }
}

export const db = new MemoryDB();
