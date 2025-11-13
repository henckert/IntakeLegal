# PRD: IntakeLegal MVP

## 1. Introduction / Overview
IntakeLegal is an AI-powered client-intake and triage platform for small law firms. The MVP delivers two UX layers: (1) a Form-Creator (firm side) to configure and publish branded intake links, and (2) a Client-Intake (public) stepper that captures client data. After submission, the system summarises the narrative, classifies legal area, estimates Statute of Limitations (Irish v1), generates follow-up questions, calculates urgency, and presents everything in a lawyer dashboard.

This MVP will ship as a monorepo (web + server + shared) with local-first mocks (AI/email/PDF) so it runs without external keys.

## 2. Goals
- Enable firms to publish branded intake forms and receive client submissions via a public link.
- Automatically generate AI outputs: summary (factual matrix), legal classification, follow-up questions.
- Compute Irish SOL v1 (expiry date, legal basis, badge colour) for covered claim types.
- Provide a dashboard with filters (area, urgency, date, status) and exports (PDF now; DOCX placeholder).
- Enforce Clerk auth for firm routes; public intake remains open.
- Capture GDPR consent and allow firm-level retention options (30/90/365 days).
- Operate locally with mock fallbacks when API keys or DB are absent.

## 3. User Stories
- As a firm admin, I can create a form from a preset template, toggle sections, set retention, and publish to get a shareable link.
- As a client, I can complete a step-through form with clear progress, tooltips, and GDPR consent.
- As a lawyer, I can view new intakes on a dashboard, see a limitation badge, and filter by area, urgency, date, and status.
- As a lawyer, I can edit the AI summary, export a PDF, and send emails.
- As operations/compliance, I can see an audit trail of AI actions and enforce data retention choices.

## 4. Functional Requirements
1. Auth & Access
   1.1 Clerk required for `/builder` and `/dashboard`; public `/intake/[slug]` open.
   1.2 Server validates firm context on authenticated routes.
2. Form Builder
   2.1 Presets: PI, Litigation, Family, Conveyancing, Commercial, Employment.
   2.2 Sections: client info, contact, narrative/query, attachments, AI section; togglable; simple up/down reordering (no drag in MVP).
   2.3 Publish generates a slug and stores FormInstance with themeJSON (logoUrl, colours) and retention policy (30/90/365 days).
   2.4 Show copyable public link.
3. Public Intake
   3.1 Typeform-style stepper with progress bar and inline tooltips ("Why we need this info").
   3.2 GDPR consent checkbox (required), stored with submission.
   3.3 Capture event date(s) and claim type where applicable; allow basic file attachments (metadata captured; storage can be stubbed in MVP).
   3.4 POST to `/api/intake/:slug/submit` with payload validation.
4. AI Processing
   4.1 Prompts:
       - Summarise: factual matrix (who/what/when/where), key legal issues, missing information.
       - Classify: primary area from {PI, ProfNeg, PropertyDamage, Employment, Family, Probate, Commercial} with sub-type if obvious.
       - Follow-Ups: up to 10 clarifying questions.
   4.2 If `OPENAI_API_KEY` absent, return deterministic mock outputs.
5. Statute of Limitations (Irish v1)
   5.1 Input: event date(s), claim type.
   5.2 Supported mapping: Personal Injury (2 years), Defamation (1 year), Contract (6 years), Negligence (6 years).
   5.3 Output: expiry date, badge colour (Red <30d; Amber 30–90; Green >90), legal basis string (e.g., “s.11(2)(a) Statute of Limitations Act 1957”) and disclaimer.
6. Dashboard
   6.1 Matter Cards show name/date/area/badge/status.
   6.2 Filters: area, urgency (badge colour), date range, status (new/in_progress/closed). Default sort: createdAt desc.
   6.3 AI summary panel editable with persistence.
   6.4 Exports: PDF (pdfkit); DOCX returns placeholder message.
