"use client";

import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import { apiGet } from "../../lib/api";

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
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ items: Item[] }>("/api/dashboard/intakes");
        if (!cancelled) setItems(data.items);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load dashboard");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="heading-serif text-2xl">Dashboard</h1>
        <p className="text-sm text-text-secondary">Latest client intakes</p>
      </header>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
