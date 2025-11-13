'use client';
import { formatDDMMYYYY } from '../lib/date';

interface ExtractedData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  incidentDate?: string;
  lawArea?: string;
  description?: string;
}

interface SOLAnalysis {
  limitationDate: string;
  daysRemaining: number;
  urgency: 'high' | 'medium' | 'low';
  badge: string;
  basis: string;
  disclaimer: string;
}

interface IntakeSummaryProps {
  extractedData: ExtractedData;
  summary: string;
  clarificationQuestions: string[];
  nextSteps: string[];
  solAnalysis: SOLAnalysis;
  onCopy?: () => void;
}

export default function IntakeSummary({
  extractedData,
  summary,
  clarificationQuestions,
  nextSteps,
  solAnalysis,
  onCopy,
}: IntakeSummaryProps) {
  
  const handleCopy = () => {
    const text = `
INTAKE SUMMARY

Client Information:
- Name: ${extractedData.name || 'N/A'}
- Email: ${extractedData.email || 'N/A'}
- Phone: ${extractedData.phone || 'N/A'}
- Address: ${extractedData.address || 'N/A'}

Case Details:
- Area of Law: ${extractedData.lawArea || 'N/A'}
- Incident Date: ${extractedData.incidentDate || 'N/A'}

Summary:
${summary}

Clarification Questions:
${clarificationQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Next Steps:
${nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Statute of Limitations:
- Limitation Date: ${solAnalysis.limitationDate}
- Days Remaining: ${solAnalysis.daysRemaining}
- Urgency: ${solAnalysis.urgency}
- Basis: ${solAnalysis.basis}
`;
    
    navigator.clipboard.writeText(text);
    if (onCopy) onCopy();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getLawAreaColor = (lawArea?: string) => {
    const colors: Record<string, string> = {
      'Personal Injury': 'bg-blue-100 text-blue-800',
      'Employment': 'bg-purple-100 text-purple-800',
      'Medical Malpractice': 'bg-red-100 text-red-800',
      'Family Law': 'bg-pink-100 text-pink-800',
      'Immigration': 'bg-indigo-100 text-indigo-800',
      'Criminal Defense': 'bg-gray-100 text-gray-800',
      'Estate Planning': 'bg-teal-100 text-teal-800',
    };
    return colors[lawArea || ''] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-dm-serif)' }}>
          Intake Summary
        </h2>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-background text-text-primary border border-text-secondary/30 rounded-lg hover:bg-text-secondary/10 transition-colors flex items-center space-x-2"
        >
          <span>📋</span>
          <span className="text-sm font-medium">Copy</span>
        </button>
      </div>

      {/* Client Information */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-text-secondary/10">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {extractedData.name && (
            <div>
              <p className="text-sm text-text-secondary">Name</p>
              <p className="font-medium text-text-primary">{extractedData.name}</p>
            </div>
          )}
          {extractedData.email && (
            <div>
              <p className="text-sm text-text-secondary">Email</p>
              <p className="font-medium text-text-primary">{extractedData.email}</p>
            </div>
          )}
          {extractedData.phone && (
            <div>
              <p className="text-sm text-text-secondary">Phone</p>
              <p className="font-medium text-text-primary">{extractedData.phone}</p>
            </div>
          )}
          {extractedData.address && (
            <div>
              <p className="text-sm text-text-secondary">Address</p>
              <p className="font-medium text-text-primary">{extractedData.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Case Details */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-text-secondary/10">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Case Details</h3>
        <div className="space-y-4">
          {extractedData.lawArea && (
            <div>
              <p className="text-sm text-text-secondary mb-2">Area of Law</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLawAreaColor(extractedData.lawArea)}`}>
                {extractedData.lawArea}
              </span>
            </div>
          )}
          {extractedData.incidentDate && (
            <div>
              <p className="text-sm text-text-secondary">Incident Date</p>
              <p className="font-medium text-text-primary">{formatDDMMYYYY(extractedData.incidentDate)}</p>
            </div>
          )}
          {extractedData.description && (
            <div>
              <p className="text-sm text-text-secondary mb-2">Description</p>
              <p className="text-text-primary leading-relaxed">{extractedData.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Statute of Limitations */}
      <div className={`rounded-2xl shadow-md p-6 border-2 ${getUrgencyColor(solAnalysis.urgency)}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Statute of Limitations</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Limitation Date:</strong> {formatDDMMYYYY(solAnalysis.limitationDate)}
              </p>
              <p className="text-sm">
                <strong>Days Remaining:</strong> {solAnalysis.daysRemaining} days
              </p>
              <p className="text-sm">
                <strong>Basis:</strong> {solAnalysis.basis}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getUrgencyColor(solAnalysis.urgency)}`}>
            {solAnalysis.urgency} priority
          </span>
        </div>
        <p className="text-xs mt-4 opacity-75">{solAnalysis.disclaimer}</p>
      </div>

      {/* AI Summary */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-text-secondary/10">
        <h3 className="text-lg font-semibold text-text-primary mb-4">AI Summary</h3>
        <div className="prose prose-sm max-w-none">
          {summary.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-text-primary leading-relaxed mb-3">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Clarification Questions */}
      {clarificationQuestions.length > 0 && (
        <div className="bg-accent2/10 rounded-2xl shadow-md p-6 border border-accent2/30">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Clarification Questions</h3>
          <ul className="space-y-3">
            {clarificationQuestions.map((question, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent2 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-text-primary leading-relaxed">{question}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <div className="bg-accent1/10 rounded-2xl shadow-md p-6 border border-accent1/30">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recommended Next Steps</h3>
          <ul className="space-y-3">
            {nextSteps.map((step, i) => (
              <li key={i} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent1 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-text-primary leading-relaxed">{step}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
