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
   "originalFilename": "upp.mp3",
   "mimetype": "audio/mpeg",
   "size": 498816,
   "path": "uploads/audio-1736591238123-456789012.mp3",
   "status": "transcribed",
   "rawTranscript": "How have you been feeling lately?\nI've been feeling anxious and not sleeping well.\nWhat do you think is contributing to that?\nWork stress mostly.",
   "transcript": "Speaker A (Therapist): How have you been feeling lately?\nSpeaker B (Client): I've been feeling anxious and not sleeping well.\nSpeaker A (Therapist): What do you think is contributing to that?\nSpeaker B (Client): Work stress mostly."
}
```

**Response Fields:**
- `originalFilename` (string) - The original name of the uploaded file
- `mimetype` (string) - The MIME type of the file (e.g., `audio/mpeg`, `audio/wav`)
- `size` (number) - File size in bytes
- `path` (string) - The server path where the file is stored
- `status` (string) - Upload status, `"transcribed"` when Whisper completes
- `rawTranscript` (string) - Raw text produced by OpenAI Whisper (no speaker labels)
- `transcript` (string) - Speaker-labeled transcript (LLM formatted)

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


### Audio Upload & Speaker Labeling Flow
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
9. SessionsService returns file metadata, raw transcript, and speaker-labeled transcript
   ↓
10. Client receives JSON response with file info, raw transcript, and labeled transcript
```

### File Storage
- **Location:** `./uploads/`
- **Naming:** `audio-{timestamp}-{random}{ext}`
- **Example:** `audio-1736591238123-456789012.mp3`
- **Purpose:** Temporary storage for processing
- **Git:** Files in `./uploads/` are ignored (see `.gitignore`)

---


## Transcription & Speaker Labeling

- **Transcription Service:** `OpenAIService.transcribeAudio()`
- **Speaker Labeling Service:** `OpenAIService.labelSpeakers()`
- **Transcription Model:** `whisper-1`
- **Speaker Labeling Model:** `gpt-4`
- **Input:** The saved file path from Multer disk storage
- **Flow:**
   1. Multer writes the uploaded audio to `./uploads/`.
   2. `SessionsService.handleAudioUpload()` validates the file.
   3. `OpenAIService.transcribeAudio()` streams the file from disk to OpenAI Whisper.
   4. Whisper returns raw text transcript.
   5. `OpenAIService.labelSpeakers()` sends the raw transcript to GPT-4 for speaker labeling.
   6. Service responds with `status: "transcribed"`, `rawTranscript`, and `transcript` (speaker-labeled).
- **Environment:** Requires `OPENAI_API_KEY` in `.env`.
- **Limitations:** Speaker labeling is based on LLM inference and may not be perfect for all audio types.

---

## Technical Stack

- **Framework:** NestJS
- **File Upload:** Multer via `@nestjs/platform-express`
- **Storage:** Disk storage (configurable in `multer.config.ts`)
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
