#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';
import { execSync } from 'node:child_process';

const BRANCH = process.env.SMOKE_BRANCH || 'feature/finalisation-v2';
const WEB_PORT = Number(process.env.WEB_PORT || 3000);
const API_PORT = Number(process.env.API_PORT || 3001);

const routes = [
  { url: `http://localhost:${WEB_PORT}/`, expectAll: ["Automate Legal Intake — Instantly."] },
  { url: `http://localhost:${WEB_PORT}/pricing`, expectAll: ["Plans Built for Every Firm", "€99"] },
  { url: `http://localhost:${WEB_PORT}/support`, expectAll: ["Help Centre"] },
  { url: `http://localhost:${WEB_PORT}/security`, expectAny: ["Data & Compliance"], expectAny2: ["Encryption","Retention","Hosting"] },
  { url: `http://localhost:${WEB_PORT}/workspace`, expectAll: ["AI Intake Demo", "Try a sample file"] },
  { url: `http://localhost:${WEB_PORT}/about`, expectAll: ["Why Choose IntakeLegal?"] },
  { url: `http://localhost:${WEB_PORT}/intakes`, expectAny: ["Intake History","Intake"] },
];

const navNeedles = ["Try Demo", "My Intakes", "Plans & Pricing", "Data & Compliance", "Help Centre", "About Us", "Sign In"];

async function fetchText(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    return { status: res.status, text };
  } catch (e) {
    return { status: 0, text: String(e?.message || e) };
  }
}

function containsAll(text, needles) {
  return needles.every(n => text.includes(n));
}
function containsAny(text, needles) {
  return needles.some(n => text.includes(n));
}

async function waitFor(url, maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const { status } = await fetchText(url);
    if (status === 200) return true;
    await sleep(500);
  }
  return false;
}

function shortCommit() {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return ''; }
}

async function main() {
  const report = {
    branch: BRANCH,
    commit: shortCommit(),
    build: { web: 'unknown', server: 'unknown' },
    health: { server: 'fail' },
    routes: {},
    navLabels: { allPresent: false, missing: [] },
    cta: { present: false },
    regressions: [],
    notes: []
  };

  // Assume servers are already running externally; just probe. Fallback to notes.
  const serverOk = await waitFor(`http://localhost:${API_PORT}/health`, 15000);
  report.health.server = serverOk ? 'pass' : 'fail';

  // Treat server build as pass when health passes
  report.build.server = serverOk ? 'pass' : 'fail';

  for (const r of routes) {
    const res = await fetchText(r.url);
    let ok = res.status === 200;
    if (ok && r.expectAll) ok = ok && containsAll(res.text, r.expectAll);
    if (ok && r.expectAny) ok = ok && containsAny(res.text, r.expectAny);
    if (ok && r.expectAny2) ok = ok && containsAny(res.text, r.expectAny2);
    report.routes[r.url.replace(`http://localhost:${WEB_PORT}`, '')] = { status: res.status, textMatch: !!ok, sample: res.text.slice(0, 200) };
  }

  const home = await fetchText(`http://localhost:${WEB_PORT}/`);
  report.navLabels.allPresent = containsAll(home.text || '', navNeedles);
  report.navLabels.missing = navNeedles.filter(n => !(home.text || '').includes(n));
  report.cta.present = containsAll(home.text || '', ["Try Demo", "Start Free Trial"]);
  if ((home.text || '').includes('Workspace Sandbox')) report.regressions.push('Found deprecated label: Workspace Sandbox');

  // Treat web build as pass when home route passed
  const homeRoute = report.routes['/'] || { status: 0, textMatch: false };
  report.build.web = (homeRoute.status === 200 && homeRoute.textMatch) ? 'pass' : 'fail';

  // Notes
  report.notes.push(`ports: web=${WEB_PORT}, api=${API_PORT}`);

  // Ensure artifacts dir and write file
  try { await mkdir('artifacts', { recursive: true }); } catch {}
  await writeFile('artifacts/smoke-report.json', JSON.stringify(report, null, 2), 'utf-8');

  console.log(JSON.stringify(report, null, 2));
  if (report.build.web === 'fail' || report.build.server === 'fail') process.exit(1);
}

main();
