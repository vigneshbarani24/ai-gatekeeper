# AI Gatekeeper: Complete Architecture Diagrams
**No bullshit. This is how everything actually works.**

---

## System Architecture (High-Level)

```
┌───────────────────────────────────────────────────────────────────┐
│                          CALLER (PSTN)                             │
│                     [Any phone number]                             │
└────────────────────────────┬──────────────────────────────────────┘
                             │ Calls Twilio Number
                             ▼
┌───────────────────────────────────────────────────────────────────┐
│                    TWILIO (Telephony Layer)                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Answers call via PSTN                                     │ │
│  │  • Executes TwiML (XML instructions)                         │ │
│  │  • Opens WebSocket (Media Streams)                           │ │
│  │  • Streams bidirectional audio (mu-law, 8kHz)                │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬──────────────────────────────────────┘
                             │ WSS (WebSocket Secure)
                             │ wss://ai-gatekeeper.run.app/streams/audio
                             ▼
┌───────────────────────────────────────────────────────────────────┐
│           FASTAPI BACKEND (Google Cloud Run)                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  TELEPHONY ROUTER (telephony.py)                             │ │
│  │  ├─ CallSession: Manages call state                          │ │
│  │  ├─ Twilio WebSocket Handler: Receives audio chunks          │ │
│  │  ├─ ElevenLabs WebSocket Client: Sends/receives AI audio     │ │
│  │  └─ Audio Codec Converter: mu-law ↔ PCM                      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  GOOGLE ADK ORCHESTRATOR (agents/orchestrator.py)            │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                   │ │
│  │  │ ScreenerAgent   │  │ ScamDetector    │                   │ │
│  │  │ (Intent)        │  │ (Parallel)      │                   │ │
│  │  └────────┬────────┘  └────────┬────────┘                   │ │
│  │           │                     │                             │ │
│  │           └──────────┬──────────┘                             │ │
│  │                      ▼                                         │ │
│  │           ┌──────────────────────┐                            │ │
│  │           │  DecisionAgent       │                            │ │
│  │           │  (Pass/Block/Screen) │                            │ │
│  │           └──────────────────────┘                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  WORKFLOW ENGINE (workflows/engine.py) [OPTIONAL]            │ │
│  │  Executes actions based on call category:                    │ │
│  │  • Google Sheets logging                                     │ │
│  │  • Gmail email summaries                                     │ │
│  │  • Calendar event creation                                   │ │
│  │  • MCP task execution                                        │ │
│  │  • SMS notifications                                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  ELEVENLABS      │  │  GOOGLE GEMINI   │  │  SUPABASE        │
│  Conversational  │  │  (Vertex AI)     │  │  PostgreSQL      │
│  AI              │  │                  │  │                  │
│                  │  │  • Gemini 2.0    │  │  • users         │
│  • Voice Cloning │  │    Flash (fast)  │  │  • contacts      │
│  • STT (Speech   │  │  • Gemini 1.5    │  │  • calls         │
│    to Text)      │  │    Pro (deep)    │  │  • transcripts   │
│  • LLM Reasoning │  │  • Embeddings    │  │  • scam_reports  │
│  • TTS (Text to  │  │    (vector)      │  │  • analytics     │
│    Speech)       │  │                  │  │                  │
│  • <500ms        │  │  Latency:        │  │  RLS enabled     │
│    latency       │  │  • 200ms (Flash) │  │  Real-time subs  │
└──────────────────┘  │  • 800ms (Pro)   │  └──────────────────┘
                      └──────────────────┘
```

---

## Call Flow Sequence (Step-by-Step)

