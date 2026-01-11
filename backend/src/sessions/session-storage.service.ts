import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface SessionData {
  id: string;
  timestamp: string;
  originalFilename: string;
  mimetype: string;
  size: number;
  audioPath: string;
  rawTranscript: string;
  transcript: string;
  summary: string;
  embedding: number[];
}

@Injectable()
export class SessionStorageService {
  private readonly storageDir = join(process.cwd(), 'sessions-data');
  private readonly indexFile = join(this.storageDir, 'sessions-index.json');

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      
      try {
        await fs.access(this.indexFile);
      } catch {
        await fs.writeFile(this.indexFile, JSON.stringify([], null, 2));
      }
    } catch (err) {
      console.error('Storage initialization error:', err);
    }
  }

  async saveSession(sessionData: SessionData): Promise<void> {
    try {
      // Read existing sessions
      const indexContent = await fs.readFile(this.indexFile, 'utf-8');
      const sessions: SessionData[] = JSON.parse(indexContent);

      // Add new session
      sessions.push(sessionData);

      // Write back to index
      await fs.writeFile(this.indexFile, JSON.stringify(sessions, null, 2));

      // Save individual session file for easier retrieval
      const sessionFile = join(this.storageDir, `${sessionData.id}.json`);
      await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2));
    } catch (err) {
      console.error('Session save error:', err);
      throw new Error('Failed to save session data');
    }
  }

  async getAllSessions(): Promise<SessionData[]> {
    try {
      const indexContent = await fs.readFile(this.indexFile, 'utf-8');
      return JSON.parse(indexContent);
    } catch (err) {
      console.error('Session retrieval error:', err);
      return [];
    }
  }

  async getSessionById(id: string): Promise<SessionData | null> {
    try {
      const sessionFile = join(this.storageDir, `${id}.json`);
      const content = await fs.readFile(sessionFile, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      return null;
    }
  }
}
