import OpenAI from 'openai';
import { ENV } from '../env.js';
import { getPrisma } from '../prisma/client.js';
import { computeSOL } from './sol.js';

const openai = ENV.OPENAI_API_KEY ? new OpenAI({ apiKey: ENV.OPENAI_API_KEY }) : null;

export interface OutputGeneratorResult {
  summary: string;
  clarificationQuestions: string[];
  nextSteps: string[];
  solAnalysis: {
    limitationDate: string;
    daysRemaining: number;
    urgency: 'high' | 'medium' | 'low';
    badge: string;
    basis: string;
    disclaimer: string;
    version?: string;
    disclaimerVersion?: string;
  };
}

/**
 * Generate lawyer-ready outputs from extracted text
 */
export async function generateOutput(
  text: string,
  uploadId: string,
  firmId?: string
): Promise<OutputGeneratorResult> {
  
  const db = getPrisma();

  // Get firm template if available
  let summaryTemplate: string | null = null;
  let questionsTemplate: string | null = null;
  let stepsTemplate: string | null = null;

  if (firmId && db) {
    try {
      const template = await db.firmTemplate.findUnique({
        where: { firmId }
      });
      if (template) {
        summaryTemplate = template.summaryTemplate;
        questionsTemplate = template.questionsTemplate;
        stepsTemplate = template.stepsTemplate;
      }
    } catch (error) {
      console.warn('[outputGenerator] Could not load firm template:', error);
    }
  }

  // Generate AI outputs
  const summary = await generateSummary(text, summaryTemplate);
  const clarificationQuestions = await generateClarificationQuestions(text, questionsTemplate);
  const nextSteps = await generateNextSteps(text, stepsTemplate);
  const solAnalysis = await analyzeSol(text);

  return {
    summary,
    clarificationQuestions,
    nextSteps,
    solAnalysis
  };
}

/**
 * Generate case summary
 */
async function generateSummary(text: string, template?: string | null): Promise<string> {
  if (!openai) {
    console.warn('[outputGenerator] OpenAI API key not configured, returning mock summary');
    return 'Mock Summary: This would contain an AI-generated summary of the intake information, highlighting key facts, dates, and legal issues presented by the client.';
  }

  const prompt = template || `Summarize this legal intake document in 2-3 professional paragraphs. Focus on:
- Who the client is
- What happened (incident details)
- When it occurred
- Where it took place
- Potential legal issues

Document:
${text.substring(0, 3000)}${text.length > 3000 ? '...(truncated)' : ''}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a legal intake specialist creating concise, professional case summaries.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || 'Summary generation failed';

  } catch (error: any) {
    console.error('[outputGenerator] Error generating summary:', error);
    return `Error generating summary: ${error.message}`;
  }
}

/**
 * Generate clarification questions
 */
async function generateClarificationQuestions(text: string, template?: string | null): Promise<string[]> {
  if (!openai) {
    console.warn('[outputGenerator] OpenAI API key not configured, returning mock questions');
    return [
      'What was the extent of your injuries?',
      'Have you sought medical treatment?',
      'Do you have any documentation of the incident?',
      'Have you reported this to any authorities?'
    ];
  }

  const prompt = template || `Based on this legal intake document, identify 3-5 important questions the lawyer should ask to clarify missing or unclear information.

Document:
${text.substring(0, 3000)}${text.length > 3000 ? '...(truncated)' : ''}

Return only a JSON array of question strings.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a legal intake specialist. Return only a JSON array of clarification questions.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 300
    });

    const content = response.choices[0]?.message?.content || '{"questions":[]}';
    const parsed = JSON.parse(content);
    
    // Handle different response formats
    if (Array.isArray(parsed)) return parsed;
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
    return [];

  } catch (error: any) {
    console.error('[outputGenerator] Error generating questions:', error);
    return ['Error generating clarification questions'];
  }
}

/**
 * Generate recommended next steps
 */
async function generateNextSteps(text: string, template?: string | null): Promise<string[]> {
  if (!openai) {
    console.warn('[outputGenerator] OpenAI API key not configured, returning mock next steps');
    return [
      'Schedule initial consultation call',
      'Request medical records and documentation',
      'Review statute of limitations deadline',
      'Prepare engagement letter',
      'Conduct conflict check'
    ];
  }

  const prompt = template || `Based on this legal intake document, recommend 3-5 next steps the law firm should take.

Document:
${text.substring(0, 3000)}${text.length > 3000 ? '...(truncated)' : ''}

Return only a JSON array of action step strings.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a legal intake specialist. Return only a JSON array of next step recommendations.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 300
    });

    const content = response.choices[0]?.message?.content || '{"steps":[]}';
    const parsed = JSON.parse(content);
    
    // Handle different response formats
    if (Array.isArray(parsed)) return parsed;
    if (parsed.steps && Array.isArray(parsed.steps)) return parsed.steps;
    if (parsed.nextSteps && Array.isArray(parsed.nextSteps)) return parsed.nextSteps;
    return [];

  } catch (error: any) {
    console.error('[outputGenerator] Error generating next steps:', error);
    return ['Error generating next steps'];
  }
}

/**
 * Analyze statute of limitations
 */
async function analyzeSol(text: string): Promise<{
  limitationDate: string;
  daysRemaining: number;
  urgency: 'high' | 'medium' | 'low';
  badge: string;
  basis: string;
  disclaimer: string;
  version?: string;
  disclaimerVersion?: string;
}> {
  // Extract incident date from text (simple regex approach)
  const dateRegex = /(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/g;
  const dates = text.match(dateRegex);
  const incidentDate = dates ? dates[0] : new Date().toISOString().split('T')[0];

  // Use versioned SOL service (IE v1 for now)
  const solResult = computeSOL('Personal Injury', incidentDate, { jurisdiction: 'ie', version: 'v1' });

  return {
    limitationDate: solResult.expiryDate || new Date().toISOString(),
    daysRemaining: solResult.daysRemaining || 0,
    urgency: (solResult.daysRemaining || 0) < 30 ? 'high' : (solResult.daysRemaining || 0) < 90 ? 'medium' : 'low',
    badge: solResult.badge || 'green',
    basis: solResult.basis || 'Unable to determine limitation period',
    disclaimer: solResult.disclaimer || 'Consult with a legal professional for accurate limitation dates',
    version: solResult.version,
    disclaimerVersion: solResult.disclaimerVersion,
  };
}
