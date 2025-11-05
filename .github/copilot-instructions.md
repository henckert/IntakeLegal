## IntakeLegal — AI assistant working notes

Purpose: Help AI agents be productive immediately in this monorepo. Keep it short, specific, and actionable.

Architecture
- Monorepo with three packages:
  - `web/` (Next.js 14 App Router + Tailwind) — Builder (/builder), Dashboard (/dashboard), Public Intake (/intake/[slug])
  - `server/` (Express + Prisma) — REST endpoints, SOL, AI/Email/PDF services
  - `shared/` (TypeScript + Zod) — Entity types and request/response validators
- Data flow: `web` → `server` routes → `services` (ai/sol/email/pdf) → Prisma → Postgres.
- Local-first: If `DATABASE_URL` or API keys are missing, `server` provides seeded in-memory demo data and deterministic mock outputs so the app runs out of the box.

Developer workflows
- Install deps at root: `npm install`
- Dev: `npm run dev` (Next.js on 3000, Express on 4000)
- DB (optional): `npx prisma migrate dev --name init` then `npm run seed` (requires `DATABASE_URL`)
- Local URLs: /builder, /dashboard, /intake/demo on port 3000

Conventions & UI
- Theme in `web/theme.ts` with brand palette:
  - primary `#0B2545`, secondary `#13315C`, accent1 `#00A9A5`, accent2 `#F7C948`, background `#F5F7FA`, text-primary `#101820`, text-secondary `#5E6C84`
- Fonts: Inter (UI), DM Serif Display (headings)
- Components: rounded-2xl corners; shadow-md/lg; gradient header from `#0B2545` → `#13315C`.
- Limitation badges: Red (<30d), Amber (30–90), Green (>90). Rendered via `web/components/Badge.tsx`. Values computed in `server/src/services/sol.ts`.

Key routes & files
- API endpoints (server):
  - `POST /api/forms` (create/update)
  - `POST /api/forms/:id/publish` (returns public slug)
  - `POST /api/intake/:slug/submit` (runs AI + SOL, persists)
  - `GET /api/dashboard/intakes` (filters/sorting)
  - `GET /api/intakes/:id/export.(pdf|docx)` (exports)
- AI prompts: `server/src/services/ai.ts` (Summarise, Classify, Follow-Ups). Uses OpenAI if `OPENAI_API_KEY` else returns deterministic mocks.
- SOL (Irish v1): `server/src/services/sol.ts` — expiry date, badge, basis string, disclaimer.
- Email: `server/src/services/email.ts` (Resend, mock fallback). PDF: `server/src/services/pdf.ts` (pdfkit).
- Shared validation: `shared/src/schemas.ts` consumed by both `web` and `server`.

PRDs and Task Lists
- Place PRDs under `tasks/` as `0001-prd-<feature>.md`.
- Task List generation rule (summary):
  1) Given a PRD path, generate ~5 high-level parent tasks; pause and wait for user to reply "Go".
  2) On "Go", explode each parent into sub-tasks.
  3) Save as `tasks/tasks-<prd-file-name>.md` with sections: Relevant Files, Notes, Tasks (checkboxes).
- Task List management rule: one task at a time; after each sub-task, update the markdown (mark [x]); when a parent’s sub-tasks are all [x], run tests, stage, clean, commit with conventional commit message referencing task and PRD. Stop and await approval before next task.

Examples
- Public demo form: `http://localhost:3000/intake/demo` (works with mocks)
- Builder publishes: calls `POST /api/forms` then `POST /api/forms/:id/publish` and displays `/intake/[slug]` link

Tips
- Prefer `shared` Zod validators for request parsing in both `web` and `server`.
- If adding a new vertical/template, update seed data and builder presets.
- Keep network boundaries thin: `web` should not implement business rules that live in `server/services`.