```
Caller              Twilio          Backend         ElevenLabs       Gemini        Supabase
  │                    │                │                │                │                │
  │ 1. Dials number    │                │                │                │                │
  ├───────────────────>│                │                │                │                │
  │                    │                │                │                │                │
  │                    │ 2. POST /webhooks/twilio/voice  │                │                │
  │                    ├───────────────>│                │                │                │
  │                    │                │                │                │                │
  │                    │ 3. TwiML XML   │                │                │                │
  │                    │<───────────────┤                │                │                │
  │                    │   (<Stream>)   │                │                │                │
  │                    │                │                │                │                │
  │                    │ 4. WebSocket CONNECT (wss://.../streams/audio)   │                │
  │                    ├───────────────>│                │                │                │
  │                    │                │                │                │                │
  │                    │                │ 5. Connect to ElevenLabs        │                │
  │                    │                ├───────────────>│                │                │
  │                    │                │                │                │                │
  │                    │ 6. Bidirectional audio stream   │                │                │
  │                    │<──────────────>│<──────────────>│                │                │
  │                    │   (mu-law PCM) │   (PCM audio)  │                │                │
  │                    │                │                │                │                │
  │ 7. "Hello?"        │                │                │                │                │
  ├───────────────────>│────audio──────>│────audio──────>│                │                │
  │                    │                │                │─STT────────────>│                │
  │                    │                │                │                │                │
  │                    │                │                │                │ 8. Intent      │
  │                    │                │                │                │    classify    │
  │                    │                │                │                │<───────────────┤
  │                    │                │                │                │                │
  │                    │                │ 9. Check whitelist/scam score   │                │
  │                    │                ├─────────────────────────────────────────────────>│
  │                    │                │                │                │   SELECT      │
  │                    │                │                │                │   contacts    │
  │                    │                │<─────────────────────────────────────────────────┤
  │                    │                │                │                │   Not found   │
  │                    │                │                │                │                │
  │                    │                │ 10. AI Response: "This is Sarah's AI assistant"  │
  │                    │                │                │<─TTS───────────┤                │
  │                    │                │<──────audio────┤                │                │
  │                    │<──────audio────┤                │                │                │
  │ "This is Sarah's   │                │                │                │                │
  │  AI assistant..."  │                │                │                │                │
  │<───────────────────┤                │                │                │                │
  │                    │                │                │                │                │
  │ 11. Caller responds: "I'm a scammer pretending to be IRS"            │                │
  ├───────────────────>│────audio──────>│────audio──────>│                │                │
  │                    │                │                │─STT────────────>│                │
  │                    │                │                │                │                │
  │                    │                │                │                │ 12. Analyze    │
  │                    │                │                │                │     (scam!)    │
  │                    │                │                │                │<───────────────┤
  │                    │                │                │                │                │
  │                    │                │ 13. Decision: BLOCK             │                │
  │                    │                │<────────────────────────────────┤                │
  │                    │                │                │                │                │
  │                    │                │ 14. AI: "Goodbye."              │                │
  │                    │                │                │<─TTS───────────┤                │
  │                    │<──────audio────┤<──────audio────┤                │                │
  │ "Goodbye."         │                │                │                │                │
  │<───────────────────┤                │                │                │                │
  │                    │                │                │                │                │
  │                    │ 15. HANGUP     │                │                │                │
  │                    │<───────────────┤                │                │                │
  │ [Call ended]       │                │                │                │                │
  │                    │                │                │                │                │
  │                    │                │ 16. Save transcript + scam report                │
  │                    │                ├─────────────────────────────────────────────────>│
  │                    │                │                │                │   INSERT      │
  │                    │                │                │                │   calls,      │
  │                    │                │                │                │   scam_       │
  │                    │                │                │                │   reports     │
```

---

## Database Schema (Supabase PostgreSQL)

