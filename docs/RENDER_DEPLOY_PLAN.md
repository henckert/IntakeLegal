# Render Deployment Plan - IntakeLegal API

**Generated:** November 7, 2025  
**Service:** `intakelegal-api`  
**Type:** Web Service  
**Region:** Frankfurt (EU)

---

## Configuration Validation ✅

### Build & Runtime Settings

| Setting | Value | Status |
|---------|-------|--------|
| **Root Directory** | `server` | ✅ Correct |
| **Build Command** | `npm ci && npm run build` | ✅ Valid |
| **Start Command** | `node dist/index.js` | ✅ Valid |
| **Health Check Path** | `/health` | ✅ Implemented |
| **Runtime** | Node.js | ✅ Compatible |
| **Region** | Frankfurt | ✅ EU compliance |
| **Plan** | Starter ($7/mo) | ✅ Production-ready |

### Environment Variables Required

| Key | Value | Source | Status |
|-----|-------|--------|--------|
| **NODE_ENV** | `production` | render.yaml | ✅ Set |
| **PORT** | `10000` | render.yaml | ✅ Set |
| **DATABASE_URL** | `postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>/<DB_NAME>?sslmode=require` | Neon (pooled) | ✅ Ready |
| **DIRECT_URL** | `postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>/<DB_NAME>?sslmode=require` | Neon (direct) | ✅ Ready |
| **OPENAI_API_KEY** | `sk-proj-***` | Local .env | ✅ Available |
| **APP_BASE_URL** | `https://intake-legal-web.vercel.app` | Cross-service | ✅ Set |
| **SERVER_BASE_URL** | `https://intakelegal-api.onrender.com` | Self-reference | ✅ Set |
| **CLERK_SECRET_KEY** | *(optional)* | Local .env | ⚠️ Empty (OK for MVP) |
| **CLERK_PUBLISHABLE_KEY** | *(optional)* | Local .env | ⚠️ Empty (OK for MVP) |
| **RESEND_API_KEY** | *(optional)* | Local .env | ⚠️ Empty (OK for MVP) |

---

## Pre-Deployment Checklist

- [x] Prisma schema validated
- [x] Database migrations applied (none pending)
- [x] Prisma client generated
- [x] TypeScript build successful (`dist/` populated)
- [x] Health endpoint implemented at `/health`
- [x] CORS configured for Vercel domain
- [x] Environment variables documented
- [x] `render.yaml` validated

---

## Deployment Steps

### Manual Deployment via Render Dashboard

1. **Create Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository: `henckert/IntakeLegal`
   - Select branch: `main`

2. **Configure Service**
   - Name: `intakelegal-api`
   - Region: `Frankfurt`
   - Branch: `main`
   - Root Directory: `server`
   - Runtime: `Node`
   - Build Command: `npm ci && npm run build`
   - Start Command: `node dist/index.js`

3. **Add Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require
   DIRECT_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
   OPENAI_API_KEY=<your-openai-api-key>
   APP_BASE_URL=https://intake-legal-web.vercel.app
   SERVER_BASE_URL=https://intakelegal-api.onrender.com
   ```

4. **Configure Health Check**
   - Path: `/health`
   - Interval: 30 seconds
   - Timeout: 5 seconds

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build (~3-5 minutes)
   - Monitor logs for startup confirmation

6. **Post-Deploy: Verify Database**
   ```bash
   # In Render Shell (if needed):
   npx prisma migrate deploy
   npm run seed
   ```

---

## Expected Deployment URL

```
https://intakelegal-api.onrender.com
```

### Endpoints to Test

- `GET /health` → `{"ok": true, "ts": "2025-11-07T..."}`
- `GET /api/forms` → Form list (requires auth or mock)
- `POST /api/intake/demo/submit` → Public intake submission

---

## Post-Deployment Verification

```bash
# Test health endpoint
curl -i https://intakelegal-api.onrender.com/health

# Expected response:
# HTTP/2 200
# content-type: application/json
# {"ok":true,"ts":"2025-11-07T..."}

# Test CORS with Vercel origin
curl -i https://intakelegal-api.onrender.com/health \
  -H "Origin: https://intake-legal-web.vercel.app"

# Expected: Access-Control-Allow-Origin header present
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check `rootDir: server` is set correctly |
| Prisma errors | Run `npx prisma generate` in Render Shell |
| Database timeout | Use pooled `DATABASE_URL`, not direct |
| Health check fails | Ensure `/health` route is not behind auth |
| CORS errors | Verify `APP_BASE_URL` matches Vercel URL |

---

## Status

**CONFIGURATION: ✅ READY FOR DEPLOYMENT**

All settings validated, environment variables prepared, and build artifacts confirmed. Ready to deploy via Render Dashboard.

**Next Step:** Deploy to Render manually, then update `NEXT_PUBLIC_SERVER_BASE_URL` in Vercel with the Render URL.
