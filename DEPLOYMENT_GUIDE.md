# 🚀 Deployment Guide - AI Gatekeeper

**COPY-PASTE READY - Execute when you're ready to deploy**

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- [ ] Supabase database created with seed data
- [ ] All environment variables ready
- [ ] Tests passing (12/19 minimum)
- [ ] Google Cloud project set up
- [ ] GitHub repository pushed

---

## 🗄️ Step 1: Supabase Database (If not done)

```bash
# 1. Go to https://supabase.com
# 2. New Project → "ai-gatekeeper-prod"
# 3. Copy database/seed_data.sql
# 4. Paste in SQL Editor → Run

# 5. Save these values:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...
```

---

## ☁️ Step 2: Deploy Backend to Cloud Run

### 2.1 Set up Google Cloud

```bash
# Install gcloud CLI if needed
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com
```

### 2.2 Create Secrets in Secret Manager

```bash
# Navigate to backend
cd ai-gatekeeper/backend

# Create secrets for sensitive values
echo -n "YOUR_ELEVENLABS_API_KEY" | gcloud secrets create elevenlabs-api-key --data-file=-
echo -n "YOUR_TWILIO_AUTH_TOKEN" | gcloud secrets create twilio-auth-token --data-file=-
echo -n "YOUR_SUPABASE_SERVICE_ROLE_KEY" | gcloud secrets create supabase-service-role-key --data-file=-

# Verify
gcloud secrets list
```

### 2.3 Deploy with Cloud Build

```bash
# Build and deploy (uses cloudbuild.yaml)
gcloud builds submit --config cloudbuild.yaml

# OR deploy directly from source
gcloud run deploy ai-gatekeeper \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars \
ENVIRONMENT=production,\
TWILIO_ACCOUNT_SID=ACxxxxx,\
TWILIO_PHONE_NUMBER=+15559876543,\
ELEVENLABS_AGENT_ID=your_agent_id,\
SUPABASE_URL=https://xxxxx.supabase.co,\
GOOGLE_CLOUD_PROJECT=your-project-id \
  --set-secrets \
ELEVENLABS_API_KEY=elevenlabs-api-key:latest,\
TWILIO_AUTH_TOKEN=twilio-auth-token:latest,\
SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest
```

### 2.4 Get Backend URL

```bash
# Get the deployed URL
gcloud run services describe ai-gatekeeper --region us-central1 --format 'value(status.url)'

# Example output:
# https://ai-gatekeeper-xxxxx-uc.a.run.app

# Test it
curl https://ai-gatekeeper-xxxxx-uc.a.run.app/health
```

**SAVE THIS URL** - You'll need it for frontend deployment!

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Login and Link Project

```bash
# Navigate to frontend
cd ai-gatekeeper/frontend

# Login to Vercel
vercel login

# Link project (follow prompts)
vercel link
```

### 3.3 Set Environment Variables

```bash
# Set production env vars
vercel env add NEXT_PUBLIC_API_URL production
# Paste: https://ai-gatekeeper-xxxxx-uc.a.run.app (your Cloud Run URL)

vercel env add NEXT_PUBLIC_ENVIRONMENT production
# Paste: production
```

### 3.4 Deploy to Production

```bash
# Deploy
vercel --prod

# Example output:
# ✅ Production: https://ai-gatekeeper.vercel.app
```

**SAVE THIS URL** - This is your public frontend!

---

## 🔧 Step 4: Configure Twilio

```bash
# 1. Go to Twilio Console: https://console.twilio.com
# 2. Phone Numbers → Your Twilio Number
# 3. Voice & Fax → Webhook for incoming calls:

# Paste this URL:
https://ai-gatekeeper-xxxxx-uc.a.run.app/api/telephony/incoming

# Method: HTTP POST
# Save
```

---

## 🎙️ Step 5: Configure ElevenLabs

```bash
# 1. Go to ElevenLabs: https://elevenlabs.io
# 2. Conversational AI → Create Agent

# Agent Configuration:
Name: AI Gatekeeper
Voice: [Your cloned voice]

# System Prompt (copy from backend/app/core/config.py SYSTEM_PROMPT_TEMPLATE)

# Webhook URL:
https://ai-gatekeeper-xxxxx-uc.a.run.app/api/elevenlabs/webhook

# Save Agent ID and update in Cloud Run:
gcloud run services update ai-gatekeeper \
  --region us-central1 \
  --update-env-vars ELEVENLABS_AGENT_ID=your_new_agent_id
```

---

## ✅ Step 6: Test End-to-End

### 6.1 Frontend Test

```bash
# 1. Open browser
open https://ai-gatekeeper.vercel.app

# 2. Should see welcome screen
# 3. Complete onboarding (4 screens)
# 4. Should redirect to dashboard
```

### 6.2 Backend API Test