```
┌───────────────────────────────────────────────────────────────────┐
│                          USERS TABLE                               │
├─────────────────┬─────────────────┬───────────────────────────────┤
│ id (UUID, PK)   │ phone_number    │ Unique user ID                │
│ name            │ email           │ User's name, contact email    │
│ twilio_phone_   │ elevenlabs_     │ Twilio number, EL voice ID    │
│   number        │   voice_id      │                               │
│ plan_tier       │ created_at      │ free/premium/senior           │
└─────────────────┴─────────────────┴───────────────────────────────┘
          │
          │ 1:N
          ▼
┌───────────────────────────────────────────────────────────────────┐
│                        CONTACTS TABLE                              │
├─────────────────┬─────────────────┬───────────────────────────────┤
│ id (UUID, PK)   │ user_id (FK)    │ Whitelist entry               │
│ name            │ phone_number    │ Contact details               │
│ relationship    │ priority (1-10) │ friend/family/doctor          │
│ auto_pass (bool)│ created_at      │ Skip screening if true        │
└─────────────────┴─────────────────┴───────────────────────────────┘

          │
          │ Referenced by
          ▼
┌───────────────────────────────────────────────────────────────────┐
│                          CALLS TABLE                               │
├─────────────────┬─────────────────┬───────────────────────────────┤
│ id (UUID, PK)   │ user_id (FK)    │ Call record                   │
│ call_sid        │ caller_number   │ Twilio SID, caller phone      │
│ caller_name     │ status          │ ringing/screening/ended       │
│ intent          │ scam_score      │ friend/sales/scam + 0.0-1.0   │
│ passed_through  │ started_at      │ Boolean, timestamp            │
│ duration_seconds│ ended_at        │ Call length                   │
└─────────────────┴─────────────────┴───────────────────────────────┘
          │
          │ 1:1
          ▼
┌───────────────────────────────────────────────────────────────────┐
│                   CALL_TRANSCRIPTS TABLE                           │
├─────────────────┬─────────────────┬───────────────────────────────┤
│ id (UUID, PK)   │ call_id (FK)    │ Unique, references calls.id   │
│ transcript      │ sentiment       │ Full text, pos/neg/neutral    │
│ audio_url       │ summary         │ Twilio recording, AI summary  │
│ created_at      │                 │                               │
└─────────────────┴─────────────────┴───────────────────────────────┘

          │ 1:N
          │
          ▼
┌───────────────────────────────────────────────────────────────────┐
│                      SCAM_REPORTS TABLE                            │
├─────────────────┬─────────────────┬───────────────────────────────┤
│ id (UUID, PK)   │ call_id (FK)    │ Detected scam                 │
│ scam_type       │ confidence      │ irs/tech_support + 0.0-1.0    │
│ pattern_matched │ action_taken    │ Which scam script, action     │
│ reported_at     │                 │ Timestamp                     │
└─────────────────┴─────────────────┴───────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    CALL_ANALYTICS TABLE                            │
├─────────────────┬─────────────────┬───────────────────────────────┤
│ id (UUID, PK)   │ user_id (FK)    │ Daily aggregation             │
│ date            │ total_calls     │ Date, count                   │
│ scams_blocked   │ sales_blocked   │ Counters                      │
│ contacts_passed │ created_at      │ Trusted calls, timestamp      │
└─────────────────┴─────────────────┴───────────────────────────────┘
```

**Indexes**:
- `users.twilio_phone_number` (UNIQUE)
- `contacts(user_id, phone_number)` (UNIQUE composite)
- `calls.call_sid` (UNIQUE)
- `calls(user_id, started_at DESC)` (for history queries)

**Row-Level Security (RLS)**:
- All tables: `WHERE user_id = auth.uid()` (users see only their data)

---

