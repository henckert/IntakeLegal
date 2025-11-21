import { PassThrough } from 'stream';
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
  const txt = buf.toString('utf8');
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
