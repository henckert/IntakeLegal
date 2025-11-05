# IntakeLegal

IntakeLegal is an AI-powered client-intake and triage platform for small law firms.

## Stack
- Web: Next.js 14 (App Router) + Tailwind + shadcn-style components
- Server: Node.js + Express (REST API)
- DB: PostgreSQL via Prisma (Supabase recommended)
- Auth: Clerk (lawyer routes)
- AI: OpenAI GPT-4.5 (mock fallback)
- Email: Resend (mock fallback)
- PDF: pdfkit

## Monorepo
- `web/` – Next.js app (builder, dashboard, public intake)
- `server/` – Express API + Prisma + services (AI, SOL, email, PDF)
- `shared/` – types & Zod validators
- `tasks/` – PRDs and generated task lists

## Quickstart
1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies at root:
   ```bash
   npm install
   ```
3. Start dev (web:3000, server:4000):
   ```bash
   npm run dev
   ```
4. (Optional, DB required) Run Prisma migrations and seed:
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

Local URLs:
- Builder: http://localhost:3000/builder
- Dashboard: http://localhost:3000/dashboard
- Public form (demo): http://localhost:3000/intake/demo
 - Server health: http://localhost:4000/health

Notes:
- If `DATABASE_URL` or API keys are missing, server uses mock data and deterministic outputs so the app still runs.
- To use real Postgres, set `DATABASE_URL` (e.g., from Supabase), run migrate + seed, then restart.

## Environment variables

Copy `.env.example` to `.env`. Keys:

- `APP_BASE_URL` – Web URL (default `http://localhost:3000`)
- `SERVER_BASE_URL` / `NEXT_PUBLIC_SERVER_BASE_URL` – Server URL (default `http://localhost:4000`)
- `NEXT_PUBLIC_APP_ENV` – `local` to bypass auth and enable full mock mode
- `OPENAI_API_KEY` – Optional; if absent, AI service returns deterministic mock output
- `CLERK_PUBLISHABLE_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` – Optional; when present, lawyer routes are protected and client sends Bearer tokens
- `DATABASE_URL` – Optional; when present, server uses Prisma/Postgres; otherwise in-memory store
- `RESEND_API_KEY` – Optional; when absent, emails are logged (mock)

## Auth modes

- Local-first (no Clerk keys or `NEXT_PUBLIC_APP_ENV=local`):
   - `/builder` and `/dashboard` render without auth; middleware is bypassed.
   - Sign-in/up pages show an “Auth not configured” message.
- With Clerk keys:
   - `/builder` and `/dashboard` are protected by Clerk middleware.
   - Web forwards a Bearer token to protected server endpoints via `Authorization` headers.

## API summary

- Forms: `POST /api/forms` (create/update), `POST /api/forms/:id/publish` (returns public slug)
- Intake: `POST /api/intake/:slug/submit` (public)
- Dashboard: `GET /api/dashboard/intakes` (filters: area, urgency, status, from, to)
- Exports: `GET /api/intakes/:id/export.pdf` (PDF), `GET /api/intakes/:id/export.docx` (501 placeholder)

Retention & compliance:
- Builder sets a `retentionPolicy` (30/90/365 days)
- Dashboard hides intakes older than retention; export endpoints return 410 when expired
- GDPR consent is required on submit and persisted with the intake

## Scripts
- `npm run dev` – start web and server concurrently
- `npm run build` – build all workspaces
- `npm run prisma:generate` / `npm run prisma:migrate` – Prisma helpers (delegates to `server/`)
- `npm run seed` – seed demo data (delegates to `server/`)

## PRDs and Task Lists
- Place PRDs in `tasks/` named `0001-prd-<feature>.md`.
- Generate task lists named `tasks-0001-prd-<feature>.md` following the rules in `.github/copilot-instructions.md`.

## Troubleshooting
- Ports in use: change ports with `APP_BASE_URL`/`SERVER_BASE_URL` in `.env`.
- Clerk errors during build: ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set or keep `NEXT_PUBLIC_APP_ENV=local`.
- Next ESLint options warning can be ignored in the MVP; it does not block builds.

## License
Proprietary – internal project.