## Audio Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│ TWILIO AUDIO FORMAT                                                 │
│ • Codec: G.711 mu-law                                               │
│ • Sample Rate: 8 kHz                                                │
│ • Channels: Mono (1)                                                │
│ • Encoding: Base64 in JSON payload                                  │
│ • Chunk Size: 20ms (160 bytes)                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND AUDIO CODEC CONVERSION (twilio_service.py)                  │
│                                                                      │
│ 1. Decode Base64 → mu-law bytes                                     │
│    mulaw_bytes = base64.b64decode(payload)                          │
│                                                                      │
│ 2. Convert mu-law → PCM (16-bit linear)                             │
│    pcm_bytes = audioop.ulaw2lin(mulaw_bytes, 2)                     │
│                                                                      │
│ 3. Send to ElevenLabs (PCM format)                                  │
│                                                                      │
│ 4. Receive PCM from ElevenLabs                                      │
│                                                                      │
│ 5. Convert PCM → mu-law                                             │
│    mulaw_bytes = audioop.lin2ulaw(pcm_bytes, 2)                     │
│                                                                      │
│ 6. Encode Base64 → Send to Twilio                                   │
│    payload = base64.b64encode(mulaw_bytes)                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ELEVENLABS AUDIO FORMAT                                             │
│ • Codec: PCM (uncompressed)                                         │
│ • Sample Rate: 16 kHz (or 8 kHz compatible)                         │
│ • Channels: Mono (1)                                                │
│ • Encoding: Base64 in JSON                                          │
│ • Latency: <500ms (STT + LLM + TTS)                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Google ADK Agent Execution Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ INCOMING CALL                                                        │
│ Context: {                                                           │
│   caller_number: "+15551234567",                                    │
│   transcript: "This is the IRS...",                                 │
│   confidence: 0.0                                                    │
│ }                                                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ORCHESTRATOR (orchestrator.py)                                      │
│                                                                      │
│ Step 1: Fast Path - Whitelist Check (Sequential)                    │
│ ┌────────────────────────┐                                          │
│ │ ContactMatcherAgent    │─────────> Database lookup                │
│ │ Check: user_id + phone │           <50ms                          │
│ └────────────────────────┘                                          │
│           │                                                          │
│           ├─ IF MATCH → PASS THROUGH (end)                          │
│           │                                                          │
│           └─ NO MATCH → Continue to Step 2                          │
│                                                                      │
│ Step 2: Parallel Analysis (asyncio.gather)                          │
│ ┌────────────────────────┐   ┌────────────────────────┐            │
│ │ ScreenerAgent          │   │ ScamDetectorAgent      │            │
│ │ • Classify intent      │   │ • Keyword match        │            │
│ │ • Gemini 2.0 Flash     │   │ • LLM analysis         │            │
│ │ • <200ms               │   │ • Vector similarity    │            │
│ │                        │   │ • <200ms               │            │
│ │ Returns:               │   │                        │            │
│ │ {                      │   │ Returns:               │            │
│ │   intent: "scam",      │   │ {                      │            │
│ │   confidence: 0.95     │   │   is_scam: true,       │            │
│ │ }                      │   │   confidence: 0.92     │            │
│ └────────────────────────┘   │ }                      │            │
│           │                   └────────────────────────┘            │
│           │                             │                            │
│           └──────────┬──────────────────┘                            │
│                      ▼                                                │
│ Step 3: Decision (Sequential)                                        │
│ ┌────────────────────────┐                                          │
│ │ DecisionAgent          │                                          │
│ │                        │                                          │
│ │ Priority Decision Tree:│                                          │
│ │ 1. Scam (≥0.85)     → BLOCK                                       │
│ │ 2. Sales (≥0.8)     → DECLINE                                     │
│ │ 3. Friend (≥0.7)    → PASS                                        │
│ │ 4. Appointment      → SCREEN                                      │
│ │ 5. Unknown (<0.7)   → ASK MORE                                    │
│ │                        │                                          │
│ │ Decision: BLOCK        │                                          │
│ └────────────────────────┘                                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ACTION: Hangup call + Log scam                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Total Latency**: <500ms (parallel execution)

---

## Deployment Architecture (Google Cloud Run)

