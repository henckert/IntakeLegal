# IntakeLegal Cloud Connectivity Report

**Generated:** 2025-11-07T21:53:10.925Z

## Summary

| Component | Status | Duration | Notes |
|-----------|--------|----------|-------|
| **API (Render)** | ❌ FAIL | 39ms | fetch failed |
| **Web (Vercel)** | ❌ FAIL | 2ms | fetch failed |
| **DB (Neon)** | ❌ FAIL | 0ms | DATABASE_URL missing |
| **E2E Submit** | ❌ FAIL | 5ms | fetch failed |

## Details

### API Health (`http://localhost:4000/health`)
- **Status:** fetch failed
- **Duration:** 39ms
- **DNS IP:** 127.0.0.1
- **Response snippet:**
```json
N/A
```

### Web Root (`http://localhost:3000/`)
- **Status:** fetch failed
- **Duration:** 2ms
- **DNS IP:** 127.0.0.1
- **Response snippet:**
```
N/A
```

### Database (Neon)
- **Status:** Failed
- **Duration:** 0ms
- **Version:** N/A
- **Temp table test:** N/A
- **Error:** DATABASE_URL missing

### E2E Submit (`http://localhost:4000/api/intake/demo/submit`)
- **Status:** fetch failed
- **Duration:** 5ms
- **DRY_RUN detected:** No
- **Response snippet:**
```json
N/A
```

## Config Detected

- **API_BASE:** http://localhost:4000
- **WEB_BASE:** http://localhost:3000
- **DATABASE_URL:** Missing
- **DIRECT_URL:** Missing

## Next Steps

- **API unreachable:** Verify Render deployment is running. Ensure server binds to `process.env.PORT`.
- **DNS/SSL:** Check domain DNS records and SSL certificate validity.
- **Web failed:** fetch failed. Verify Vercel deployment and domain configuration.
- **DB not configured:** Set DATABASE_URL (and optionally DIRECT_URL) in .env and on Render.
- **E2E failed:** fetch failed. Check server logs and endpoint implementation.

## Timestamp

**Generated at:** 2025-11-07T21:53:10.925Z
