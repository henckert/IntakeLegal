# File 3: Automation and Deployment

## Parent Task: Build Automation, Testing, and Production Deployment

### Objective
Automate the build, test, and deployment pipeline for IntakeLegal. Verify all components work locally and in production (Render for API, Vercel for Web, Neon for DB).

---

## Subtasks

### 3.1 Create Local Build Verification Script
**Status:** Not Started  
**Description:** Automate checks to ensure both server and web build successfully.

**Actions:**
- [ ] Create `scripts/verify-build.sh` (or `.ps1` for Windows)
- [ ] Check steps:
  1. Install all dependencies
  2. Run Prisma generate
  3. Build server
  4. Build web
  5. Check for build artifacts (`server/dist/`, `web/.next/`)
  6. Report success/failure for each step
- [ ] Exit with code 0 if all pass, 1 if any fail

**Script Template (PowerShell):**
```powershell
#!/usr/bin/env pwsh

Write-Host "🔧 IntakeLegal Build Verification" -ForegroundColor Cyan

# 1. Install dependencies
Write-Host "`n[1/5] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

# 2. Prisma generate
Write-Host "`n[2/5] Generating Prisma client..." -ForegroundColor Yellow
Set-Location server
npx prisma generate
if ($LASTEXITCODE -ne 0) { Set-Location ..; exit 1 }
Set-Location ..

# 3. Build server
Write-Host "`n[3/5] Building server..." -ForegroundColor Yellow
npm --workspace server run build
if ($LASTEXITCODE -ne 0) { exit 1 }

# 4. Build web
Write-Host "`n[4/5] Building web..." -ForegroundColor Yellow
npm --workspace web run build
if ($LASTEXITCODE -ne 0) { exit 1 }

# 5. Verify artifacts
Write-Host "`n[5/5] Verifying build artifacts..." -ForegroundColor Yellow
if (-Not (Test-Path "server/dist/index.js")) {
  Write-Host "❌ Server build failed: dist/index.js not found" -ForegroundColor Red
  exit 1
}
if (-Not (Test-Path "web/.next")) {
  Write-Host "❌ Web build failed: .next/ directory not found" -ForegroundColor Red
  exit 1
}

Write-Host "`n✅ All builds successful!" -ForegroundColor Green
exit 0
```

**Acceptance Criteria:**
- Script runs without manual intervention
- All five steps complete successfully
- Exit codes correctly indicate pass/fail

---

### 3.2 Verify Environment Variables
**Status:** Not Started  
**Description:** Ensure all required environment variables are set before deployment.

**Actions:**
- [ ] Create `scripts/verify-env.sh` (or `.ps1`)
- [ ] Check for required variables:
  - `DATABASE_URL` (Neon pooled connection)
  - `DIRECT_DATABASE_URL` (Neon direct connection)
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_SERVER_BASE_URL`
  - `APP_BASE_URL`
  - `SERVER_BASE_URL`
- [ ] Report missing variables with friendly error messages
- [ ] Exit with code 0 if all present, 1 if any missing

**Script Template (PowerShell):**
```powershell
#!/usr/bin/env pwsh

Write-Host "🔍 Environment Variable Verification" -ForegroundColor Cyan

$required = @(
  "DATABASE_URL",
  "DIRECT_DATABASE_URL",
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_SERVER_BASE_URL",
  "APP_BASE_URL",
  "SERVER_BASE_URL"
)

$missing = @()

foreach ($var in $required) {
  $value = [Environment]::GetEnvironmentVariable($var)
  if (-Not $value) {
    $missing += $var
    Write-Host "❌ Missing: $var" -ForegroundColor Red
  } else {
    Write-Host "✅ Found: $var" -ForegroundColor Green
  }
}

if ($missing.Count -gt 0) {
  Write-Host "`n❌ Missing $($missing.Count) required variable(s)" -ForegroundColor Red
  Write-Host "Add these to your .env file:" -ForegroundColor Yellow
  foreach ($var in $missing) {
    Write-Host "  $var=..." -ForegroundColor Yellow
  }
  exit 1
}

