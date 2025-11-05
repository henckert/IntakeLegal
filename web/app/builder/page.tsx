'use client';

import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Card from '../../components/Card';
import Tooltip from '../../components/Tooltip';
import { apiPost } from '../../lib/api';

const ALL_SECTIONS = [
  { key: 'clientInfo', label: 'Client Info' },
  { key: 'contact', label: 'Contact' },
  { key: 'narrative', label: 'Narrative / Query' },
  { key: 'attachments', label: 'Attachments' },
  { key: 'ai', label: 'AI Section' },
] as const;

type SectionKey = typeof ALL_SECTIONS[number]['key'];

type Vertical = 'PI' | 'Litigation' | 'Family' | 'Conveyancing' | 'Commercial' | 'Employment';

function Protected({ children }: { children: React.ReactNode }) {
  // Local dev: allow access; Production: TODO integrate Clerk
  const isLocal = process.env.NEXT_PUBLIC_APP_ENV === 'local';
  if (!isLocal) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-6">
          <h2 className="heading-serif text-xl">Sign-in required</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Please sign in to access the Builder. (Clerk integration pending in MVP.)
          </p>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
}

export default function BuilderPage() {
  const [vertical, setVertical] = useState<Vertical>('PI');
  const [sections, setSections] = useState<SectionKey[]>([
    'clientInfo',
    'contact',
    'narrative',
    'ai',
  ]);
  const [retention, setRetention] = useState<string>('90');
  const [logoUrl, setLogoUrl] = useState('');
  const [primary, setPrimary] = useState('#0B2545');
  const [secondary, setSecondary] = useState('#13315C');
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = useMemo(() => ALL_SECTIONS, []);

  function toggleSection(key: SectionKey) {
    setSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function move(key: SectionKey, dir: -1 | 1) {
    setSections((prev) => {
      const idx = prev.indexOf(key);
      const next = [...prev];
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= prev.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  async function publish() {
    try {
      setBusy(true);
      setError(null);
      const themeJSON = { logoUrl, colors: { primary, secondary } };
      const schemaJSON = { vertical, sections };

      // Minimal payload to server; server may create IDs for firm/template in mock mode
      const form = await apiPost<{ id: string }>(
        '/api/forms',
        {
          firmId: 'demo-firm',
          templateId: 'template-' + vertical.toLowerCase(),
          slug: 'draft-' + Math.random().toString(36).slice(2, 8),
          themeJSON,
          retentionPolicy: retention,
          schemaJSON,
        },
      );
      const pub = await apiPost<{ slug: string }>(`/api/forms/${form.id}/publish`, {});
      setPublishedSlug(pub.slug);
    } catch (e: any) {
      setError(e.message ?? 'Failed to publish');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Protected>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-serif text-2xl">Form Builder</h1>
          {publishedSlug ? (
            <a href={`/intake/${publishedSlug}`} className="text-accent1 underline">
              View Public Link →
            </a>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}

        <Card className="p-6">
          <h2 className="heading-serif text-lg">Preset Template</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Choose a starting point; you can toggle sections below.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
            {(
              [
                'PI',
                'Litigation',
                'Family',
                'Conveyancing',
                'Commercial',
                'Employment',
              ] as Vertical[]
            ).map((v) => (
              <button
                key={v}
                onClick={() => setVertical(v)}
                className={`rounded-2xl border px-3 py-2 text-sm ${
                  vertical === v ? 'border-primary bg-primary/5' : 'border-slate-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="heading-serif text-lg">Sections</h2>
          <div className="mt-3 grid gap-2">
            {available.map((s) => (
              <div key={s.key} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sections.includes(s.key as SectionKey)}
                    onChange={() => toggleSection(s.key as SectionKey)}
                  />
                  <span>{s.label}</span>
                  <Tooltip text="Toggle whether this appears on the client form.">
                    <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-600">?</span>
                  </Tooltip>
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => move(s.key as SectionKey, -1)}>
                    ↑
                  </Button>
                  <Button variant="outline" onClick={() => move(s.key as SectionKey, 1)}>
                    ↓
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="heading-serif text-lg">Branding</h2>
            <div className="mt-3 grid gap-3">
              <label className="text-sm">
                Logo URL
                <Input placeholder="https://..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
              </label>
              <label className="text-sm">
                Primary Color
                <Input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
              </label>
              <label className="text-sm">
                Secondary Color
                <Input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="heading-serif text-lg">Compliance</h2>
            <div className="mt-3 grid gap-3">
              <label className="text-sm">
                Data Retention
                <Select value={retention} onChange={(e) => setRetention(e.target.value)}>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">365 days</option>
                </Select>
              </label>
              <p className="text-xs text-text-secondary">
                GDPR consent is collected on the public form. Retention limits data lifetime.
              </p>
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={publish} disabled={busy}>
            {busy ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </div>
    </Protected>
  );
}
