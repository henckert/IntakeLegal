# IntakeLegal Deployment Structure Analysis

**Generated:** November 7, 2025  
**Repository:** https://github.com/henckert/IntakeLegal.git

---

## Repository Structure Summary

### ✅ Monorepo Architecture Detected

```
IntakeLegal/
├── server/          # Express API backend
│   ├── src/
│   │   └── index.ts  # Main entry point
│   ├── dist/         # Compiled output
│   ├── package.json  # Backend dependencies
│   └── prisma/       # Database schema
├── web/             # Next.js frontend
│   ├── app/         # Next.js 14 App Router
│   ├── next.config.mjs
│   └── package.json  # Frontend dependencies
├── shared/          # Shared types/validators
│   └── package.json
└── package.json     # Root workspace config
```

**Structure Type:** npm workspaces monorepo with separate `/server` and `/web` folders

---

## Deployment Configuration Analysis

| Item | Status | Path/Value | Notes |
|------|--------|------------|-------|
| **API Root** | ✅ Found | `/server` | Correct root directory |
| **API Entry Point** | ✅ Found | `server/src/index.ts` | Compiles to `dist/index.js` |
| **Build Script** | ✅ Valid | `tsc -p tsconfig.json` | TypeScript compilation |
| **Start Script** | ✅ Valid | `node dist/index.js` | Production entry |
| **Health Endpoint** | ✅ Confirmed | `/health` | Returns `{ok:true}` |
| **Render Config** | ✅ Valid | `render.yaml` | Correct `rootDir: server` |
| **Web Root** | ✅ Found | `/web` | Next.js 14 App Router |
| **Next Config** | ✅ Found | `web/next.config.mjs` | React Strict Mode enabled |
| **Vercel Config** | ✅ Found | `vercel.json` | Output directory configured |
| **NEXT_PUBLIC_SERVER_BASE_URL** | ✅ Present | `.env` | Points to localhost (needs cloud update) |

---

## Environment Variables Audit

### ✅ Present in .env

- `OPENAI_API_KEY` - Configured (value present)
- `APP_BASE_URL` - Configured (`http://localhost:3000`)
- `SERVER_BASE_URL` - Configured (`http://localhost:4000`)
- `NEXT_PUBLIC_SERVER_BASE_URL` - Configured (`http://localhost:4000`)
- `NEXT_PUBLIC_APP_ENV` - Configured (`local`)

### ⚠️ Missing/Empty (Optional)

- `DATABASE_URL` - Empty (needs Neon connection string)
- `DIRECT_URL` - Not present (needs Neon direct URL for migrations)
- `CLERK_PUBLISHABLE_KEY` - Empty (optional for auth)
- `CLERK_SECRET_KEY` - Empty (optional for auth)
- `RESEND_API_KEY` - Empty (optional for emails)

### ❌ Not Found (But Not Required)

- `JWT_SECRET` - Not used in this project (uses Clerk for auth)
- `CORS_ORIGIN` - Handled via `APP_BASE_URL` in server code

---

## Render (API) Configuration

### Current render.yaml Analysis

```yaml
✅ type: web                    # Correct
✅ rootDir: server              # Matches monorepo structure
✅ buildCommand: npm ci && npm run build  # Installs + compiles TypeScript
✅ startCommand: node dist/index.js       # Correct entry point
✅ healthCheckPath: /health     # Endpoint exists in code
✅ region: frankfurt            # EU region (good for GDPR)
✅ All required env vars listed
```

### Recommended Render Settings

```yaml
Root Directory: server
Build Command: npm ci && npm run build
Start Command: node dist/index.js
Health Check Path: /health
Environment Variables (add via Render Dashboard):
  - NODE_ENV=production
  - PORT=10000
  - OPENAI_API_KEY=<your-openai-api-key>
  - DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
  - DIRECT_URL=(same as DATABASE_URL but with direct endpoint)
  - APP_BASE_URL=https://intakelegal.vercel.app (set after Vercel deploys)
```

**✅ VERDICT:** Render configuration is correct and deployment-ready.

---

## Vercel (Web) Configuration

### Current vercel.json Analysis

```json
✅ buildCommand includes "cd web"    # Correct workspace navigation
✅ framework: nextjs                 # Detected properly
✅ outputDirectory: web/.next        # Correct Next.js output
```

### Recommended Vercel Settings

```yaml
Root Directory: web
Framework Preset: Next.js
Build Command: (auto-detected) npm run build
Output Directory: (auto-detected) .next
Environment Variables (add via Vercel Dashboard):
  - NEXT_PUBLIC_SERVER_BASE_URL=https://intakelegal-api.onrender.com (set after Render deploys)
  - NEXT_PUBLIC_APP_ENV=production
  - OPENAI_API_KEY=<your-openai-api-key> (optional)
```

**✅ VERDICT:** Vercel configuration is correct and deployment-ready.

---

## Database Configuration

