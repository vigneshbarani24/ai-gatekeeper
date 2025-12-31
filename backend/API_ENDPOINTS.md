# 📡 API Endpoints Reference

**Complete mapping of every API call in the system**

---

## 🔴 CRITICAL PATH: Incoming Call Flow

### 1. Twilio → YOUR Backend
```
POST https://your-backend.run.app/api/telephony/incoming

Called by: Twilio (when call received)
Purpose: Route call to ElevenLabs with user's cloned voice

Request (from Twilio):
  CallSid: CA1234567890
  From: +15551234567  (caller's number)
  To: +15557654321    (your Twilio number)

Response (to Twilio):
  Content-Type: application/xml
  Body: <Response><Connect><Stream>...</Stream></Connect></Response>

What happens inside:
  1. Get user from Supabase (by Twilio number)
  2. Check whitelist in Supabase
  3. Get voice_id from Supabase
  4. Call ElevenLabs Register Call API ↓
  5. Return TwiML to Twilio
```

### 2. YOUR Backend → ElevenLabs
```
POST https://api.elevenlabs.io/v1/convai/twilio/register-call

Called by: YOUR backend (telephony_optimized.py)
Purpose: Get TwiML to connect Twilio to ElevenLabs agent

Headers:
  xi-api-key: YOUR_ELEVENLABS_API_KEY
  Content-Type: application/json

Request:
{
  "agent_id": "your_agent_id_from_dashboard",
  "from_number": "+15551234567",
  "to_number": "+15557654321",
  "conversation_initiation_client_data": {
    "user_id": "user_123",
    "call_sid": "CA123",
    "voice_id": "user_cloned_voice_id",
    "user_name": "Maria",
    "mode": "accessibility"
  }
}

Response:
  Content-Type: application/xml
  Body: <Response><Connect><Stream url="wss://api.elevenlabs.io/...">
           <!-- Full TwiML for Twilio -->
        </Stream></Connect></Response>
```

---

## 🛠️ ElevenLabs Agent → YOUR Backend (Server Tools)

### Tool 1: Check Calendar
```
POST https://your-backend.run.app/api/tools/check_calendar

Called by: ElevenLabs agent (during conversation)
Trigger: Agent says "Let me check your calendar..."

Request (from ElevenLabs):
{
  "conversation_id": "conv_abc123",
  "user_id": "user_123",  // From conversation_initiation_client_data
  "call_sid": "CA123",
  "parameters": {
    "date": "2025-01-03",
    "time": "19:00",
    "duration_minutes": 120
  }
}

What YOU do:
  1. Get user_id from request
  2. Call Google Calendar API (YOUR Google Cloud project)
  3. Check availability for that date/time
  4. Return structured response

Response (to ElevenLabs):
{
  "available": true,
  "conflicts": [],
  "suggested_times": ["19:00", "20:00", "21:00"]
}

Agent continues: "Friday at 7pm is available. Shall I book it?"
```

### Tool 2: Book Calendar
```
POST https://your-backend.run.app/api/tools/book_calendar

Called by: ElevenLabs agent (after user confirms)
Trigger: User says "Yes, book it"

Request:
{
  "user_id": "user_123",
  "parameters": {
    "title": "Dinner reservation",
    "date": "2025-01-03",
    "time": "19:00",
    "duration_minutes": 120
  }
}

What YOU do:
  1. Call Google Calendar API
  2. Create event
  3. Return confirmation

Response:
{
  "success": true,
  "event_id": "evt_abc123",
  "calendar_link": "https://calendar.google.com/..."
}
```

### Tool 3: Check Contact
```
POST https://your-backend.run.app/api/tools/check_contact

Called by: ElevenLabs agent
Trigger: Agent wants to know if caller is whitelisted

Request:
{
  "user_id": "user_123",
  "parameters": {
    "phone_number": "+15551234567",
    "caller_name": "John Smith"  // Optional
  }
}

What YOU do:
  1. Query Supabase contacts table
  2. Check if phone_number exists for user_id

Response:
{
  "is_contact": true,
  "contact_name": "John Smith",
  "relationship": "friend",
  "auto_pass": false
}
```

