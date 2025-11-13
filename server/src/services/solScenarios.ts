// Deterministic SOL scenarios for acceptance checks
// Uses relative offsets from today to keep badge classification stable

import { formatISO } from './timeutil.js';

export type SolScenario = {
  id: string;
  claimType: string;
  eventDateISO: string; // derived from today with offsets
  expectedBadge: 'red' | 'amber' | 'green';
  expectedYears?: number;
};

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatISO(d);
}

// Helper to compute offsets so that remaining days map to a given badge for given years
function eventDateForBadge(years: number, badge: 'red' | 'amber' | 'green') {
  const daysInYears = years * 365; // approximation sufficient for coarse grouping
  // We choose remaining days targets well within the bucket to avoid edge flakiness
  const rem = badge === 'red' ? 15 : badge === 'amber' ? 60 : 180;
  const elapsed = daysInYears - rem;
  return daysAgo(elapsed);
}

const CLAIMS: Array<{ name: string; years: number }> = [
  { name: 'Defamation', years: 1 },
  { name: 'Personal Injury', years: 2 },
  { name: 'Contract', years: 6 },
  { name: 'Negligence', years: 6 },
];

// Generate 24 scenarios: 4 claim types × 3 badges × 2 spelling variants
const scenarios: SolScenario[] = [];

const badges: Array<'red' | 'amber' | 'green'> = ['red', 'amber', 'green'];

for (const { name, years } of CLAIMS) {
  for (const badge of badges) {
    // canonical name
    scenarios.push({
      id: `${name.toLowerCase().replace(/\s+/g, '-')}-${badge}`,
      claimType: name,
      eventDateISO: eventDateForBadge(years, badge),
      expectedBadge: badge,
      expectedYears: years,
    });
    // variant spelling / abbreviation
    const variant = name === 'Personal Injury' ? 'PI' : name.toLowerCase();
    scenarios.push({
      id: `${variant}-${badge}`,
      claimType: variant,
      eventDateISO: eventDateForBadge(years, badge),
      expectedBadge: badge,
      expectedYears: years,
    });
  }
}

// Add one unknown category scenario to ensure graceful fallback
scenarios.push({
  id: 'unknown-claim',
  claimType: 'Equity/Trusts',
  eventDateISO: daysAgo(30),
  expectedBadge: 'green', // not validated (no mapping), but included for coverage
});

export const SOL_SCENARIOS: SolScenario[] = scenarios;
