# IntakeLegal Deployment Guide

**Status:** Ready for deployment  
**Last Updated:** November 7, 2025

This guide provides exact commands and steps to deploy IntakeLegal to production.

---

## Prerequisites

- [ ] GitHub repo pushed: `https://github.com/henckert/IntakeLegal.git`
- [ ] Local build passes: `npm run build`
- [ ] OpenAI API key obtained
- [ ] Credit card ready for cloud services (all have free tiers)

---

## Phase 1: Neon Database (15 minutes)

### Step 1.1: Create Neon Account & Project

```bash
# Option A: Web UI (Recommended)
1. Go to: https://neon.tech
2. Sign up with GitHub
3. Click "Create Project"
   - Name: IntakeLegal
   - Region: Europe (Frankfurt) - closest to Render
   - Postgres version: 16
4. Click "Create Project"
```

```bash
# Option B: CLI (Advanced)
npm install -g neonctl
neonctl auth
neonctl projects create --name IntakeLegal --region eu-central-1
```

### Step 1.2: Get Connection Strings

From Neon Dashboard → Connection Details:

```bash
# Copy BOTH connection strings:

# 1. Pooled (for application runtime)
DATABASE_URL="postgresql://neondb_owner:xxxxx@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# 2. Direct (for migrations)
DIRECT_URL="postgresql://neondb_owner:xxxxx@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=10"
```

### Step 1.3: Add to Local .env

```bash
# Edit .env and add:
DATABASE_URL="postgresql://neondb_owner:xxxxx@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:xxxxx@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=10"
```

### Step 1.4: Run Migrations

```powershell
# From project root:
npm run prisma:generate
npm run prisma:migrate
# or
npx prisma db push
npm run seed
```

### Step 1.5: Verify Database

```powershell
# Test connectivity:
npm run diag:cloud

# Or manual test:
$env:DATABASE_URL="your_connection_string"
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => console.log('✅ Connected')).catch(e => console.error('❌', e));"
```

**Expected:** `✅ Connected` or Prisma client connects successfully.

---

## Phase 2: Render API Deployment (20 minutes)

### Step 2.1: Create Render Account

```bash
1. Go to: https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories
```

### Step 2.2: Create Web Service

```bash
1. Dashboard → "New +" → "Web Service"
2. Connect Repository: Select "henckert/IntakeLegal"
3. Configure:
   - Name: intakelegal-api
   - Region: Frankfurt (EU Central)
   - Branch: main
   - Root Directory: server
   - Runtime: Node
   - Build Command: npm ci && npm run build
   - Start Command: node dist/index.js
   - Plan: Starter ($7/month) or Free
```

### Step 2.3: Set Environment Variables

In Render dashboard, add these environment variables:

```bash
NODE_ENV=production
PORT=10000

# From your .env file (placeholder — do NOT commit real keys):
OPENAI_API_KEY=<your-openai-api-key>

# From Neon (Step 1.2):
DATABASE_URL=postgresql://neondb_owner:xxxxx@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:xxxxx@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=10

# Will be your Vercel URL (set after Step 3):
APP_BASE_URL=https://intakelegal.vercel.app

# Optional (leave blank for now):
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
RESEND_API_KEY=
```

### Step 2.4: Deploy

```bash
1. Click "Create Web Service"
2. Wait for build (~3-5 minutes)
3. Monitor logs for "listening on port 10000"
4. Copy your API URL: https://intakelegal-api.onrender.com
```

### Step 2.5: Verify API

```powershell
# Test health endpoint:
curl https://intakelegal-api.onrender.com/health

# Expected: {"ok":true,"ts":"2025-11-07T..."}
```

### Step 2.6: Run Migrations on Render (One-Time)

```bash
1. Render Dashboard → Your Service → "Shell"
2. Run:
   npx prisma migrate deploy
   npm run seed
3. Exit shell
```

---

## Phase 3: Vercel Web Deployment (15 minutes)

### Step 3.1: Create Vercel Account

```bash
1. Go to: https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access repositories
```

### Step 3.2: Import Project

```bash
1. Dashboard → "Add New..." → "Project"
2. Import "henckert/IntakeLegal"
3. Configure:
   - Project Name: intakelegal
   - Framework Preset: Next.js
   - Root Directory: web
   - Build Command: (leave default) npm run build
   - Output Directory: (leave default) .next
   - Install Command: (leave default) npm install
```

### Step 3.3: Set Environment Variables

Add these in Vercel project settings:

```bash
# Production environment:
NEXT_PUBLIC_SERVER_BASE_URL=https://intakelegal-api.onrender.com
NEXT_PUBLIC_APP_ENV=production

# Optional (for auth - leave blank for now):
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Optional (if you want OpenAI in browser — placeholder):
OPENAI_API_KEY=<your-openai-api-key>
```

### Step 3.4: Deploy

```bash
1. Click "Deploy"
2. Wait for build (~2-3 minutes)
3. Copy your Web URL: https://intakelegal.vercel.app
```

### Step 3.5: Update Render with Web URL

```bash
1. Go back to Render dashboard
2. Your service → Environment
3. Update APP_BASE_URL=https://intakelegal.vercel.app
4. Save changes (triggers redeploy)
```

### Step 3.6: Verify Web

```powershell
# Test homepage:
curl https://intakelegal.vercel.app

# Test public intake:
curl https://intakelegal.vercel.app/intake/demo

# Expected: HTML response with "IntakeLegal" in content
```

