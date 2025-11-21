import dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dns from 'dns/promises';

dotenv.config();

// ============================================================================
// Config Discovery
// ============================================================================
const API_BASE = process.env.SERVER_BASE_URL || process.env.NEXT_PUBLIC_SERVER_BASE_URL || 'MISSING_API_BASE';
const WEB_BASE = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || 'MISSING_WEB_BASE';
const DATABASE_URL = process.env.DATABASE_URL || '';
const DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL || '';

// ============================================================================
// Helpers
// ============================================================================
interface FetchResult {
  ok: boolean;
  status?: number;
  ms: number;
  body?: any;
  text?: string;
  error?: string;
}

async function fetchJSON(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<FetchResult> {
  const t0 = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timer);
    const ms = Date.now() - t0;

    let body: any;
    let text: string = '';
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      text = await response.text();
      text = text.slice(0, 300); // truncate
    }

    return {
      ok: response.ok,
      status: response.status,
      ms,
      body,
      text,
    };
  } catch (e: any) {
    clearTimeout(timer);
    const ms = Date.now() - t0;
    const error = e.name === 'AbortError' ? `Timeout after ${timeoutMs}ms` : String(e.message || e);
    return {
      ok: false,
      ms,
      error,
    };
  }
}

interface DBResult {
  ok: boolean;
  version?: string;
  tempTableOk?: boolean;
  error?: string;
  ms: number;
}

async function testDB(): Promise<DBResult> {
  if (!DATABASE_URL) {
    return { ok: false, error: 'DATABASE_URL missing', ms: 0 };
  }

  const t0 = Date.now();
  let client: any;

  try {
    // Dynamically import pg to avoid bundling issues
    const { default: pg } = await import('pg');
    const { Client } = pg;

    client = new Client({
      connectionString: DIRECT_URL || DATABASE_URL,
      connectionTimeoutMillis: 6000,
      query_timeout: 6000,
    });

    await client.connect();

    // Test: SELECT version()
    const versionRes = await client.query('SELECT version()');
    const version = versionRes.rows[0]?.version?.slice(0, 100) || 'unknown';

    // Test: temp table create/insert/select/drop
    const tempTable = `diag_intakelegal_smoke_${Date.now()}`;
    await client.query(`CREATE TEMP TABLE "${tempTable}" (id SERIAL PRIMARY KEY, val TEXT)`);
    await client.query(`INSERT INTO "${tempTable}" (val) VALUES ('smoke-test')`);
    const countRes = await client.query(`SELECT COUNT(*) FROM "${tempTable}"`);
    const count = parseInt(countRes.rows[0]?.count || '0', 10);
    await client.query(`DROP TABLE "${tempTable}"`);

    const tempTableOk = count === 1;

    await client.end();
    const ms = Date.now() - t0;
    return { ok: true, version, tempTableOk, ms };
  } catch (e: any) {
    if (client) {
      try {
        await client.end();
      } catch {}
    }
    const ms = Date.now() - t0;
    return { ok: false, error: String(e.message || e), ms };
  }
}

async function resolveDNS(urlString: string): Promise<string> {
  try {
    const url = new URL(urlString);
    const addresses = await dns.resolve4(url.hostname);
    return addresses[0] || 'N/A';
  } catch {
    return 'N/A';
  }
}

