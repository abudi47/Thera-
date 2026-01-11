import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

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
  constructor(private readonly supabaseService: SupabaseService) {}

  async saveSession(sessionData: SessionData): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase
        .from('therapy_sessions')
        .insert({
          id: sessionData.id,
          timestamp: sessionData.timestamp,
          original_filename: sessionData.originalFilename,
          mimetype: sessionData.mimetype,
          file_size: sessionData.size,
          audio_path: sessionData.audioPath,
          raw_transcript: sessionData.rawTranscript,
          transcript: sessionData.transcript,
          summary: sessionData.summary,
          embedding: sessionData.embedding,
        });

      if (error) {
        console.error('Supabase save error:', error);
        throw new Error(`Failed to save session: ${error.message}`);
      }
    } catch (err) {
      console.error('Session save error:', err);
      throw new Error('Failed to save session data');
    }
  }

  async getAllSessions(): Promise<SessionData[]> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Supabase retrieval error:', error);
        return [];
      }

      return data.map((row) => ({
        id: row.id,
        timestamp: row.timestamp,
        originalFilename: row.original_filename,
        mimetype: row.mimetype,
        size: row.file_size,
        audioPath: row.audio_path,
        rawTranscript: row.raw_transcript,
        transcript: row.transcript,
        summary: row.summary,
        embedding: row.embedding,
      }));
    } catch (err) {
      console.error('Session retrieval error:', err);
      return [];
    }
  }

  async getSessionById(id: string): Promise<SessionData | null> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        timestamp: data.timestamp,
        originalFilename: data.original_filename,
        mimetype: data.mimetype,
        size: data.file_size,
        audioPath: data.audio_path,
        rawTranscript: data.raw_transcript,
        transcript: data.transcript,
        summary: data.summary,
        embedding: data.embedding,
      };
    } catch (err) {
      console.error('Session retrieval error:', err);
      return null;
    }
  }

  async searchSimilarSessions(queryEmbedding: number[], limit: number = 5): Promise<SessionData[]> {
    try {
      const supabase = this.supabaseService.getClient();

      // Using pgvector's cosine similarity
      const { data, error } = await supabase.rpc('match_sessions', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit,
      });

      if (error) {
        console.error('Similarity search error:', error);
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        timestamp: row.timestamp,
        originalFilename: row.original_filename,
        mimetype: row.mimetype,
        size: row.file_size,
        audioPath: row.audio_path,
        rawTranscript: row.raw_transcript,
        transcript: row.transcript,
        summary: row.summary,
        embedding: row.embedding,
      }));
    } catch (err) {
      console.error('Similarity search error:', err);
      return [];
    }
  }
}

