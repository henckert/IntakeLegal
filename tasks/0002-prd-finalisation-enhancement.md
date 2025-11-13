## 0002 PRD — Finalisation Enhancement Meta-Feature

### 1. Introduction / Overview
This meta-feature bundles the critical production‑readiness and correctness layers required to move IntakeLegal from MVP to a reliable multi‑tenant legal intake platform. It addresses: strict data isolation, statute of limitations (SOL) accuracy with versioned test suite, AI processing with redaction and provenance, secure file intake, lifecycle and audit observability, standardized error & logging, and high‑fidelity PDF export. Two sub‑capabilities (SOL table updates and AI redaction pipeline) will be gated behind feature flags for safe incremental rollout.

### 2. Goals
1. Enforce tenant isolation on all data operations (100% firmId scoping) with guard rails (wrapper, lint rule, test harness).
2. Provide accurate SOL calculations (Ireland personal injury & initial England/Wales scenarios) validated by a 25‑scenario acceptance suite with versioning.
3. Implement AI intake pipeline (summary, classification, follow‑ups) with prompt/version tracking, source flag (openai|mock), and PII redaction (names, addresses, phone, email, PPSN/NINO, DOB, employer, medical providers) prior to persistence.
4. Add robust file upload validation (extension + MIME/magic bytes) and rate limiting (uploads 5/min, AI calls 10/min per user & firm) plus consent gating for AI.
5. Define and enforce intake lifecycle (draft → submitted → processed → exported → archived) with automatic processing on submit and audit logging of key events.
6. Standardize error envelope and logging structure (masked PII, correlation id) and provide performance & correctness test coverage.
7. Deliver A4 PDF export (logo + firm, matter info, AI summary, SOL outcomes + disclaimers, follow-ups) with multi-page headers and font size spec.
8. Guarantee no PII in logs, redaction consistency, and documented open risks.

### 3. User Stories
1. As a firm user, I can submit an intake and have it automatically processed (AI + SOL) producing accurate summaries and follow-ups with sensitive data protected.
2. As an admin, I can trust that no intake from Firm A can be accessed by Firm B (attempts return 404).
3. As a firm user, I receive immediate validation rejection for disallowed or oversized files before server processing.
4. As a firm user, I can export a PDF containing summary, SOL, follow-ups, and disclaimers styled consistently.
5. As compliance / future reviewer, I can inspect audit logs for create/update/export/archive events.
6. As engineering, I can run a deterministic SOL test suite to catch regressions when statutes or logic change.
7. As a client uploading an intake, I give explicit AI processing consent once per firm; if not granted, the system still accepts the intake but skips AI.

