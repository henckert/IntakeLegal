# IntakeLegal - Quick Deployment Settings

**Last Updated:** November 7, 2025

---

## Render (API Server)

| Key | Value |
|-----|-------|
| **Root Directory** | `server` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `node dist/index.js` |
| **Health Check Path** | `/health` |
| **Region** | Frankfurt (EU) |
| **Plan** | Starter ($7/mo) or Free |

### Environment Variables

```env
NODE_ENV=production
PORT=10000

# Database (from Neon - use POOLED connection)
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require
DIRECT_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require

# API Keys
OPENAI_API_KEY=<your-openai-api-key>

# Cross-service URLs (update after Vercel deploys)
APP_BASE_URL=https://intakelegal.vercel.app
SERVER_BASE_URL=https://intakelegal-api.onrender.com

# Optional (leave empty for MVP)
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
RESEND_API_KEY=
```

### Post-Deploy: Run Migrations (One-Time)

```bash
# In Render Dashboard → Shell:
npx prisma migrate deploy
npm run seed
```

---

## Vercel (Web Frontend)

| Key | Value |
|-----|-------|
| **Root Directory** | `web` |
| **Framework** | Next.js (auto-detected) |
| **Build Command** | `npm run build` (auto) |
| **Output Directory** | `.next` (auto) |

### Environment Variables

```env
# API Connection (update after Render deploys)
NEXT_PUBLIC_SERVER_BASE_URL=https://intakelegal-api.onrender.com

# Mode
NEXT_PUBLIC_APP_ENV=production

# Optional (for OpenAI in browser - usually not needed)
OPENAI_API_KEY=<your-openai-api-key>

# Optional (for auth - leave empty for MVP)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## Neon (Database)

| Key | Value |
|-----|-------|
| **Region** | EU West 2 (London) |
| **Database** | `neondb` |
| **Connection Type** | Pooled (for app runtime) + Direct (for migrations) |

### Connection Strings

```env
# POOLED (use in Render/Vercel for runtime)
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require

# DIRECT (use for migrations only)
DIRECT_URL=postgresql://neondb_owner:npg_durK8Bbt0CNY@ep-shiny-scene-abnixujn.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

**⚠️ Important:** Use **POOLED** for runtime (Render), **DIRECT** for migrations (local or Render Shell).

---

## Local Migration Setup (Optional)

Run migrations locally before deploying (recommended for first-time setup):

```bash
# 1. Navigate to server folder
cd server

# 2. Create .env with DIRECT connection
cp .env.example .env
# Edit .env and add:
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require

# 3. Install dependencies
npm ci

# 4. Generate Prisma client
npx prisma generate

# 5. Run migrations
npx prisma migrate deploy
# or for development:
npx prisma migrate dev --name init

# 6. Seed database
npm run seed

# 7. Build
npm run build

# 8. Switch back to POOLED connection for runtime
# Edit .env:
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require
```

---

## Deployment Sequence

1. ✅ **Neon** - Database already created
2. ⏳ **Local** - Run migrations locally (optional but recommended)
3. ⏳ **Render** - Deploy API with DATABASE_URL (pooled)
4. ⏳ **Render Shell** - Run `npx prisma migrate deploy` if migrations not run locally
5. ⏳ **Vercel** - Deploy Web with NEXT_PUBLIC_SERVER_BASE_URL
6. ⏳ **Update Render** - Set APP_BASE_URL to Vercel URL
7. ✅ **Verify** - Run `npm run diag:cloud`

---

## Quick Verification Commands

```bash
# Test Render API
curl https://intakelegal-api.onrender.com/health

# Test Vercel Web
curl https://intakelegal.vercel.app

# Test E2E locally (after both deployed)
npm run diag:cloud
```

---

## Common Gotchas

| Issue | Solution |
|-------|----------|
| **Prisma Client not found** | Run `npx prisma generate` in Render Shell |
| **Migration timeout** | Use DIRECT_URL (non-pooled) for migrations |
| **CORS errors** | Ensure `APP_BASE_URL` in Render matches Vercel URL |
| **Build fails on Render** | Check `rootDir: server` is set correctly |
| **404 on Vercel** | Ensure Root Directory is `web` |

---

## Environment Variable Summary

### Render Needs:
- `DATABASE_URL` (pooled)
- `DIRECT_URL` (direct, for migrations)
- `OPENAI_API_KEY`
- `APP_BASE_URL` (Vercel URL)
- `SERVER_BASE_URL` (own Render URL)
- `NODE_ENV=production`
- `PORT=10000`

### Vercel Needs:
- `NEXT_PUBLIC_SERVER_BASE_URL` (Render URL)
- `NEXT_PUBLIC_APP_ENV=production`

---

**📋 Checklist:**
- [ ] Neon database created
- [ ] Local migrations run
- [ ] Render deployed with all env vars
- [ ] Migrations run on Render
- [ ] Vercel deployed with Render URL
- [ ] Render updated with Vercel URL
- [ ] `npm run diag:cloud` passes

---

**For full step-by-step instructions, see `DEPLOYMENT.md`**
