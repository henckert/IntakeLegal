#!/usr/bin/env tsx

import assert from 'node:assert/strict';

async function run() {
  const url = `http://localhost:4000/api/intake/demo/submit`;
  // Send deliberately invalid JSON
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{ invalid json' });
  assert.equal(res.status, 400);
  const rid = res.headers.get('X-Request-Id');
  assert.ok(rid, 'X-Request-Id should be present');
  const j = await res.json();
  assert.ok(j.error, 'error envelope present');
}

run().catch(e => { console.error(e); process.exit(1); });