### 4. Functional Requirements
FR1 Multi‑tenancy enforcement: All DB queries must include firmId scoping via a query wrapper; cross‑firm access returns 404.
FR2 Lint rule / static check that disallows direct prisma calls without wrapper.
FR3 Test harness asserts representative queries are firm‑scoped (failing examples blocked).
FR4 SOL engine supports Ireland personal injury + initial England/Wales scenario taxonomy with configurable version id.
FR5 Maintain `solVersion` and `solDisclaimerVersion` persisted per calculation.
FR6 Provide acceptance test suite of 25 scenarios (fields: id, title, jurisdiction, area, statuteRef, triggerType, expectedOutcome, expectedBadge).
FR7 AI pipeline modules: ingest raw intake → redact PII → generate summary, classification, up to 5 follow-ups → persist with promptVersion, source, model.
FR8 Redaction logic reversible via token mapping only for runtime re-insertion (not stored in logs).
FR9 Rate limiting: uploads (5/min) and AI calls (10/min) enforced per-user & per-firm; exceed → error code `rate_limited`.
FR10 Consent gating: if firm has not consented, AI pipeline bypassed; normal intake stored.
FR11 File validation: client-side pre-check + server-side magic bytes / MIME verification; allowed types pdf, doc, docx, txt, jpg, png; size ≤10MB.
FR12 Error codes supported: validation_error, not_found, unauthorized, forbidden, rate_limited, conflict, system_error, external_error, payload_too_large.
FR13 Standard error envelope: `{ error: { code, message, details? } }`; success responses raw data.
FR14 Logging: structured JSON with level, timestamp, requestId (X-Request-Id), userId, firmId, event context; mask specified PII fields.
FR15 Audit log table: events (login, intake_create, intake_update, intake_process, intake_export, intake_archive, file_upload) persisted with metadata JSON.
FR16 Intake lifecycle: state transitions enforced; archived is terminal (no revert); exported sets exportedAt timestamp.
FR17 Auto-processing triggers on submit → AI + SOL run sequentially; failure logs error & sets processed flag false.
FR18 PDF export generator: sections ordered (Logo+Firm, Matter Info, AI Summary, SOL + disclaimers, Follow-ups); A4; font sizes Title 18–22, Headings 14–16, Body 10–11; repeat header/footer each page.
FR19 PDF excludes internal system notes and includes logo placeholder; no watermark.
FR20 Health endpoint includes commit hash and service versions (solVersion, promptVersion).
FR21 SOL and AI disclaimers displayed in web, email templates, and PDF.
FR22 No PII appears in logs or test snapshots.
FR23 Feature flags: `enableSolUpdates`, `enableAiRedactionPipeline` controlling dynamic activation.
FR24 Redaction fields: names, addresses, phone, email, PPSN/NINO, DOB, employer, medical providers.
FR25 Follow-up questions limited to max 5.

### 5. Non-Goals / Out of Scope
GraphQL, realtime (WebSockets/SSE), dark mode, multilingual UI, advanced billing, notification preferences, autosave builder, full read access logs, OpenTelemetry tracing, antivirus scanning, Terraform infra, caching of PDFs/AI outputs.

### 6. Design Considerations
Consistent heading hierarchy (hero large; interior pages use smaller scale). Placeholder logo uses fixed dimensions to prevent layout shifts. Use brand token palette; legacy tokens marked deprecated but retained. All dates displayed DD/MM/YYYY. Disclaimers stylistically rendered with subtle border and muted text.

### 7. Technical Considerations
- Introduce a Prisma wrapper (e.g. `tenantDb(firmId)` returning narrowed client).
- ESLint rule or code mod pattern detection for direct `prisma.` usage outside wrapper.
- SOL engine modular: jurisdiction strategies keyed by version id.
- AI service: single orchestrator function with redaction pre-step; token mapping ephemeral.
- Rate limit middleware using in-memory store for local; pluggable adapter (Redis) later.
- File validation: use a library (e.g. `file-type`) to inspect magic bytes; fallback to MIME.
- PDF: pdfkit or existing `pdf.ts` extended with layout util; handle multi-page text flow.
- Logging: attach requestId middleware early; generate if absent.
- Feature flags via environment variables or a small in-memory config service.

### 8. Success Metrics
- 0 critical SOL miscalculations in acceptance suite.
- 100% firmId scoping verified by automated test scanning representative queries.
- ≥99% invalid file rejection accuracy in tests.
- Zero PII occurrences detected by log scanner (mask audit).
- p95 non-AI endpoints <500ms; AI endpoints <5s.
- PDF generation p95 <3000ms.

### 9. Open Questions (Resolved by Spec Inputs)
All major clarifications provided; any additional jurisdictions or consent text copy to be supplied separately.

### 10. Open Risks
R1 SOL legal accuracy depends on correct statute interpretation and could produce liability if wrong.
R2 AI model drift changes output quality; need promptVersion provenance.
R3 Cross-firm leakage would be catastrophic → strict test + lint enforcement.
R4 PII redaction quality directly impacts GDPR exposure.
R5 File upload pathway is a common attack vector (malicious files, oversized payloads).
R6 Incorrect disclaimers could mislead users; version them.

