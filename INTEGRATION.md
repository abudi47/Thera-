# Frontend-Backend Integration Guide

## Overview
This document outlines all changes made to integrate the Next.js frontend with the NestJS backend for the Thera therapy session management system.

---

## Architecture

```
Frontend (Next.js)          API Proxy                Backend (NestJS)
    localhost:3001    →    /api/sessions/*    →    localhost:3000/sessions/*
```

**Communication Flow:**
1. Frontend makes requests to `/api/sessions/*`
2. Next.js API routes proxy requests to NestJS backend
3. Backend processes and returns data
4. Frontend receives and displays data

---

## Changes Made

### 1. Frontend Configuration

#### **File: `/frontend/.env`**
```env
BACKEND_URL=http://localhost:3000
```
- Added backend URL for API proxy routes
- Used in all API route handlers to forward requests

---

### 2. Backend API Endpoints

#### **File: `/backend/src/sessions/sessions.controller.ts`**

**Added imports:**
```typescript
import { Get, Param } from '@nestjs/common';
```

**New endpoints:**

1. **GET /sessions** - List all sessions
```typescript
@Get()
getAllSessions() {
  return this.sessionsService.getAllSessions();
}
```

2. **GET /sessions/:id** - Get single session by ID
```typescript
@Get(':id')
getSessionById(@Param('id') id: string) {
  return this.sessionsService.getSessionById(id);
}
```

#### **File: `/backend/src/sessions/sessions.service.ts`**

**Added methods:**

1. **getAllSessions()** - Retrieves all sessions from database
```typescript
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
```

2. **getSessionById(id)** - Retrieves single session by UUID
```typescript
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
```

---

### 3. Frontend Type Definitions

#### **File: `/frontend/lib/types.ts`**

**Added interface:**
```typescript
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
```

**Updated Session interface:**
```typescript
export interface Session {
  // ... existing fields
  createdAt?: string
  timestamp?: string  // Added for compatibility with backend
}
```

---

### 4. Frontend Components

#### **File: `/frontend/components/session-uploader.tsx`**

**Changes:**
- Removed unused `SessionResponse` and `TranscriptEntry` interfaces
- Updated import to use `UploadResponse` type
- Changed response type from `Session` to `UploadResponse`

**Before:**
```typescript
const data: Session = await res.json()
```

**After:**
```typescript
const data: UploadResponse = await res.json()
```

---

## API Endpoints Summary

### Backend Endpoints (NestJS - http://localhost:3000)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| POST | `/sessions/upload` | Upload audio file | Session object with transcript, summary, embedding |
| GET | `/sessions` | Get all sessions | Array of session objects |
| GET | `/sessions/:id` | Get session by ID | Single session object |

### Frontend API Routes (Next.js - http://localhost:3001)

| Method | Endpoint | Proxies To | Description |
|--------|----------|------------|-------------|
| POST | `/api/sessions/upload` | `POST /sessions/upload` | Upload audio file |
| GET | `/api/sessions` | `GET /sessions` | List all sessions |
| GET | `/api/sessions/:id` | `GET /sessions/:id` | Get session details |

---

## Response Formats

### Upload Response
```json
{
  "id": "uuid",
  "originalFilename": "session.mp3",
  "mimetype": "audio/mpeg",
  "size": 498816,
  "path": "uploads/audio-xxx.mp3",
  "status": "transcribed",
  "rawTranscript": "How have you been feeling...",
  "transcript": "Speaker A (Therapist): How have you been feeling...",
  "summary": "The client reported anxiety...",
  "embeddingDimensions": 1536
}
```

### Sessions List Response
```json
[
  {
    "id": "uuid",
    "originalFilename": "session.mp3",
    "mimetype": "audio/mpeg",
    "size": 498816,
    "path": "uploads/audio-xxx.mp3",
    "status": "transcribed",
    "rawTranscript": "...",
    "transcript": "...",
    "summary": "...",
    "embeddingDimensions": 1536,
    "createdAt": "2026-01-11T10:30:00Z"
  }
]
```

### Session Detail Response
```json
{
  "id": "uuid",
  "originalFilename": "session.mp3",
  "mimetype": "audio/mpeg",
  "size": 498816,
  "path": "uploads/audio-xxx.mp3",
  "status": "transcribed",
  "rawTranscript": "...",
  "transcript": "...",
  "summary": "...",
  "embeddingDimensions": 1536,
  "createdAt": "2026-01-11T10:30:00Z"
}
```

