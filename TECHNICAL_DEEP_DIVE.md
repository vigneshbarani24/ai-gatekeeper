# 🔧 AI Gatekeeper - Technical Architecture Deep Dive

**How Everything Actually Connects**

---

## 🎯 The Real Architecture (No BS)

### **The Flow: Phone Call → Twilio → FastAPI → ElevenLabs + Gemini → Decision**

```
┌─────────────┐
│ Caller      │
│ (Phone)     │
└──────┬──────┘
       │
       │ 1. Incoming call
       ▼
┌─────────────────┐
│ Twilio          │ ← Your Twilio phone number
│ Media Streams   │
└──────┬──────────┘
       │
       │ 2. WebSocket (bidirectional audio)
       │    ws://your-server.com/streams/audio
       ▼
┌─────────────────────────────────────┐
│ FastAPI Backend                     │
│ (/home/user/Storytopia/ai-gatekeeper/backend)
│                                     │
│  ┌─────────────────────────────┐  │
│  │ CallSession                 │  │
│  │ (telephony.py)              │  │
│  │                             │  │
│  │ • Twilio WS ←──┬──→ ElevenLabs WS
│  │ • Audio bridge │              │
│  │ • State mgmt   │              │
│  └────────┬───────┴──────────────┘
│           │                         │
│           │ 3. Process call         │
│           ▼                         │
│  ┌──────────────────────┐          │
│  │ Google ADK           │          │
│  │ Orchestrator         │          │
│  │                      │          │
│  │ • Whitelist check ──→ Supabase │
│  │ • Parallel analysis  │          │
│  │   ├─ Scam (Gemini)  │          │
│  │   └─ Intent (Gemini)│          │
│  │ • Decision agent     │          │
│  └──────────────────────┘          │
└─────────────────────────────────────┘
```

---

## 1️⃣ **ElevenLabs SDK Integration**

### **What It Actually Does**

**ElevenLabs Conversational AI** = All-in-one voice agent:
- **STT** (Speech-to-Text) - Transcribes caller's speech
- **LLM** (GPT-4 or Gemini) - Understands and responds
- **TTS** (Text-to-Speech) - Speaks back in cloned voice

**WebSocket Connection**: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id={agent_id}`

### **File**: `backend/app/services/elevenlabs_service.py`

```python
class ElevenLabsService:
    async def connect(self, on_audio, on_transcript, on_interruption):
        """
        Connect to ElevenLabs Conversational AI via WebSocket

        Headers:
          xi-api-key: {ELEVENLABS_API_KEY}

        Query params:
          agent_id: {ELEVENLABS_AGENT_ID}  # Created in ElevenLabs dashboard
        """
        url = f"{self.websocket_url}?agent_id={self.agent_id}"

        self.connection = await websockets.connect(
            url,
            extra_headers={"xi-api-key": self.api_key},
            ping_interval=20,
        )

        # Listen for messages
        asyncio.create_task(self._listen_loop(on_audio, on_transcript))

    async def send_audio(self, audio_bytes: bytes):
        """Send caller's audio to ElevenLabs"""
        message = {
            "type": "audio",
            "audio": base64.b64encode(audio_bytes).decode()
        }
        await self.connection.send(json.dumps(message))

    async def _listen_loop(self, on_audio, on_transcript):
        """Listen for AI responses"""
        async for message in self.connection:
            data = json.loads(message)

            if data["type"] == "audio":
                # AI spoke - send to caller via Twilio
                audio_bytes = base64.b64decode(data["audio"])
                on_audio(audio_bytes)

            elif data["type"] == "transcript":
                # Update transcript
                on_transcript(data["text"])
```

### **How It Connects to Twilio**

**File**: `backend/app/routers/telephony.py`

```python
class CallSession:
    async def handle_twilio_websocket(self, websocket: WebSocket):
        """
        Bridge: Twilio WebSocket ↔ ElevenLabs WebSocket
        """
        await websocket.accept()  # Accept Twilio connection

        # Connect to ElevenLabs
        await self.elevenlabs_service.connect(
            on_audio=self._on_elevenlabs_audio,  # AI speaks → send to Twilio
            on_transcript=self._on_transcript,   # Update transcript
            on_interruption=lambda: None,        # Handle barge-in
        )

        # Listen for Twilio messages
        async for message in websocket.iter_text():
            data = json.loads(message)

            if data["event"] == "media":
                # Caller spoke - decode audio
                audio_payload = data["media"]["payload"]  # Base64 mu-law
                pcm_audio = twilio_service.decode_mulaw_audio(audio_payload)

                # Send to ElevenLabs
                await self.elevenlabs_service.send_audio(pcm_audio)

    def _on_elevenlabs_audio(self, audio_bytes: bytes):
        """Callback: AI spoke, send to caller"""
        # Encode as mu-law
        mulaw_audio = twilio_service.encode_mulaw_audio(audio_bytes)

        # Send to Twilio WebSocket
        message = {
            "event": "media",
            "streamSid": self.stream_sid,
            "media": {
                "payload": base64.b64encode(mulaw_audio).decode()
            }
        }
        await self.twilio_ws.send_text(json.dumps(message))
