'use client';

import { useState } from 'react';

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date';
  required: boolean;
  options?: string[];
}

export default function TemplateBuilderPage() {
  const [templateName, setTemplateName] = useState('My Firm Template');
  
  const lawAreas = [
    'Personal Injury',
    'Employment Law',
    'Family Law',
    'Criminal Defense',
    'Medical Malpractice',
    'Contract Disputes',
    'Property Law',
    'Immigration'
  ];
  
  const [enabledAreas, setEnabledAreas] = useState<string[]>([
    'Personal Injury',
    'Employment Law'
  ]);

  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: '1',
      label: 'Preferred Contact Time',
      type: 'select',
      required: false,
      options: ['Morning', 'Afternoon', 'Evening']
    }
  ]);

  const [summaryTemplate, setSummaryTemplate] = useState(
    `{{client_name}} contacted us regarding a {{law_area}} matter. ` +
    `The incident occurred on {{incident_date}}. ` +
    `Key details: {{description}}`
  );

  const [questionsTemplate, setQuestionsTemplate] = useState(
    `- Can you provide more details about {{incident_date}}?\n` +
    `- Were there any witnesses present?\n` +
    `- Do you have documentation related to this matter?`
  );

  const [stepsTemplate, setStepsTemplate] = useState(
    `1. Schedule consultation with {{client_name}}\n` +
    `2. Request supporting documents\n` +
    `3. Review SOL deadline: {{sol_deadline}}\n` +
    `4. Conduct conflict check`
  );

  const [showPreview, setShowPreview] = useState(false);

  const toggleLawArea = (area: string) => {
    setEnabledAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      label: 'New Field',
      type: 'text',
      required: false
    };
    setCustomFields([...customFields, newField]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(
      customFields.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleSave = async () => {
    const template = {
      name: templateName,
      enabledLawAreas: enabledAreas,
      customFields,
      summaryTemplate,
      questionsTemplate,
      stepsTemplate
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });

      if (res.ok) {
        alert('Template saved successfully!');
      } else {
        alert('Failed to save template');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save template. Please try again.');
    }
  };

  const renderPreview = () => {
    const mockData = {
      client_name: 'John Smith',
      law_area: 'Personal Injury',
      incident_date: '15 March 2024',
      description: 'Slip and fall accident at grocery store resulting in back injury',
      sol_deadline: '15 March 2026'
    };

    const replacePlaceholders = (template: string) => {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => mockData[key as keyof typeof mockData] || match);
    };

    return (
      <div className="bg-background rounded-xl p-6 border border-text-secondary/20">
        <h3 className="font-semibold text-text-primary mb-4">Preview (with sample data)</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-text-secondary mb-2">Summary</h4>
            <p className="text-text-primary bg-white p-4 rounded-lg border">
              {replacePlaceholders(summaryTemplate)}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-secondary mb-2">Questions</h4>
            <div className="text-text-primary bg-white p-4 rounded-lg border whitespace-pre-line">
              {replacePlaceholders(questionsTemplate)}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-secondary mb-2">Next Steps</h4>
            <div className="text-text-primary bg-white p-4 rounded-lg border whitespace-pre-line">
              {replacePlaceholders(stepsTemplate)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1
          className="text-4xl md:text-5xl font-bold text-text-primary mb-4"
          style={{ fontFamily: 'var(--font-dm-serif)' }}
        >
          Template Builder
        </h1>
        <p className="text-text-secondary text-lg">
          Customize how IntakeLegal processes and presents intake information for your firm.
        </p>
      </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
          {/* Template Name */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-text-secondary/10">
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-4 py-2 border border-text-secondary/20 rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent"
            />
          </div>

          {/* Practice Areas */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-text-secondary/10">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Practice Areas</h2>
            <p className="text-sm text-text-secondary mb-4">
              Select which practice areas your firm handles:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {lawAreas.map(area => (
                <label key={area} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabledAreas.includes(area)}
                    onChange={() => toggleLawArea(area)}
                    className="w-4 h-4 text-accent1 border-text-secondary/30 rounded focus:ring-accent1"
                  />
                  <span className="text-sm text-text-primary">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Fields */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-text-secondary/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">Custom Fields</h2>
              <button
                onClick={addCustomField}
                className="px-3 py-1 text-sm bg-accent1 text-white rounded-lg hover:bg-accent1/90"
              >
                + Add Field
              </button>
            </div>
            <div className="space-y-4">
              {customFields.map(field => (
                <div key={field.id} className="border border-text-secondary/20 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                      placeholder="Field Label"
                      className="px-3 py-2 border border-text-secondary/20 rounded text-sm"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateCustomField(field.id, { type: e.target.value as any })}
                      className="px-3 py-2 border border-text-secondary/20 rounded text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-text-secondary">Required</span>
                    </label>
                    <button
                      onClick={() => removeCustomField(field.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-text-secondary/10">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Output Templates</h2>
            <p className="text-xs text-text-secondary mb-4">
              Use variables: {'{{client_name}}'}, {'{{law_area}}'}, {'{{incident_date}}'}, {'{{description}}'}, {'{{sol_deadline}}'}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Summary Template
                </label>
                <textarea
                  value={summaryTemplate}
                  onChange={(e) => setSummaryTemplate(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-text-secondary/20 rounded-lg text-sm focus:ring-2 focus:ring-accent1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Questions Template
                </label>
                <textarea
                  value={questionsTemplate}
                  onChange={(e) => setQuestionsTemplate(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-text-secondary/20 rounded-lg text-sm focus:ring-2 focus:ring-accent1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Next Steps Template
                </label>
                <textarea
                  value={stepsTemplate}
                  onChange={(e) => setStepsTemplate(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-text-secondary/20 rounded-lg text-sm focus:ring-2 focus:ring-accent1"
                />
              </div>
            </div>
          </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-4 h-fit space-y-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full px-4 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>

          {showPreview && renderPreview()}

          <button
            onClick={handleSave}
            className="w-full px-4 py-3 bg-accent1 text-white rounded-lg font-semibold hover:bg-accent1/90 transition-colors"
          >
            Save Template
          </button>

          <div className="bg-accent2/20 rounded-xl p-4 border border-accent2/30">
            <p className="text-sm text-text-secondary">
              💡 <strong>Tip:</strong> Templates are applied automatically when processing intakes.
              You can create multiple templates for different practice areas.
            </p>
          </div>
          </div>
        </div>
    </div>
  );
}
