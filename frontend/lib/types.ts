// Session response type matching the NestJS backend
export interface Session {
  id: string
  originalFilename: string
  mimetype: string
  size: number
  path: string
  status: "transcribed" | "processing" | "failed"
  rawTranscript: string
  transcript: string // Speaker-labeled: "Speaker A (Therapist): ... Speaker B (Client): ..."
  summary: string
  embeddingDimensions: number
  createdAt?: string
  timestamp?: string
}

// Upload response from backend
export interface UploadResponse {
  id: string
  originalFilename: string
  mimetype: string
  size: number
  path: string
  status: "transcribed"
  rawTranscript: string
  transcript: string
  summary: string
  embeddingDimensions: number
}

// Parsed transcript entry for display
export interface ParsedTranscriptEntry {
  speaker: string
  role: "Therapist" | "Client" | "Unknown"
  text: string
}

// Parse the speaker-labeled transcript string into structured entries
export function parseTranscript(transcript: string): ParsedTranscriptEntry[] {
  const entries: ParsedTranscriptEntry[] = []

  // Split by speaker labels like "Speaker A (Therapist):" or "Speaker B (Client):"
  const regex = /Speaker\s+(\w+)\s*$$(\w+)$$:\s*/gi
  const parts = transcript.split(regex)

  // parts will be: [before, speaker, role, text, speaker, role, text, ...]
  for (let i = 1; i < parts.length; i += 3) {
    const speaker = parts[i] || ""
    const role = (parts[i + 1] as "Therapist" | "Client") || "Unknown"
    const text = parts[i + 2]?.trim() || ""

    if (text) {
      entries.push({ speaker: `Speaker ${speaker}`, role, text })
    }
  }

  return entries
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
