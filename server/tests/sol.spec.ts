#!/usr/bin/env tsx

// Lightweight SOL acceptance checks (no Jest)
// Run with: npx tsx server/tests/sol.spec.ts

import assert from 'node:assert/strict';
import { computeSOL } from '../src/services/sol.js';
import { SOL_SCENARIOS } from '../src/services/solScenarios.js';

function run() {
  let failed = 0;
  let passed = 0;

  for (const sc of SOL_SCENARIOS) {
    const res = computeSOL(sc.claimType, sc.eventDateISO, { jurisdiction: 'ie', version: 'v1' });

    try {
      // Unknown claim types won't have expectedYears
      if (sc.expectedYears) {
        assert.ok(res.basis && res.basis.includes(String(sc.expectedYears)), `basis should include ${sc.expectedYears} years`);
      }
      assert.equal(res.badge, sc.expectedBadge, `badge should be ${sc.expectedBadge}`);
      assert.ok(res.disclaimer, 'disclaimer present');
      assert.ok(res.version && res.version.startsWith('ie-'), 'version stamped');
      assert.ok(res.disclaimerVersion, 'disclaimer version stamped');
      passed++;
      console.log(`[PASS] ${sc.id} -> badge=${res.badge} basis=${res.basis}`);
    } catch (e: any) {
      failed++;
      console.error(`[FAIL] ${sc.id}: ${e.message}`);
    }
  }

  console.log(`\nSOL acceptance summary: passed=${passed}, failed=${failed}`);
  if (failed > 0) process.exit(1);
}

run();
