#!/usr/bin/env tsx

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { audit, getMemoryAuditLogs } from '../src/services/audit.js';

function readJsonl(filePath: string): Array<any> {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => {
      try { return JSON.parse(l); } catch { return null; }
    })
    .filter(Boolean);
}

async function run() {
  const auditFile = process.env.AUDIT_LOG_FILE || path.join(process.cwd(), 'artifacts', 'test-audit.jsonl');

  // Prefer file sink (cross-process). If empty, seed one event so the test is still meaningful when run standalone.
  let fileLogs = readJsonl(auditFile);
  if (fileLogs.length === 0) {
    try { fs.mkdirSync(path.dirname(auditFile), { recursive: true }); } catch {}
    try { fs.unlinkSync(auditFile); } catch {}
    const req: any = { headers: { 'x-firm-id': 'demo', 'x-user-id': 'tester' }, query: {}, body: {} };
    await audit(req, 'consent.changed', { entityType: 'Firm', entityId: 'demo', consent: false });
    fileLogs = readJsonl(auditFile);
  }

  const hasUpload = fileLogs.some(l => String(l.eventType || '').startsWith('upload.'));
  const hasConsent = fileLogs.some(l => l.eventType === 'consent.changed');
  assert.ok(hasUpload || hasConsent, 'Expected some audit events in AUDIT_LOG_FILE');
  console.log('Audit logs present:', fileLogs.slice(-5).map(l => l.eventType).join(', '));

  // Also keep the in-memory assertion lightweight (should be non-empty when called in-process).
  const mem = getMemoryAuditLogs();
  if (mem.length) console.log('Memory audit logs present:', mem.slice(-5).map(l => l.eventType).join(', '));
}

run().catch(e => { console.error(e); process.exit(1); });
