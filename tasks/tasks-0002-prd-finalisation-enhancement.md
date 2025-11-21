## Relevant Files

- `server/src/prisma/client.ts` - Add tenant wrapper / firmId scoping helper.
- `server/src/services/firmId.ts` - Extract firmId from auth/headers/query/body.
- `server/src/middleware/requestId.ts` - Inject X-Request-Id header & attach to context.
- `server/src/middleware/rateLimit.ts` - Per-user & per-firm rate limiting logic.
- `server/src/middleware/consentGate.ts` - Blocks AI processing if firm consent absent.
- `server/src/services/tenantDb.ts` - Exports prisma proxy enforcing firmId.
- `server/src/services/sol.ts` - Refactor to support versioned jurisdictions & scenario execution.
- `server/src/services/solScenarios.ts` - Acceptance test scenario definitions (25 cases).
- `server/src/services/ai.ts` - Orchestrator: redaction + summary/classification/followUps + provenance fields.
- `server/src/services/redaction.ts` - PII redaction + token mapping utilities.
- `server/src/services/pdf.ts` - Extend to produce ordered sections, multi-page header/footer, font sizes.
- `server/src/services/audit.ts` - Write audit log entries.
- `server/src/routes/intake.ts` - Implement lifecycle transitions & auto-processing on submit.
- `server/src/routes/uploads.ts` - Enforce file validation & rate limits.
- `server/src/routes/dashboard.ts` - Ensure firmId scoping via tenant wrapper (representative queries).
- `server/src/routes/forms.ts` - Ensure tenant wrapper usage; export PDF endpoint if not present.
- `server/src/lib/errors.ts` - Central error envelope helpers & codes.
- `server/src/lib/log.ts` - Structured masked logging utilities.
- `server/src/lib/rateLimiter.ts` - Backing store & algorithm (token bucket or fixed window).
- `server/src/lib/featureFlags.ts` - Reads env flags (enableSolUpdates, enableAiRedactionPipeline).
- `server/prisma/schema.prisma` - Add fields: lifecycle timestamps, versions, audit log table, consent.
- `server/prisma/migrations/*` - Migration files for new columns & audit log table.
- `server/tests/sol.spec.ts` - SOL acceptance suite (25 scenarios).
- `server/tests/multiTenancy.spec.ts` - Verifies queries are firm-scoped; negative leakage tests.
- `server/tests/aiPipeline.spec.ts` - Redaction correctness, provenance fields, follow-up limit.
- `server/tests/uploads.spec.ts` - File type/size validation & rate limiting.
- `server/tests/errorEnvelope.spec.ts` - Standard error shape across endpoints.
- `server/tests/auditLog.spec.ts` - Audit events recorded for lifecycle & exports.
- `server/tests/pdf.spec.ts` - PDF export content ordering & disclaimers.
- `server/tests/redactionSnapshot.spec.ts` - Ensures masked tokens / no raw PII stored.
- `scripts/check-prisma-usage.mjs` - Guardrail script blocking raw @prisma/client imports.
- `scripts/test-server.mjs` - Detached server test runner with guardrails.
- `web/lib/api.ts` - Adjust client error handling for new envelope.
- `web/components/ConsentBanner.tsx` - UI to capture AI consent.
- `web/components/UploadWidget.tsx` - Client-side pre-check for file size/type.
- `web/components/Disclaimer.tsx` - Reusable SOL / AI disclaimers block.
- `web/app/intake/[slug]/page.tsx` - Surface disclaimers & consent gating states.
- `web/app/intakes/[id]/page.tsx` - Display processed summary & SOL outputs.
- `web/app/(marketing)/page.tsx` - Ensure hero PDF/export references removed if outdated.
- `tasks/0002-prd-finalisation-enhancement.md` - Source PRD (reference only).

### Notes

- Each test file focuses on one concern to keep failures localized.
- Avoid direct `prisma.` calls outside `tenantDb`; lint rule will flag violations.
- Feature flags read once at startup; restart needed to toggle (acceptable MVP).
- Redaction token mapping stored transiently (not persisted long-term) – unit tests mock ephemeral store.
- Date display in UI uses DD/MM/YYYY formatting helper (add if missing).

## Tasks

- [x] 1.0 Multi-Tenancy Enforcement & Guard Rails
  - [x] 1.1 Implement `tenantDb` proxy enforcing firmId injection.
  - [x] 1.2 Add lifecycle & version columns to Prisma schema (firm consent, audit table) initial migration.
  - [x] 1.3 Introduce ESLint/custom rule to detect disallowed raw `prisma.` usages.
  - [x] 1.4 Refactor existing route handlers (`dashboard`, `forms`, `intake`, `uploads`) to use `tenantDb`.
  - [x] 1.5 Add multi-tenancy test harness (prisma usage guardrail) and integrate in test runner.
  - [x] 1.6 Add requestId middleware and structured logging baseline.
  - [x] 1.7 Commit (after all subtasks complete & tests pass).

