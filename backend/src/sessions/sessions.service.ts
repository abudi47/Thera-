import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class SessionsService {
  constructor(private readonly openaiService: OpenAIService) {}

  async handleAudioUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No audio file provided. Expect field name "audio" with multipart/form-data.');
    }

    // Step 1: Transcribe audio using Whisper
    const rawTranscript = await this.openaiService.transcribeAudio(file);

    // Step 2: Label speakers using LLM
    const labeledTranscript = await this.openaiService.labelSpeakers(rawTranscript);

    return {
      originalFilename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      status: 'transcribed',
      rawTranscript,
      transcript: labeledTranscript,
    };
  }
}