### 11. Acceptance Criteria
AC1 All FRs implemented; non-goals untouched.
AC2 SOL test suite (25 scenarios) passes; failing scenarios block merge.
AC3 Attempted direct prisma query (without wrapper) triggers lint failure in CI.
AC4 Upload of disallowed file type returns `file_invalid_type` within 300ms.
AC5 AI pipeline stores redacted + token mapped content; raw PII absent from logs.
AC6 PDF export contains required sections and matches font sizing spec.
AC7 Audit logs present for all listed event types with metadata.
AC8 Health endpoint returns commit hash and versions.
AC9 Rate limiting returns proper `rate_limited` error envelope.
AC10 Error envelope format validated in tests for each code path.

### 12. Working Protocol
- Execution proceeds parent task by parent task. Sub-tasks may be completed sequentially without pausing for review between them.
- After all sub-tasks under a parent are completed: run full test suite, stage, clean temporary artifacts, and commit with a conventional message referencing the parent task and PRD.
- Pause for approval only after each parent task; do not pause after each sub-task.

### 13. Dependencies / Phasing
Phase order (blocking): Multi-tenancy → SOL engine/tests → AI pipeline → PDF export. Parallel permissible between SOL tests and AI after wrapper + lifecycle scaffolding.

### 14. Data Model Additions (Sketch)
`AuditLog(id, timestamp, eventType, actorUserId, firmId, entityType, entityId, metadata JSONB)`
Add columns: `Intake.state`, `Intake.processedAt`, `Intake.exportedAt`, `Intake.archivedAt`, `Intake.solVersion`, `Intake.promptVersion`.
`Firm.aiConsentAt`, `Firm.uploadDayCount`, `Firm.uploadDayCountUpdatedAt`.

### 15. Sample JSON Payloads
Error envelope: `{ "error": { "code": "validation_error", "message": "Field x is required" } }`
SOL result: `{ "jurisdiction": "IE", "area": "personal_injury", "badge": "amber", "expiryDate": "2027-05-14", "solVersion": "1.0.0", "disclaimerVersion": "1.0.0" }`
AI summary persist: `{ "intakeId": "...", "summary": "...", "classification": { ... }, "followUps": ["..."], "promptVersion": "2025.11.13-1", "source": "openai" }`

### 16. Pseudocode Sketch (Illustrative)
```ts
// tenant wrapper
function tenantDb(firmId: string) {
  return new Proxy(prisma, {
    get(target, prop) {
      const model = (target as any)[prop];
      if (typeof model === 'object' && 'findMany' in model) {
        return new Proxy(model, {
          get(mTarget, mProp) {
            const orig = (mTarget as any)[mProp];
            if (typeof orig === 'function') {
              return (args: any = {}) => orig({ ...args, where: { firmId, ...(args?.where || {}) } });
            }
            return orig;
          }
        });
      }
      return model;
    }
  });
}

// intake submit flow
async function submitIntake(intakeId, firmId) {
  const db = tenantDb(firmId);
  await db.intake.update({ where: { id: intakeId }, data: { state: 'submitted' } });
  try {
    const redacted = redactPII(await db.intake.findUnique({ where: { id: intakeId } }));
    const sol = await computeSOL(redacted, firmId);
    const ai = await runAI(redacted);
    await persistResults(intakeId, sol, ai);
    audit('intake_process', { intakeId });
  } catch (e) {
    log.error('processing_failed', { intakeId, err: e.message });
  }
}
```

### 17. Feature Flags
`enableSolUpdates` — toggles loading new SOL jurisdiction/version sets.
`enableAiRedactionPipeline` — toggles PII redaction pre-step + token mapping.

### 18. Documentation Artifacts to Produce
Sequence diagrams (submit flow, export flow); DB migration sketches; JSON samples; service pseudocode (above) integrated in developer docs.

### 19. Open Follow-ups
Consent template text to be provided.
Exact statute references list to populate initial SOL table.
Logo asset finalization (placeholder currently). 
