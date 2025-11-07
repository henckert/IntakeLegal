# IntakeLegal Cloud Deployment Status

**Last Updated:** November 7, 2025

## Current Status: ❌ NOT DEPLOYED

Your IntakeLegal application is currently **only running locally**. No cloud services are connected yet.

---

## Required Cloud Services

### 1. ✅ GitHub Repository
- **Status:** CONNECTED
- **URL:** https://github.com/henckert/IntakeLegal.git
- **Purpose:** Source code hosting and CI/CD trigger
- **Action:** None needed - already configured

---

### 2. ❌ Render (API Server)
- **Status:** NOT CONFIGURED
- **Purpose:** Host your Express server (API + services)
- **Required Settings:**
  - Service Type: Web Service
  - Build Command: `npm install && npm run build`
  - Start Command: `node server/dist/index.js`
  - Environment Variables:
    - `OPENAI_API_KEY` = sk-proj-YOUR_KEY
    - `DATABASE_URL` = (from Neon)
    - `CLERK_SECRET_KEY` = (optional, for auth)
    - `CLERK_PUBLISHABLE_KEY` = (optional, for auth)
    - `RESEND_API_KEY` = (optional, for emails)
    - `APP_BASE_URL` = https://your-app.vercel.app
    - `NODE_ENV` = production

**Setup Steps:**
1. Go to https://render.com
2. Sign up/login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo: `henckert/IntakeLegal`
5. Configure settings (above)
6. Click "Create Web Service"
7. Copy the service URL (e.g., `https://intakelegal-api.onrender.com`)

---

### 3. ❌ Vercel (Web Frontend)
- **Status:** NOT CONFIGURED
- **Purpose:** Host your Next.js web application
- **Required Settings:**
  - Framework Preset: Next.js
  - Root Directory: `web`
  - Build Command: `npm run build` (or leave default)
  - Output Directory: `.next` (default)
  - Environment Variables:
    - `NEXT_PUBLIC_SERVER_BASE_URL` = https://intakelegal-api.onrender.com (from Render)
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = (optional, for auth)
    - `NEXT_PUBLIC_APP_ENV` = production (or omit to enable auth)

**Setup Steps:**
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New" → "Project"
4. Import `henckert/IntakeLegal`
5. Set Root Directory to `web`
6. Add environment variables (above)
7. Click "Deploy"
8. Copy the production URL (e.g., `https://intakelegal.vercel.app`)

---

### 4. ❌ Neon (PostgreSQL Database)
- **Status:** NOT CONFIGURED
- **Purpose:** Production database for intakes, forms, users
- **Required Settings:**
  - Database name: `intakelegal` (or any name)
  - Region: Choose closest to your Render region (e.g., US East)

**Setup Steps:**
1. Go to https://neon.tech
2. Sign up/login
3. Click "Create Project"
4. Name: `IntakeLegal`
5. Region: US East (or your preference)
6. Copy the connection strings:
   - **CONNECTION_STRING** (pooled): Use for `DATABASE_URL`
   - **DIRECT_URL** (non-pooled): Use for migrations
7. Add to Render environment variables:
   - `DATABASE_URL` = postgresql://...neon.tech/intakelegal (pooled)
   - `DIRECT_URL` = postgresql://...neon.tech/intakelegal?sslmode=require (direct)

**After Database Created:**
Run Prisma migrations on Render (one-time setup):
```bash
# SSH into Render or use their shell
npx prisma migrate deploy
npm run seed
```

---

## Optional Services

### 5. ⚠️ Clerk (Authentication) - OPTIONAL
- **Status:** NOT CONFIGURED (local bypass enabled)
- **Purpose:** Lawyer/firm authentication for /builder and /dashboard
- **Note:** Currently `NEXT_PUBLIC_APP_ENV=local` bypasses auth
- **Required if enabling auth:**
  - `CLERK_PUBLISHABLE_KEY` (Render + Vercel)
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Vercel)
  - `CLERK_SECRET_KEY` (Render)