```

**Audio Pipeline**:
```
Caller speaks → Twilio (mu-law) → FastAPI decodes → ElevenLabs (PCM)
                                                          ↓
AI responds   ← Twilio (mu-law) ← FastAPI encodes ← ElevenLabs (PCM)
```

---

## 2️⃣ **Google ADK (Agent Development Kit)**

### **What "ADK" Actually Means**

**ADK** = Design pattern for multi-agent orchestration (from Google's examples)

**NOT** an SDK you `pip install`. It's a **pattern**:
- **Sequential**: One agent → next agent → final decision
- **Parallel**: Multiple agents run simultaneously (faster!)
- **Loop**: Retry until quality threshold met

### **File**: `backend/app/agents/orchestrator.py`

```python
class GatekeeperOrchestrator:
    """
    Google ADK-inspired orchestrator

    Pattern 1: Sequential (fast path)
      Check whitelist → If match, pass through immediately

    Pattern 2: Parallel (slow path)
      Scam detection (Gemini 1.5 Pro) ║ run in parallel
      Intent classification (Gemini 2.0 Flash) ║

    Pattern 3: Sequential (decision)
      Analysis → Decision agent → Action
    """

    async def process_call(self, context: CallContext):
        # Step 1: Fast path (sequential)
        contact = await self.check_whitelist(context)
        if contact:
            return {"action": "pass_through", "reason": "whitelisted"}

        # Step 2: Parallel analysis (faster!)
        analysis = await self.analyze_call_parallel(context)

        # Step 3: Decision (sequential)
        decision = await self.make_decision(analysis, context)
        return decision

    async def analyze_call_parallel(self, context):
        """Run scam + intent analysis in parallel"""
        tasks = [
            self._detect_scam(context),      # Gemini 1.5 Pro
            self._classify_intent(context),  # Gemini 2.0 Flash
        ]

        # Both run simultaneously!
        scam_analysis, intent_analysis = await asyncio.gather(*tasks)

        return {"scam": scam_analysis, "intent": intent_analysis}
```

### **How ADK Uses Gemini**

**File**: `backend/app/services/gemini_service.py`

```python
class GeminiService:
    def __init__(self):
        # Lazy initialization (prevents hanging!)
        self.fast_model = None      # Gemini 2.0 Flash
        self.analysis_model = None  # Gemini 1.5 Pro

    def _ensure_initialized(self):
        """Only import when needed (avoids 30s hang!)"""
        if not self._initialized:
            # Import HERE, not at module level
            from google.cloud import aiplatform
            from vertexai.generative_models import GenerativeModel

            aiplatform.init(
                project=settings.GOOGLE_CLOUD_PROJECT,
                location=settings.VERTEX_AI_LOCATION
            )

            self.fast_model = GenerativeModel("gemini-2.0-flash-exp")
            self.analysis_model = GenerativeModel("gemini-1.5-pro")
            self._initialized = True

    async def classify_caller_intent(self, transcript: str):
        """Fast intent classification"""
        self._ensure_initialized()  # Initialize on first call

        if not self.fast_model:
            # Demo mode fallback
            return {"intent": "unknown", "confidence": 0.5}

        response = self.fast_model.generate_content(
            f"Classify this call intent: {transcript}"
        )
        return json.loads(response.text)
```

**Why Lazy Loading?**
- `from google.cloud import aiplatform` hangs 30+ seconds without credentials
- Solution: Only import when `_ensure_initialized()` is called
- Server starts instantly, works in demo mode

---

## 3️⃣ **Supabase Integration**

### **What It Does**

**Supabase** = PostgreSQL database + real-time subscriptions

**Tables** (`backend/database/schema.sql`):
```sql
-- Users (who owns the AI Gatekeeper)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    phone_number TEXT UNIQUE,           -- User's personal phone
    twilio_phone_number TEXT UNIQUE,    -- AI Gatekeeper's phone number
    elevenlabs_voice_id TEXT,           -- Cloned voice ID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts (whitelist)
