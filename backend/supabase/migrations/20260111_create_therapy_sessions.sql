-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create therapy_sessions table
CREATE TABLE therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  original_filename TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  audio_path TEXT NOT NULL,
  raw_transcript TEXT NOT NULL,
  transcript TEXT NOT NULL,
  summary TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on timestamp for efficient queries
CREATE INDEX idx_sessions_timestamp ON therapy_sessions(timestamp DESC);

-- Create index on embedding for vector similarity search
CREATE INDEX idx_sessions_embedding ON therapy_sessions USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Add comments for documentation
COMMENT ON TABLE therapy_sessions IS 'Stores therapy session data including transcripts, summaries, and vector embeddings';
COMMENT ON COLUMN therapy_sessions.id IS 'Unique session identifier';
COMMENT ON COLUMN therapy_sessions.timestamp IS 'When the session occurred';
COMMENT ON COLUMN therapy_sessions.embedding IS '1536-dimensional vector embedding of the session summary for semantic search';
COMMENT ON COLUMN therapy_sessions.raw_transcript IS 'Raw transcript from Whisper without speaker labels';
COMMENT ON COLUMN therapy_sessions.transcript IS 'Speaker-labeled transcript';
COMMENT ON COLUMN therapy_sessions.summary IS 'AI-generated summary of the session';
