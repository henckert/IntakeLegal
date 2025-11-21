'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '../../components/FileUpload';
import IntakeSummary from '../../components/IntakeSummary';
import { COPY } from '../../lib/copy';
import { telemetry } from '../../lib/telemetry';

interface UploadResponse {
  id: string;
  filename: string;
  uploadedAt: string;
  extractedData: any;
  summary: string;
  clarificationQuestions: string[];
  nextSteps: string[];
  solAnalysis: any;
  status: string;
}

export default function WorkspacePage() {
  const router = useRouter();
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    setError('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/uploads`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        let errorMessage = errorData.error || 'Upload failed';
        
        if (response.status === 400) {
          errorMessage = `${errorMessage}. ${errorData.hint || 'Please check your file and try again.'}`;
        } else if (response.status === 415) {
          errorMessage = `Unsupported file type. ${errorData.hint || 'Please use .docx, .pdf, .eml, .wav, or .mp3 files.'}`;
        } else if (response.status === 429) {
          errorMessage = 'Too many uploads. Please wait a few minutes and try again.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again or contact support.';
        } else if (response.status === 503) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      const data: UploadResponse = await response.json();
      setUploadResult(data);
      telemetry.track(COPY.events.workspace.uploadSuccess);
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleFile = () => {
    const sampleText = `From: john.smith@email.com
Subject: Car Accident - Need Legal Advice

Hi, my name is John Smith. I was involved in a car accident on March 15th, 2024 on the M50 motorway near Dublin. 

The other driver ran a red light and hit my vehicle on the passenger side. I suffered neck and back injuries and have been unable to work for the past two weeks. I have medical records from St. James's Hospital.

My contact number is 087-555-1234. Do I have a case? What should I do next?

Thanks,
John Smith`;

    const blob = new Blob([sampleText], { type: 'text/plain' });
    const file = new File([blob], 'sample-intake.txt', { type: 'text/plain' });
    handleUpload(file);
    telemetry.track(COPY.events.workspace.sampleFileUsed);
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    
    const blob = new Blob([pasteText], { type: 'text/plain' });
    const file = new File([blob], 'pasted-text.txt', { type: 'text/plain' });
    setShowPasteModal(false);
    setPasteText('');
    handleUpload(file);
    telemetry.track(COPY.events.workspace.pasteTextUsed);
  };

  const handleReset = () => {
    setUploadResult(null);
    setError('');
  };

  const handleCopy = () => {
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4 font-heading">
          {COPY.workspace.heading}
        </h1>
        <p className="text-lg text-text-muted max-w-3xl font-body">
          {COPY.workspace.subtext}
        </p>
      </div>

      {/* Quick Actions */}
      {!uploadResult && !isProcessing && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleSampleFile}
            className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-primary-light transition-colors shadow-sm"
          >
            ⚡ {COPY.workspace.sampleButton}
          </button>
          <button
            onClick={() => setShowPasteModal(true)}
            className="px-6 py-3 bg-surface border-2 border-border text-text-main font-medium rounded-xl hover:bg-background transition-colors"
          >
            📄 {COPY.workspace.pasteButton}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl">
        {!uploadResult && !isProcessing && (
          <>
            <FileUpload onUpload={handleUpload} disabled={isProcessing} />
            <p className="mt-4 text-sm text-text-muted text-center">
              🔒 {COPY.workspace.privacyHint}
            </p>
          </>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-surface rounded-2xl shadow-lg p-12 text-center border border-accent">
            <div className="inline-block animate-spin text-6xl mb-6">⚙️</div>
            <h3 className="text-2xl font-semibold text-text-main mb-2 font-heading">
              Processing Your File
            </h3>
            <p className="text-text-muted mb-6">
              Our AI is analyzing the document and extracting key information...
            </p>
            <div className="max-w-md mx-auto space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-accent rounded-full animate-pulse"></div>
                <span className="text-sm text-text-muted">Extracting text...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm text-text-muted">Analyzing content...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-sm text-text-muted">Generating summary...</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {uploadResult && !isProcessing && (
          <div className="space-y-6">
            <IntakeSummary
              extractedData={uploadResult.extractedData || {}}
              summary={uploadResult.summary || 'Summary not available'}
              clarificationQuestions={uploadResult.clarificationQuestions || []}
              nextSteps={uploadResult.nextSteps || []}
              solAnalysis={uploadResult.solAnalysis || {
                limitationDate: new Date().toISOString(),
                daysRemaining: 0,
                urgency: 'low',
                badge: 'green',
                basis: 'Unknown',
                disclaimer: 'Consult with a legal professional'
              }}
              onCopy={handleCopy}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4 pt-6">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-primary-light transition-colors shadow-md"
              >
                Try Another File
              </button>
              <a
                href="/pricing"
                className="px-6 py-3 bg-warning text-text-main font-medium rounded-xl hover:bg-warning/90 transition-colors shadow-md"
              >
                Sign Up to Save
              </a>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Upload Error</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed bottom-6 right-6 bg-accent text-white px-6 py-3 rounded-xl shadow-lg animate-slide-up">
          <div className="flex items-center space-x-2">
            <span>✓</span>
            <span className="font-medium">Copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-border">
            <h3 className="text-2xl font-semibold text-text-main mb-4 font-heading">
              Paste Intake Text
            </h3>
            <p className="text-text-muted mb-6">
              Paste email text, intake notes, or any client communication below.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste intake text here..."
              className="w-full h-64 p-4 border-2 border-border rounded-xl focus:border-accent focus:outline-none font-mono text-sm resize-none"
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPasteModal(false);
                  setPasteText('');
                }}
                className="px-6 py-3 bg-background text-text-main font-medium rounded-xl hover:bg-border/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteSubmit}
                disabled={!pasteText.trim()}
                className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-12 bg-accent/10 border border-accent/30 rounded-2xl p-6">
        <h3 className="font-semibold text-text-main mb-2">💡 Demo Mode</h3>
        <p className="text-text-muted text-sm">
          This is a public sandbox for testing. Data is not saved. 
          <a href="/pricing" className="text-accent hover:underline ml-1">Sign up</a> to store your intakes, access advanced features, and customize templates.
        </p>
      </div>
    </div>
  );
}
