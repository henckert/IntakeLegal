import { differenceInCalendarDays, addYears, formatISO } from './timeutil.js';

export type SolResult = {
  expiryDate?: string;
  daysRemaining?: number;
  badge?: 'red' | 'amber' | 'green';
  basis?: string;
  disclaimer?: string;
  version?: string; // e.g., 'ie-v1'
  disclaimerVersion?: string; // e.g., '2025-01'
};

const ENABLE_SOL_UPDATES = (process.env.ENABLE_SOL_UPDATES || 'true').toLowerCase() !== 'false';
const DEFAULT_JURISDICTION = 'ie';
const DEFAULT_VERSION = 'v1';
export const DISCLAIMER_VERSION = '2025-01';

export function getSolDefaultVersion(): string {
  return `${DEFAULT_JURISDICTION}-${DEFAULT_VERSION}`;
}

function yearsForClaim(claim: string): number | undefined {
  const c = claim.toLowerCase();
  if (c.includes('defamation')) return 1;
  if (c.includes('personal injury') || c.includes('pi')) return 2;
  if (c.includes('contract') || c.includes('negligence')) return 6;
  return undefined;
}

type ComputeOptions = {
  jurisdiction?: string; // e.g., 'ie'
  version?: string; // e.g., 'v1'
};

function computeSOL_ie_v1(claimType: string, eventDateISO: string): SolResult {
  const years = yearsForClaim(claimType);
  if (!years)
    return {
      // For unknown categories, provide a safe default: no computed expiry and a neutral/green badge
      // to avoid alarming users while still surfacing a disclaimer.
      badge: 'green',
      disclaimer: 'Claim category not recognised for SOL v1 mapping.',
      version: 'ie-v1',
      disclaimerVersion: DISCLAIMER_VERSION,
    };
  const expiry = addYears(new Date(eventDateISO), years);
  const days = differenceInCalendarDays(expiry, new Date());
  const badge = days < 30 ? 'red' : days <= 90 ? 'amber' : 'green';
  return {
    expiryDate: formatISO(expiry),
    daysRemaining: days,
    badge,
    basis: `${claimType} – ${years} years from date of event`,
    disclaimer: 'Indicative only; seek legal advice. Not a substitute for professional judgment.',
    version: 'ie-v1',
    disclaimerVersion: DISCLAIMER_VERSION,
  };
}

export function computeSOL(
  claimType: string | undefined,
  eventDateISO: string | undefined,
  opts: ComputeOptions = {}
): SolResult {
  if (!claimType || !eventDateISO) return { disclaimer: 'Insufficient information for limitation assessment.', version: `${DEFAULT_JURISDICTION}-${DEFAULT_VERSION}`, disclaimerVersion: DISCLAIMER_VERSION };

  const jurisdiction = (opts.jurisdiction || DEFAULT_JURISDICTION).toLowerCase();
  const version = (opts.version || DEFAULT_VERSION).toLowerCase();

  if (!ENABLE_SOL_UPDATES) {
    // Legacy path: always IE v1 semantics
    return computeSOL_ie_v1(claimType, eventDateISO);
  }

  // Strategy map for future versions/jurisdictions
  if (jurisdiction === 'ie' && version === 'v1') {
    return computeSOL_ie_v1(claimType, eventDateISO);
  }

  // Fallback
  return computeSOL_ie_v1(claimType, eventDateISO);
}
