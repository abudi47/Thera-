# API Documentation

## Base URL
```
http://localhost:3000
```

---

## Endpoints

### 1. Health Check

**Endpoint:** `GET /`

**Description:** Verify the server is running and view available endpoints.

**Request:**
```bash
curl http://localhost:3000
```

**Response:**
```json
{
  "message": "NestJS backend is running",
  "endpoints": {
    "upload": "POST /sessions/upload"
  }
}
```

---

### 2. Upload Audio File

**Endpoint:** `POST /sessions/upload`

**Description:** Upload an audio file for temporary storage and transcription with OpenAI Whisper. The file is saved to the `./uploads/` directory with a unique timestamped filename, then transcribed.

**Content-Type:** `multipart/form-data`

**Form Field:**
- `audio` (file, required) - The audio file to upload

**Request Example (cURL):**
```bash
curl -X POST http://localhost:3000/sessions/upload \
  -F "audio=@/path/to/your/file.mp3"
```

**Request Example (Insomnia/Postman):**
1. Method: `POST`
2. URL: `http://localhost:3000/sessions/upload`
3. Body: Select "Multipart Form"
4. Add field named `audio` with type "File"
5. Browse and select your audio file


**Success Response (200):**
```json
{
   "id": "550e8400-e29b-41d4-a716-446655440000",
   "originalFilename": "upp.mp3",
   "mimetype": "audio/mpeg",
   "size": 498816,
   "path": "uploads/audio-1736591238123-456789012.mp3",
   "status": "transcribed",
   "rawTranscript": "How have you been feeling lately?\nI've been feeling anxious and not sleeping well.\nWhat do you think is contributing to that?\nWork stress mostly.",
   "transcript": "Speaker A (Therapist): How have you been feeling lately?\nSpeaker B (Client): I've been feeling anxious and not sleeping well.\nSpeaker A (Therapist): What do you think is contributing to that?\nSpeaker B (Client): Work stress mostly.",
   "summary": "The client reported increased anxiety and sleep difficulties. The therapist explored the sources of anxiety, identifying work stress from deadlines and meetings as primary contributors. The client mentioned limited success with meditation as a coping strategy. The session focused on exploring additional stress management strategies and prioritization techniques, with plans to set actionable goals for the upcoming week.",
   "embeddingDimensions": 1536
}
```

**Response Fields:**
- `id` (string) - Unique session identifier (UUID)
- `originalFilename` (string) - The original name of the uploaded file
- `mimetype` (string) - The MIME type of the file (e.g., `audio/mpeg`, `audio/wav`)
- `size` (number) - File size in bytes
- `path` (string) - The server path where the file is stored
- `status` (string) - Upload status, `"transcribed"` when Whisper completes
- `rawTranscript` (string) - Raw text produced by OpenAI Whisper (no speaker labels)
- `transcript` (string) - Speaker-labeled transcript (LLM formatted)
- `summary` (string) - Concise summary of the therapy session (3-5 sentences)
- `embeddingDimensions` (number) - Dimension count of the embedding vector (1536 for text-embedding-3-small)

**Error Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "No audio file provided. Expect field name \"audio\" with multipart/form-data.",
  "error": "Bad Request"
}
```

**Common Error Causes:**
- Missing `audio` field in the multipart form data
- Field name is not exactly `audio` (case-sensitive)
- No file attached to the request

---

## Workflow


### Audio Upload, Speaker Labeling, Summarization & Vectorization Flow
```
1. Client prepares audio file (MP3, WAV, etc.)
   ↓
2. Client sends POST request to /sessions/upload
   - Content-Type: multipart/form-data
   - Field name: "audio"
   ↓
3. NestJS FileInterceptor captures the file
   ↓
4. Multer saves file to ./uploads/ directory
   - Filename format: audio-{timestamp}-{random}.{ext}
   ↓
5. SessionsController passes file to SessionsService
   ↓
6. SessionsService validates file exists
   ↓
7. SessionsService transcribes audio to text (raw transcript)
   ↓
8. SessionsService sends transcript to LLM for speaker labeling
   ↓
9. SessionsService sends labeled transcript to LLM for summarization
   ↓
10. SessionsService generates vector embedding from summary
   ↓
11. SessionsService stores complete session data (transcript, summary, embeddings)
   ↓
