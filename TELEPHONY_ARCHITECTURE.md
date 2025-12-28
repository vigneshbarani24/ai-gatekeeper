# 📞 Complete Telephony Architecture

**The Core Product: How Everything Connects**

---

## 🔄 End-to-End Call Flow

```
┌──────────────────────────────────────────────────────────────┐
│  1. INCOMING CALL                                             │
│     Caller dials your phone → Forwards to Twilio number      │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  2. TWILIO WEBHOOK                                            │
│     POST /api/telephony/incoming                             │
│     ├─ Get user by Twilio number (Supabase)                 │
│     ├─ Check whitelist (Supabase) → Pass through if family  │
│     ├─ Get voice profile (Supabase) → User's cloned voice   │
│     └─ Call ElevenLabs Register Call API                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  3. ELEVENLABS REGISTER CALL API                             │
│     POST https://api.elevenlabs.io/v1/convai/twilio/         │
│          register-call                                        │
│                                                               │
│     Body:                                                     │
│     {                                                         │
│       "agent_id": "YOUR_AGENT_ID",                           │
│       "from_number": "+15551234567",  // Caller             │
│       "to_number": "+15557654321",    // Your Twilio #      │
│       "conversation_initiation_client_data": {              │
│         "user_id": "user_123",                              │
│         "call_sid": "CA123",                                │
│         "voice_id": "ElevenLabs_voice_abc123",  // CLONED  │
│         "mode": "accessibility",  // or "gatekeeper"        │
│         "user_name": "Maria"                                │
│       }                                                       │
│     }                                                         │
│                                                               │
│     Returns: TwiML with WebSocket connection details        │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  4. YOU RETURN TWIML TO TWILIO                               │
│     <Response>                                               │
│       <Connect>                                              │
│         <Stream url="wss://api.elevenlabs.io/v1/convai...">  │
│       </Connect>                                             │
│     </Response>                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  5. TWILIO ↔ ELEVENLABS BIDIRECTIONAL AUDIO                 │
│     ┌──────────────────────────────────────────┐            │
│     │  Caller speaks → Twilio → ElevenLabs    │            │
│     │                  (mu-law audio stream)   │            │
│     └──────────────────────────────────────────┘            │
│     ┌──────────────────────────────────────────┐            │
│     │  ElevenLabs TTS → Twilio → Caller hears │            │
│     │  (in YOUR cloned voice!)                 │            │
│     └──────────────────────────────────────────┘            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  6. AI AGENT USES SERVER TOOLS                               │
│                                                               │
│     Agent: "Let me check your calendar..."                   │
│     ┌───────────────────────────────────────┐               │
│     │ POST /api/tools/check_calendar         │               │
│     │ ├─ Reads user_id from client_data     │               │
│     │ ├─ Calls Google Calendar API           │               │
│     │ └─ Returns: {"available": true}       │               │
│     └───────────────────────────────────────┘               │
│                                                               │
│     Agent: "Is this caller in my contacts?"                  │
│     ┌───────────────────────────────────────┐               │
│     │ POST /api/tools/check_contact          │               │
│     │ ├─ Queries Supabase contacts table     │               │
│     │ └─ Returns: {"is_contact": false}     │               │
│     └───────────────────────────────────────┘               │
│                                                               │
│     Agent: "This sounds like a scam!"                        │
│     ┌───────────────────────────────────────┐               │
│     │ POST /api/tools/block_scam             │               │
│     │ ├─ Calls Twilio API to hangup          │               │
│     │ ├─ Logs to Supabase scam_reports       │               │
│     │ └─ Broadcasts to dashboard via WS     │               │
│     └───────────────────────────────────────┘               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  7. REAL-TIME DASHBOARD UPDATES (WebSocket)                  │
│                                                               │
│     Frontend: ws://your-backend.run.app/ws/dashboard         │
│                                                               │
│     Backend broadcasts:                                      │
│     ├─ {"type": "call_started", "caller": "+1555..."}       │
│     ├─ {"type": "transcript_update", "text": "Hello..."}    │
│     ├─ {"type": "scam_detected", "confidence": 0.95}        │
│     └─ {"type": "call_ended", "summary": "Reservation..."}  │
│                                                               │
│     Orb updates in real-time!                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack Integration

### Layer 1: Telephony (PSTN → WebSocket)
```
Twilio Programmable Voice
├─ Receives PSTN call
├─ Converts to Media Stream (WebSocket)
├─ Calls YOUR webhook
└─ Connects to ElevenLabs via TwiML
```

### Layer 2: AI Conversation (The Brain)
```
ElevenLabs Conversational AI
├─ Speaks in user's cloned voice
├─ Real-time speech-to-text
├─ Natural language understanding
├─ Calls YOUR tools for data
└─ Text-to-speech with <150ms latency
```

### Layer 3: Backend Logic (FastAPI)
```
FastAPI + Python 3.11
├─ /api/telephony/incoming     → Twilio webhook handler
├─ /api/tools/check_calendar   → Google Calendar integration
├─ /api/tools/check_contact    → Supabase whitelist query
├─ /api/tools/block_scam       → Twilio hangup + logging
└─ /ws/dashboard               → Real-time updates to frontend
```

### Layer 4: Data Layer (Supabase PostgreSQL)
```
Supabase Tables
├─ users                → User profiles, phone numbers, mode
├─ voice_profiles       → ElevenLabs voice IDs
├─ contacts             → Whitelist (auto-pass family/friends)
├─ calls                → Call records with outcomes
├─ call_transcripts     → Full conversation logs
└─ scam_reports         → Fraud detection logs
```

### Layer 5: External APIs
```
Google Cloud Services
├─ Vertex AI Gemini 2.0 Flash   → Scam detection (0.16ms)
├─ Google Calendar API           → Reservation booking
└─ Cloud Monitoring              → Production observability

