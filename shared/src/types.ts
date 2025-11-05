export type Plan = 'free' | 'pro' | 'enterprise';

export interface Firm {
  id: string;
  name: string;
  logoUrl?: string;
  brandColor?: string;
  plan: Plan;
  settingsJSON?: any;
}

export interface User {
  id: string;
  firmId: string;
  role: 'admin' | 'member';
  clerkExternalId: string;
}

export type Vertical = 'PI' | 'Litigation' | 'Family' | 'Conveyancing' | 'Commercial' | 'Employment';

export interface FormTemplate {
  id: string;
  firmId?: string | null;
  vertical: Vertical;
  schemaJSON: any;
  isSystemTemplate: boolean;
}

export interface FormInstance {
  id: string;
  firmId: string;
  templateId: string;
  slug: string;
  themeJSON?: any;
  retentionPolicy?: string;
}

export interface Intake {
  id: string;
  formInstanceId: string;
  createdAt: Date;
  clientName: string;
  contactJSON: any;
  narrative: string;
  areaTag?: string;
  aiSummary?: string;
  followUpsJSON?: string[];
  eventDatesJSON?: string[];
  solDate?: string;
  solBasis?: string;
  priorityScore?: number;
  status?: 'new' | 'in_progress' | 'closed';
}

export interface AuditLog {
  id: string;
  firmId: string;
  actorId?: string | null;
  action: string;
  metaJSON?: any;
  createdAt: Date;
}
