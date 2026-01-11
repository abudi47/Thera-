# Thera — AI-Powered Therapy Session Processing

<div align="center">

**A web application for therapists to upload therapy session audio and automatically process it using AI**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=flat-square&logo=openai)](https://openai.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

**[Live Demo](https://thera-nine.vercel.app)** · **[Backend API](https://thera-6r7o.onrender.com)**

</div>

---

## 🎯 Overview

This project demonstrates an end-to-end pipeline for handling unstructured audio data:

```
Audio → Text → Structured Insights → Vector Embeddings → Storage
```

The goal is to show **clean system design**, **correct data flow**, and **pragmatic engineering decisions** rather than production completeness.

---

## ✨ Core Features

### 🎙️ Audio Upload
- Upload **MP3/WAV** audio files from the browser
- Multipart upload handled by the backend

### 🤖 AI Processing Pipeline
- **Transcription** using OpenAI Whisper
- **Speaker identification** (at least two speakers)
- **Automatic session summarization**
- **Vector embedding generation** for semantic search

### 💾 Persistence
- Session metadata
- Transcript and speaker-labeled transcript
- Summary
- Embedding vectors stored in PostgreSQL (pgvector)

### 🎨 Frontend Display
- Upload UI with **real-time processing steps**
- Transcript and summary display
- Clear indication of processing completion

---

## 🛠️ Tech Stack

### Frontend
```
Framework:   Next.js 14
Language:    TypeScript
Styling:     Tailwind CSS
Deployment:  Vercel
```

### Backend
```
Framework:   NestJS (Node.js)
AI Services: OpenAI SDK
File Upload: Multer
Deployment:  Render
```

### Database
```
Database:    Supabase PostgreSQL
Vector:      pgvector extension
```

---

## 🏗️ High-Level Architecture

```
User (Browser)
   ↓
Next.js Frontend (Vercel)
   ↓
NestJS Backend (Render)
   ├─ OpenAI Whisper (Transcription)
┌─────────────────┐
│  User (Browser) │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────┐
│  Next.js Frontend (Vercel)  │
└────────┬────────────────────┘
         │ HTTP
         ▼
┌──────────────────────────────────────┐
│     NestJS Backend (Render)          │
│  ├─ OpenAI Whisper (Transcription)   │
│  ├─ OpenAI GPT (Labeling + Summary)  │
│  ├─ OpenAI Embeddings                │
│  └─ Supabase PostgreSQL              │
└──────────────────────────────────────┘
```

---

## 🔄 Processing Flow

CREATE TABLE therapy_sessions (
  id UUID PRIMARY KEY,
  filename TEXT,
  transcript TEXT,
  labeled_transcript TEXT,
  summary TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ
);
```

Embeddings are indexed using **pgvector** to support future semantic search.

---

## 📡 API Overview

### Upload & Process Session

```httpable

```sq
embedding vector(1536)
created_at TIMESTAMPTZ


Embeddings are indexed using pgvector to support future semantic search.
Body:
  audio: <file>
```

**Response:**
```json
{
  "id": "uuid",
  "transcript": "...",
  "summary": "...",
  "status": "completed"
}
```

---

## 🚀 Local Development

### Prerequisites

- **Node.js** 18+
- **OpenAI API key**
- **Supabase project**
```

### Frontend Setup

```bashend Setup

```bash 18+

OpenAI API key

Supabase project
```

---





<div align="center">



[⬆ Back to Top](#thera--ai-powered-therapy-session-processing)

</div>ope)