Write-Host "`n✅ All required variables present" -ForegroundColor Green
exit 0
```

**Acceptance Criteria:**
- All required variables detected
- Clear error messages for missing variables
- Script works on Windows and Unix-like systems

---

### 3.3 Create Health Check Verification Script
**Status:** Not Started  
**Description:** Verify API and Web endpoints are responding correctly.

**Actions:**
- [ ] Create `scripts/verify-health.sh` (or `.ps1`)
- [ ] Check endpoints:
  - `http://localhost:4000/health` (API)
  - `http://localhost:3000` (Web)
- [ ] Verify response codes (200 OK)
- [ ] Timeout after 10 seconds per check
- [ ] Report success/failure with response time

**Script Template (PowerShell):**
```powershell
#!/usr/bin/env pwsh

Write-Host "🏥 Health Check Verification" -ForegroundColor Cyan

# Check API health
Write-Host "`n[1/2] Checking API (http://localhost:4000/health)..." -ForegroundColor Yellow
try {
  $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -TimeoutSec 10
  if ($response.StatusCode -eq 200) {
    Write-Host "✅ API is healthy" -ForegroundColor Green
  } else {
    Write-Host "❌ API returned status $($response.StatusCode)" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host "❌ API is not responding: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

# Check Web health
Write-Host "`n[2/2] Checking Web (http://localhost:3000)..." -ForegroundColor Yellow
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
  if ($response.StatusCode -eq 200) {
    Write-Host "✅ Web is healthy" -ForegroundColor Green
  } else {
    Write-Host "❌ Web returned status $($response.StatusCode)" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host "❌ Web is not responding: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Write-Host "`n✅ All services are healthy!" -ForegroundColor Green
exit 0
```

**Acceptance Criteria:**
- Script correctly detects running services
- Timeouts prevent hanging on unreachable services
- Response times logged for debugging

---

### 3.4 Create End-to-End Test Script
**Status:** Not Started  
**Description:** Test complete upload flow from file submission to summary generation.

**Actions:**
- [ ] Create `scripts/e2e-test.sh` (or `.ps1`)
- [ ] Test flow:
  1. Upload test file to `/api/uploads`
  2. Poll for processing completion
  3. Verify response contains:
     - `extractedData` with required fields
     - `summary` text
     - `clarificationQuestions` array
     - `nextSteps` array
  4. Download PDF export
  5. Verify PDF file exists and has content
- [ ] Use sample file from `server/tests/fixtures/sample.docx`
- [ ] Report pass/fail with detailed output

**Script Template (PowerShell):**
```powershell
#!/usr/bin/env pwsh

Write-Host "🧪 End-to-End Test" -ForegroundColor Cyan

$apiBase = "http://localhost:4000"
$testFile = "server/tests/fixtures/sample.docx"

# 1. Upload file
Write-Host "`n[1/4] Uploading test file..." -ForegroundColor Yellow
$form = @{
  file = Get-Item -Path $testFile
}
try {
  $uploadResponse = Invoke-RestMethod -Uri "$apiBase/api/uploads" `
    -Method Post -Form $form -TimeoutSec 30
  Write-Host "✅ Upload successful, ID: $($uploadResponse.id)" -ForegroundColor Green
} catch {
  Write-Host "❌ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

# 2. Verify extracted data
Write-Host "`n[2/4] Verifying extracted data..." -ForegroundColor Yellow
if (-Not $uploadResponse.extractedData) {
  Write-Host "❌ No extractedData in response" -ForegroundColor Red
  exit 1
}
Write-Host "✅ Extracted data present" -ForegroundColor Green

# 3. Verify summary
Write-Host "`n[3/4] Verifying AI summary..." -ForegroundColor Yellow
if (-Not $uploadResponse.summary) {
  Write-Host "❌ No summary in response" -ForegroundColor Red
  exit 1
}
Write-Host "✅ Summary generated: $($uploadResponse.summary.Substring(0, 50))..." -ForegroundColor Green

# 4. Download PDF
Write-Host "`n[4/4] Testing PDF export..." -ForegroundColor Yellow
try {
  $pdfPath = "test-output.pdf"
  Invoke-WebRequest -Uri "$apiBase/api/uploads/$($uploadResponse.id)/export/pdf" `
    -OutFile $pdfPath -TimeoutSec 30
  if (Test-Path $pdfPath) {
    $size = (Get-Item $pdfPath).Length
    Write-Host "✅ PDF exported successfully ($size bytes)" -ForegroundColor Green
    Remove-Item $pdfPath
  } else {
    Write-Host "❌ PDF file not created" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host "❌ PDF export failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Write-Host "`n✅ End-to-end test passed!" -ForegroundColor Green
exit 0
```

**Acceptance Criteria:**
- Upload completes successfully
- AI processing returns structured data
- PDF export downloads correctly
- All assertions pass

---

### 3.5 Update Render Configuration
**Status:** Not Started  
**Description:** Ensure Render deployment config is production-ready.

**Actions:**
- [ ] Verify `render.yaml` has:
  - `rootDir: server`
  - `buildCommand: npm ci && npm run build`
  - `startCommand: node dist/index.js`
  - `healthCheckPath: /health`
  - All environment variables listed
- [ ] Add new environment variables if added in File 1:
  - `UPLOAD_DIR` (optional, default to `/tmp/uploads`)
  - `MAX_FILE_SIZE_MB` (default to 10)
- [ ] Ensure region is set to `frankfurt` (EU)

**Acceptance Criteria:**
- `render.yaml` is complete and valid
- All env vars documented
- Health check path correct

---

### 3.6 Update Vercel Configuration
**Status:** Not Started  
**Description:** Ensure Vercel deployment config is production-ready.

**Actions:**
- [ ] Verify `vercel.json` has:
  - `framework: "nextjs"`
  - `buildCommand: "npm --workspace web run build"`
  - Root directory set to `web`
- [ ] Ensure environment variables include:
  - `NEXT_PUBLIC_SERVER_BASE_URL` (Render API URL)
  - `NEXT_PUBLIC_APP_ENV=production`
- [ ] Add `CLERK_*` variables if authentication enabled

**Acceptance Criteria:**
- `vercel.json` is complete and valid
- Build command correct for monorepo
- Environment variables documented

---

### 3.7 Run Local Database Migration
**Status:** Not Started  
**Description:** Apply Prisma migrations to Neon database.

**Actions:**
- [ ] Set `DATABASE_URL` to Neon **direct** connection (non-pooled)
- [ ] Run: `cd server && npx prisma migrate deploy`
- [ ] Verify migration success
- [ ] Switch `DATABASE_URL` back to pooled connection
- [ ] Test database connection with: `npx prisma db pull`

**Commands:**
```bash
# Use direct connection for migration
export DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:5432/<DB_NAME>?sslmode=require"

cd server
npx prisma migrate deploy
npx prisma generate

# Switch back to pooled for runtime
export DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST_POOLER>:5432/<DB_NAME>?sslmode=require&channel_binding=require"
```

**Acceptance Criteria:**
- Migrations apply without errors
- Database schema matches Prisma schema
- Connection works with pooled URL

---

### 3.8 Deploy to Render
**Status:** Not Started  
**Description:** Deploy API server to Render and verify.

**Actions:**
- [ ] Push `feature/ai-intake-pipeline` branch to GitHub
- [ ] Create new Web Service on Render dashboard
- [ ] Connect to GitHub repo `henckert/IntakeLegal`
- [ ] Set branch to `feature/ai-intake-pipeline`
- [ ] Configure from `render.yaml`
- [ ] Add environment variables:
  - `DATABASE_URL` (Neon pooled)
  - `DIRECT_DATABASE_URL` (Neon direct)
  - `OPENAI_API_KEY`
  - `APP_BASE_URL` (Vercel URL, update after Vercel deploys)
  - `SERVER_BASE_URL` (own Render URL)
  - `NODE_ENV=production`
- [ ] Deploy and wait for build
- [ ] Run migration in Render Shell:
  ```bash
  cd server
  npx prisma migrate deploy
  ```
- [ ] Test health endpoint: `curl https://intakelegal-api.onrender.com/health`

**Acceptance Criteria:**
- Render build succeeds
- Health endpoint returns 200
- API logs show no errors

---

### 3.9 Deploy to Vercel
**Status:** Not Started  
**Description:** Deploy web app to Vercel and verify.

**Actions:**
- [ ] Go to Vercel dashboard
- [ ] Import `henckert/IntakeLegal` repository
- [ ] Set branch to `feature/ai-intake-pipeline`
- [ ] Set root directory to `web`
- [ ] Add environment variables:
  - `NEXT_PUBLIC_SERVER_BASE_URL=https://intakelegal-api.onrender.com`
  - `NEXT_PUBLIC_APP_ENV=production`
  - Add `CLERK_*` variables if using auth
- [ ] Deploy and wait for build
- [ ] Test URLs:
  - `https://intake-legal-web.vercel.app`
  - `https://intake-legal-web.vercel.app/workspace`

**Acceptance Criteria:**
- Vercel build succeeds
- Home page loads correctly
- Workspace demo upload works
- No console errors in browser

---

### 3.10 Update Cross-Service URLs
**Status:** Not Started  
**Description:** Configure production URLs in both services.

**Actions:**
- [ ] Update Render environment variables:
  - `APP_BASE_URL=https://intake-legal-web.vercel.app`
  - `SERVER_BASE_URL=https://intakelegal-api.onrender.com`
- [ ] Redeploy Render service
- [ ] Update Vercel environment variables:
  - `NEXT_PUBLIC_SERVER_BASE_URL=https://intakelegal-api.onrender.com`
- [ ] Redeploy Vercel service
- [ ] Test CORS with browser dev tools

**Acceptance Criteria:**
- Web app successfully calls API
- No CORS errors in browser console
- Both services reference correct URLs

---

### 3.11 Run Production Smoke Tests
**Status:** Not Started  
**Description:** Verify production deployments with automated tests.

**Actions:**
- [ ] Test API health:
  ```bash
  curl -I https://intakelegal-api.onrender.com/health
  ```
- [ ] Test Web home page:
  ```bash
  curl -I https://intake-legal-web.vercel.app
  ```
- [ ] Test CORS headers:
  ```bash
  curl -I https://intakelegal-api.onrender.com/health \
    -H "Origin: https://intake-legal-web.vercel.app"
  ```
- [ ] Test E2E upload flow (manual in browser):
  1. Go to `https://intake-legal-web.vercel.app/workspace`
  2. Upload test file
  3. Verify summary displays
  4. Download PDF export
- [ ] Document results in table:

| Endpoint | Status | Latency | Result |
|----------|--------|---------|--------|
| API /health | 200 | <300ms | ✅ OK |
| Web / | 200 | <500ms | ✅ OK |
| CORS check | 200 | - | ✅ OK |
| E2E upload | 200 | <10s | ✅ OK |

**Acceptance Criteria:**
- All endpoints return 200
- Latencies within acceptable ranges
- E2E flow works end-to-end
- PDF exports successfully

---

### 3.12 Generate Deployment Confirmation Document
**Status:** Not Started  
**Description:** Create final summary document confirming deployment success.

**Actions:**
- [ ] Create `docs/DEPLOYMENT_CONFIRMATION.md`
- [ ] Include sections:
  - **Database Migration Status** ✅
  - **Render Deployment Status** ✅
  - **Vercel Deployment Status** ✅
  - **Environment Variables Verified** ✅
  - **API and Web Live** ✅
  - **Smoke Test Results** (table from 3.11)
  - **Production URLs**:
    - API: https://intakelegal-api.onrender.com
    - Web: https://intake-legal-web.vercel.app
  - **Ready for External Testing** ✅

**Template:**
```markdown
# IntakeLegal Deployment Confirmation

**Date:** [Auto-generated]  
**Branch:** feature/ai-intake-pipeline  
**Deployed By:** [Agent/User]

---

## Deployment Checklist

- [x] Database migration completed
- [x] Render API deployed and healthy
- [x] Vercel Web deployed and healthy
- [x] Environment variables configured
- [x] Cross-service URLs updated
- [x] CORS configured correctly
- [x] Smoke tests passed

---

## Production URLs

- **Web App:** https://intake-legal-web.vercel.app
- **API:** https://intakelegal-api.onrender.com
- **Health Check:** https://intakelegal-api.onrender.com/health

---

## Smoke Test Results

| Endpoint | Status | Latency | Result |
|----------|--------|---------|--------|
| API /health | 200 | 250ms | ✅ OK |
| Web / | 200 | 450ms | ✅ OK |
| CORS check | 200 | - | ✅ OK |
| E2E upload | 200 | 8.5s | ✅ OK |

---

## ✅ READY FOR TESTING

The IntakeLegal AI Intake System is now live and ready for external testers.

**Demo URL:** https://intake-legal-web.vercel.app/workspace

Test the system by uploading a sample intake document (.docx, .pdf, .eml, .wav, .mp3) and reviewing the AI-generated summary.

---

**Next Steps:**
1. Share demo URL with test users
2. Monitor Render/Vercel logs for errors
3. Collect user feedback
4. Plan next iteration features
```

**Acceptance Criteria:**
- Document is comprehensive and accurate
- All checkboxes marked as complete
- URLs are correct and clickable
- Ready for external testing confirmed

---

### 3.13 Merge to Main and Final Deployment
**Status:** Not Started  
**Description:** Merge feature branch to main and deploy from main branch.

**Actions:**
- [ ] Create pull request: `feature/ai-intake-pipeline` → `main`
- [ ] Review changes (AI agent can self-review or user reviews)
- [ ] Merge PR to `main`
- [ ] Update Render to deploy from `main` branch
- [ ] Update Vercel to deploy from `main` branch
- [ ] Verify both services redeploy successfully
- [ ] Test production URLs again
- [ ] Tag release: `git tag v2.0.0-ai-intake`
- [ ] Push tag: `git push origin v2.0.0-ai-intake`

**Acceptance Criteria:**
- PR merged without conflicts
- Both services deploy from `main`
- Production URLs work correctly
- Release tagged for version control

---

## Deliverables for File 3

- [ ] Build verification script (`scripts/verify-build.ps1`)
- [ ] Environment variable verification script (`scripts/verify-env.ps1`)
- [ ] Health check script (`scripts/verify-health.ps1`)
- [ ] End-to-end test script (`scripts/e2e-test.ps1`)
- [ ] Updated `render.yaml` with all env vars
- [ ] Updated `vercel.json` with correct config
- [ ] Database migrations applied to Neon
- [ ] Render deployment live and healthy
- [ ] Vercel deployment live and healthy
- [ ] Cross-service URLs configured
- [ ] Smoke tests passed (table with results)
- [ ] `docs/DEPLOYMENT_CONFIRMATION.md` created
- [ ] Feature branch merged to `main`
- [ ] Release tagged `v2.0.0-ai-intake`

---

## Final Verification Checkpoint

After completing all subtasks, verify:

```bash
# 1. Run all verification scripts
./scripts/verify-build.ps1
./scripts/verify-env.ps1
./scripts/verify-health.ps1
./scripts/e2e-test.ps1

# 2. Test production URLs
curl -I https://intakelegal-api.onrender.com/health
curl -I https://intake-legal-web.vercel.app

# 3. Verify deployment confirmation exists
cat docs/DEPLOYMENT_CONFIRMATION.md
```

**Expected Output:**
```json
{
  "api_ok": true,
  "web_ok": true,
  "test_passed": true,
  "deployment_confirmed": true,
  "ready_for_production": true
}
```

---

## Final Output Message

After all three files completed successfully:

```
✅ IntakeLegal AI Intake System successfully refactored and deployed.

🌐 Production URLs:
   - Web: https://intake-legal-web.vercel.app
   - API: https://intakelegal-api.onrender.com

📊 Status:
   - Database: ✅ Migrated
   - Server: ✅ Deployed (Render)
   - Web: ✅ Deployed (Vercel)
   - Tests: ✅ Passed

🎯 Next Steps:
   1. Share workspace demo: https://intake-legal-web.vercel.app/workspace
   2. Monitor logs for errors
   3. Collect user feedback
   4. Plan iteration 2

🚀 System is live and ready for external testers!
```

---

## Status Summary

**Status:** ✅ DEPLOYMENT COMPLETE | ⚠️ ISSUES DETECTED | ❌ DEPLOYMENT FAILED

Do not output final message until this status is ✅ DEPLOYMENT COMPLETE.
