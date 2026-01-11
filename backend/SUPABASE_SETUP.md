# Supabase Setup Guide

## Prerequisites
- Supabase account (sign up at https://supabase.com)
- PostgreSQL database with pgvector extension support

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter project details:
   - Name: `thera-backend` (or your preferred name)
   - Database Password: (choose a strong password)
   - Region: (select closest to your users)
4. Click "Create new project"
5. Wait for project initialization (~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

Update your `.env` file:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-public-key-here
```

## Step 4: Enable pgvector Extension

1. In Supabase dashboard, go to **Database** → **Extensions**
2. Search for `vector`
3. Enable the **vector** extension
4. Click "Enable"

## Step 5: Run Database Migrations

### Option A: Using Supabase SQL Editor

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the content from:
   - `supabase/migrations/20260111_create_therapy_sessions.sql`
4. Click "Run" to execute
5. Repeat for:
   - `supabase/migrations/20260111_create_search_function.sql`

### Option B: Using Supabase CLI (Recommended for production)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 6: Verify Setup

Run this query in SQL Editor to verify table creation:

```sql
SELECT * FROM therapy_sessions LIMIT 1;
```

You should see an empty result with all column headers.

## Step 7: Test the Connection

Restart your NestJS server and upload an audio file. Check Supabase dashboard:

1. Go to **Table Editor**
2. Select `therapy_sessions` table
3. You should see your uploaded session data

## Database Schema

### Table: `therapy_sessions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `timestamp` | TIMESTAMPTZ | Session timestamp |
| `original_filename` | TEXT | Original audio filename |
| `mimetype` | TEXT | Audio file MIME type |
| `file_size` | INTEGER | File size in bytes |
| `audio_path` | TEXT | Path to stored audio file |
| `raw_transcript` | TEXT | Raw Whisper transcript |
| `transcript` | TEXT | Speaker-labeled transcript |
| `summary` | TEXT | AI-generated summary |
| `embedding` | vector(1536) | Vector embedding for semantic search |
| `created_at` | TIMESTAMPTZ | Record creation time |
| `updated_at` | TIMESTAMPTZ | Record update time |

### Indexes

- `idx_sessions_timestamp`: B-tree index on timestamp for efficient sorting
- `idx_sessions_embedding`: IVFFlat index on embedding for vector similarity search

### Functions

- `match_sessions(query_embedding, match_threshold, match_count)`: Performs semantic similarity search

## Security Recommendations

1. **Row Level Security (RLS)**: Enable RLS for production:

```sql
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;

-- Example policy (adjust based on your auth setup)
CREATE POLICY "Enable read access for authenticated users"
ON therapy_sessions FOR SELECT
TO authenticated
USING (true);
```

2. **API Keys**: 
   - Use `anon` key for client-side applications
   - Use `service_role` key only in backend (never expose to clients)

3. **Environment Variables**: Never commit `.env` file to version control

## Troubleshooting

### Error: "relation 'therapy_sessions' does not exist"
- Run the migration scripts in SQL Editor
- Verify you're connected to the correct database

### Error: "extension 'vector' does not exist"
- Enable pgvector extension in Database → Extensions

### Error: "SUPABASE_URL and SUPABASE_KEY must be set"
- Check your `.env` file is in the correct location
- Restart your NestJS server after updating `.env`

## Next Steps

- Implement authentication with Supabase Auth
- Add Row Level Security policies
- Set up database backups
- Monitor performance in Supabase dashboard
