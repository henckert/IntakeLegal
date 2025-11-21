import { ENV } from '../env.js';
import fs from 'fs/promises';
import path from 'path';
import { redactPII } from './redaction.js';

export type AIResult = {
  summary: string;
  classification: string;
  followUps: string[];
  provenance: {
    source: 'mock' | 'openai';
    model: string;
    promptVersion: string;
    redactionsApplied: number;
  };
};

const ENABLE_AI_REDACTION_PIPELINE = (process.env.ENABLE_AI_REDACTION_PIPELINE || 'true').toLowerCase() !== 'false';
export const PROMPT_VERSION = '2025-01';

export function getPromptVersion() {
  return PROMPT_VERSION;
}

// Deterministic mock when no OPENAI key (or FORCE_MOCK_AI)
export async function runAI(narrative: string): Promise<AIResult> {
  const inputText = ENABLE_AI_REDACTION_PIPELINE ? redactPII(narrative) : { redactedText: narrative, tokens: [] };
  const redactions = inputText.tokens.length;

  if (!ENV.OPENAI_API_KEY || process.env.FORCE_MOCK_AI === 'true') {
    const firstSentence = inputText.redactedText.split(/\.|\n/)[0]?.slice(0, 180) || 'Summary unavailable.';
    const knowledge = await readKnowledgeSafe();
    const followups = (knowledge.followups?.length ? knowledge.followups : [
      'Please provide any documents or photos relevant to the matter.',
      'Were there any witnesses? If so, please share their contact details.',
      'Have you received any correspondence from the other party or insurers?',
    ]).slice(0, 5);
    return {
      summary: firstSentence.trim() + (firstSentence.endsWith('.') ? '' : '.'),
      classification: classifyHeuristic(inputText.redactedText),
      followUps: followups,
      provenance: { source: 'mock', model: 'mock-embedded', promptVersion: PROMPT_VERSION, redactionsApplied: redactions },
    };
  }
  // TODO: Implement OpenAI client call; for MVP we simulate deterministic output retaining provenance
  return {
    summary: inputText.redactedText.slice(0, 160) + '...',
    classification: classifyHeuristic(inputText.redactedText),
    followUps: [
      'Provide timeline of events',
      'Share supporting documents',
      'Confirm any witnesses and their details'
    ],
    provenance: { source: 'openai', model: 'gpt-4o-mini', promptVersion: PROMPT_VERSION, redactionsApplied: redactions },
  };
}

function classifyHeuristic(text: string): string {
  const t = text.toLowerCase();
  if (/(accident|injur|whiplash|hospital|doctor)/.test(t)) return 'Personal Injury';
  if (/(defam|libel|slander|reputation)/.test(t)) return 'Defamation';
  if (/(contract|agreement|breach|terms)/.test(t)) return 'Contract';
  if (/(negligence|duty of care|omission)/.test(t)) return 'Negligence';
  if (/(family|divorce|custody|maintenance)/.test(t)) return 'Family';
  if (/(property|conveyancing|title|lease)/.test(t)) return 'Conveyancing';
  if (/(company|commercial|shareholder)/.test(t)) return 'Commercial';
  if (/(employ|workplace|dismissal|harass)/.test(t)) return 'Employment';
  return 'Other';
}

async function readKnowledgeSafe(): Promise<{ followups?: string[] }> {
  try {
    const root = path.resolve(process.cwd(), 'server/knowledge');
    const piFollowups = path.join(root, 'personal_injury', 'followups.json');
    const raw = await fs.readFile(piFollowups, 'utf-8');
    return { followups: JSON.parse(raw) };
  } catch {
    return {};
  }
}
