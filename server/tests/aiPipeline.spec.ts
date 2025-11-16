#!/usr/bin/env tsx

import assert from 'node:assert/strict';
import { redactPII } from '../src/services/redaction.js';
// runAI imported dynamically after env mutation to ensure mock path when key absent

function testRedaction() {
  const text = 'My email is jane.doe@example.com and phone is +353 85 123 4567. Incident on 2024-09-12.';
  const { redactedText, tokens } = redactPII(text);
  assert.ok(tokens.length >= 3, 'should redact at least email, phone, date');
  for (const t of tokens) {
    assert.ok(!redactedText.includes(t.value), `redacted text must not include ${t.type}`);
  }
}

async function testRunAI() {
  const origKey = process.env.OPENAI_API_KEY;
  // Force mock behavior regardless of previously loaded ENV snapshot
  delete process.env.OPENAI_API_KEY;
  process.env.FORCE_MOCK_AI = 'true';
  const { runAI } = await import('../src/services/ai.js');
  const res = await runAI('My name is John. Contact me at john@doe.com.');
  // Restore environment
  if (origKey) process.env.OPENAI_API_KEY = origKey; else delete process.env.OPENAI_API_KEY;
  delete process.env.FORCE_MOCK_AI;
  assert.ok(res.followUps.length <= 5, 'followUps should be limited to 5');
  assert.ok(res.provenance, 'provenance present');
  assert.equal(res.provenance.source, 'mock');
  assert.ok(typeof res.provenance.redactionsApplied === 'number');
}

async function run() {
  try {
    testRedaction();
    await testRunAI();
    console.log('AI pipeline tests passed');
  } catch (e: any) {
    console.error('AI pipeline tests failed:', e.message);
    process.exit(1);
  }
}

run();
