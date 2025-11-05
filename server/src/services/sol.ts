import { differenceInCalendarDays, addYears, formatISO } from './timeutil.js';

export type SolResult = {
  expiryDate?: string;
  daysRemaining?: number;
  badge?: 'red' | 'amber' | 'green';
  basis?: string;
  disclaimer?: string;
};

function yearsForClaim(claim: string): number | undefined {
  const c = claim.toLowerCase();
  if (c.includes('defamation')) return 1;
  if (c.includes('personal injury') || c.includes('pi')) return 2;
  if (c.includes('contract') || c.includes('negligence')) return 6;
  return undefined;
}

export function computeSOL(claimType: string | undefined, eventDateISO: string | undefined): SolResult {
  if (!claimType || !eventDateISO) return { disclaimer: 'Insufficient information for limitation assessment.' };
  const years = yearsForClaim(claimType);
  if (!years) return { disclaimer: 'Claim category not recognised for SOL v1 mapping.' };
  const expiry = addYears(new Date(eventDateISO), years);
  const days = differenceInCalendarDays(expiry, new Date());
  const badge = days < 30 ? 'red' : days <= 90 ? 'amber' : 'green';
  return {
    expiryDate: formatISO(expiry),
    daysRemaining: days,
    badge,
    basis: `${claimType} – ${years} years from date of event`,
    disclaimer: 'Indicative only; seek legal advice. Not a substitute for professional judgment.',
  };
}