---

## Testing the Integration

### 1. Start Backend
```bash
cd backend
npm run start:dev
# Server runs on http://localhost:3000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Server runs on http://localhost:3001
```

### 3. Test Upload Flow
1. Go to http://localhost:3001
2. Upload an audio file (MP3, WAV, etc.)
3. Wait for processing (~10-30 seconds)
4. You'll be redirected to `/sessions/:id` with full details

### 4. Test Sessions List
1. Go to http://localhost:3001/sessions
2. You should see all uploaded sessions
3. Click on any session to view details

### 5. Test via cURL

**Upload:**
```bash
curl -X POST http://localhost:3000/sessions/upload \
  -F "audio=@path/to/audio.mp3"
```

**List sessions:**
```bash
curl http://localhost:3000/sessions
```

**Get specific session:**
```bash
curl http://localhost:3000/sessions/{session-id}
```

---

## Environment Variables

### Backend (.env)
```env
OPENAI_API_KEY=your-openai-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### Frontend (.env)
```env
BACKEND_URL=http://localhost:3000
```

---

## Data Flow

### Upload Process
```
1. User selects audio file in frontend
   ↓
2. FormData sent to /api/sessions/upload
   ↓
3. Next.js proxies to backend /sessions/upload
   ↓
4. Backend processes:
   - Saves file to uploads/
   - Transcribes with Whisper
   - Labels speakers with GPT-4
   - Generates summary with GPT-4
   - Creates embeddings
   - Saves to Supabase
   ↓
5. Returns session object with id
   ↓
6. Frontend redirects to /sessions/:id
```

### Sessions List Process
```
1. Frontend requests /api/sessions
   ↓
2. Next.js proxies to backend /sessions
   ↓
3. Backend queries Supabase
   ↓
4. Returns array of sessions
   ↓
5. Frontend displays in table/card view
```

---

## CORS Configuration

Frontend and backend run on different ports, but CORS is handled by:
1. Next.js API routes acting as a proxy
2. All external requests go through Next.js
3. Backend only receives requests from Next.js (localhost)

**No additional CORS configuration needed** for development.

---

## Production Deployment

### Option 1: Same Domain
- Deploy Next.js and NestJS to same domain
- Use path-based routing:
  - `/` → Next.js
  - `/api/backend/*` → NestJS

### Option 2: Different Domains
- Deploy Next.js to Vercel
- Deploy NestJS to Railway/Render/AWS
- Update `BACKEND_URL` in frontend `.env`
- Enable CORS in NestJS:

```typescript
// main.ts
app.enableCors({
  origin: 'https://your-frontend-domain.com',
  credentials: true,
});
```

---

## Troubleshooting

### "Failed to connect to backend"
- Ensure backend is running on port 3000
- Check `BACKEND_URL` in frontend `.env`
- Verify no firewall blocking localhost connections

### "Session not found"
- Check session ID is valid UUID
- Verify session exists in Supabase
- Check database connection

### "Could not find table 'therapy_sessions'"
- Run Supabase migrations (see SUPABASE_SETUP.md)
- Verify pgvector extension is enabled
- Check Supabase credentials in backend `.env`

---

## Summary of Files Modified

### Backend
- ✅ `/src/sessions/sessions.controller.ts` - Added GET endpoints
- ✅ `/src/sessions/sessions.service.ts` - Added retrieval methods

### Frontend
- ✅ `/.env` - Added BACKEND_URL
- ✅ `/lib/types.ts` - Added UploadResponse interface
- ✅ `/components/session-uploader.tsx` - Updated to use correct types

### Existing (No changes)
- `/app/api/sessions/upload/route.ts` - Already configured
- `/app/api/sessions/route.ts` - Already configured
- `/app/api/sessions/[id]/route.ts` - Already configured

---

## Next Steps

1. ✅ Backend endpoints created
2. ✅ Frontend connected
3. ✅ Types aligned
4. 🔄 Test full flow with real audio
5. 🔄 Add error handling improvements
6. 🔄 Add loading states for long operations
7. 🔄 Implement semantic search UI (future)
8. 🔄 Add authentication (future)

---

## Support

For issues or questions:
1. Check this integration guide
2. Review [API_docs.md](../backend/API_docs.md)
3. Review [SUPABASE_SETUP.md](../backend/SUPABASE_SETUP.md)