- [x] 2.0 SOL Engine & Versioned Acceptance Suite
  - [x] 2.1 Extend `sol.ts` with version parameter & jurisdiction strategy map.
  - [x] 2.2 Implement scenario definition module (`solScenarios.ts`).
  - [x] 2.3 Add SOL calculation persistence fields (`solVersion`, `disclaimerVersion`).
  - [x] 2.4 Implement feature flag `enableSolUpdates` gating new jurisdiction loading.
  - [x] 2.5 Write 25 acceptance scenarios & expected badge/date outputs.
  - [x] 2.6 Add SOL test suite & ensure deterministic results (mocks if needed).
  - [x] 2.7 Commit after test pass.

- [x] 3.0 AI Pipeline with Redaction & Provenance
  - [x] 3.1 Create `redaction.ts` with patterns for PII fields (emails, phones, dates).
  - [x] 3.2 Update `ai.ts` orchestrator: redact → call model → return summary/classification/followUps.
  - [x] 3.3 Add `promptVersion`, `source`, `model` fields to provenance.
  - [x] 3.4 Enforce follow-up max=5.
  - [ ] 3.5 Implement retry-once logic for transient AI failures. (deferred)
  - [x] 3.6 Integrate feature flag `ENABLE_AI_REDACTION_PIPELINE` (skip redaction if off).
  - [x] 3.7 Add tests: redaction correctness, provenance fields, follow-up limit.
  - [x] 3.8 Commit after tests pass.

- [x] 4.0 Secure File Intake, Rate Limiting & Consent
  - [x] 4.1 Add server-side file validation (magic bytes + extension + size).
  - [x] 4.2 Add client-side pre-check in `FileUpload` (size/type) – already present.
  - [x] 4.3 Implement rate limiter (uploads 5/min per-user & per-firm; AI 10/min).
  - [x] 4.4 Add consent column on `Firm` (aiConsentAt) & migration. (Read via FirmTemplate.aiConsentAt; upsert used.)
  - [x] 4.5 Build `ConsentBanner` component + route to set consent.
  - [x] 4.6 Integrate consent gate middleware (skip AI only).
  - [x] 4.7 Add tests: file validation (PowerShell script), rate limit exceed, consent gating.
  - [x] 4.8 Commit after tests pass.

- [x] 5.0 Intake Lifecycle, Audit Logging & Error/Logging Standardization
  - [x] 5.1 Add lifecycle transitions (submitted→processed→exported→archived) & timestamps. (Persist on submit; export emits audit.)
  - [x] 5.2 Auto-process on submit (invoke AI + SOL sequentially).
  - [x] 5.3 Create `audit.ts` and insert events at key points (upload created/processed, consent changed, intake processed/exported).
  - [x] 5.4 Implement error envelope helper & update routes to standardize (consent, uploads, intake bad JSON).
  - [x] 5.5 Add masked logging (baseline existed in `lib/log.ts`).
  - [x] 5.6 Add tests: audit log presence, error envelope coverage; integrated into runner.
  - [x] 5.7 Commit after tests pass.

- [x] 6.0 PDF Export Delivery
  - [x] 6.1 Extend `pdf.ts` for ordered sections & repeated header/footer.
  - [x] 6.2 Implement font sizing spec (Title 20, Headings 14, Body 11).
  - [x] 6.3 Insert SOL + AI disclaimers in export (SOL line + common disclaimer block).
  - [x] 6.4 Exclude internal notes; include logo placeholder.
  - [x] 6.5 Add tests: content ordering, disclaimers present, follow-ups ≤5.
  - [x] 6.6 Performance test PDF generation (p95 proxy <3000ms in unit test).
  - [x] 6.7 Commit after tests pass.

- [x] 7.0 Cross-Cutting Quality & Compliance
  - [x] 7.1 Add health endpoint enrichments (commit hash, solVersion, promptVersion).
  - [x] 7.2 Implement logging scan test ensuring zero PII patterns.
  - [x] 7.3 Add DD/MM/YYYY date formatting helper & apply across UI where missing (IntakeSummary).
  - [x] 7.4 Produce sequence diagrams & attach to docs (intake submit, PDF export).
  - [x] 7.5 Final QA checklist execution (rate limits, consent flow, error codes) via detached test runner.
  - [x] 7.6 Consolidate documentation artifacts in `docs/finalisation/`.
  - [x] 7.7 Commit after tests & QA complete.

### Additional / Emerging Tasks
- (Add here as discovered.)

### Completion Protocol Reminder
- Work through sub-tasks sequentially under the active parent task without pausing for approval between sub-tasks.
- After each sub-task, mark `[x]` and keep Relevant Files up to date, then continue to the next sub-task.
- When all sub-tasks under a parent are `[x]`: run the full test suite, stage, clean temporary artifacts, and commit with a conventional message referencing the parent task and PRD.
- Pause and request approval only after each parent task is completed.