Twilio APIs
├─ Media Streams API             → Audio transport
├─ TwiML                         → Call control
└─ Programmable Voice            → PSTN connectivity
```

---

## 📡 Server Tools: How Agent Calls Your Backend

### Configuration in ElevenLabs Dashboard

1. Go to **ElevenLabs Dashboard** → **Your Agent** → **Tools**
2. Add each tool with these details:

#### Tool 1: Check Calendar
```json
{
  "name": "check_calendar",
  "description": "Check user's calendar for availability",
  "url": "https://your-backend.run.app/api/tools/check_calendar",
  "method": "POST",
  "parameters": {
    "date": {"type": "string", "description": "YYYY-MM-DD"},
    "time": {"type": "string", "description": "HH:MM"},
    "duration_minutes": {"type": "integer"}
  }
}
```

#### Tool 2: Check Contact
```json
{
  "name": "check_contact",
  "description": "Check if caller is in whitelist",
  "url": "https://your-backend.run.app/api/tools/check_contact",
  "method": "POST",
  "parameters": {
    "phone_number": {"type": "string"},
    "caller_name": {"type": "string"}
  }
}
```

#### Tool 3: Block Scam
```json
{
  "name": "block_scam",
  "description": "Immediately end scam call",
  "url": "https://your-backend.run.app/api/tools/block_scam",
  "method": "POST",
  "parameters": {
    "scam_type": {"type": "string"},
    "confidence": {"type": "number"},
    "red_flags": {"type": "array"}
  }
}
```

### How ElevenLabs Calls Your Tools

When the agent decides to use a tool:

```
Agent conversation:
Caller: "I'd like to book a table for Friday at 7pm"

Agent thinks: "I need to check the calendar"

Agent calls:
POST https://your-backend.run.app/api/tools/check_calendar
Headers:
  Content-Type: application/json
  x-elevenlabs-signature: <signature>
Body:
{
  "conversation_id": "conv_abc123",
  "call_sid": "CA123",  // From conversation_initiation_client_data
  "user_id": "user_123",  // From conversation_initiation_client_data
  "parameters": {
    "date": "2025-01-03",
    "time": "19:00",
    "duration_minutes": 120
  }
}

Your backend responds:
{
  "available": true,
  "conflicts": [],
  "suggested_times": ["19:00", "20:00"]
}

Agent continues:
"Friday at 7pm is available. Shall I book it for you?"
```

---

## 🎯 Demo Scenario Walkthrough

### Scenario 1: Reservation

**1. Call Setup (500ms)**
```
Caller → Twilio → Your backend → ElevenLabs Register Call API
→ Returns TwiML → Twilio connects to ElevenLabs
```

**2. AI Greeting (Your Voice!)**
```
AI: "Hello, this is Maria's assistant. How can I help you?"
Caller: "Hi, I'd like to make a dinner reservation"
```

**3. Tool Call: Check Calendar**
```
AI → POST /api/tools/check_calendar
Backend → Google Calendar API → Returns availability
AI: "I can book you for Friday at 7pm. Would that work?"
```

**4. Tool Call: Book Calendar**
```
Caller: "Yes, please"
AI → POST /api/tools/book_calendar
Backend → Google Calendar API → Creates event
AI: "Done! I've added it to your calendar."
```

**5. Dashboard Update**
```
Backend → WebSocket broadcast:
{
  "type": "call_ended",
  "summary": "Reservation booked for Friday 7pm",
  "action": "booked_calendar",
  "caller": "+15551234567"
}

