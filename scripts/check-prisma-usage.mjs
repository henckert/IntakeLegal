#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'server', 'src');
const ALLOW_EXACT = new Set([
  path.join('server', 'src', 'services', 'tenantDb.ts'),
]);

async function* walk(dir) {
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile() && entry.endsWith('.ts')) yield entry;
  }
}

async function main() {
  const violations = [];
  for await (const file of walk(ROOT)) {
  const rel = file.replace(process.cwd() + path.sep, '');
  if (rel.startsWith(path.join('server','src','prisma'))) continue; // allow prisma helpers and seeds
  if (ALLOW_EXACT.has(rel)) continue;
    const content = await fs.readFile(file, 'utf8');
    if (content.includes("from '@prisma/client'")) {
      violations.push(rel);
    }
  }
  if (violations.length) {
    console.error('[check-prisma-usage] Disallowed @prisma/client imports in:\n' + violations.join('\n'));
    process.exit(1);
  }
  console.log('[check-prisma-usage] OK');
}

main().catch((e) => { console.error(e); process.exit(1); });
