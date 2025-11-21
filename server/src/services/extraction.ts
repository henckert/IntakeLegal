import mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';
import { simpleParser } from 'mailparser';
import fs from 'fs';
import OpenAI from 'openai';
import { ENV } from '../env.js';
import { z } from 'zod';

const openai = ENV.OPENAI_API_KEY ? new OpenAI({ apiKey: ENV.OPENAI_API_KEY }) : null;

// Entity extraction schema
const EntitySchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  incidentDate: z.string().optional(),
  lawArea: z.string().optional(),
  description: z.string().optional()
});

export type ExtractedEntities = z.infer<typeof EntitySchema>;

export interface ExtractionResult {
  rawText: string;
  entities: ExtractedEntities;
}

/**
 * Extract text from .docx files
 */
async function extractFromDocx(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Extract text from .pdf files
 */
async function extractFromPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await (pdfParse as any).default(buffer);
  return data.text;
}

/**
 * Extract text from .eml files
 */
async function extractFromEmail(filePath: string): Promise<string> {
  const source = fs.readFileSync(filePath, 'utf8');
  const parsed = await simpleParser(source);
  
  let text = '';
  if (parsed.subject) text += `Subject: ${parsed.subject}\n\n`;
  if (parsed.from) text += `From: ${parsed.from.text}\n`;
  if (parsed.to) {
    const toText = Array.isArray(parsed.to) ? parsed.to.map(a => a.text).join(', ') : parsed.to.text;
    text += `To: ${toText}\n`;
  }
  if (parsed.date) text += `Date: ${parsed.date}\n\n`;
  if (parsed.text) text += parsed.text;
  
  return text;
}

/**
 * Use AI to extract structured entities from text
 */
async function extractEntitiesWithAI(text: string): Promise<ExtractedEntities> {
  if (!openai) {
    console.warn('[extraction] OpenAI API key not configured, returning mock entities');
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-0123',
      address: '123 Main St, Dublin, Ireland',
      incidentDate: '2024-01-15',
      lawArea: 'Personal Injury',
      description: 'Mock extraction: This would contain the actual case description extracted by AI.'
    };
  }

  const prompt = `Extract the following information from this legal intake document:
- Client name
- Email address
- Phone number
- Physical address
- Incident date (ISO format YYYY-MM-DD)
- Description of incident (brief summary)
- Area of law (Personal Injury, Employment, Medical Malpractice, Family Law, Immigration, Criminal Defense, Estate Planning, or Other)

Return as JSON with these exact fields: name, email, phone, address, incidentDate, lawArea, description.
If a field is not found, omit it from the JSON.

Document text:
${text.substring(0, 4000)} ${text.length > 4000 ? '...(truncated)' : ''}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a legal intake assistant. Extract structured data from documents and return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    
    // Validate with Zod
    const validated = EntitySchema.parse(parsed);
    console.log('[extraction] Entities extracted:', validated);
    
    return validated;

  } catch (error: any) {
    console.error('[extraction] Error extracting entities with AI:', error);
    return {
      description: 'AI extraction failed, returning raw text preview: ' + text.substring(0, 200)
    };
  }
}

/**
 * Main extraction function - routes to appropriate parser based on mime type
 */
export async function extractEntities(filePath: string, mimeType: string): Promise<ExtractionResult> {
  let rawText = '';

  try {
    console.log(`[extraction] Extracting from ${filePath} (${mimeType})`);

    // Extract text based on file type
    if (mimeType.includes('wordprocessingml') || filePath.endsWith('.docx')) {
      rawText = await extractFromDocx(filePath);
    } else if (mimeType.includes('pdf') || filePath.endsWith('.pdf')) {
      rawText = await extractFromPdf(filePath);
    } else if (mimeType.includes('rfc822') || filePath.endsWith('.eml')) {
      rawText = await extractFromEmail(filePath);
    } else if (mimeType.includes('octet-stream') && filePath.endsWith('.eml')) {
      // Fallback for .eml with generic mime type
      rawText = await extractFromEmail(filePath);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    console.log(`[extraction] Extracted ${rawText.length} characters of text`);

    // Extract entities using AI
    const entities = await extractEntitiesWithAI(rawText);

    return {
      rawText,
      entities
    };

  } catch (error: any) {
    console.error('[extraction] Error during extraction:', error);
    throw new Error(`Extraction failed: ${error.message}`);
  }
}
