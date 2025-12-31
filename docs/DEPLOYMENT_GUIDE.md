# AI Gatekeeper: Complete Deployment Guide
**From Zero to Production in 30 Minutes**

---

## Prerequisites

Before starting, create accounts and get API keys:

1. **Google Cloud** (https://console.cloud.google.com)
   - Create new project: `ai-gatekeeper-prod`
   - Enable APIs: Vertex AI, Cloud Run, Cloud Build, Secret Manager
   - Create service account with Vertex AI permissions
   - Download JSON key file

2. **Twilio** (https://console.twilio.com)
   - Purchase phone number (+1 US number ~$1/month)
   - Get Account SID and Auth Token
   - Note: Will configure webhooks after deployment

3. **ElevenLabs** (https://elevenlabs.io)
   - Sign up for Professional plan ($99/month for voice cloning)
   - Clone your voice (30-second audio sample + verification)
   - Create Conversational AI agent
   - Get API key, agent ID, and voice ID

4. **Supabase** (https://supabase.com)
   - Create new project
   - Run database schema (provided in `backend/database/schema.sql`)
   - Get URL, service role key, anon key

5. **Domain/SSL** (Optional but recommended)
   - Register domain or use Cloud Run default URL
   - Twilio requires HTTPS for webhooks

---

## Deployment Steps

### Step 1: Clone Repository

```bash
git clone https://github.com/vigneshbarani24/Storytopia
cd Storytopia/ai-gatekeeper/backend
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp ../.env.example .env

# Edit .env with your API keys
nano .env
```

**Critical variables to set**:
```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx  # From Twilio Console
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+15551234567  # Your purchased number

# ElevenLabs
ELEVENLABS_API_KEY=<YOUR_ELEVENLABS_API_KEY>
ELEVENLABS_AGENT_ID=xxxxx  # From Conversational AI dashboard
ELEVENLABS_VOICE_ID=xxxxx  # Your cloned voice ID

# Google Cloud
GOOGLE_CLOUD_PROJECT=ai-gatekeeper-prod
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json  # Downloaded JSON key

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# User
USER_NAME=Your Name  # Used in AI greeting
```

### Step 3: Initialize Supabase Database

```bash
# Open Supabase SQL Editor
# https://app.supabase.com/project/YOUR_PROJECT/sql

# Copy and run the schema from backend/database/schema.sql
# This creates all tables, indexes, RLS policies, and seed data
```

**Verify**:
- Check "Database" → "Tables" in Supabase dashboard
- Should see: users, contacts, calls, call_transcripts, scam_reports, call_analytics

### Step 4: Deploy to Google Cloud Run

**Option A: Automated (Cloud Build)**

```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud config set project ai-gatekeeper-prod

# Submit build
gcloud builds submit --config=cloudbuild.yaml

# Wait 5-10 minutes for build + deploy
# Cloud Build automatically builds Docker image and deploys to Cloud Run
```

**Option B: Manual (Docker + gcloud run deploy)**

```bash
# Build Docker image
docker build -t gcr.io/ai-gatekeeper-prod/ai-gatekeeper:latest .

# Push to Container Registry
docker push gcr.io/ai-gatekeeper-prod/ai-gatekeeper:latest

# Deploy to Cloud Run
gcloud run deploy ai-gatekeeper \
  --image gcr.io/ai-gatekeeper-prod/ai-gatekeeper:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 1000 \
  --memory 8Gi \
  --cpu 4 \
  --timeout 3600 \
  --concurrency 10 \
  --set-env-vars-file .env
```

**Get Cloud Run URL**:
```bash
gcloud run services describe ai-gatekeeper \
  --region us-central1 \
  --format 'value(status.url)'

# Example output: https://ai-gatekeeper-xxxxx-uc.a.run.app
```

### Step 5: Configure Twilio Webhooks

1. **Open Twilio Console**: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. **Select your phone number**
3. **Under "Voice & Fax"**:
   - **Webhook URL**: `https://ai-gatekeeper-xxxxx-uc.a.run.app/webhooks/twilio/voice`
   - **HTTP Method**: POST
   - **Call Status Callback**: `https://ai-gatekeeper-xxxxx-uc.a.run.app/webhooks/twilio/status`

4. **Save**

**Update .env on Cloud Run**:
```bash
# Update TWILIO_STREAM_URL to match your Cloud Run URL
# In .env:
TWILIO_STREAM_URL=wss://ai-gatekeeper-xxxxx-uc.a.run.app/streams/audio

# Redeploy with updated env
gcloud run services update ai-gatekeeper \
  --region us-central1 \
  --update-env-vars TWILIO_STREAM_URL=wss://ai-gatekeeper-xxxxx-uc.a.run.app/streams/audio
```

### Step 6: Configure ElevenLabs Agent

1. **Open ElevenLabs Dashboard**: https://elevenlabs.io/app/conversational-ai
2. **Create or edit your agent**
3. **Set System Prompt**:

```
You are an AI assistant screening calls for [YOUR NAME].

Rules:
1. First sentence MUST be: "Hello, this is [YOUR NAME]'s AI assistant. How can I help you?"
2. If caller is selling something → Politely decline: "Thank you, but [NAME] isn't interested."
3. If caller mentions IRS, warrant, legal action → Flag as scam, say: "I can't help with that. Goodbye."
4. If caller is a friend → Ask their name, say: "Let me connect you to [NAME]."
5. Keep responses short (1-2 sentences max).
```

4. **Configure Voice**:
   - Select your cloned voice
   - Model: Turbo v2.5 (lowest latency)
   - Stability: 0.5
   - Similarity: 0.75

5. **Add Server Tools** (optional, for calendar integration):
   - Webhook URL: `https://ai-gatekeeper-xxxxx-uc.a.run.app/webhooks/elevenlabs/tools`

### Step 7: Test the System

**Test 1: Call Your Twilio Number**

```bash
# Call from your personal phone
# You should hear: "Hello, this is [YOUR NAME]'s AI assistant..."
```

**Expected flow**:
1. AI greets you
2. You say: "Hi, this is [Your Name]"
3. AI should recognize you're testing and respond naturally

**Test 2: Check Logs**

```bash
# View Cloud Run logs
gcloud run services logs read ai-gatekeeper \
  --region us-central1 \
  --limit 50

# Look for:
# ✅ "Incoming call: +1... → +1..."
# ✅ "Twilio WebSocket connected"
# ✅ "ElevenLabs connected, screening started"
```

**Test 3: Check Database**

```bash
# Open Supabase dashboard → Table Editor → calls
# Should see your test call with:
# - caller_number: Your phone
# - status: "ended"
# - transcript: Conversation text
```

---

## Troubleshooting

### Issue: "Cannot connect to WebSocket"

**Cause**: Cloud Run URL not set correctly in Twilio

**Fix**:
1. Verify webhook URL matches Cloud Run URL exactly
2. Check Cloud Run is deployed and running: `gcloud run services list`
3. Test endpoint manually: `curl https://YOUR-CLOUD-RUN-URL/health`

### Issue: "No audio from AI"

**Cause**: ElevenLabs connection failed

**Fix**:
1. Check ElevenLabs API key is valid
2. Verify agent ID and voice ID are correct
3. Check Cloud Run logs for ElevenLabs errors:
   ```bash
   gcloud run services logs read ai-gatekeeper --limit 100 | grep -i "elevenlabs"
   ```

### Issue: "Database errors"

**Cause**: Supabase credentials incorrect or schema not created

**Fix**:
1. Verify SUPABASE_SERVICE_ROLE_KEY (not anon key!)
2. Run schema.sql in Supabase SQL editor
3. Check RLS policies are created

### Issue: "Call connects but immediately hangs up"

**Cause**: Likely an exception in the code

**Fix**:
1. Check Cloud Run logs for Python exceptions
2. Verify all environment variables are set
3. Test locally first with ngrok (see Local Development section)

---

## Local Development (Optional)

For local testing without deploying to Cloud Run:

**Step 1: Install ngrok** (for Twilio webhooks)

```bash
# Download from https://ngrok.com
# Or install via package manager:
brew install ngrok  # macOS
# OR
snap install ngrok  # Linux
```

**Step 2: Start Backend Locally**

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI
uvicorn app.main:app --reload --port 8000
```

**Step 3: Expose with ngrok**

```bash
# In another terminal
ngrok http 8000

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Step 4: Configure Twilio**

- Set webhook URL to: `https://abc123.ngrok.io/webhooks/twilio/voice`
- Set WebSocket URL to: `wss://abc123.ngrok.io/streams/audio`

**Step 5: Test Locally**

Call your Twilio number. Logs appear in your terminal in real-time.

---

## Monitoring & Observability

### Cloud Run Metrics

```bash
# Open Google Cloud Console
# Navigate to: Cloud Run → ai-gatekeeper → Metrics

# Key metrics to watch:
# - Request count (calls/minute)
# - Request latency (should be <2s)
# - Instance count (should autoscale based on load)
# - Error rate (should be <1%)
```

### Logs

```bash
# Real-time logs
gcloud run services logs tail ai-gatekeeper --region us-central1

# Search for errors
gcloud run services logs read ai-gatekeeper \
  --limit 1000 \
  --format json | grep -i error

# Export to file
gcloud run services logs read ai-gatekeeper \
  --limit 5000 > logs.txt
```

### Alerts (Recommended)

Set up Cloud Monitoring alerts for:
- **Error rate >5%**: Indicates code issues
- **Latency >5 seconds**: Slow responses
- **No requests for 1 hour**: Service might be down

---

## Scaling & Performance

### Current Configuration

- **Min instances**: 1 (always warm, no cold starts)
- **Max instances**: 1000 (handles 10,000 concurrent calls)
- **Concurrency**: 10 calls per instance
- **Memory**: 8 GB per instance
- **CPU**: 4 vCPU per instance

### Cost Estimate

**Monthly cost for 100 calls/day**:

| Service | Usage | Cost |
|---------|-------|------|
| Cloud Run | ~3,000 calls/month | $15 |
| Twilio | 3,000 min @ $0.0085/min | $26 |
| ElevenLabs | 3,000 min @ $0.12/min | $360 |
| Supabase | 3,000 DB queries | $0 (free tier) |
| **Total** | | **~$400/month** |

**Optimization tips**:
- Use min instances = 0 in dev (saves $10/month but adds cold start latency)
- Compress audio for lower ElevenLabs costs
- Cache frequent queries in Redis

---

## Security Checklist

Before going to production:

- [ ] Enable HTTPS only (Cloud Run does this by default)
- [ ] Validate Twilio signatures on webhooks
- [ ] Validate ElevenLabs signatures on tool calls
- [ ] Enable Supabase Row-Level Security (RLS)
- [ ] Rotate API keys regularly
- [ ] Set up Cloud Armor for DDoS protection
- [ ] Enable Cloud Run authentication (if not using public webhooks)
- [ ] Configure CORS origins to only allow your frontend
- [ ] Set up Secret Manager for sensitive env vars (instead of .env)
- [ ] Enable audit logging

---

## Next Steps

1. **Test thoroughly**: Call from multiple numbers, test scam scenarios
2. **Add contacts**: Import whitelist from Google Contacts
3. **Monitor for a week**: Watch logs, fix any edge cases
4. **Iterate on prompts**: Refine AI behavior based on real calls
5. **Add features**: Calendar integration, SMS notifications, etc.

---

## Support

**Issues**: Open GitHub issue at https://github.com/vigneshbarani24/Storytopia/issues

**Logs**: Always include Cloud Run logs when reporting bugs

**Community**: Join Discord (link TBD)

---

**Congratulations!** 🎉

You now have a production-ready AI call screening system powered by Google Cloud, ElevenLabs, and Twilio.

**Test it**: Call your Twilio number and experience AI answering in YOUR voice!