```
┌───────────────────────────────────────────────────────────────────┐
│                     INTERNET (Public)                              │
└────────────────────────────┬──────────────────────────────────────┘
                             │ HTTPS/WSS
                             ▼
┌───────────────────────────────────────────────────────────────────┐
│              GOOGLE CLOUD LOAD BALANCER                            │
│  • SSL Termination (HTTPS → WSS)                                  │
│  • DDoS Protection (Cloud Armor)                                  │
│  • Health Checks (/health endpoint)                               │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────────┐
│              CLOUD RUN SERVICE: ai-gatekeeper                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Container: gcr.io/PROJECT/ai-gatekeeper:latest               │ │
│  │                                                              │ │
│  │ Resources (per instance):                                   │ │
│  │  • CPU: 4 vCPU                                              │ │
│  │  • Memory: 8 GB                                             │ │
│  │  • Timeout: 3600s (1 hour for long calls)                   │ │
│  │  • Concurrency: 10 calls/instance                           │ │
│  │                                                              │ │
│  │ Autoscaling:                                                │ │
│  │  • Min instances: 1 (always warm, no cold start)            │ │
│  │  • Max instances: 1000                                      │ │
│  │  • Scale-up trigger: 80% CPU or 10 concurrent requests      │ │
│  │  • Scale-down: 60s idle                                     │ │
│  │                                                              │ │
│  │ Networking:                                                 │ │
│  │  • VPC: default (can isolate if needed)                     │ │
│  │  • Egress: Unrestricted (for API calls)                    │ │
│  │  • Ingress: Allow all (webhooks from Twilio)                │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬──────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ VERTEX AI        │ │ SUPABASE         │ │ EXTERNAL APIs    │
│ (same project)   │ │ (external)       │ │                  │
│                  │ │                  │ │ • ElevenLabs     │
│ • Gemini API     │ │ • PostgreSQL     │ │ • Twilio         │
│ • Vector Search  │ │ • Realtime       │ │ • Google Sheets  │
│ • Low latency    │ │ • RLS            │ │ • Gmail API      │
│   (<100ms)       │ │                  │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Cost Estimate** (per month, 3,000 calls):
- Cloud Run: $20 (CPU + memory)
- Twilio: $26 (inbound minutes)
- ElevenLabs: $360 (Conversational AI)
- Vertex AI: $15 (Gemini calls)
- Supabase: $0 (free tier)
- **Total: ~$420/month**

---

## File Structure (Code Organization)

```
ai-gatekeeper/backend/
├── app/
│   ├── main.py                    # FastAPI entry point
│   │   ├─ App lifecycle (startup/shutdown)
│   │   ├─ CORS middleware
│   │   ├─ Health check (/health)
│   │   └─ Router includes
│   │
│   ├── core/
│   │   ├── config.py              # Settings (50+ env vars)
│   │   └── security.py            # Webhook validation (TODO)
│   │
│   ├── agents/                    # Google ADK Multi-Agent System
│   │   ├── orchestrator.py        # Coordinator (sequential + parallel)
│   │   ├── screener_agent.py      # Intent classification
│   │   ├── scam_detector_agent.py # Fraud detection
│   │   ├── contact_matcher_agent.py # Whitelist lookup
│   │   └── decision_agent.py      # Routing logic
│   │
│   ├── services/                  # External integrations
│   │   ├── twilio_service.py      # Telephony (TwiML, WebSocket, audio)
│   │   ├── elevenlabs_service.py  # Voice AI (STT+LLM+TTS)
│   │   ├── gemini_service.py      # LLM (dual-model: Flash + Pro)
│   │   ├── database.py            # Supabase client (CRUD)
│   │   └── vector_store.py        # Scam vector DB (placeholder)
│   │
│   ├── routers/                   # API endpoints
│   │   ├── telephony.py           # ⭐ CRITICAL: WebSocket handler
│   │   │   └─ CallSession class (call state machine)
│   │   ├── webhooks.py            # Twilio/ElevenLabs callbacks
│   │   ├── contacts.py            # Whitelist CRUD
│   │   ├── calls.py               # Call history
│   │   └── analytics.py           # Dashboard stats
│   │
│   ├── workflows/                 # [OPTIONAL] Workflow automation
│   │   ├── engine.py              # Workflow executor
│   │   ├── default_workflows.json # Pre-configured workflows
│   │   └── executors/             # Action executors
│   │       ├── base.py
│   │       ├── call_actions.py    # Ring, hangup
│   │       ├── notification_actions.py # SMS, email
│   │       ├── business_actions.py # Google Sheets
│   │       ├── calendar_actions.py # Calendar events
│   │       └── mcp_actions.py     # MCP integration
│   │
│   └── models/                    # Pydantic models (TODO)
│       ├── call_session.py
│       └── scam_report.py
│
├── database/
│   └── schema.sql                 # Supabase PostgreSQL schema
│
├── requirements.txt               # Python dependencies
├── Dockerfile                     # Container image
└── cloudbuild.yaml                # Cloud Build deployment
```

---

**This is the actual architecture. No bullshit.**

Next: Testing all endpoints with real curl commands.
