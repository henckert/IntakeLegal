"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

type UploadItem = {
  id: string;
  filename: string;
  createdAt: string;
  status: string;
  mimeType?: string;
};

export default function IntakesPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/uploads?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed fetching intakes', err);
        if (!mounted) return;
        setError(String(err));
        setLoading(false);
      });

    return () => { mounted = false };
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-heading">Intake History</h1>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {items.length === 0 && <p className="text-text-secondary">No intakes yet.</p>}
          {items.map((it) => (
            <div key={it.id} className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-semibold">{it.filename}</div>
                <div className="text-sm text-text-secondary">{new Date(it.createdAt).toLocaleString()}</div>
                <div className="text-xs text-text-secondary">{it.mimeType || ''}</div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-text-secondary">{it.status}</span>
                <Link href={`/intakes/${it.id}` as any} className="text-accent1 hover:underline">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
