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

Notes:
- If `DATABASE_URL` or API keys are missing, server uses mock data and deterministic outputs so the app still runs.
- To use real Postgres, set `DATABASE_URL` (e.g., from Supabase), run migrate + seed, then restart.

## Scripts
- `npm run dev` – start web and server concurrently
- `npm run build` – build all workspaces
- `npm run prisma:generate` / `npm run prisma:migrate` – Prisma helpers (delegates to `server/`)
- `npm run seed` – seed demo data (delegates to `server/`)

## PRDs and Task Lists
- Place PRDs in `tasks/` named `0001-prd-<feature>.md`.
- Generate task lists named `tasks-0001-prd-<feature>.md` following the rules in `.github/copilot-instructions.md`.

## License
Proprietary – internal project.