### Tool 4: Block Scam
```
POST https://your-backend.run.app/api/tools/block_scam

Called by: ElevenLabs agent OR YOUR backend intelligence
Trigger: Scam detected (>0.85 confidence)

Request:
{
  "call_sid": "CA123",
  "user_id": "user_123",
  "parameters": {
    "scam_type": "irs_impersonation",
    "confidence": 0.95,
    "red_flags": ["irs", "arrest warrant", "gift cards"]
  }
}

What YOU do:
  1. Call Twilio API: hangup_call(call_sid)
  2. Log to Supabase: create_scam_report()
  3. Broadcast to dashboard via WebSocket

Response:
{
  "success": true,
  "action": "call_terminated",
  "report_id": "scam_123"
}
```

---

## 🧠 Google ADK Intelligence Layer (Background)

### Intelligence Flow (Parallel to ElevenLabs conversation)

```
ElevenLabs sends transcript updates →
  YOUR backend receives webhook →
    Google ADK Orchestrator runs agents in parallel:

┌─────────────────────────────────────────────────┐
│  Google ADK Multi-Agent System                  │
│  (Runs ASYNCHRONOUSLY, doesn't block call)      │
├─────────────────────────────────────────────────┤
│                                                  │
│  Agent 1: Scam Detector                        │
│  ├─ RAG Search (Vertex AI Vector Search)       │
│  │  Query: "This is the IRS..."                │
│  │  Returns: Similar scam scripts (0.16ms)     │
│  ├─ Keyword Matching (Local, 5ms)              │
│  └─ Gemini 2.0 Flash Analysis (200ms)          │
│                                                  │
│  Agent 2: Intent Classifier                    │
│  ├─ Gemini 1.5 Flash                           │
│  └─ Intent: "scam" | "reservation" | "friend"  │
│                                                  │
│  Agent 3: Entity Verifier                      │
│  ├─ Google Search API                          │
│  │  "Is ABC Restaurant legitimate?"            │
│  ├─ Check business listings                    │
│  └─ Returns: verified | suspicious             │
│                                                  │
│  Agent 4: Decision Maker                       │
│  ├─ Combines all agent outputs                 │
│  ├─ Confidence: 0.95                           │
│  └─ Action: BLOCK | CONTINUE | TRANSFER        │
│                                                  │
└─────────────────────────────────────────────────┘
         │
         ▼
If action = BLOCK:
  Call /api/tools/block_scam
  (Which triggers ElevenLabs to end call)
```

**Key Point:** Google ADK does NOT talk to Twilio directly.
- ElevenLabs handles the call
- Google ADK provides intelligence
- YOUR backend bridges them

---

## 🔵 Google Cloud APIs (Called by YOUR Backend)

### 1. Vertex AI - Scam Detection
```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/gemini-2.0-flash-exp:generateContent

Called by: app/services/gemini_service.py
Purpose: Analyze transcript for scam indicators

Request:
{
  "contents": [{
    "parts": [{
      "text": "Analyze this call for scam indicators:\n\nCaller: This is the IRS, you owe taxes..."
    }]
  }]
}

Response:
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "SCAM DETECTED: IRS impersonation, confidence 0.95"
      }]
    }
  }]
}
```

### 2. Vertex AI Vector Search - RAG
```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/indexes/SCAM_INDEX/indexEndpoints/ENDPOINT_ID:findNeighbors

Called by: app/services/rag_service.py
Purpose: Find similar scam scripts

Request:
{
  "queries": [{
    "embedding": [0.123, 0.456, ...]  // Text embedding
  }],
  "neighbor_count": 5
}

Response:
{
  "nearestNeighbors": [{
    "id": "scam_script_123",
    "distance": 0.05  // Very similar = likely scam
  }]
}
```

