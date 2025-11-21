import OpenAI from 'openai';
import fs from 'fs';
import { ENV } from '../env.js';

const openai = ENV.OPENAI_API_KEY ? new OpenAI({ apiKey: ENV.OPENAI_API_KEY }) : null;

export interface TranscriptionResult {
  transcript: string;
  duration: number;
  language: string;
}

/**
 * Transcribe audio files using OpenAI Whisper API
 */
export async function transcribeAudio(filePath: string): Promise<TranscriptionResult> {
  if (!openai) {
    console.warn('[transcription] OpenAI API key not configured, returning mock transcript');
    return {
      transcript: 'Mock transcript: This is a simulated transcription for testing purposes. The actual audio content would be transcribed here when OpenAI API is configured.',
      duration: 120,
      language: 'en'
    };
  }

  try {
    console.log(`[transcription] Transcribing audio file: ${filePath}`);
    
    const audioFile = fs.createReadStream(filePath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json'
    });

    console.log(`[transcription] Transcription complete (${transcription.duration}s, ${transcription.language})`);

    return {
      transcript: transcription.text,
      duration: transcription.duration || 0,
      language: transcription.language || 'en'
    };

  } catch (error: any) {
    console.error('[transcription] Error transcribing audio:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}
