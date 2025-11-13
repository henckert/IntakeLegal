#!/usr/bin/env tsx

import assert from 'node:assert/strict';
import { getMemoryAuditLogs } from '../src/services/audit.js';

async function run() {
  // Memory audit logs are appended when prisma is not configured.
  const logs = getMemoryAuditLogs();
  // Minimal check: ensure previous tests emitted some audit entries
  const hasUpload = logs.some(l => l.eventType.startsWith('upload.'));
  const hasConsent = logs.some(l => l.eventType === 'consent.changed');
  // Intake processed may or may not run depending on earlier flow, so we check at least one
  assert.ok(hasUpload || hasConsent, 'Expected some audit events in memory');
  console.log('Audit logs present:', logs.slice(-5).map(l => l.eventType).join(', '));
}

run().catch(e => { console.error(e); process.exit(1); });
