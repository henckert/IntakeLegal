## Relevant Files

- `web/app/(marketing)/page.tsx` - Landing page with brand gradient header and CTA to builder.
- `web/app/layout.tsx` - Root layout, fonts (Inter, DM Serif), global styles, header.
- `web/theme.ts` - Brand palette and theme tokens.
- `web/tailwind.config.ts` - Tailwind configuration extended with brand colors, radius, shadows.
- `web/postcss.config.js` - Tailwind/PostCSS setup.
- `web/next.config.mjs` - Next.js configuration.
- `web/styles/globals.css` - Tailwind base and gradient header CSS.
- `web/lib/api.ts` - Helper to call backend using SERVER_BASE_URL.
- `web/app/builder/page.tsx` - Form builder UI (presets, toggles, reorder, retention, publish).
- `web/app/dashboard/page.tsx` - Lawyer dashboard (filters, cards, editable AI summary, exports).
- `web/app/intake/[slug]/page.tsx` - Public stepper form (GDPR, tooltips, submit).
- `web/components/Badge.tsx` - Limitation badge renderer (red/amber/green).
- `web/components/Card.tsx` - Card component with rounded-2xl/shadow.
- `web/components/Stepper.tsx` - Stepper UI for public intake.
- `web/components/Tooltip.tsx` - Inline tooltip component.
- `web/components/ui/*` - Button, Input, TextArea, Select primitives.

- `server/src/index.ts` - Express app bootstrap and route mounting.
- `server/src/env.ts` - dotenv + typed env accessors.
- `server/src/routes/forms.ts` - `POST /api/forms`, `POST /api/forms/:id/publish`.
- `server/src/routes/intake.ts` - `POST /api/intake/:slug/submit`, `GET /api/intakes/:id/export.(pdf|docx)`.
- `server/src/routes/dashboard.ts` - `GET /api/dashboard/intakes` with filters.
- `server/src/services/ai.ts` - OpenAI integration with mock fallback.
- `server/src/services/sol.ts` - Irish SOL v1 mapping, expiry, badge, basis, disclaimer.
- `server/src/services/pdf.ts` - pdfkit PDF export; DOCX placeholder.
- `server/src/services/email.ts` - Resend integration; mock fallback.
- `server/src/prisma/schema.prisma` - Prisma models per PRD.
- `server/src/prisma/client.ts` - PrismaClient singleton.
- `server/src/prisma/seed.ts` - Demo firm, templates, form instance (slug "demo"), sample intake.

- `shared/src/schemas.ts` - Zod validators (create/update form, publish, intake submit, filters).
- `shared/src/types.ts` - Shared TS types across web/server.

- `.env.example` - Required env keys.
- `README.md` - Install/run instructions and local URLs.
- `.github/copilot-instructions.md` - Architecture, workflows, PRD and Task List rules.
- `tasks/0001-prd-intakelegal-mvp.md` - Source PRD.

### Notes

- Local-first: if `DATABASE_URL` or API keys are missing, server uses in-memory data and deterministic mock outputs so the app runs out of the box.
- Auth: Clerk required for `/builder` and `/dashboard`; public `/intake/[slug]` is open.
- SOL v1 mapping covered: Personal Injury (2y), Defamation (1y), Contract (6y), Negligence (6y). Badge thresholds: Red <30d; Amber 30–90; Green >90.
- Exports: PDF via pdfkit; DOCX returns a placeholder message in MVP.
- Emails: Client confirmation + internal summary on every intake; mocked if RESEND_API_KEY is absent.
- Retention: 30/90/365 days selector per form instance.
- Demo: seeded public slug `demo` should work end-to-end with mocks.

## Tasks

- [ ] 1.0 Web foundation and theme
  - [x] 1.1 Set up Next.js 14 App Router (TypeScript) in `web/` with `next.config.ts` and base app structure.
  - [x] 1.2 Configure Tailwind (`tailwind.config.ts`, `postcss.config.js`, `styles/globals.css`).
  - [x] 1.3 Add fonts using `next/font/google`: Inter (default), DM Serif Display (headings) in `app/layout.tsx`.
  - [x] 1.4 Implement `web/theme.ts` with brand colors and export tokens; wire into Tailwind config.
  - [x] 1.5 Build shadcn-like primitives (`components/ui/*`): Button, Input, TextArea, Select.
  - [x] 1.6 Create shared components: `Card`, `Badge` (red/amber/green), `Tooltip`, `Stepper`.
  - [x] 1.7 Create `(marketing)/page.tsx` with gradient header and CTA to `/builder`.

