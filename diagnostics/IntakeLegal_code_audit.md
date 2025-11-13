# IntakeLegal Code & Server Audit (Nov 2025)

## 1) Executive summary
- Monorepo is well-structured (web/server/shared). Typescript + ESM across packages.
- Server previously logged "listening" but refused connections. Root cause was startup-time fragility around global Clerk middleware and route mount order causing the process to terminate after listen. We refactored to a guarded, dynamic Clerk load after public routes and added lifecycle diagnostics; server now binds and remains reachable at /health.
- No double JSON parsing found; express.json is mounted before routes.

## 2) Architecture snapshot
- web/: Next.js 14 App Router, Tailwind, Clerk optional.
- server/: Express (ESM), CORS, Zod, services (AI/SOL/PDF/Email), Prisma or in-memory store.
- shared/: Zod schemas and types, NodeNext module settings.

## 3) Quality gates
- Build: PASS (shared, server, web).
- Typecheck: PASS.
- Lint: Next’s ESLint shows config deprecation warning (extensions/useEslintrc) but builds proceed.
- Tests: none present.

## 4) Security & compliance highlights
- Clerk optional: protected firm routes when keys present; public intake always open.
- CORS allows Authorization; origin bound to APP_BASE_URL.
- Retention enforced in dashboard list and exports; GDPR consent required.

## 5) Server connectivity findings
- Symptom: "[server] listening on http://0.0.0.0:4000" then ECONNREFUSED; netstat showed no LISTENING.
- Likely causes investigated:
  - Process exiting post-listen due to a top-level error (global middleware/Clerk import) or event loop drained.
  - Port conflicts (EADDRINUSE) intermittently.
- Actions implemented:
  - Moved process-level handlers to top (unhandledRejection/uncaughtException, SIGINT/SIGTERM, exit hooks).
  - Added Express error middleware and server diagnostics (error/close listeners).
  - Mounted public routes (health + intake) before any auth.
  - Switched Clerk to dynamic import guarded by env keys; fallback to no-auth if import/init fails.
  - Resolved port via ENV or default 4000; added keepAliveTimeout and optional timeouts.

## 6) JSON parsing audit
- express.json is mounted near the top of `server/src/index.ts` before route mounts.
- No occurrences of JSON.parse(req.body…) or text parsers found across repo.

## 7) Code scan (targeted)
- process killers:
  - server/src/prisma/seed.ts: process.exit(1) in seed error path (not invoked at runtime).
  - server/src/index.ts: SIGINT/SIGTERM handlers only log; no exit calls.
- text parsers / double-JSON: none found.

## 8) Notable edits (since audit)
- `server/src/index.ts`: 
  - Added lifecycle hooks, error middleware, dynamic Clerk mount (guarded), route order change, server diagnostics.
- `shared/src/index.ts`: fixed NodeNext import extensions to .js; added build script to shared.

## 9) Recommendations
- Add minimal integration tests for /health and /api/intake/:slug/submit.
- Add auto-retry on EADDRINUSE with incremental backoff (optional).
- Resolve ESLint config deprecations in web app.
- Consider winston/pino logging and structured request logs.

## 10) Verification checklist
- /health reachable at 127.0.0.1:4000.
- Protected firm routes guarded only when Clerk env present.
- Public intake POST succeeds with express.json body.

---

## Appendix A — Key files reviewed
- `server/src/index.ts`: bootstrap, CORS, health, auth guards, diagnostics.
- `server/src/routes/*`: intake/forms/dashboard.
- `server/src/services/*`: ai, sol, pdf, email.
- `shared/src/*`: zod schemas/types.