Frontend orb shows: "✅ Booked reservation - Friday 7pm"
```

### Scenario 2: Scam

**1. Call Setup** (same as above)

**2. Suspicious Start**
```
Caller: "This is the IRS, you owe back taxes..."
```

**3. Real-Time Scam Detection (Parallel)**
```
Backend receives transcript webhook from ElevenLabs

Google ADK orchestrator runs in parallel:
├─ Scam Detector Agent → Keyword match: "IRS" (0.16ms)
├─ Intent Classifier (Gemini Flash) → Intent: "scam"
└─ Decision Agent → Confidence: 0.95 → BLOCK

While conversation continues:
AI: "I'm sorry, but I can't help with that..."
```

**4. Tool Call: Block Scam**
```
AI → POST /api/tools/block_scam
{
  "scam_type": "irs_impersonation",
  "confidence": 0.95,
  "red_flags": ["irs", "owe taxes", "immediate action"]
}

Backend:
├─ Calls Twilio: hangup_call(call_sid)
├─ Logs to Supabase: create_scam_report()
└─ Broadcasts to dashboard via WebSocket
```

**5. Dashboard Update**
```
{
  "type": "scam_detected",
  "caller": "+15551234567",
  "scam_type": "IRS impersonation",
  "confidence": 0.95,
  "action": "blocked"
}

Frontend orb flashes red: "🚨 Blocked scam call"
```

---

## 🔌 Key Integration Points

### 1. Supabase ↔ FastAPI
```python
# Get user's cloned voice
voice_profile = await db_service.get_voice_profile(user_id)
voice_id = voice_profile["voice_id"]

# Check whitelist
contact = await db_service.get_contact_by_phone(user_id, caller_number)
if contact and contact["auto_pass"]:
    # Pass through immediately
```

### 2. Google Calendar ↔ FastAPI
```python
# TODO: Implement in tools/check_calendar
from googleapiclient.discovery import build

service = build('calendar', 'v3', credentials=creds)
events = service.events().list(
    calendarId='primary',
    timeMin=start_time,
    timeMax=end_time
).execute()
```

### 3. Google Gemini ↔ FastAPI (Scam Detection)
```python
from app.services.gemini_service import get_gemini_service

gemini = get_gemini_service()
scam_analysis = await gemini.analyze_scam_indicators(
    transcript=transcript,
    caller_number=caller_number
)

if scam_analysis["is_scam"] and scam_analysis["confidence"] > 0.85:
    # Block call
```

### 4. WebSocket ↔ Frontend
```python
# Backend: Broadcast to connected clients
from app.services.dashboard_manager import dashboard_manager

await dashboard_manager.broadcast(user_id, {
    "type": "transcript_update",
    "text": transcript
})
```

```typescript
// Frontend: Receive updates
const ws = new WebSocket('wss://backend.run.app/ws/dashboard?user_id=123');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  updateOrb(update);
};
```

---

## 🚀 Deployment Architecture

### Production Stack
```
Google Cloud Run (Backend)
├─ Auto-scaling: 0 → 1000 instances
├─ URL: https://ai-gatekeeper-backend-xxxxx-uc.a.run.app
└─ Environment: BACKEND_URL must be set to this URL

Vercel (Frontend)
├─ URL: https://ai-gatekeeper.app
└─ Env: NEXT_PUBLIC_API_URL points to Cloud Run

Supabase (Database)
├─ Project: ai-gatekeeper-prod
└─ Connection: Direct from Cloud Run (service role key)

Twilio (Telephony)
├─ Phone Number: +1555...
└─ Webhook: https://ai-gatekeeper-backend...run.app/api/telephony/incoming

ElevenLabs (Voice AI)
├─ Agent ID: configured in .env
└─ Tools: Point to Cloud Run /api/tools/* endpoints
```

---

## ✅ Testing Checklist

### Local Development
- [ ] Start backend: `uvicorn app.main:app --reload`
- [ ] Expose with ngrok: `ngrok http 8000`
- [ ] Update Twilio webhook to ngrok URL
- [ ] Call Twilio number, verify AI answers

### Tool Testing
- [ ] Test calendar check (returns availability)
- [ ] Test contact check (queries Supabase)
- [ ] Test scam blocking (hangs up call)
- [ ] Test dashboard WebSocket (updates in real-time)

### End-to-End
- [ ] Reservation scenario (books calendar)
- [ ] Scam scenario (detects and blocks)
- [ ] Whitelisted call (passes through immediately)
- [ ] Dashboard shows all updates correctly

---

**Last Updated:** December 28, 2025
**Status:** Ready for demo with API keys
**Critical Path:** Get ElevenLabs Agent ID + Configure Tools