**Setup Steps (if needed):**
1. Go to https://clerk.com
2. Create application
3. Copy keys to environment variables
4. Remove `NEXT_PUBLIC_APP_ENV=local` from Vercel

---

### 6. ⚠️ Resend (Email Notifications) - OPTIONAL
- **Status:** NOT CONFIGURED (mock mode active)
- **Purpose:** Send intake confirmation emails
- **Required if enabling:**
  - `RESEND_API_KEY` (Render)

**Setup Steps (if needed):**
1. Go to https://resend.com
2. Get API key
3. Add to Render environment variables

---

## Deployment Checklist

### Phase 1: Database Setup (Required)
- [ ] Create Neon project
- [ ] Copy `DATABASE_URL` and `DIRECT_URL`
- [ ] Add to local `.env` for testing

### Phase 2: API Deployment (Render)
- [ ] Create Render web service
- [ ] Connect GitHub repo
- [ ] Configure build/start commands
- [ ] Add all environment variables (especially `DATABASE_URL`, `OPENAI_API_KEY`)
- [ ] Deploy and verify health endpoint works
- [ ] Run Prisma migrations via Render shell

### Phase 3: Web Deployment (Vercel)
- [ ] Create Vercel project
- [ ] Set root directory to `web`
- [ ] Add `NEXT_PUBLIC_SERVER_BASE_URL` with Render URL
- [ ] Deploy and test public intake form

### Phase 4: Integration Testing
- [ ] Test `/health` endpoint on Render
- [ ] Test Next.js homepage on Vercel
- [ ] Submit demo intake form end-to-end
- [ ] Verify data appears in Neon database
- [ ] Check Render logs for errors

### Phase 5: Optional Features
- [ ] Enable Clerk authentication (if needed)
- [ ] Enable Resend email notifications (if needed)
- [ ] Configure custom domains (if desired)

---

## Current Local Configuration

Your `.env` file should look like this for local development:

```env
# IntakeLegal - Environment Variables
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=postgresql://...neon.tech/intakelegal
RESEND_API_KEY=
APP_BASE_URL=http://localhost:3000
SERVER_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SERVER_BASE_URL=http://localhost:4000
NEXT_PUBLIC_APP_ENV=local
```

**⚠️ SECURITY WARNING:** Never commit the `.env` file to GitHub! It's already in `.gitignore`.

---

## URLs After Full Deployment

Once everything is deployed, you'll have:

| Service | URL Pattern | Purpose |
|---------|-------------|---------|
| **Render API** | `https://intakelegal-api.onrender.com` | Express server |
| **Vercel Web** | `https://intakelegal.vercel.app` | Next.js frontend |
| **Neon DB** | `postgresql://...neon.tech/intakelegal` | Database |
| **Builder** | `https://intakelegal.vercel.app/builder` | Form builder |
| **Dashboard** | `https://intakelegal.vercel.app/dashboard` | Intake dashboard |
| **Public Intake** | `https://intakelegal.vercel.app/intake/demo` | Client-facing form |

---

## Linking Summary

**What's Linked:**
- ✅ GitHub repository connected

**What's NOT Linked:**
- ❌ Render (API hosting) - needs setup
- ❌ Vercel (Web hosting) - needs setup
- ❌ Neon (Database) - needs setup
- ⚠️ Clerk (Auth) - optional, currently bypassed
- ⚠️ Resend (Email) - optional, currently mocked

**Recommended Deployment Order:**
1. Neon (database first)
2. Render (API server with DB connection)
3. Vercel (web frontend pointing to API)
4. Optional: Clerk + Resend

---

## Next Steps

1. **Immediate:** Add your OpenAI API key to `.env` locally
2. **Today:** Set up Neon database
3. **This week:** Deploy to Render + Vercel
4. **Later:** Enable optional auth/email features

Would you like step-by-step guidance for any specific deployment?
