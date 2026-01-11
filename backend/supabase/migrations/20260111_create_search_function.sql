-- Create function for semantic similarity search
CREATE OR REPLACE FUNCTION match_sessions(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  timestamp TIMESTAMP WITH TIME ZONE,
  original_filename TEXT,
  mimetype TEXT,
  file_size INTEGER,
  audio_path TEXT,
  raw_transcript TEXT,
  transcript TEXT,
  summary TEXT,
  embedding vector(1536),
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    therapy_sessions.id,
    therapy_sessions.timestamp,
    therapy_sessions.original_filename,
    therapy_sessions.mimetype,
    therapy_sessions.file_size,
    therapy_sessions.audio_path,
    therapy_sessions.raw_transcript,
    therapy_sessions.transcript,
    therapy_sessions.summary,
    therapy_sessions.embedding,
    1 - (therapy_sessions.embedding <=> query_embedding) as similarity
  FROM therapy_sessions
  WHERE 1 - (therapy_sessions.embedding <=> query_embedding) > match_threshold
  ORDER BY therapy_sessions.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_sessions IS 'Performs semantic similarity search on therapy sessions using cosine similarity';
