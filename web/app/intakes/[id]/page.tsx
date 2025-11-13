"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UploadDetail = {
  id: string;
  filename: string;
  uploadedAt: string;
  extractedData?: any;
  summary?: string;
  clarificationQuestions?: any;
  nextSteps?: any;
  solAnalysis?: any;
  status?: string;
};

export default function IntakeDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [data, setData] = useState<UploadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/uploads/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!mounted) return;
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed fetching intake detail', err);
        if (!mounted) return;
        setError(String(err));
        setLoading(false);
      });

    return () => { mounted = false };
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-heading">Intake Detail</h1>
        <button onClick={() => router.back()} className="text-sm text-accent1 hover:underline">Back</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {data && (
        <div className="space-y-6">
          <div className="p-4 border rounded bg-white">
            <div className="font-semibold">{data.filename}</div>
            <div className="text-xs text-text-secondary">Uploaded: {new Date(data.uploadedAt).toLocaleString()}</div>
            <div className="text-sm text-text-secondary">Status: {data.status}</div>
          </div>

          <div className="p-4 border rounded bg-white">
            <h2 className="font-semibold mb-2">AI Summary</h2>
            <p className="text-text-primary whitespace-pre-line">{data.summary || '—'}</p>
          </div>

          <div className="p-4 border rounded bg-white">
            <h2 className="font-semibold mb-2">Extracted Data (raw JSON)</h2>
            <pre className="text-sm overflow-auto max-h-64 bg-background p-3 rounded">{JSON.stringify(data.extractedData, null, 2)}</pre>
          </div>

          <div className="p-4 border rounded bg-white">
            <h2 className="font-semibold mb-2">Clarification Questions</h2>
            <pre className="text-sm whitespace-pre-line">{Array.isArray(data.clarificationQuestions) ? data.clarificationQuestions.join('\n') : JSON.stringify(data.clarificationQuestions, null, 2)}</pre>
          </div>

          <div className="p-4 border rounded bg-white">
            <h2 className="font-semibold mb-2">Next Steps</h2>
            <pre className="text-sm whitespace-pre-line">{Array.isArray(data.nextSteps) ? data.nextSteps.join('\n') : JSON.stringify(data.nextSteps, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