### 3. Google Calendar API
```
POST https://www.googleapis.com/calendar/v3/calendars/primary/events

Called by: app/routers/elevenlabs_tools.py (check_calendar tool)
Purpose: Create calendar event

Request:
{
  "summary": "Dinner reservation - ABC Restaurant",
  "start": {"dateTime": "2025-01-03T19:00:00-05:00"},
  "end": {"dateTime": "2025-01-03T21:00:00-05:00"},
  "description": "Booked via AI Gatekeeper"
}

Response:
{
  "id": "evt_abc123",
  "htmlLink": "https://calendar.google.com/event?eid=..."
}
```

### 4. Google Search API (for verification)
```
GET https://www.googleapis.com/customsearch/v1?q=ABC+Restaurant+New+York&key=YOUR_KEY

Called by: app/services/verification_service.py
Purpose: Verify if business is legitimate

Response:
{
  "items": [{
    "title": "ABC Restaurant - Official Website",
    "link": "https://abcrestaurant.com"
  }]
}
```

---

## 🟢 Supabase Database APIs (Called by YOUR Backend)

### 1. Get User by Twilio Number
```
GET https://your-project.supabase.co/rest/v1/users?twilio_phone_number=eq.+15557654321

Called by: db_service.get_user_by_twilio_number()
Purpose: Find which user owns this Twilio number

Headers:
  apikey: YOUR_SUPABASE_KEY
  Authorization: Bearer YOUR_SERVICE_ROLE_KEY

Response:
{
  "id": "user_123",
  "name": "Maria",
  "mode": "accessibility",
  "phone_number": "+15551111111",
  "twilio_phone_number": "+15557654321"
}
```

### 2. Get Voice Profile
```
GET https://your-project.supabase.co/rest/v1/voice_profiles?user_id=eq.user_123&is_active=eq.true&order=created_at.desc&limit=1

Called by: db_service.get_voice_profile()
Purpose: Get user's cloned voice ID

Response:
{
  "voice_id": "ElevenLabs_voice_abc123",
  "voice_name": "Maria",
  "language": "en",
  "is_active": true
}
```

### 3. Check Whitelist Contact
```
GET https://your-project.supabase.co/rest/v1/contacts?user_id=eq.user_123&phone_number=eq.+15551234567

Called by: db_service.get_contact_by_phone()
Purpose: Check if caller is whitelisted

Response:
{
  "id": "contact_456",
  "name": "John Smith",
  "relationship": "friend",
  "auto_pass": true
}
```

### 4. Create Call Record
```
POST https://your-project.supabase.co/rest/v1/calls

Called by: db_service.create_call()
Purpose: Log call for analytics

Request:
{
  "user_id": "user_123",
  "call_sid": "CA123",
  "caller_number": "+15551234567",
  "action_taken": "assisting",
  "intent": "unknown",
  "scam_score": 0.0
}
```

### 5. Create Scam Report
```
POST https://your-project.supabase.co/rest/v1/scam_reports

Called by: db_service.create_scam_report()
Purpose: Log detected scam

Request:
{
  "call_sid": "CA123",
  "scam_type": "irs_impersonation",
  "confidence": 0.95,
  "pattern_matched": "irs, arrest warrant, immediate payment"
}
```

---

## 🟣 Twilio APIs (Called by YOUR Backend)

### 1. Hangup Call
```
POST https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Calls/CA123.json

Called by: twilio_service.hangup_call()
Purpose: Terminate scam call immediately

Request:
  Status: completed

Auth: Basic (Account SID + Auth Token)
```

### 2. Dial User (Transfer)
```
POST https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Calls/CA123.json

Called by: twilio_service.dial_user()
Purpose: Transfer legitimate call to user's phone

Request:
  Twiml: <Response><Dial>+15551111111</Dial></Response>
```

---

## 🔴 Frontend WebSocket (Real-Time Dashboard)

