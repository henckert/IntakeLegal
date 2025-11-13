import { ENV } from '../env.js';
import path from 'path';
import fs from 'fs';
import { generateIntakePDFBuffer } from './pdf.js';

let COMMON_DISCLAIMER = 'This content is informational only and not legal advice. Consult a qualified solicitor for specific guidance. AI-generated content may be incorrect or incomplete. All dates must be confirmed by a qualified solicitor.';
try {
  const p = path.join(process.cwd(), 'server', 'knowledge', 'common', 'disclaimer.txt');
  if (fs.existsSync(p)) {
    const txt = fs.readFileSync(p, 'utf8').trim();
    if (txt) COMMON_DISCLAIMER = txt;
  }
} catch {}

export type EmailPayload = { to: string; subject: string; text: string };

export async function sendEmail(payload: EmailPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ENV.RESEND_API_KEY) {
    console.log('[email:mock]', payload);
    return { ok: true };
  }
  // TODO: integrate Resend; mock for MVP
  console.log('[email:todo]', payload);
  return { ok: true };
}

export async function sendIntakePackage(options: {
  intake: {
    id: string;
    clientName: string;
    narrative: string;
    ai?: { summary?: string; classification?: string; followUps?: string[] };
    sol?: { expiryDate?: string; badge?: string; basis?: string; disclaimer?: string; version?: string; disclaimerVersion?: string };
  };
  recipientEmail: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { intake, recipientEmail } = options;
  const pdf = await generateIntakePDFBuffer({
    id: intake.id,
    clientName: intake.clientName,
    narrative: intake.narrative,
    classification: intake.ai?.classification,
    expiryDate: intake.sol?.expiryDate,
    badge: intake.sol?.badge,
    solBasis: intake.sol?.basis,
    solDisclaimer: intake.sol?.disclaimer,
    disclaimerVersion: intake.sol?.disclaimerVersion,
    solVersion: intake.sol?.version,
    followUps: intake.ai?.followUps,
  });

  const subject = `Your Intake Summary (Ref: ${intake.id})`;
  const body = [
    intake.ai?.summary || 'Please find attached your intake summary PDF.',
    '',
    'Disclaimers:',
    COMMON_DISCLAIMER,
  ].join('\n');

  if (!ENV.RESEND_API_KEY) {
    console.log('[email-package:mock]', { to: recipientEmail, subject, body, attachmentBytes: pdf.length });
    return { ok: true };
  }
  // TODO integrate provider (Resend) with base64 attachment
  console.log('[email-package:todo]', { to: recipientEmail, subject, body, attachmentBytes: pdf.length });
  return { ok: true };
}