```bash
# Health check
curl https://ai-gatekeeper-xxxxx-uc.a.run.app/health

# Should return:
# {"status":"healthy","environment":"production","version":"1.0.0"}

# API docs (if enabled)
open https://ai-gatekeeper-xxxxx-uc.a.run.app/docs
```

### 6.3 Call Test

```bash
# Call your Twilio number
# You should hear:
# "Hello, this is [Your Name]'s AI assistant. How can I help you?"

# Try saying:
# "This is the IRS. You owe money."

# AI should respond:
# "This call is being terminated." [HANG UP]
```

---

## 🔍 Step 7: Monitor & Debug

### Cloud Run Logs

```bash
# View logs
gcloud run services logs read ai-gatekeeper --region us-central1 --limit 50

# Stream logs (real-time)
gcloud run services logs tail ai-gatekeeper --region us-central1
```

### Vercel Logs

```bash
# View deployment logs
vercel logs https://ai-gatekeeper.vercel.app

# Or in dashboard:
open https://vercel.com/your-username/ai-gatekeeper
```

### Check Health Status

```bash
# Detailed health (if DEBUG=true)
curl https://ai-gatekeeper-xxxxx-uc.a.run.app/health | jq

# Should show:
# - All validation checks
# - Database connection status
# - External service status
```

---

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check logs
gcloud run services logs read ai-gatekeeper --region us-central1 --limit 100

# Common issues:
# 1. Missing secret: Add to Secret Manager
# 2. Database connection: Check SUPABASE_URL
# 3. API key invalid: Verify ELEVENLABS_API_KEY
```

### Frontend shows "API Error"

```bash
# 1. Check NEXT_PUBLIC_API_URL is set correctly
vercel env ls

# 2. Verify backend is accessible
curl https://ai-gatekeeper-xxxxx-uc.a.run.app/health

# 3. Check CORS settings in backend
```

### Calls not connecting

```bash
# 1. Verify Twilio webhook URL
# Console → Phone Numbers → Your Number → Voice Webhook

# 2. Test webhook directly
curl -X POST https://ai-gatekeeper-xxxxx-uc.a.run.app/api/telephony/incoming \
  -d "CallSid=CA_test&From=+15551234567&To=+15559876543"

# 3. Check ElevenLabs agent is configured
```

---

## 📊 Step 8: Verify Metrics

### Cloud Run Metrics

```bash
# Open Cloud Run console
open https://console.cloud.google.com/run/detail/us-central1/ai-gatekeeper

# Check:
# - Request count (should be > 0)
# - Latency (should be < 500ms)
# - Error rate (should be < 1%)
# - Container instances (auto-scaling working)
```

### Test Load

```bash
# Simple load test (10 concurrent requests)
for i in {1..10}; do
  curl -s https://ai-gatekeeper-xxxxx-uc.a.run.app/health &
done
wait

# All should return 200
```

---

## 🎯 Success Criteria

After deployment, you should have:

- [ ] ✅ Backend live at https://ai-gatekeeper-xxxxx-uc.a.run.app
- [ ] ✅ Frontend live at https://ai-gatekeeper.vercel.app
- [ ] ✅ Health endpoint returns 200
- [ ] ✅ Welcome flow works (4 screens)
- [ ] ✅ Dashboard loads
- [ ] ✅ Twilio calls connect to AI
- [ ] ✅ Scam detection working
- [ ] ✅ Logs show no errors

---

## 💰 Cost Estimate

### Google Cloud Run (Free Tier)
- 2M requests/month free
- 360,000 GB-seconds free
- **Estimated**: $0-10/month for hackathon

### Vercel (Hobby Tier)
- Unlimited bandwidth
- 100 GB-hours
- **Free** for personal projects

### ElevenLabs
- Pay per character
- **Estimated**: $5-20/month (depending on call volume)

### Supabase (Free Tier)
- 500MB database
- 50,000 monthly active users
- **Free** for development

**Total**: ~$5-30/month for MVP

---

## 🔄 Updates & Redeployment

### Update Backend

```bash
cd backend

# Make changes
# Then redeploy
gcloud run deploy ai-gatekeeper --source . --region us-central1

# Or use Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

### Update Frontend

```bash
cd frontend

# Make changes
# Then redeploy
vercel --prod

# Or let GitHub integration auto-deploy
```

---

## 📝 Post-Deployment Checklist

- [ ] Update README with live URLs
- [ ] Test complete user flow
- [ ] Configure monitoring alerts
- [ ] Set up backup strategy (Supabase)
- [ ] Document API endpoints
- [ ] Create demo video with live system
- [ ] Submit to hackathon with live demo URL

---

## 🏆 You're Live!

**Backend**: https://ai-gatekeeper-xxxxx-uc.a.run.app
**Frontend**: https://ai-gatekeeper.vercel.app

**Next**: Record demo video showing the LIVE system working!

---

**Questions? Check logs first:**
```bash
# Backend
gcloud run services logs tail ai-gatekeeper --region us-central1

# Frontend
vercel logs
```
