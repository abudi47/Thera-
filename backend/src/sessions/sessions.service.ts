import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { SessionStorageService, SessionData } from './session-storage.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly openaiService: OpenAIService,
    private readonly storageService: SessionStorageService,
  ) {}

  async handleAudioUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No audio file provided. Expect field name "audio" with multipart/form-data.');
    }

    // Step 1: Transcribe audio using Whisper
    const rawTranscript = await this.openaiService.transcribeAudio(file);

    // Step 2: Label speakers using LLM
    const labeledTranscript = await this.openaiService.labelSpeakers(rawTranscript);

    // Step 3: Generate summary
    const summary = await this.openaiService.summarizeTranscript(labeledTranscript);

    // Step 4: Generate embedding for semantic search
    const embedding = await this.openaiService.generateEmbedding(summary);

    // Step 5: Store session data with embeddings
    const sessionData: SessionData = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      originalFilename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      audioPath: file.path,
      rawTranscript,
      transcript: labeledTranscript,
      summary,
      embedding,
    };

    await this.storageService.saveSession(sessionData);

    return {
      id: sessionData.id,
      originalFilename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      status: 'transcribed',
      rawTranscript,
      transcript: labeledTranscript,
      summary,
      embeddingDimensions: embedding.length,
    };
  }

  async getAllSessions() {
    const sessions = await this.storageService.getAllSessions();
    
    return sessions.map(session => ({
      id: session.id,
      originalFilename: session.originalFilename,
      mimetype: session.mimetype,
      size: session.size,
      path: session.audioPath,
      status: 'transcribed',
      rawTranscript: session.rawTranscript,
      transcript: session.transcript,
      summary: session.summary,
      embeddingDimensions: session.embedding?.length || 0,
      createdAt: session.timestamp,
    }));
  }

  async getSessionById(id: string) {
    const session = await this.storageService.getSessionById(id);
    
    if (!session) {
      throw new BadRequestException('Session not found');
    }

    return {
      id: session.id,
      originalFilename: session.originalFilename,
      mimetype: session.mimetype,
      size: session.size,
      path: session.audioPath,
      status: 'transcribed',
      rawTranscript: session.rawTranscript,
      transcript: session.transcript,
      summary: session.summary,
      embeddingDimensions: session.embedding?.length || 0,
      createdAt: session.timestamp,
    };
  }
}