12. Client receives JSON response with session metadata
```

### File Storage
- **Location:** `./uploads/`
- **Naming:** `audio-{timestamp}-{random}{ext}`
- **Example:** `audio-1736591238123-456789012.mp3`
- **Purpose:** Temporary storage for processing
- **Git:** Files in `./uploads/` are ignored (see `.gitignore`)

---


## Transcription, Speaker Labeling, Summarization & Vectorization

- **Transcription Service:** `OpenAIService.transcribeAudio()`
- **Speaker Labeling Service:** `OpenAIService.labelSpeakers()`
- **Summarization Service:** `OpenAIService.summarizeTranscript()`
- **Vectorization Service:** `OpenAIService.generateEmbedding()`
- **Storage Service:** `SessionStorageService`
- **Transcription Model:** `whisper-1`
- **Speaker Labeling Model:** `gpt-4`
- **Summarization Model:** `gpt-4`
- **Embedding Model:** `text-embedding-3-small` (1536 dimensions)
- **Input:** The saved file path from Multer disk storage
- **Flow:**
   1. Multer writes the uploaded audio to `./uploads/`.
   2. `SessionsService.handleAudioUpload()` validates the file.
   3. `OpenAIService.transcribeAudio()` streams the file from disk to OpenAI Whisper.
   4. Whisper returns raw text transcript.
   5. `OpenAIService.labelSpeakers()` sends the raw transcript to GPT-4 for speaker labeling.
   6. `OpenAIService.summarizeTranscript()` sends the labeled transcript to GPT-4 for summarization.
   7. `OpenAIService.generateEmbedding()` converts the summary into a 1536-dimensional vector.
   8. `SessionStorageService.saveSession()` stores all session data with embeddings to `./sessions-data/`.
   9. Service responds with session metadata including `embeddingDimensions`.
- **Environment:** Requires `OPENAI_API_KEY` in `.env`.
- **Limitations:** Speaker labeling and summarization are based on LLM inference and may not be perfect for all audio types.

---

## Session Storage & Vector Embeddings

### Storage Structure
- **Location:** `./sessions-data/`
- **Index File:** `sessions-index.json` - Contains array of all sessions
- **Individual Files:** `{session-id}.json` - Individual session data files

### Session Data Format
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-01-11T10:30:00.000Z",
  "originalFilename": "therapy-session.mp3",
  "mimetype": "audio/mpeg",
  "size": 498816,
  "audioPath": "uploads/audio-1736591238123-456789012.mp3",
  "rawTranscript": "How have you been feeling lately?...",
  "transcript": "Speaker A (Therapist): How have you been feeling lately?...",
  "summary": "The client reported increased anxiety...",
  "embedding": [0.123, -0.456, 0.789, ...]
}
```

### Vector Embeddings
- **Purpose:** Enable semantic search across therapy sessions
- **Model:** OpenAI `text-embedding-3-small`
- **Dimensions:** 1536-dimensional vectors
- **Input:** Session summary text
- **Storage:** Stored as array of floats alongside session metadata
- **Future Use:** Can be indexed for similarity search, semantic clustering, or retrieval-augmented generation (RAG)

### Semantic Search Design
The architecture is designed to support future semantic search capabilities:
- **Cosine Similarity:** Compare query embeddings with stored session embeddings
- **Vector Database Migration:** Data can be exported to vector databases (Pinecone, Weaviate, ChromaDB)
- **Query Pattern:** Convert search query → embedding → find similar sessions by vector similarity
- **Use Cases:** "Find sessions about anxiety", "Sessions discussing work stress", "Similar client concerns"

---

## Technical Stack

- **Framework:** NestJS
- **File Upload:** Multer via `@nestjs/platform-express`
- **Storage:** Disk storage (configurable in `multer.config.ts`)
- **Session Storage:** JSON files (ready for vector database migration)
- **Language:** TypeScript
- **Runtime:** Node.js

---

## Development

### Start Server
```bash
npm run start:dev
```

### Test Upload
```bash
# Create test file
echo "test audio content" > /tmp/test.mp3

# Upload
curl -X POST http://localhost:3000/sessions/upload \
  -F "audio=@/tmp/test.mp3"
```

### View Uploaded Files
```bash
ls -lh uploads/
```

---

## Module Structure

### SessionsModule
- **Controller:** `sessions.controller.ts` - Handles HTTP routing and file interception
- **Service:** `sessions.service.ts` - Contains business logic and validation
- **Config:** `multer.config.ts` - Configures disk storage and filename generation
- **Module:** `sessions.module.ts` - Wires controller and service together

### File Responsibilities
- **Controller:** Thin layer, uses `@UseInterceptors(FileInterceptor('audio'))` to capture uploads
- **Service:** Validates file presence, returns structured response
- **Config:** Defines storage destination and unique filename generation strategy
