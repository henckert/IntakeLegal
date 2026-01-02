import { PassThrough } from 'stream';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { sendIntakePDF } from '../src/services/pdf.js';

class MockRes extends PassThrough {
  headers: Record<string, any> = {};
  setHeader(name: string, value: any) {
    this.headers[name.toLowerCase()] = value;
  }
  getHeader(name: string) {
    return this.headers[name.toLowerCase()];
  }
}

async function renderToBuffer(): Promise<{ buf: Buffer; headers: Record<string, any>; durMs: number }>{
  const res = new MockRes();
  const chunks: Buffer[] = [];
  res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
  const t0 = Date.now();
  const done = new Promise<Buffer>((resolve) => res.on('finish', () => resolve(Buffer.concat(chunks))));

  sendIntakePDF(res as any, {
    id: 'test123',
    clientName: 'Jane Doe',
    narrative: 'The client reported an incident with minor injuries. Treatment ongoing.',
    classification: 'Personal Injury',
    expiryDate: '2026-01-01',
    badge: 'green',
    solBasis: 'Personal Injury – 2 years from date of event',
    solDisclaimer: 'Indicative only; seek legal advice.',
    disclaimerVersion: '2025-01',
    solVersion: 'ie-v1',
    followUps: ['Obtain medical records', 'Confirm incident date']
  });

  const buf = await done;
  const durMs = Date.now() - t0;
  return { buf, headers: (res as any).headers, durMs };
}

(async () => {
  const { buf, headers, durMs } = await renderToBuffer();

  // Always emit artifact for manual inspection (fixture-only content)
  const artifactsDir = path.join(process.cwd(), 'artifacts');
  const outPdfPath = path.join(artifactsDir, 'pdf-test-output.pdf');
  fs.mkdirSync(artifactsDir, { recursive: true });
  fs.writeFileSync(outPdfPath, buf);
  const first16 = buf.subarray(0, 16).toString('utf8');
  console.error('[pdf.spec] bufferByteLength:', buf.length);
  console.error('[pdf.spec] first16BytesUtf8:', JSON.stringify(first16));
  console.error('[pdf.spec] pdfFilePath:', outPdfPath);
  console.error('[pdf.spec] pdfFileExists:', fs.existsSync(outPdfPath));

  if (!buf.subarray(0, 5).toString('utf8').startsWith('%PDF-')) {
    console.error('PDF buffer does not begin with %PDF-');
    process.exit(1);
  }
  if (buf.length <= 3000) {
    console.error('PDF buffer too small; expected > 3000 bytes, got', buf.length);
    process.exit(1);
  }

  if (!headers['content-type'] || !String(headers['content-type']).includes('application/pdf')) {
    console.error('Expected application/pdf content-type header');
    process.exit(1);
  }
  if (buf.length < 1500) {
    console.error('PDF too small; expected at least 1500 bytes, got', buf.length);
    process.exit(1);
  }
  if (durMs > 3000) {
    console.error('PDF generation too slow; expected <3000ms, got', durMs);
    process.exit(1);
  }

  const require = createRequire(import.meta.url);
  const pdfParseAny = require('pdf-parse');
  const PDFParse = pdfParseAny?.PDFParse;
  if (typeof PDFParse !== 'function') throw new Error('pdf-parse PDFParse class not found');
  const parser = new PDFParse(new Uint8Array(buf));
  await parser.load();
  const parsed = await parser.getText();
  const txt = String(parsed?.text || '');

  const page1Text = String(parsed?.pages?.[0]?.text || '');
  if (!page1Text.includes('Intake Summary')) {
    console.error('[pdf.spec] Page 1 text did not include "Intake Summary"');
    console.error('[pdf.spec] page1Preview:', JSON.stringify(page1Text.slice(0, 800)));
    process.exit(1);
  }
  const mustContain = [
    'Intake Summary',
    'Client: Jane Doe',
    'Classification',
    'Limitation',
    'Disclaimers',
    'This content is informational only and not legal advice. Consult a qualified solicitor for specific guidance.'
  ];
  for (const s of mustContain) {
    if (!txt.includes(s)) {
      try {
        console.error('[pdf.spec] PDF written to:', outPdfPath);
      } catch (e) {
        console.error('[pdf.spec] Failed to write PDF artifact:', String((e as any)?.message || e));
      }

      console.error('[pdf.spec] extractedTextLength:', txt.length);
      console.error('[pdf.spec] extractedTextPreview:', JSON.stringify(txt.slice(0, 800)));
      console.error('[pdf.spec] contains("Intake Summary"):', txt.includes('Intake Summary'));
      console.error('[pdf.spec] contains("Attachments Reviewed"):', txt.includes('Attachments Reviewed'));
      console.error('[pdf.spec] contains("AI-generated, to be checked by a solicitor"):', txt.includes('AI-generated, to be checked by a solicitor'));
      console.error('Missing expected text in PDF:', s);
      process.exit(1);
    }
  }
  console.log('pdf.spec passed');
  process.exit(0);
})().catch((e) => {
  console.error('pdf.spec error', e);
  process.exit(1);
});