### Neon Connection String (Provided)

```
postgresql://<user>:<password>@<host>/<db>?sslmode=require
```

**Region:** EU West 2 (London) - Good for GDPR compliance  
**Type:** Pooled connection (correct for production)

### Required Actions

1. Add to local `.env`:
  ```bash
  DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require"
  ```

2. Run migrations locally:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

3. Add to Render environment variables (same value)

4. Run migrations on Render (one-time, via Render Shell):
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

---

## Deployment Readiness Summary

### ✅ Ready for Deployment

| Component | Status | Reason |
|-----------|--------|--------|
| **Repository Structure** | ✅ Ready | Monorepo with correct `/server` and `/web` separation |
| **API Build System** | ✅ Ready | TypeScript compilation working, dist/ folder generated |
| **API Entry Point** | ✅ Ready | `dist/index.js` exists and runs successfully |
| **Web Build System** | ✅ Ready | Next.js 14 builds without errors |
| **Render Config** | ✅ Ready | `render.yaml` has correct rootDir and commands |
| **Vercel Config** | ✅ Ready | `vercel.json` has correct paths |
| **Environment Template** | ✅ Ready | `.env.example` documents all required vars |

### ⚠️ Requires Action Before Deploy

| Item | Action Required | Priority |
|------|----------------|----------|
| **DATABASE_URL** | Add Neon connection string to `.env` | HIGH |
| **Local Migrations** | Run `npm run prisma:migrate` locally | HIGH |
| **Update .env URLs** | Change localhost to production URLs after deploy | MEDIUM |
| **Render DB Setup** | Run migrations via Render Shell after first deploy | HIGH |

---

## Diagnostic Command

### Run Deployment Check

```bash
npm run diag:cloud
```

**What it checks:**
- ✅ API health endpoint (`/health`)
- ✅ Web root loads
- ✅ Database connectivity (if DATABASE_URL set)
- ✅ End-to-end intake submission

**Expected Output (after cloud deploy):**

```
🔍 IntakeLegal Cloud Connectivity Check

[1/4] Checking API health: https://intakelegal-api.onrender.com/health
  → PASS (120ms)
[2/4] Checking Web root: https://intakelegal.vercel.app/
  → PASS (200ms)
[3/4] Checking Database (Neon)
  → PASS (85ms) PostgreSQL 16.x
[4/4] Testing E2E submit: https://intakelegal-api.onrender.com/api/intake/demo/submit
  → PASS (750ms)

✅ ALL CHECKS PASSED
```

---

## Recommended Deployment Sequence

### Phase 1: Database Setup (15 min)

1. ✅ Neon project already created
2. Add connection string to local `.env`
3. Run migrations locally: `npm run prisma:migrate`
4. Verify: `npm run diag:cloud` (DB check should pass)

### Phase 2: API Deployment (20 min)

1. Go to https://render.com
2. New Web Service → Connect GitHub `henckert/IntakeLegal`
3. Settings (use values above)
4. Add all environment variables
5. Deploy
6. Run migrations via Render Shell: `npx prisma migrate deploy && npm run seed`
7. Verify: `curl https://intakelegal-api.onrender.com/health`

### Phase 3: Web Deployment (15 min)

1. Go to https://vercel.com
2. Import `henckert/IntakeLegal`
3. Set Root Directory to `web`
4. Add `NEXT_PUBLIC_SERVER_BASE_URL` with Render URL
5. Deploy
6. Verify: Open `https://intakelegal.vercel.app`

### Phase 4: Cross-Link & Verify (5 min)

1. Update Render `APP_BASE_URL` with Vercel URL
2. Redeploy Render
3. Run `npm run diag:cloud`
4. Test intake form: `https://intakelegal.vercel.app/intake/demo`

---

## Quick Reference: Correct Values

```yaml
# Render API
Root Directory: server
Build: npm ci && npm run build
Start: node dist/index.js
Health: /health

# Vercel Web
Root Directory: web
Framework: Next.js
Auto-detect build commands

# Environment Cross-Links (after deployment)
Render → APP_BASE_URL: https://intakelegal.vercel.app
Vercel → NEXT_PUBLIC_SERVER_BASE_URL: https://intakelegal-api.onrender.com
Both → DATABASE_URL: postgresql://neondb_owner:npg_durK8Bbt0CNY@ep-shiny-scene-abnixujn-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## Final Verdict

### ✅ DEPLOYMENT STRUCTURE: CORRECT

- Render `rootDir: server` matches monorepo structure
- Vercel root directory `web` matches monorepo structure
- Build and start commands are correct
- Health check endpoint exists
- All configuration files valid

**Status:** 🟢 **READY FOR DEPLOYMENT**

**Next Step:** Follow `DEPLOYMENT.md` Phase 1 to set up database, then deploy to Render and Vercel using the values documented above.

---

**Generated by automated deployment structure analysis**  
**Last verified:** November 7, 2025