// ============================================================================
// Main Diagnostic
// ============================================================================
async function main() {
  console.log('🔍 IntakeLegal Cloud Connectivity Check\n');

  const results: any = {
    api: { status: 'UNKNOWN', ms: 0 },
    web: { status: 'UNKNOWN', ms: 0 },
    db: { status: 'UNKNOWN', ms: 0 },
    e2e: { status: 'UNKNOWN', ms: 0 },
  };

  // 1) API Health Check
  console.log(`[1/4] Checking API health: ${API_BASE}/health`);
  if (API_BASE === 'MISSING_API_BASE') {
    results.api = { status: 'FAIL', error: 'API_BASE not configured', ms: 0 };
  } else {
    const apiResult = await fetchJSON(`${API_BASE}/health`);
    results.api = apiResult;
    console.log(`  → ${apiResult.ok ? 'PASS' : 'FAIL'} (${apiResult.ms}ms) ${apiResult.error || ''}`);
  }

  // 2) Web Root Check
  console.log(`[2/4] Checking Web root: ${WEB_BASE}/`);
  if (WEB_BASE === 'MISSING_WEB_BASE') {
    results.web = { status: 'FAIL', error: 'WEB_BASE not configured', ms: 0 };
  } else {
    const webResult = await fetchJSON(`${WEB_BASE}/`);
    results.web = webResult;
    console.log(`  → ${webResult.ok ? 'PASS' : 'FAIL'} (${webResult.ms}ms) ${webResult.error || ''}`);
  }

  // 3) Database Test
  console.log(`[3/4] Checking Database (Neon)`);
  const dbResult = await testDB();
  results.db = dbResult;
  console.log(`  → ${dbResult.ok ? 'PASS' : 'FAIL'} (${dbResult.ms}ms) ${dbResult.error || ''}`);

  // 4) E2E Submit Test
  console.log(`[4/4] Testing E2E submit: ${API_BASE}/api/intake/demo/submit`);
  if (API_BASE === 'MISSING_API_BASE') {
    results.e2e = { status: 'FAIL', error: 'API_BASE not configured', ms: 0 };
  } else {
    const payload = {
      slug: 'demo',
      client: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
      case: {
        claimType: 'Personal Injury',
        eventDate: '2024-01-01',
        location: 'Dublin',
        narrative: 'I was in an accident and suffered injuries.',
      },
      consent: { gdpr: true },
    };

    const e2eResult = await fetchJSON(`${API_BASE}/api/intake/demo/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    results.e2e = e2eResult;
    
    // Detect dry-run mode
    const isDryRun = e2eResult.body?.meta?.dryRun === true || 
                     (e2eResult.body?.summaryText && String(e2eResult.body.summaryText).startsWith('MOCK'));
    
    results.e2e.isDryRun = isDryRun;
    console.log(`  → ${e2eResult.ok ? 'PASS' : 'FAIL'} (${e2eResult.ms}ms) ${isDryRun ? '[DRY_RUN detected]' : ''} ${e2eResult.error || ''}`);
  }

  // Resolve DNS for API and Web
  const apiIP = API_BASE !== 'MISSING_API_BASE' ? await resolveDNS(API_BASE) : 'N/A';
  const webIP = WEB_BASE !== 'MISSING_WEB_BASE' ? await resolveDNS(WEB_BASE) : 'N/A';

  // ============================================================================
  // Generate Report
  // ============================================================================
  const timestamp = new Date().toISOString();
  
  const report = `# IntakeLegal Cloud Connectivity Report

**Generated:** ${timestamp}

## Summary

| Component | Status | Duration | Notes |
|-----------|--------|----------|-------|
| **API (Render)** | ${results.api.ok ? '✅ PASS' : '❌ FAIL'} | ${results.api.ms}ms | ${results.api.error || `HTTP ${results.api.status || 'N/A'}`} |
| **Web (Vercel)** | ${results.web.ok ? '✅ PASS' : '❌ FAIL'} | ${results.web.ms}ms | ${results.web.error || `HTTP ${results.web.status || 'N/A'}`} |
| **DB (Neon)** | ${results.db.ok ? '✅ PASS' : '❌ FAIL'} | ${results.db.ms}ms | ${results.db.error || `Version: ${results.db.version?.slice(0, 50)}...`} |
| **E2E Submit** | ${results.e2e.ok ? '✅ PASS' : '❌ FAIL'} | ${results.e2e.ms}ms | ${results.e2e.error || (results.e2e.isDryRun ? 'DRY_RUN mode' : 'OK')} |

## Details

### API Health (\`${API_BASE}/health\`)
- **Status:** ${results.api.status || results.api.error}
- **Duration:** ${results.api.ms}ms
- **DNS IP:** ${apiIP}
- **Response snippet:**
\`\`\`json
${results.api.body ? JSON.stringify(results.api.body, null, 2).slice(0, 300) : results.api.text || 'N/A'}
\`\`\`

### Web Root (\`${WEB_BASE}/\`)
- **Status:** ${results.web.status || results.web.error}
- **Duration:** ${results.web.ms}ms
- **DNS IP:** ${webIP}
- **Response snippet:**
\`\`\`
${results.web.text || 'N/A'}
\`\`\`

### Database (Neon)
- **Status:** ${results.db.ok ? 'Connected' : 'Failed'}
- **Duration:** ${results.db.ms}ms
- **Version:** ${results.db.version || 'N/A'}
- **Temp table test:** ${results.db.tempTableOk ? 'PASS (created/inserted/selected/dropped)' : 'N/A'}
- **Error:** ${results.db.error || 'None'}

### E2E Submit (\`${API_BASE}/api/intake/demo/submit\`)
- **Status:** ${results.e2e.status || results.e2e.error}
- **Duration:** ${results.e2e.ms}ms
- **DRY_RUN detected:** ${results.e2e.isDryRun ? 'Yes (server returned mock response)' : 'No'}
- **Response snippet:**
\`\`\`json
${results.e2e.body ? JSON.stringify(results.e2e.body, null, 2).slice(0, 300) : 'N/A'}
\`\`\`

## Config Detected

- **API_BASE:** ${API_BASE}
- **WEB_BASE:** ${WEB_BASE}
- **DATABASE_URL:** ${DATABASE_URL ? 'Present' : 'Missing'}
- **DIRECT_URL:** ${DIRECT_URL ? 'Present' : 'Missing'}

## Next Steps

${generateNextSteps(results)}

## Timestamp

**Generated at:** ${timestamp}
`;

  // Write report
  const reportPath = path.join(process.cwd(), 'diagnostics', 'cloud_connectivity_report.md');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, report, 'utf-8');

  console.log(`\n✅ Report written to: ${reportPath}`);

  // Print summary
  const allPass = results.api.ok && results.web.ok && results.db.ok && results.e2e.ok;
  console.log(`\n${allPass ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);
  
  process.exit(allPass ? 0 : 1);
}

function generateNextSteps(results: any): string {
  const steps: string[] = [];

  if (!results.api.ok) {
    if (results.api.error?.includes('Timeout')) {
      steps.push('- **API timeout:** Ensure DRY_RUN=true or set OPENAI_API_KEY on Render. Check server logs for stalls.');
    } else if (results.api.error?.includes('fetch failed') || results.api.error?.includes('ECONNREFUSED')) {
      steps.push('- **API unreachable:** Verify Render deployment is running. Ensure server binds to `process.env.PORT`.');
      steps.push('- **DNS/SSL:** Check domain DNS records and SSL certificate validity.');
    } else {
      steps.push(`- **API failed:** ${results.api.error}. Check Render logs and ensure /health endpoint is implemented.`);
    }
  }

  if (!results.web.ok) {
    if (results.web.error?.includes('Timeout')) {
      steps.push('- **Web timeout:** Check Vercel deployment status and logs.');
    } else {
      steps.push(`- **Web failed:** ${results.web.error}. Verify Vercel deployment and domain configuration.`);
    }
  }

  if (!results.db.ok) {
    if (results.db.error?.includes('timeout')) {
      steps.push('- **DB timeout:** Check Neon connection pooling settings and network latency. Try DIRECT_URL for pooler bypass.');
    } else if (results.db.error?.includes('DATABASE_URL missing')) {
      steps.push('- **DB not configured:** Set DATABASE_URL (and optionally DIRECT_URL) in .env and on Render.');
    } else {
      steps.push(`- **DB connection failed:** ${results.db.error}. Verify Neon credentials and IP allowlist.`);
    }
  }

  if (!results.e2e.ok) {
    if (results.e2e.error?.includes('Timeout') || results.e2e.status === 504) {
      steps.push('- **E2E timeout (504):** Enable DRY_RUN=true on server or set OPENAI_API_KEY. Check withTimeout configuration.');
    } else if (results.e2e.status === 400) {
      steps.push('- **E2E bad request (400):** Verify payload schema matches server validation (UIShape in intake.ts).');
    } else if (results.e2e.status === 502) {
      steps.push('- **E2E upstream error (502):** Check server logs for AI/SOL/email service failures.');
    } else {
      steps.push(`- **E2E failed:** ${results.e2e.error || `HTTP ${results.e2e.status}`}. Check server logs and endpoint implementation.`);
    }
  }

  if (steps.length === 0) {
    return '✅ **All checks passed!** No action required. System is fully operational.';
  }

  return steps.join('\n');
}

main().catch((e) => {
  console.error('❌ Diagnostic script failed:', e);
  process.exit(1);
});
