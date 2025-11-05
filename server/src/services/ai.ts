import { ENV } from '../env.js';
import fs from 'fs/promises';
import path from 'path';

export type AIResult = {
  summary: string;
  classification: string;
  followUps: string[];
};

// Deterministic mock when no OPENAI key
export async function runAI(narrative: string): Promise<AIResult> {
  if (!ENV.OPENAI_API_KEY) {
    const firstSentence = narrative.split(/\.|\n/)[0]?.slice(0, 180) || 'Summary unavailable.';
    const knowledge = await readKnowledgeSafe();
    return {
      summary: firstSentence.trim() + (firstSentence.endsWith('.') ? '' : '.'),
      classification: classifyHeuristic(narrative),
      followUps: knowledge.followups?.length ? knowledge.followups : [
        'Please provide any documents or photos relevant to the matter.',
        'Were there any witnesses? If so, please share their contact details.',
        'Have you received any correspondence from the other party or insurers?',
      ],
    };
  }
  // TODO: Implement OpenAI client call; for MVP we keep mock deterministic
  return runAI(narrative);
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
