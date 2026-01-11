import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { createReadStream } from 'fs';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(file: Express.Multer.File): Promise<string> {
    const audioStream = createReadStream(file.path);

    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioStream as any,
        model: 'whisper-1',
      });

      return transcription.text;
    } catch (err) {
      console.error('OpenAI error:', err);
      throw new Error('Transcription failed');
    }
  }

  async labelSpeakers(rawTranscript: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that formats therapy session transcripts by identifying and labeling speakers. Label speakers as "Speaker A (Therapist)" and "Speaker B (Client)". Format each line as "Speaker X (Role): [dialogue]". Maintain the exact dialogue content without adding or removing words.',
          },
          {
            role: 'user',
            content: `Please format this therapy session transcript by labeling the speakers:\n\n${rawTranscript}`,
          },
        ],
        temperature: 0.3,
      });

      return response.choices[0].message.content || rawTranscript;
    } catch (err) {
      console.error('OpenAI speaker labeling error:', err);
      throw new Error('Speaker labeling failed');
    }
  }

  async summarizeTranscript(labeledTranscript: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes therapy session transcripts. Generate a concise summary that captures the main topics discussed, client concerns, and key therapeutic interventions. Keep the summary contextually accurate and professional. Use 3-5 sentences.',
          },
          {
            role: 'user',
            content: `Please summarize this therapy session transcript:\n\n${labeledTranscript}`,
          },
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content || 'Summary generation failed';
    } catch (err) {
      console.error('OpenAI summarization error:', err);
      throw new Error('Summarization failed');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (err) {
      console.error('OpenAI embedding error:', err);
      throw new Error('Embedding generation failed');
    }
  }
}