- [x] 2.0 Builder (firm side)
  - [x] 2.1 Implement presets: PI, Litigation, Family, Conveyancing, Commercial, Employment.
  - [x] 2.2 Add section toggles: client info, contact, narrative/query, attachments, AI.
  - [x] 2.3 Implement simple up/down reordering for sections (no drag in MVP).
  - [x] 2.4 Add data retention selector (30/90/365 days) and theme (logoUrl/colors) inputs.
  - [x] 2.5 Hook Publish to `POST /api/forms` then `POST /api/forms/:id/publish`; display copyable public link `/intake/[slug]`.
  - [x] 2.6 Protect route with Clerk; show sign-in if unauthenticated.

- [x] 3.0 Public intake (client side)
  - [x] 3.1 Build Typeform-style stepper with progress and inline tooltips.
  - [x] 3.2 Capture client info, contact, narrative; event date(s) and claim type selector where applicable.
  - [x] 3.3 Require GDPR consent checkbox to enable Submit; include consent text.
  - [x] 3.4 POST to `/api/intake/:slug/submit` using `web/lib/api.ts` and handle success state.

- [x] 4.0 Backend API and services
  - [x] 4.1 Implement `server/src/routes/forms.ts`: create/update form instance and publish (returns slug).
  - [x] 4.2 Implement `server/src/routes/intake.ts`: submit intake → AI (summarise/classify/follow-ups) + SOL → persist.
  - [x] 4.3 Implement `server/src/routes/dashboard.ts`: list intakes with filters (area, urgency, date, status) sorted by createdAt desc.
  - [x] 4.4 Build `services/ai.ts` with OpenAI client and deterministic mocks when no `OPENAI_API_KEY`.
  - [x] 4.5 Build `services/sol.ts` with Irish v1 mapping, expiry calc, badge thresholding, basis string, disclaimer.
  - [x] 4.6 Build `services/pdf.ts` for PDF export; add DOCX placeholder response.
  - [x] 4.7 Build `services/email.ts` to send client confirmation and internal summary; mock if no `RESEND_API_KEY`.
  - [x] 4.8 Implement in-memory store fallback when `DATABASE_URL` is absent; add basic audit logs (console/memory).

- [x] 5.0 Prisma schema and seed
  - [x] 5.1 Define `schema.prisma` models per PRD.
  - [x] 5.2 Generate Prisma client and wire `prisma/client.ts`.
  - [x] 5.3 Seed demo firm, templates, form instance (`slug:"demo"`), and a sample intake in `seed.ts`.
  - [x] 5.4 Make routes use Prisma when `DATABASE_URL` is set; fallback to memory otherwise.

- [ ] 6.0 Dashboard (lawyer side)
  - [ ] 6.1 Render Matter Cards: name/date/area/badge/status using `Badge` and `Card` components.
  - [ ] 6.2 Add filters: area, urgency (badge), date range, status; default sort createdAt desc.
  - [ ] 6.3 Editable AI summary panel with save.
  - [ ] 6.4 Export buttons that call export PDF/DOCX endpoints.
  - [ ] 6.5 Protect route with Clerk.

- [ ] 7.0 Auth & compliance
  - [ ] 7.1 Integrate Clerk on web; secure `/builder` and `/dashboard` routes.
  - [ ] 7.2 Forward firm context or auth claims to server on protected requests.
  - [ ] 7.3 Ensure GDPR consent stored with intake; enforce retention selector in builder UI.

- [ ] 8.0 Dev experience & docs
  - [ ] 8.1 Finish README with exact local run steps and URLs; confirm `.env.example` keys.
  - [ ] 8.2 Ensure `npm run dev` starts web:3000 and server:4000; add `/health` endpoint.
  - [ ] 8.3 Verify local-first mocks: AI, SOL, email, PDF; document behavior.

- [ ] 9.0 QA & push
  - [ ] 9.1 Manual sanity: publish a form, complete public demo, verify dashboard, badges, export PDF, and email mocks.
  - [ ] 9.2 Initialize git (if needed), add remote `https://github.com/henckert/IntakeLegal.git`.
  - [ ] 9.3 Commit and push to `main`.