CREATE TABLE contacts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    phone_number TEXT NOT NULL,
    name TEXT,
    auto_pass BOOLEAN DEFAULT false,    -- Skip screening?
    UNIQUE(user_id, phone_number)
);

-- Calls (history)
CREATE TABLE calls (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    call_sid TEXT UNIQUE,               -- Twilio call ID
    caller_number TEXT,
    intent TEXT,                        -- "scam", "sales", "friend"
    scam_score FLOAT,
    action_taken TEXT,                  -- "blocked", "passed", "screened"
    duration INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transcripts (full text)
CREATE TABLE call_transcripts (
    id UUID PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    transcript TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scam reports
CREATE TABLE scam_reports (
    id UUID PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    scam_type TEXT,                     -- "irs", "tech_support", etc.
    red_flags TEXT[],
    confidence FLOAT
);

-- Analytics (dashboard)
CREATE TABLE call_analytics (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    date DATE,
    total_calls INT DEFAULT 0,
    scams_blocked INT DEFAULT 0,
    time_saved_minutes INT DEFAULT 0
);
```

### **How It Connects**

**File**: `backend/app/services/database.py`

```python
class DatabaseService:
    async def init(self):
        """Initialize Supabase client"""
        self.client = create_client(
            settings.SUPABASE_URL,              # https://xxxxx.supabase.co
            settings.SUPABASE_SERVICE_ROLE_KEY  # Service role key (bypass RLS)
        )

    async def get_contact_by_phone(self, user_id: str, phone_number: str):
        """Check whitelist"""
        response = (
            self.client
            .table("contacts")
            .select("*")
            .eq("user_id", user_id)
            .eq("phone_number", phone_number)
            .single()
            .execute()
        )
        return response.data  # None if not found

    async def create_call(self, user_id, caller_number, call_sid, intent, scam_score):
        """Log call to database"""
        response = (
            self.client
            .table("calls")
            .insert({
                "user_id": user_id,
                "caller_number": caller_number,
                "call_sid": call_sid,
                "intent": intent,
                "scam_score": scam_score,
            })
            .execute()
        )
        return response.data
```

### **Real-Time Updates (Frontend)**

**File**: `frontend/lib/api.ts`

```typescript
// Subscribe to new calls
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const subscription = supabase
  .channel('calls')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'calls'
  }, (payload) => {
    console.log('New call:', payload.new);
    // Update Voice Orb status
    setOrbStatus('active');
  })
  .subscribe();
```

---

## 4️⃣ **ElevenLabs Server Tools** (Advanced)

### **What Are Server Tools?**

**Server Tools** = Webhooks that ElevenLabs Conversational AI can call during a conversation.

**Example**: During story time, AI asks kid a question:
- Kid: "Why did the dragon help?"
- AI calls webhook: `POST /api/server-tools/answer-question`
- Webhook uses Gemini to generate educational answer
- Returns JSON → AI speaks the answer

### **How to Configure** (Not implemented yet, but here's how):

1. **Create tools in ElevenLabs Dashboard**:
   - Tool name: `check_calendar`
   - Webhook URL: `https://your-backend.com/api/server-tools/check-calendar`
   - Parameters: `{ "date": "2024-01-15", "time": "2pm" }`

2. **Implement webhook**:

```python
# backend/app/routers/server_tools.py

@router.post("/api/server-tools/check-calendar")
async def check_calendar(request: Request):
    """
    ElevenLabs calls this when user asks to schedule
    """
    data = await request.json()
    date = data.get("date")
    time = data.get("time")

    # Check Google Calendar
    is_free = await check_google_calendar(date, time)

    if is_free:
        # Create event
        await create_calendar_event(date, time)
        return {
            "message": f"Great! I've scheduled that for {date} at {time}.",
            "success": True
        }
    else:
        return {
            "message": f"Sorry, you're busy at {time}. How about 3pm?",
            "success": False
        }
```

3. **AI uses the tool**:
```
Caller: "Can you schedule a call for tomorrow at 2pm?"
AI: *calls webhook* → receives "you're busy"
AI: "Sorry, you're busy at 2pm. How about 3pm?"
```

### **Example Server Tools for AI Gatekeeper**

