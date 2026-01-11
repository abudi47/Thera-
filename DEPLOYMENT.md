# Deployment Guide: Backend (Render) + Frontend (Vercel)

This guide walks you through deploying the Thera therapy session management system to production.

---

## Architecture

```
Frontend (Vercel)                    Backend (Render)                   Database (Supabase)
https://your-app.vercel.app  →  https://your-api.onrender.com  →  PostgreSQL + pgvector
```

---

## Prerequisites

1. **GitHub Account** - For connecting repositories
2. **Vercel Account** - Sign up at https://vercel.com
3. **Render Account** - Sign up at https://render.com
4. **Supabase Project** - Already set up (see SUPABASE_SETUP.md)
5. **OpenAI API Key** - For transcription and summarization

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/thera-backend.git
git push -u origin main
```

### Step 2: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `thera-backend` repository

### Step 3: Configure Build Settings

**Basic Settings:**
- **Name:** `thera-backend` (or your preferred name)
- **Region:** Oregon (US West) or closest to you
- **Branch:** `main`
- **Root Directory:** Leave blank (or specify if in monorepo)
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start:prod`

**Plan:**
- Select **Free** tier (or paid for better performance)

### Step 4: Set Environment Variables

In the **Environment** section, add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | Your Supabase anon key |
| `FRONTEND_URL` | `https://your-app.vercel.app` (add after Vercel deploy) |
| `PORT` | `3000` (Render sets automatically) |

### Step 5: Create uploads directory

Add this to your build command:
```
npm install && npm run build && mkdir -p uploads
```

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (~2-5 minutes)
3. Your backend will be available at: `https://your-backend.onrender.com`

### Step 7: Test Backend

```bash
curl https://your-backend.onrender.com
# Should return: {"message":"NestJS backend is running",...}
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/thera-frontend.git
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `thera-frontend` repository
4. Click **"Import"**

### Step 3: Configure Project Settings

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** Leave as `./`

**Build Settings:**
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Step 4: Set Environment Variables

In the **Environment Variables** section, add:

| Name | Value |
|------|-------|
| `BACKEND_URL` | `https://your-backend.onrender.com` |

**Important:** Use your actual Render backend URL from Part 1.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for deployment (~1-3 minutes)
3. Your frontend will be available at: `https://your-app.vercel.app`

### Step 6: Update Backend CORS

Go back to Render dashboard:
1. Open your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your actual Vercel URL: `https://your-app.vercel.app`
4. Click **"Save Changes"**
5. Service will automatically redeploy

---

## Part 3: Verify Deployment

### Test Frontend
1. Go to `https://your-app.vercel.app`
2. Upload an audio file
3. Verify transcription, speaker labeling, and summary work

### Test Backend Directly
```bash
# Health check
curl https://your-backend.onrender.com

# Get sessions (should return empty array initially)
curl https://your-backend.onrender.com/sessions
```

---

## Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
OPENAI_API_KEY=sk-proj-xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJxxxxx
FRONTEND_URL=https://your-app.vercel.app
PORT=3000
```

### Frontend (Vercel)
```env
BACKEND_URL=https://your-backend.onrender.com
```

---

## Custom Domain Setup (Optional)

### For Vercel (Frontend)
1. Go to your project → **Settings** → **Domains**
2. Add your custom domain: `therapy.yourdomain.com`
3. Follow DNS configuration instructions
4. Update backend `FRONTEND_URL` to your custom domain

### For Render (Backend)
1. Go to your service → **Settings** → **Custom Domain**
2. Add your custom domain: `api.yourdomain.com`
3. Follow DNS configuration instructions
4. Update frontend `BACKEND_URL` to your custom domain

---

## Troubleshooting

### Backend Issues

**Error: "Application failed to respond"**
- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set
- Ensure build completed successfully
- Check `PORT` is set correctly

**Error: "OPENAI_API_KEY not set"**
- Go to Environment tab
- Add `OPENAI_API_KEY` variable
- Redeploy

**Error: "Supabase connection failed"**
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check Supabase project is active
- Verify database migrations ran successfully

**Uploads not working:**
- Render free tier has ephemeral storage
- Files are deleted on service restart
- Consider using S3/Cloudinary for production file storage

### Frontend Issues

**Error: "Failed to connect to backend"**
- Verify `BACKEND_URL` is correct in Vercel environment variables
- Check backend is running on Render
- Verify CORS is configured correctly

**Error: "CORS policy blocked"**
- Check backend `FRONTEND_URL` matches your Vercel URL
- Ensure backend CORS is enabled in main.ts
- Redeploy backend after updating CORS settings

**Build fails:**
- Check Vercel build logs
- Verify all dependencies are in package.json
- Ensure TypeScript types are correct

---

## Monitoring & Logs

### Render
- **Logs:** Dashboard → Service → Logs tab
- **Metrics:** Dashboard → Service → Metrics tab
- **Events:** Shows deployments and restarts

### Vercel
- **Deployments:** Project → Deployments tab
- **Logs:** Click on any deployment → View Function Logs
- **Analytics:** Project → Analytics tab (paid plans)

---

## Scaling Considerations

### Render Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free (sufficient for hobby projects)

**Upgrade to Paid Plan ($7/month) for:**
- Always-on instances
- No cold starts
- Better performance
- More memory

### Vercel Free Tier Limitations
- 100GB bandwidth/month
- 100 builds/day
- Unlimited projects

**Upgrade for:**
- Higher bandwidth
- Team collaboration
- Advanced analytics

---

## CI/CD: Automatic Deployments

Both Render and Vercel support automatic deployments:

### Render
- **Auto-deploy on push to main:** Enabled by default
- **Manual deploys:** Dashboard → Manual Deploy button

### Vercel
- **Auto-deploy on push:** Enabled by default
- **Preview deployments:** Auto-created for PRs
- **Production deploys:** From main branch only

---

## Database Backups

**Supabase automatic backups:**
- Free tier: Daily backups (7-day retention)
- Pro tier: Daily backups (30-day retention)
- Point-in-time recovery available on paid plans

**Manual backup:**
```bash
# Export from Supabase dashboard
# Settings → Database → Backups → Download
```

---

## Security Recommendations

### Backend
1. ✅ CORS configured for specific frontend domain
2. ✅ Environment variables not committed to Git
3. ⚠️ Add rate limiting (consider @nestjs/throttler)
4. ⚠️ Add authentication (Supabase Auth recommended)
5. ⚠️ Implement file upload size limits
6. ⚠️ Use service_role key only on backend (never expose)

### Frontend
1. ✅ API proxy routes prevent CORS issues
2. ✅ No sensitive keys in frontend code
3. ⚠️ Add authentication UI
4. ⚠️ Implement user sessions
5. ⚠️ Add CSP headers

### Supabase
1. ✅ Row Level Security (RLS) enabled
2. ⚠️ Add RLS policies for user data isolation
3. ⚠️ Regularly rotate API keys
4. ⚠️ Monitor usage in dashboard

---

## Cost Estimate

**Monthly costs for hobby/startup:**

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Render (Backend) | ✅ Free | $7/month |
| Vercel (Frontend) | ✅ Free | $20/month |
| Supabase (Database) | ✅ Free | $25/month |
| OpenAI API | Pay-per-use | ~$10-50/month* |
| **Total** | **$0** + OpenAI | **$52-72/month** |

*OpenAI costs depend on usage (Whisper + GPT-4)

---

## Maintenance

### Weekly
- Check Render/Vercel logs for errors
- Monitor OpenAI usage costs
- Review Supabase database size

### Monthly
- Update npm dependencies
- Check for security vulnerabilities: `npm audit`
- Review and rotate API keys if needed
- Backup database manually

### As Needed
- Scale services based on usage
- Optimize database queries
- Add indexes for performance
- Implement caching

---

## Rollback Procedure

### Render
1. Go to Dashboard → Service → Events
2. Find previous successful deployment
3. Click **"Rollback to this version"**

### Vercel
1. Go to Project → Deployments
2. Find previous working deployment
3. Click **"⋯"** → **"Promote to Production"**

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **NestJS Docs:** https://docs.nestjs.com
- **Next.js Docs:** https://nextjs.org/docs

---

## Next Steps After Deployment

1. ✅ Test all features in production
2. ⚠️ Add authentication (Supabase Auth)
3. ⚠️ Implement user accounts
4. ⚠️ Add semantic search UI
5. ⚠️ Set up monitoring/alerting
6. ⚠️ Add analytics
7. ⚠️ Implement file storage (S3/Cloudinary)
8. ⚠️ Add email notifications
9. ⚠️ Create admin dashboard
10. ⚠️ Add usage limits per user

---

## Quick Reference

### Deployment URLs
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.onrender.com`
- **Database:** Supabase Dashboard

### Important Commands
```bash
# Redeploy backend
git push origin main  # Auto-deploys on Render

# Redeploy frontend
git push origin main  # Auto-deploys on Vercel

# Check logs
# Render: Dashboard → Logs
# Vercel: Dashboard → Deployments → Function Logs
```

---

**Deployment Complete!** 🎉

Your therapy session management system is now live in production!
