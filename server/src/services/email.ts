import { ENV } from '../env.js';

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
