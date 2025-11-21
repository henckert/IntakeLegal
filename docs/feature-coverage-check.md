# Feature coverage check — Email/Voice Intake and Email-back Package

Date: 2025-11-14

This note verifies whether the repo implements the requested features and where to find them. Summary: all three features exist and are wired to the existing AI/SOL/PDF pipeline with mock fallbacks when keys are absent.

## 1) Email as an intake source

- Route: `POST /api/email-intake`
- File: `server/src/routes/emailIntake.ts`
- Payload (normalized): `{ fromEmail, subject?, bodyText, attachments? }` plus firm via `X-Firm-Id` header or domain mapping stub.
- Behavior:
  - Validates payload (Zod)
  - Resolves firmId (header preferred; demo domain mapping fallback)
  - Applies consent gate + per-firm/user rate limiter
  - Runs AI redaction/summarise + SOL, persists intake in memory store (DB fallback supported)
  - Audit events: `intake.email.received`, `intake.email.processed`

Notes: Event names use dot notation rather than snake_case; functional parity is maintained.

## 2) Voice/audio intake with transcription

- Route: `POST /api/intake/:slug/voice` (multipart, field `audio`)
- File: `server/src/routes/voice.ts`
- Upload constraints: `wav/mp3/m4a`, magic bytes via multer/mime, 10MB limit
- Transcription service: `server/src/services/transcription.ts`
  - Uses OpenAI Whisper when `OPENAI_API_KEY` is set; deterministic mock otherwise
- Behavior:
  - Accepts audio, audits receipt, transcribes, runs AI + SOL, persists intake, audits processed
  - Audit events: `intake.voice.received`, `intake.voice.processed`

## 3) Email-back workflow (PDF package with disclaimers)

- Service: `sendIntakePackage()` in `server/src/services/email.ts`
  - Generates intake PDF via `generateIntakePDFBuffer()` in `server/src/services/pdf.ts`
  - Composes email body with summary + disclaimers (loaded from `server/knowledge/common/disclaimer.txt` when present; includes required disclaimers by default)
  - Sends via provider when `RESEND_API_KEY` is set; otherwise mock/log
- Route: `POST /api/intakes/:id/email-package` in `server/src/routes/intake.ts`
  - Validates recipient email, loads intake, invokes `sendIntakePackage`, audits `intake.email_package.sent`

## Non-functional checks

- Multi-tenancy: requests are scoped via firm headers and thin store proxy; guardrails against raw Prisma remain (memory store fallback in local mode)
- Consent gating: enforced via `aiConsentGate` middleware
- Rate limiting: applied via `limitAiPerFirmUser` middleware (email-intake, voice-intake, submit)
- Logging/PII: structured audit events avoid narrative/PII values; requestId present via middleware

## Tests and tooling

- Spec files: `server/tests/emailIntake.spec.ts`, `server/tests/emailIntakeMissingFirm.spec.ts`, `server/tests/voiceIntake.spec.ts`, `server/tests/emailPackage.spec.ts`
- Runner: `scripts/test-server.mjs` executes health, SOL, AI pipeline, logging scan, PDF, and the new specs

Conclusion: All requested features are implemented and validated via the detached test runner with mock fallbacks for missing provider keys.
