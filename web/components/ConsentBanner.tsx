"use client";

import { useState } from 'react';

type Props = { firmId: string };

export default function ConsentBanner({ firmId }: Props) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const setConsent = async (consent: boolean) => {
    setStatus('saving');
    setError('');
    try {
      const res = await fetch('/api/consent/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Firm-Id': firmId },
        body: JSON.stringify({ consent })
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (e: any) {
      setStatus('error');
      setError(e.message || 'Failed to update consent');
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-[#F0F4F8] p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-text-main font-medium">Enable AI processing for your firm?</p>
        <p className="text-xs text-text-muted">This controls whether uploaded intakes are processed by AI. You can change this at any time.</p>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setConsent(true)} className="px-4 py-2 rounded-xl bg-accent text-white shadow-sm" disabled={status==='saving'}>
          Enable
        </button>
        <button onClick={() => setConsent(false)} className="px-4 py-2 rounded-xl border border-border bg-white" disabled={status==='saving'}>
          Disable
        </button>
      </div>
    </div>
  );
}
