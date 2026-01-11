import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Readable } from 'stream';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(file: Express.Multer.File): Promise<string> {
    const audioStream = Readable.from(file.buffer);

    const transcription = await this.openai.audio.transcriptions.create({
      file: audioStream as any,
      model: 'whisper-1',
    });

    return transcription.text;
  }
}