7. Email
   7.1 Send client confirmation and internal summary on every intake (Resend).
   7.2 If `RESEND_API_KEY` absent, log/record mock and continue.
8. Compliance & Branding
   8.1 GDPR consent required to submit.
   8.2 Data retention selector (30/90/365 days) at form instance level.
   8.3 themeJSON per form instance (colors, logoUrl) applied in public form.
   8.4 AuditLog entries recorded for AI actions and exports (DB mode); in mock mode, console/log substitute is acceptable.
9. API
   9.1 `POST /api/forms` – create/update form instance.
   9.2 `POST /api/forms/:id/publish` – returns public slug.
   9.3 `POST /api/intake/:slug/submit` – process submission → AI + SOL → persist.
   9.4 `GET /api/dashboard/intakes` – list with filters.
   9.5 `GET /api/intakes/:id/export.pdf` and `.docx` – export endpoints.
10. Data Model (Prisma)
   - Firm(id,name,logoUrl,brandColor,plan,settingsJSON)
   - User(id,firmId,role,clerkExternalId)
   - FormTemplate(id,firmId?,vertical,schemaJSON,isSystemTemplate)
   - FormInstance(id,firmId,templateId,slug,themeJSON,retentionPolicy)
   - Intake(id,formInstanceId,createdAt,clientName,contactJSON,narrative,areaTag,aiSummary,followUpsJSON,eventDatesJSON,solDate,solBasis,priorityScore,status)
   - AuditLog(id,firmId,actorId?,action,metaJSON,createdAt)

## 5. Non-Goals (Out of Scope for MVP)
- Full drag-and-drop builder with arbitrary fields; advanced conditional logic.
- Rich DOCX export; advanced PDF layouts and templating.
- Payment processing, calendaring, or client portals.
- Multi-environment SSO or role-based permissions beyond basic Clerk roles.
- Complex file storage; production-grade attachment handling can follow later.

## 6. Design Considerations
- Brand system in Tailwind: primary `#0B2545`, secondary `#13315C`, accent1 `#00A9A5`, accent2 `#F7C948`, background `#F5F7FA`, text-primary `#101820`, text-secondary `#5E6C84`.
- Typography: Inter (UI), DM Serif Display (headings/wordmark).
- UI depth: rounded-2xl, shadow-md/-lg, gradient header (#0B2545 → #13315C), consistent spacing (p-4 → p-6).
- Limitation badges: red/amber/green computed in SOL service, rendered consistently in web.

## 7. Technical Considerations
- Monorepo: `web` (Next.js 14), `server` (Express + Prisma), `shared` (Zod + types).
- Local-first: if `DATABASE_URL` or API keys missing, use in-memory demo data and deterministic mock outputs.
- Services: `ai.ts` (OpenAI w/ fallback), `sol.ts` (deterministic mapping + basis string), `email.ts` (Resend w/ fallback), `pdf.ts` (pdfkit).
- Deploy: Vercel (web), Supabase (DB). Ensure server CORS allows web origin in dev.
- Environment: OPENAI_API_KEY, CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, DATABASE_URL, RESEND_API_KEY, APP_BASE_URL, SERVER_BASE_URL.

## 8. Success Metrics
- Time-to-first-intake locally: < 10 minutes from clone to submission (with mocks).
- ≥ 95% successful form submissions without validation errors.
- SOL badge displayed for 100% intakes with a recognized claim type and event date.
- PDF export works on ≥ 95% of intakes.
- Emails (or mocks) triggered for 100% of submissions.

## 9. Open Questions
- Exact GDPR consent text and any jurisdiction-specific disclosures.
- Attachment storage strategy for production (S3/Supabase storage) and virus scanning.
- Clerk role mapping (admin/member) enforcement granularity on server endpoints.
- Retention enforcement mechanism (scheduled deletion or flagged for review?).
- Internationalization (i18n) needs for public intake.
