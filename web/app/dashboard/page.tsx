"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/ui/Button";
import TextArea from "../../components/ui/TextArea";
import { apiPost } from "../../lib/api";
import { apiGet } from "../../lib/api";
import { useAuth } from "@clerk/nextjs";

type Item = any;

function getArea(i: Item): string {
  return i?.ai?.classification ?? i?.aiClassification ?? "—";
}

function getBadge(i: Item): "red" | "amber" | "green" | undefined {
  return i?.sol?.badge ?? i?.solBadge;
}

function getDate(i: Item): string {
  const iso = i?.createdAt;
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return String(iso);
  }
}

export default function DashboardPage() {
  const SERVER_BASE = process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:4000";
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [urgency, setUrgency] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const { getToken } = useAuth();

  function openPDF(id: string) {
    const url = `${SERVER_BASE}/api/intakes/${id}/export.pdf`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openDOCX(id: string) {
    // DOCX export is not implemented in MVP; surface a friendly notice.
    alert("DOCX export is coming soon in this MVP.");
  }

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (urgency) params.set("urgency", urgency);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const s = params.toString();
    return s ? `?${s}` : "";
  }, [area, urgency, status, from, to]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken().catch(() => undefined);
        const data = await apiGet<{ items: Item[] }>(`/api/dashboard/intakes${query}`, { token: token ?? undefined });
        if (!cancelled) setItems(data.items);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load dashboard");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  function Protected({ children }: { children: React.ReactNode }) {
    const isLocal = process.env.NEXT_PUBLIC_APP_ENV === 'local';
    if (!isLocal) {
      return (
        <div className="mx-auto max-w-3xl">
          <Card className="p-6">
            <h2 className="heading-serif text-xl">Sign-in required</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Please sign in to access the Dashboard. (Clerk integration pending in MVP.)
            </p>
          </Card>
        </div>
      );
    }
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-heading">Dashboard</h1>
        <p className="text-sm text-text-secondary">Latest client intakes</p>
      </header>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      <Protected>
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Area</label>
          <input className="w-full rounded-2xl border border-slate-300 px-3 py-1.5 text-sm" value={area} onChange={(e) => setArea(e.target.value)} placeholder="PI, Contract, ..." />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Urgency</label>
          <select className="w-full rounded-2xl border border-slate-300 px-3 py-1.5 text-sm" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="">Any</option>
            <option value="red">Red</option>
            <option value="amber">Amber</option>
            <option value="green">Green</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Status</label>
          <select className="w-full rounded-2xl border border-slate-300 px-3 py-1.5 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any</option>
            <option value="new">New</option>
            <option value="in-review">In Review</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">From</label>
          <input type="date" className="w-full rounded-2xl border border-slate-300 px-3 py-1.5 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">To</label>
          <input type="date" className="w-full rounded-2xl border border-slate-300 px-3 py-1.5 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {!items ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="p-4 animate-pulse">
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/3 rounded bg-slate-200" />
              <div className="mt-4 h-24 rounded bg-slate-100" />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-text-secondary">No intakes yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((i) => (
            <Card key={i.id ?? getDate(i) + getArea(i)} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{i.clientName ?? "—"}</h3>
                  <p className="text-xs text-text-secondary">{getDate(i)}</p>
                </div>
                {getBadge(i) ? (
                  <Badge color={getBadge(i) as any}>{getBadge(i)}</Badge>
                ) : null}
              </div>
              <div className="mt-3 text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="font-medium text-text-primary">Area:</span>
                  <span>{getArea(i)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-text-secondary">
                  <span className="font-medium text-text-primary">Status:</span>
                  <span>{i.status ?? "new"}</span>
                </div>
              </div>

              {/* Export actions */}
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => openPDF(i.id)}
                >
                  Open PDF
                </Button>
                <Button
                  variant="outline"
                  className="h-8 px-3 text-xs opacity-70"
                  onClick={() => openDOCX(i.id)}
                >
                  DOCX (soon)
                </Button>
              </div>

              {/* Summary section */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">AI Summary</span>
                  {editing === i.id ? null : (
                    <Button
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        const current = (i?.ai?.summary ?? i?.aiSummary ?? "") as string;
                        setDraft(current);
                        setEditing(i.id);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </div>
                {editing === i.id ? (
                  <div className="space-y-2">
                    <TextArea rows={5} value={draft} onChange={(e) => setDraft(e.target.value)} />
                    <div className="flex items-center gap-2">
                      <Button
                        className="h-8 px-3 text-xs"
                        onClick={async () => {
                          try {
                            const token = await getToken().catch(() => undefined);
                            await apiPost(`/api/intakes/${i.id}/summary`, { summary: draft }, { token: token ?? undefined });
                            // Optimistically update local state
                            setItems((prev) =>
                              prev?.map((x) =>
                                x.id === i.id
                                  ? { ...x, ai: { ...(x.ai ?? {}), summary: draft }, aiSummary: draft }
                                  : x,
                              ) ?? prev,
                            );
                            setEditing(null);
                          } catch (e: any) {
                            alert(e?.message ?? "Failed to save summary");
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-text-secondary">
                    {(i?.ai?.summary ?? i?.aiSummary ?? "No summary yet.") as string}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      </Protected>
    </div>
  );
}
