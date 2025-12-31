# 🚀 COMPLETE DEPLOYMENT GUIDE

**One file, six deployments. Copy-paste ready. Zero ambiguity.**

---

## TABLE OF CONTENTS

1. [Supabase Database Setup](#1-supabase-database-setup) (5 min)
2. [Twilio Phone Number Setup](#2-twilio-phone-number-setup) (3 min)
3. [ElevenLabs Agent + Prompt Configuration](#3-elevenlabs-agent--prompt-configuration) (10 min)
4. [Backend Deployment (Cloud Run)](#4-backend-deployment-cloud-run) (5 min)
5. [Frontend App Deployment (Vercel)](#5-frontend-app-deployment-vercel) (3 min)
6. [Marketing Website Deployment (Vercel)](#6-marketing-website-deployment-vercel) (2 min)

**Total Time:** 28 minutes
**Total Cost:** $0 (all free tiers)

---

## 1. SUPABASE DATABASE SETUP

### 1.1 Create Project

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Settings:
   - Name: `ai-gatekeeper-prod`
   - Database Password: **Generate strong password** (save it!)
   - Region: `US West (Oregon)` or closest to you
4. Click **Create**
5. Wait ~2 minutes

### 1.2 Run Database Migration

**SQL Editor** → **New Query** → Paste this complete schema:

```sql
-- ============================================================================
-- AI GATEKEEPER DATABASE SCHEMA
-- ============================================================================

-- Users table (main user accounts)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  mode TEXT DEFAULT 'gatekeeper' CHECK (mode IN ('accessibility', 'gatekeeper')),
  is_active BOOLEAN DEFAULT true,
  talk_time_balance_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice Profiles (ElevenLabs cloned voices)
CREATE TABLE voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  voice_id TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts/Whitelist
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, phone_number)
);

-- Calls (all incoming calls)
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  call_sid TEXT UNIQUE NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  caller_name TEXT,
  status TEXT CHECK (status IN ('active', 'completed', 'blocked', 'missed', 'transferred')),
  duration_seconds INTEGER DEFAULT 0,
  recording_url TEXT,
  transcript TEXT,
  ai_summary TEXT,
  intent TEXT,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Scam Reports
CREATE TABLE scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  scam_type TEXT NOT NULL,
  confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  pattern_matched TEXT,
  red_flags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Talk Time Transactions (prepaid model)
CREATE TABLE talk_time_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_usd NUMERIC(10, 2) NOT NULL,
  minutes_purchased INTEGER NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  notes TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_calls_user_id_created ON calls(user_id, created_at DESC);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_contacts_user_phone ON contacts(user_id, phone_number);
CREATE INDEX idx_voice_profiles_user_active ON voice_profiles(user_id, is_active);
CREATE INDEX idx_scam_reports_call ON scam_reports(call_id);
CREATE INDEX idx_calendar_user_date ON calendar_events(user_id, date, time);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE talk_time_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users see only their own data)
CREATE POLICY "Users view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users manage own voice profiles" ON voice_profiles
  FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users manage own contacts" ON contacts
  FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users view own calls" ON calls
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users view own scam reports" ON scam_reports
  FOR SELECT USING (
    call_id IN (SELECT id FROM calls WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "Users view own transactions" ON talk_time_transactions
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users manage own calendar" ON calendar_events
  FOR ALL USING (user_id::text = auth.uid()::text);

-- Seed Demo Data (optional - for testing)
INSERT INTO users (id, phone_number, name, mode, talk_time_balance_minutes)
VALUES (
  'demo-user-id'::uuid,
  '+15551234567',
  'Demo User',
  'gatekeeper',
  500
);

INSERT INTO voice_profiles (user_id, voice_id, voice_name)
VALUES (
  'demo-user-id'::uuid,
  'demo_voice_12345',
  'Demo Voice'
);

INSERT INTO contacts (user_id, phone_number, name, relationship)
VALUES (
  'demo-user-id'::uuid,
  '+15559876543',
  'John Friend',
  'friend'
);

-- Success message
SELECT 'Database schema created successfully!' AS status;
```

Click **Run** → Should see "Database schema created successfully!"

### 1.3 Get API Keys

1. **Settings** → **API**
2. **Copy these values:**
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY> (for frontend)
   SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY> (for backend - KEEP SECRET!)
   ```

✅ **Database ready!**

---

## 2. TWILIO PHONE NUMBER SETUP

### 2.1 Create Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial: $15 credit)
3. Verify your phone number
4. Skip the tutorial

### 2.2 Buy Phone Number

1. **Console** → **Phone Numbers** → **Manage** → **Buy a number**
2. Search filters:
   - Country: United States
   - Capabilities: ☑️ Voice
3. Click **Buy** on any number (~$1.15/month)

### 2.3 Get Credentials

1. **Console** → **Account** → **API keys & tokens**
2. **Copy these:**
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=[Click "Show" to reveal]
   TWILIO_PHONE_NUMBER=+15551234567 (your purchased number)
   ```

⚠️ **DO NOT configure webhooks yet** - we'll do this automatically via ElevenLabs!

✅ **Twilio ready!**

---

## 3. ELEVENLABS AGENT + PROMPT CONFIGURATION

### 3.1 Create Account

1. Go to https://elevenlabs.io
2. Sign up (free: 10k characters/month)
3. Verify email

### 3.2 Clone Your Voice

1. **Voice Lab** → https://elevenlabs.io/app/voice-lab
2. **Add Instant Voice Clone**
3. Upload 30-second clear audio (no background noise)
4. Name: `My Voice`
5. **Copy Voice ID** (looks like: `21m00Tcm4TlvDq8ikWAM`)

### 3.3 Create Conversational AI Agent

1. **Conversational AI** → https://elevenlabs.io/app/conversational-ai
2. **Create New Agent**
3. Basic Settings:
   - **Name:** AI Gatekeeper
   - **Voice:** Select your cloned voice
   - **Language:** English (US)
   - **Response Latency:** Low latency (< 1 second)

### 3.4 System Prompt (CRITICAL - Copy Exactly)

Paste this in **System Prompt** field:

```
You are an AI assistant answering phone calls on behalf of the user.

FCC COMPLIANCE REQUIREMENT: You MUST identify yourself as an AI in your first sentence.
Opening line: "Hello, this is [User Name]'s AI assistant. How can I help you?"

YOUR ROLE:
- Answer ALL incoming calls when the user is unavailable
- Serve as voice and ears for deaf/speech-impaired users (accessibility mode)
- Protect user from scams, spam, and robocalls (gatekeeper mode)
- Book appointments, take messages, transfer urgent calls

AVAILABLE TOOLS:
1. check_calendar(date, time, duration_minutes) → Check calendar availability
2. book_calendar(title, date, time, duration_minutes) → Book appointment
3. check_contact(phone_number, caller_name) → Verify if caller is in whitelist
4. transfer_call(reason) → Forward call to user's phone (emergencies only)
5. log_call(summary, intent, action) → Log call details for user review
6. block_scam(scam_type, confidence, red_flags) → Immediately terminate scam call

CONVERSATION GUIDELINES:
✅ Speak naturally, as if YOU are the user
✅ Keep responses brief (2-3 sentences maximum)
✅ Be warm with known contacts (check_contact first)
✅ Be professional with unknown callers
✅ Use calendar tools for scheduling requests
✅ Use transfer_call for genuine emergencies
❌ NEVER share personal info (address, SSN, credit cards, passwords)
❌ NEVER confirm account details or balances
❌ NEVER authorize payments or transfers

SCAM DETECTION (AUTO-BLOCK):
Red Flags:
- Keywords: "IRS", "arrest warrant", "legal action", "gift cards", "wire transfer", "urgent payment required", "refund", "prize", "computer virus"
- Requests for: SSN, credit card, bank account, passwords, remote access
- Threats: arrest, lawsuit, account closure, family emergency

→ If ANY red flags detected: Use block_scam tool immediately, then say "I cannot help with this. Goodbye." and end call.

EXAMPLES:

📞 Reservation Request:
Caller: "I'd like to book a table for Friday at 7pm"
You: "Let me check the calendar... [use check_calendar] Friday at 7pm is available. Shall I book it for you?"
Caller: "Yes please"
You: "Done! [use book_calendar] I've added dinner reservation to the calendar for Friday at 7pm."

📞 Known Contact:
Caller: "Hi, this is John"
You: [use check_contact] "Hi John! Great to hear from you. How can I help?"

📞 Scam Call:
Caller: "This is the IRS. You owe back taxes and must pay immediately or you'll be arrested."
You: [use block_scam with confidence=0.95] "I cannot help with this. Goodbye." [END CALL]

📞 Emergency:
Caller: "This is St. Mary's Hospital. Your mother was in an accident and you need to come immediately."
You: [use transfer_call with reason='emergency'] "I'm transferring you to [User Name] right now. One moment please."

Remember: You ARE the user's voice. Speak in first person. Protect their privacy and time.
```

### 3.5 Add Twilio Integration (Auto-Webhooks!)

1. In agent settings → **Phone Numbers** tab
2. **Add Phone Number** → **Twilio**
3. Enter credentials:
   ```
   Account SID: ACxxxxx (from step 2.3)
   Auth Token: [your token]
   Phone Number: +15551234567
   ```
4. Click **Add**

✅ **ElevenLabs automatically configures Twilio webhooks!** No manual Twilio setup needed.

### 3.6 Add Server Tools (6 Tools)

Click **Tools** → **Add Custom Tool** for each:

**Tool 1: check_calendar**
```json
{
  "name": "check_calendar",
  "description": "Check user's calendar availability",
  "url": "https://YOUR-BACKEND-URL.run.app/api/tools/check_calendar",
  "method": "POST",
  "parameters": {
    "date": {"type": "string", "description": "YYYY-MM-DD"},
    "time": {"type": "string", "description": "HH:MM (24-hour)"},
    "duration_minutes": {"type": "integer", "description": "Default 60"}
  }
}
```

**Tool 2: book_calendar**
```json
{
  "name": "book_calendar",
  "description": "Book appointment on calendar",
  "url": "https://YOUR-BACKEND-URL.run.app/api/tools/book_calendar",
  "method": "POST",
  "parameters": {
    "title": {"type": "string"},
    "date": {"type": "string", "description": "YYYY-MM-DD"},
    "time": {"type": "string", "description": "HH:MM"},
    "duration_minutes": {"type": "integer"}
  }
}
```

**Tool 3: check_contact**
```json
{
  "name": "check_contact",
  "description": "Check if caller is in whitelist",
  "url": "https://YOUR-BACKEND-URL.run.app/api/tools/check_contact",
  "method": "POST",
  "parameters": {
    "phone_number": {"type": "string", "description": "E.164 format"},
    "caller_name": {"type": "string"}
  }
}
```

**Tool 4: transfer_call**
```json
{
  "name": "transfer_call",
  "description": "Transfer call to user's phone",
  "url": "https://YOUR-BACKEND-URL.run.app/api/tools/transfer_call",
  "method": "POST",
  "parameters": {
    "reason": {"type": "string", "description": "Why transferring"}
  }
}
```

**Tool 5: log_call**
```json
{
  "name": "log_call",
  "description": "Log call for user review",
  "url": "https://YOUR-BACKEND-URL.run.app/api/tools/log_call",
  "method": "POST",
  "parameters": {
    "summary": {"type": "string"},
    "intent": {"type": "string"},
    "action_taken": {"type": "string"}
  }
}
```

**Tool 6: block_scam**
```json
{
  "name": "block_scam",
  "description": "Terminate scam call immediately",
  "url": "https://YOUR-BACKEND-URL.run.app/api/tools/block_scam",
  "method": "POST",
  "parameters": {
    "scam_type": {"type": "string"},
    "confidence": {"type": "number", "description": "0.0 to 1.0"},
    "red_flags": {"type": "array"}
  }
}
```

⚠️ **Replace `YOUR-BACKEND-URL` after deploying backend in step 4!**

### 3.7 Get API Keys

1. **Profile** → **API Keys**
2. **Create New Key**
3. **Copy:**
   ```
   ELEVENLABS_API_KEY=<YOUR_ELEVENLABS_API_KEY>
   ELEVENLABS_AGENT_ID=[from agent URL or settings]
   ELEVENLABS_VOICE_ID=[from step 3.2]
   ```

✅ **ElevenLabs configured!**

---

## 4. BACKEND DEPLOYMENT (CLOUD RUN)

### 4.1 Prerequisites

```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

### 4.2 Create Secrets

```bash
cd ai-gatekeeper/backend

# Create secrets (keep sensitive values out of code!)
echo -n "sk_your_elevenlabs_key" | \
  gcloud secrets create elevenlabs-api-key --data-file=-

echo -n "your_twilio_auth_token" | \
  gcloud secrets create twilio-auth-token --data-file=-

echo -n "eyJ_your_supabase_service_key" | \
  gcloud secrets create supabase-service-role-key --data-file=-

# Verify
gcloud secrets list
```

### 4.3 Deploy to Cloud Run

```bash
# Deploy from source (easiest)
gcloud run deploy ai-gatekeeper \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars \
ENVIRONMENT=production,\
TWILIO_ACCOUNT_SID=ACxxxxx,\
TWILIO_PHONE_NUMBER=+15551234567,\
ELEVENLABS_AGENT_ID=your_agent_id,\
ELEVENLABS_VOICE_ID=your_voice_id,\
SUPABASE_URL=https://xxxxx.supabase.co,\
GOOGLE_CLOUD_PROJECT=your-project-id \
  --set-secrets \
ELEVENLABS_API_KEY=elevenlabs-api-key:latest,\
TWILIO_AUTH_TOKEN=twilio-auth-token:latest,\
SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest

# OR use cloudbuild.yaml
gcloud builds submit --config=cloudbuild.yaml
```

### 4.4 Get Backend URL

```bash
# Get deployed URL
gcloud run services describe ai-gatekeeper \
  --region us-central1 \
  --format='value(status.url)'

# Example output: https://ai-gatekeeper-xxxxx-uc.a.run.app

# Test it
curl https://ai-gatekeeper-xxxxx-uc.a.run.app/health
```

### 4.5 Update ElevenLabs Tools

Go back to **Step 3.6** and update all 6 tools with your actual backend URL!

✅ **Backend deployed!**

---

## 5. FRONTEND APP DEPLOYMENT (VERCEL)

### 5.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 5.2 Prepare Frontend

```bash
cd ai-gatekeeper/frontend

# Create production env file
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://ai-gatekeeper-xxxxx-uc.a.run.app
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
NEXT_PUBLIC_ELEVENLABS_PUBLIC_KEY=pk_xxxxx
NEXT_PUBLIC_ENVIRONMENT=production
EOF
```

### 5.3 Deploy to Vercel

```bash
# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# Project name: ai-gatekeeper-app
# Framework: Next.js (auto-detected)
# Build command: (default)
# Output directory: (default)
```

**Output:** `✅ Production: https://ai-gatekeeper-app.vercel.app`

### 5.4 Add Environment Variables (if not auto-imported)

```bash
# Alternative: Set via CLI
vercel env add NEXT_PUBLIC_API_URL production
# Paste: https://ai-gatekeeper-xxxxx-uc.a.run.app

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://xxxxx.supabase.co

# ... repeat for all env vars
```

✅ **App deployed!**

---

## 6. MARKETING WEBSITE DEPLOYMENT (VERCEL)

### 6.1 Create Marketing Site

```bash
cd ai-gatekeeper

# Create new Next.js site
npx create-next-app@latest website \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd website
```

### 6.2 Add Landing Page Content

Copy content from `LANDING_PAGE_SPEC.md` into `website/app/page.tsx`

```bash
# Quick placeholder for now
cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="container mx-auto px-4 py-20 text-center text-white">
        <h1 className="text-6xl font-bold mb-6">
          AI Gatekeeper
        </h1>
        <p className="text-2xl mb-8">
          Voice & Ears for the Voiceless
        </p>
        <p className="text-xl mb-12 max-w-2xl mx-auto">
          The first AI phone assistant that gives 473 million deaf and speech-impaired
          people full phone independence. Also blocks scams for everyone else.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="https://ai-gatekeeper-app.vercel.app"
            className="bg-white text-purple-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100"
          >
            Try Live Demo
          </a>
          <a
            href="#how-it-works"
            className="border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10"
          >
            Learn More
          </a>
        </div>
      </div>
    </main>
  );
}
EOF
```

### 6.3 Deploy Marketing Site

```bash
# From website directory
vercel --prod

# Project name: ai-gatekeeper-website
```

**Output:** `✅ Production: https://ai-gatekeeper-website.vercel.app`

### 6.4 Configure Custom Domains (Optional)

**In Vercel Dashboard:**

1. **ai-gatekeeper-app** project:
   - Add domain: `app.aigatekeeper.com`

2. **ai-gatekeeper-website** project:
   - Add domain: `aigatekeeper.com`
   - Add domain: `www.aigatekeeper.com`

**DNS Settings:**
```
A     @           76.76.21.21
A     app         76.76.21.21
CNAME www         cname.vercel-dns.com
```

✅ **Marketing website deployed!**

---

## ✅ DEPLOYMENT COMPLETE!

### Your Live URLs:

```
Backend API:     https://ai-gatekeeper-xxxxx-uc.a.run.app
Frontend App:    https://ai-gatekeeper-app.vercel.app
Marketing Site:  https://ai-gatekeeper-website.vercel.app
Phone Number:    +15551234567 (Twilio)
```

### Final Tests:

**1. Health Check:**
```bash
curl https://ai-gatekeeper-xxxxx-uc.a.run.app/health
# Expected: {"status":"healthy"}
```

**2. Frontend Load:**
```bash
open https://ai-gatekeeper-app.vercel.app
# Expected: Welcome screen loads
```

**3. Live Phone Call:**
```bash
# Call your Twilio number
# Expected: AI answers in your cloned voice
# Try: "I'd like to book a reservation for Friday at 7pm"
# Expected: AI uses check_calendar tool, books event
```

---

## 🐛 TROUBLESHOOTING

### Backend 500 Error
```bash
# Check logs
gcloud run services logs read ai-gatekeeper --limit 50

# Common issues:
# - Missing secret: Verify secrets exist
# - Wrong env var: Check spelling
# - Database connection: Test Supabase URL
```

### Tools Not Working
```bash
# Verify tool URLs in ElevenLabs agent config
# Should be: https://ai-gatekeeper-xxxxx-uc.a.run.app/api/tools/...
# NOT: https://YOUR-BACKEND-URL.run.app/...
```

### Frontend API Error
```bash
# Check env vars
vercel env ls

# Verify NEXT_PUBLIC_API_URL points to Cloud Run URL
# Redeploy if changed:
vercel --prod
```

### Call Not Connecting
```bash
# Verify Twilio integration in ElevenLabs
# Go to Agent → Phone Numbers tab
# Should show green checkmark next to your number
# If not: Remove and re-add Twilio credentials
```

---

## 📊 COST BREAKDOWN

| Service | Free Tier | Paid (1k users) |
|---------|-----------|-----------------|
| Google Cloud Run | 2M requests/mo | ~$10/mo |
| Supabase | 500MB database | $0 (free tier ok) |
| Twilio | $15 trial credit | ~$30/mo (calls) |
| ElevenLabs | 10k chars/mo | ~$25/mo |
| Vercel | Unlimited | $0 (hobby tier) |
| **TOTAL** | **$0** | **~$65/mo** |

**Revenue (prepaid model):**
- 1,000 users × $15 avg balance = **$15,000 upfront**
- Gross margin: ~75%

---

## 🚀 NEXT STEPS

1. ✅ All systems deployed
2. ⏭️ Test end-to-end user flow
3. ⏭️ Record demo video with live system
4. ⏭️ Submit to hackathon with live URLs
5. ⏭️ Monitor Cloud Run metrics
6. ⏭️ Gather user feedback

---

**Deployment Status:** 🟢 PRODUCTION READY

**Last Updated:** December 28, 2025