---

## Phase 4: End-to-End Verification (5 minutes)

### Step 4.1: Update Local Environment

```bash
# Edit .env:
SERVER_BASE_URL=https://intakelegal-api.onrender.com
APP_BASE_URL=https://intakelegal.vercel.app
NEXT_PUBLIC_SERVER_BASE_URL=https://intakelegal-api.onrender.com
```

### Step 4.2: Run Automated Diagnostics

```powershell
npm run diag:cloud
```

**Expected Output:**
```
✅ IntakeLegal Cloud Connectivity Check

[1/4] Checking API health: https://intakelegal-api.onrender.com/health
  → PASS (150ms)
[2/4] Checking Web root: https://intakelegal.vercel.app/
  → PASS (200ms)
[3/4] Checking Database (Neon)
  → PASS (100ms) PostgreSQL 16...
[4/4] Testing E2E submit: https://intakelegal-api.onrender.com/api/intake/demo/submit
  → PASS (850ms)

✅ ALL CHECKS PASSED
```

### Step 4.3: Manual E2E Test

```powershell
# Test intake submission:
$body = @{
  slug = "demo"
  client = @{ firstName = "Jane"; lastName = "Doe"; email = "test@example.com" }
  case = @{ claimType = "Personal Injury"; eventDate = "2024-01-01"; location = "Dublin"; narrative = "Test case" }
  consent = @{ gdpr = $true }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "https://intakelegal-api.onrender.com/api/intake/demo/submit" -Method POST -ContentType "application/json" -Body $body
```

**Expected:** 200 OK with JSON response containing `summaryText`, `area`, `limitation`.

---

## Phase 5: Verify in Browser

### Test Checklist:

- [ ] Homepage loads: `https://intakelegal.vercel.app`
- [ ] Public intake form: `https://intakelegal.vercel.app/intake/demo`
  - Fill form
  - Submit
  - Verify success message
- [ ] Builder (if auth disabled): `https://intakelegal.vercel.app/builder`
- [ ] Dashboard: `https://intakelegal.vercel.app/dashboard`
  - Should show submitted intake

---

## Phase 6: Update Documentation

```powershell
# Commit deployment configs:
git add render.yaml vercel.json
git add diagnostics/cloud_connectivity_report.md
git add diagnostics/cloud_deployment_status.md
git commit -m "chore(deploy): configure Neon, Render, Vercel for production"
git push
```

---

## Deployment URLs (Update After Deployment)

Once deployed, your URLs will be:

| Service | URL | Purpose |
|---------|-----|---------|
| **API** | `https://intakelegal-api.onrender.com` | Express backend |
| **Web** | `https://intakelegal.vercel.app` | Next.js frontend |
| **Database** | Neon Dashboard | View data |
| **Health** | `https://intakelegal-api.onrender.com/health` | API status |
| **Public Intake** | `https://intakelegal.vercel.app/intake/demo` | Client forms |

---

## Troubleshooting

### Render Build Fails

**Error:** `Cannot find module '@prisma/client'`

**Fix:**
```bash
# Add to render.yaml buildCommand:
buildCommand: npm ci && npx prisma generate && npm run build
```

### Vercel Build Fails

**Error:** `NEXT_PUBLIC_SERVER_BASE_URL is not defined`

**Fix:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add `NEXT_PUBLIC_SERVER_BASE_URL` for Production environment
3. Redeploy

### Database Connection Timeout

**Error:** `connect ETIMEDOUT`

**Fix:**
1. Neon Dashboard → Project → Settings → IP Allow
2. Add `0.0.0.0/0` (allow all - Render uses dynamic IPs)
3. Or use connection pooling URL from Neon

### CORS Errors in Browser

**Error:** `Access-Control-Allow-Origin`

**Fix:**
Render dashboard → Environment → Update:
```
APP_BASE_URL=https://intakelegal.vercel.app
```
Redeploy.

---

## Cost Estimate

| Service | Plan | Cost/Month |
|---------|------|------------|
| Neon | Free | $0 (up to 0.5GB) |
| Render | Starter | $7 (or Free tier available) |
| Vercel | Hobby | $0 |
| **Total** | | **~$7/month** |

---

## Security Checklist

- [ ] `.env` is in `.gitignore` (already done)
- [ ] No API keys committed to GitHub
- [ ] HTTPS enforced on all services
- [ ] Database uses SSL (`sslmode=require`)
- [ ] Render environment variables set to "secret"
- [ ] Regular dependency updates (`npm audit`)

---

## Next Steps After Deployment

1. **Custom Domain** (optional):
   - Vercel: Project Settings → Domains → Add `www.intakelegal.com`
   - Update `APP_BASE_URL` in Render

2. **Enable Authentication** (optional):
   - Sign up for Clerk
   - Add keys to Render + Vercel
   - Remove `NEXT_PUBLIC_APP_ENV=production` to enable auth

3. **Enable Email** (optional):
   - Sign up for Resend
   - Add `RESEND_API_KEY` to Render
   - Verify email domain

4. **Monitoring**:
   - Render has built-in logs and metrics
   - Vercel has built-in analytics
   - Consider adding Sentry for error tracking

---

## Support

- Neon Docs: https://neon.tech/docs
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs

---

**Ready to deploy? Start with Phase 1 (Neon) above!**