### WebSocket Connection
```
WSS wss://your-backend.run.app/ws/dashboard?user_id=user_123

Purpose: Real-time updates to frontend orb

Messages FROM backend TO frontend:
{
  "type": "call_started",
  "caller": "+15551234567",
  "timestamp": "2025-01-03T19:00:00Z"
}

{
  "type": "transcript_update",
  "text": "Hello, I'd like to make a reservation",
  "timestamp": "2025-01-03T19:00:05Z"
}

{
  "type": "scam_detected",
  "caller": "+15551234567",
  "scam_type": "irs_impersonation",
  "confidence": 0.95
}

{
  "type": "call_ended",
  "summary": "Reservation booked for Friday 7pm",
  "duration": 120,
  "action": "booked_calendar"
}
```

---

## 📊 Complete API Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INCOMING CALL                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │  Twilio                       │
      │  POST /api/telephony/incoming │
      └──────────────┬────────────────┘
                     │
                     ▼
      ┌──────────────────────────────────────────┐
      │  YOUR Backend (FastAPI)                  │
      │  ┌────────────────────────────────────┐ │
      │  │ 1. GET Supabase: users             │ │
      │  │ 2. GET Supabase: contacts          │ │
      │  │ 3. GET Supabase: voice_profiles    │ │
      │  └────────────────────────────────────┘ │
      └──────────────┬───────────────────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │  ElevenLabs                   │
      │  POST /register-call          │
      │  Returns: TwiML               │
      └──────────────┬────────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │  Twilio                       │
      │  Connects to ElevenLabs WS    │
      └──────────────┬────────────────┘
                     │
      ┌──────────────┴────────────────┐
      │                                │
      ▼                                ▼
┌──────────────┐            ┌──────────────────────┐
│  Caller      │ <───Audio─>│  ElevenLabs Agent    │
│  Speaks      │            │  (Your Cloned Voice) │
└──────────────┘            └──────────┬───────────┘
                                       │
                     ┌─────────────────┴────────────────┐
                     │                                   │
                     ▼                                   ▼
      ┌────────────────────────────┐   ┌────────────────────────────┐
      │ POST /tools/check_calendar │   │ POST /tools/check_contact  │
      │ → Google Calendar API      │   │ → Supabase query           │
      └────────────────────────────┘   └────────────────────────────┘
                     │
                     ▼
      ┌─────────────────────────────────────────┐
      │  YOUR Backend (Background Intelligence) │
      │  ┌───────────────────────────────────┐ │
      │  │ Google ADK Orchestrator           │ │
      │  │ ├─ Scam Detector (RAG + Gemini)  │ │
      │  │ ├─ Intent Classifier (Gemini)    │ │
      │  │ ├─ Entity Verifier (Google Search)│ │
      │  │ └─ Decision Maker                 │ │
      │  └───────────────────────────────────┘ │
      └─────────────────┬───────────────────────┘
                        │
                        ▼ If scam detected
      ┌──────────────────────────────┐
      │ POST /tools/block_scam        │
      │ → Twilio: hangup_call()       │
      │ → Supabase: scam_report       │
      │ → WebSocket: alert frontend   │
      └───────────────────────────────┘
```

---

## 🎯 Quick Reference: Who Calls What

| Caller | Endpoint | Purpose |
|--------|----------|---------|
| Twilio | `POST /api/telephony/incoming` | Route incoming call |
| YOUR Backend | `POST elevenlabs.io/register-call` | Get TwiML for call |
| ElevenLabs Agent | `POST /api/tools/check_calendar` | Check availability |
| ElevenLabs Agent | `POST /api/tools/book_calendar` | Create event |
| ElevenLabs Agent | `POST /api/tools/check_contact` | Check whitelist |
| YOUR Backend | `POST /api/tools/block_scam` | End scam call |
| YOUR Backend | `POST calendar.googleapis.com/events` | Book calendar |
| YOUR Backend | `POST aiplatform.googleapis.com/generateContent` | Scam analysis |
| YOUR Backend | `GET supabase.co/rest/v1/users` | Get user data |
| YOUR Backend | `POST twilio.com/Calls/{sid}` | Hangup call |
| YOUR Backend | `WSS /ws/dashboard` | Update frontend |

---

**Last Updated:** December 28, 2025
**Status:** Production-ready API design