```python
# Tool 1: Transfer call to human
@router.post("/api/server-tools/transfer-call")
async def transfer_call(request: Request):
    data = await request.json()
    call_sid = data["call_sid"]

    # Transfer to user's real phone
    twilio_service.transfer_call(call_sid, settings.USER_PHONE_NUMBER)

    return {"message": "Transferring you now!"}

# Tool 2: Schedule callback
@router.post("/api/server-tools/schedule-callback")
async def schedule_callback(request: Request):
    data = await request.json()
    phone_number = data["phone_number"]
    time = data["requested_time"]

    # Create calendar event
    await create_callback_reminder(phone_number, time)

    return {
        "message": f"I'll call you back at {time}. Have a great day!",
        "success": True
    }

# Tool 3: Add to whitelist
@router.post("/api/server-tools/add-to-whitelist")
async def add_to_whitelist(request: Request):
    data = await request.json()
    caller_number = data["caller_number"]
    caller_name = data["caller_name"]

    # Add to Supabase
    await db_service.create_contact(
        user_id=data["user_id"],
        phone_number=caller_number,
        name=caller_name,
        auto_pass=True
    )

    return {
        "message": f"Added {caller_name} to your contacts!",
        "success": True
    }
```

---

## 📊 **Complete Call Flow**

```
1. Phone rings → Twilio receives call
   ↓
2. Twilio webhook: POST /api/telephony/incoming
   FastAPI returns TwiML: <Connect><Stream url="ws://..."/></Connect>
   ↓
3. Twilio opens WebSocket: ws://your-server.com/streams/audio
   ↓
4. CallSession starts:
   - Connects to ElevenLabs WebSocket
   - Checks whitelist (Supabase)
   ↓
5. Audio flows:
   Caller speaks → Twilio → FastAPI → ElevenLabs
   AI responds ← Twilio ← FastAPI ← ElevenLabs
   ↓
6. Parallel analysis (Google ADK):
   - Scam detection (Gemini 1.5 Pro)
   - Intent classification (Gemini 2.0 Flash)
   ↓
7. Decision agent:
   - Pass through (whitelisted / emergency)
   - Screen (ask questions)
   - Block (scam detected)
   ↓
8. Action taken:
   - If pass: Transfer call to user
   - If screen: Continue conversation
   - If block: "This number has been blocked. Goodbye."
   ↓
9. Save to Supabase:
   - Log call details
   - Update analytics
   - Real-time update frontend (Voice Orb)
```

---

## 🔑 **Environment Setup**

### **Backend `.env`**

```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx                     # From Twilio console
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+15551234567               # Your AI Gatekeeper's phone number

# ElevenLabs
ELEVENLABS_API_KEY=sk_xxxxx                    # From elevenlabs.io
ELEVENLABS_AGENT_ID=agent_xxxxx                # Create in ElevenLabs dashboard
ELEVENLABS_VOICE_ID=voice_xxxxx                # Clone your voice first

# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
VERTEX_AI_LOCATION=us-central1

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx            # Service role key
SUPABASE_ANON_KEY=eyJxxxxx                    # Anon key (for frontend)

# App
WEBHOOK_SECRET=generate_random_string          # For webhook signature validation
USER_NAME=Your Name                            # AI says "This is {USER_NAME}'s assistant"
USER_PHONE_NUMBER=+15559999999                # For call transfers
```

### **Frontend `.env.local`**

```bash
NEXT_PUBLIC_API_URL=https://your-backend.run.app  # Or http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
```

---

## 🚀 **Deployment Commands**

### **Backend to Cloud Run**

```bash
cd backend

# Build and deploy
gcloud builds submit --config=cloudbuild.yaml

# Set secrets
gcloud secrets create elevenlabs-api-key --data-file=<(echo -n "$ELEVENLABS_API_KEY")
gcloud secrets create twilio-auth-token --data-file=<(echo -n "$TWILIO_AUTH_TOKEN")

# Deploy with secrets
gcloud run deploy ai-gatekeeper \
  --source . \
  --region us-central1 \
  --set-env-vars="ENVIRONMENT=production" \
  --set-secrets="ELEVENLABS_API_KEY=elevenlabs-api-key:latest" \
  --allow-unauthenticated
```

### **Frontend to Vercel**

```bash
cd frontend

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://ai-gatekeeper-xxxxx.run.app
```

---

## 📝 **Summary**

**How It All Connects**:

1. **Phone call** → **Twilio** → Opens WebSocket to your FastAPI server
2. **FastAPI** → Bridges Twilio WebSocket ↔ **ElevenLabs WebSocket**
3. **ElevenLabs** → Handles STT + LLM + TTS (all-in-one voice agent)
4. **Google ADK** → Runs parallel analysis (scam + intent) using **Gemini**
5. **Supabase** → Stores calls, contacts, analytics
6. **Frontend** → Subscribes to Supabase real-time → Updates **Voice Orb**

**No bullshit**. This is how it actually works. 🚀
