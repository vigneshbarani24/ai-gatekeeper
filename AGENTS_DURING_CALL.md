# 🎭 What Happens During a Live Call

**Simple, visual guide to agents and tools**

---

## 🟢 BASE LAYER: The Call Foundation

This is what handles the actual phone call. **You must configure this first.**

```
┌──────────────────────────────────────────────────────────┐
│                     LIVE PHONE CALL                       │
│                                                           │
│  Caller's Phone ←→ Twilio ←→ ElevenLabs Agent            │
│                                                           │
│  What's happening:                                        │
│  • Caller speaks → Twilio sends audio → ElevenLabs STT  │
│  • ElevenLabs AI thinks → Generates response             │
│  • ElevenLabs TTS (your voice!) → Twilio → Caller hears │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**Configure in ElevenLabs Studio:**
1. Go to https://elevenlabs.io/app/conversational-ai
2. Add your Twilio credentials
3. Assign agent to phone number
4. Done - calls now work!

**At this point:** AI can have basic conversations in your cloned voice. No tools yet.

---

## 🔵 TOOL LAYER: Add Intelligence

Now add tools ONE BY ONE. Each tool gives the agent new abilities.

### Tool 1: Check Calendar (Scheduling)

**What it does:** Agent can check if you're available at a specific time

```
During call:
Caller: "Can we meet Friday at 7pm?"
   ↓
Agent thinks: "I need to check the calendar"
   ↓
Agent calls: POST /api/tools/check_calendar
   ↓
YOUR backend:
  • Gets user_id from request
  • Calls Google Calendar API
  • Returns: {"available": true}
   ↓
Agent responds: "Yes, Friday at 7pm works!"
```

**Configure in ElevenLabs:**
```json
{
  "name": "check_calendar",
  "url": "https://your-backend.run.app/api/tools/check_calendar",
  "parameters": {
    "date": "string",
    "time": "string"
  }
}
```

---

### Tool 2: Book Calendar (Action)

**What it does:** Agent can actually create events on your calendar

```
During call:
Caller: "Great, book it!"
   ↓
Agent calls: POST /api/tools/book_calendar
   ↓
YOUR backend:
  • Calls Google Calendar API
  • Creates event
  • Returns: {"success": true, "event_id": "..."}
   ↓
Agent responds: "Done! I've added it to your calendar."
```

---

### Tool 3: Check Contact (Verification)

**What it does:** Agent can see if caller is in your whitelist

```
During call:
Caller: "Hi, this is John"
   ↓
Agent thinks: "Let me check if I know them"
   ↓
Agent calls: POST /api/tools/check_contact
{
  "phone_number": "+15551234567",
  "caller_name": "John"
}
   ↓
YOUR backend:
  • Queries Supabase contacts table
  • Returns: {"is_contact": true, "relationship": "friend"}
   ↓
Agent responds: "Hi John! How can I help you?"
```

---

### Tool 4: Block Scam (Protection)

**What it does:** Agent (or your backend) can end suspicious calls immediately

```
During call:
Caller: "This is the IRS, you owe taxes..."
   ↓
PARALLEL PROCESSING:

Thread 1 (Agent conversation):
  Agent: "I'm sorry, I can't help with that..."

Thread 2 (YOUR backend intelligence):
  Google ADK Scam Detector:
    • Keyword match: "IRS" (5ms)
    • RAG similarity: 0.95 (scam script match)
    • Gemini analysis: SCAM (200ms)
    • Confidence: 0.95
   ↓
  YOUR backend calls: POST /api/tools/block_scam
   ↓
  Tool calls Twilio API: hangup_call(call_sid)
   ↓
  Call terminated ✂️
```

**This is the magic:** Agent handles conversation while YOUR backend runs intelligence in parallel!

---

## 🟣 AGENT LAYER: Google ADK Multi-Agent System

These agents run in the **background** during every call. They don't talk to the caller - they provide intelligence to your backend.

### Agent 1: Scam Detector

**Role:** Analyzes transcript for fraud patterns

**What it does:**
```python
# Runs on EVERY transcript update
async def detect_scam(transcript: str):
    # Fast path: Keyword matching (5ms)
    keywords = ["irs", "arrest warrant", "gift cards"]
    score = count_matches(transcript, keywords)

    if score > 3:
        # Deep analysis: RAG + Gemini (200ms)
        similar_scams = await rag_search(transcript)
        gemini_analysis = await gemini.analyze_scam(transcript)

        if gemini_analysis.confidence > 0.85:
            return {
                "is_scam": True,
                "action": "BLOCK"
            }
```

**When it triggers:**
- Real-time as conversation happens
- Doesn't interrupt the call
- If scam detected → Calls `block_scam` tool

---

### Agent 2: Intent Classifier

**Role:** Understands what the caller wants

**What it does:**
```python
async def classify_intent(transcript: str):
    # Uses Gemini 1.5 Flash
    intent = await gemini.classify(
        transcript,
        options=["reservation", "friend", "sales", "scam", "question"]
    )

    return {
        "intent": intent,
        "confidence": 0.92
    }
```

**When it triggers:**
- After first few sentences
- Helps agent choose appropriate response style
- Updates dashboard with call type

---

### Agent 3: Entity Verifier

**Role:** Checks if businesses/places mentioned are legitimate

**What it does:**
```python
async def verify_entity(entity: str):
    # Caller mentions "ABC Restaurant"
    # Google Search API: Is this real?

    results = await google_search(f"{entity} official website")

    if len(results) > 0:
        return {"verified": True, "url": results[0].link}
    else:
        return {"verified": False, "suspicious": True}
```

**When it triggers:**
- When caller mentions business names
- Helps detect fake companies (scam indicator)
- Can share info with agent via tool call

---

### Agent 4: Decision Maker

**Role:** Combines all agent outputs to make final decision

**What it does:**
```python
async def make_decision(call_data):
    # Combines:
    # - Scam Detector output
    # - Intent Classifier output
    # - Entity Verifier output

    if scam_score > 0.85:
        return {"action": "BLOCK"}

    elif intent == "reservation" and entity_verified:
        return {"action": "ASSIST"}

    elif intent == "friend" and in_whitelist:
        return {"action": "TRANSFER"}

    else:
        return {"action": "SCREEN"}
```

---

## 📊 Complete Call Flow (All Layers Together)

```
┌─────────────────────────────────────────────────────────┐
│  SECOND 0: Call Starts                                  │
├─────────────────────────────────────────────────────────┤
│  Caller → Twilio → ElevenLabs Agent                     │
│  Agent: "Hello, this is Maria's AI assistant"           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SECOND 3: Caller Speaks                                │
├─────────────────────────────────────────────────────────┤
│  Caller: "I'd like to book a table for Friday 7pm"      │
│                                                          │
│  Parallel Processing:                                   │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │ ElevenLabs Agent     │  │ Google ADK Agents       │ │
│  │ • STT → Text         │  │ • Scam Det: score=0.01  │ │
│  │ • Understands request│  │ • Intent: "reservation" │ │
│  │ • Decides to use tool│  │ • Entity: not mentioned │ │
│  └──────────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SECOND 5: Agent Uses Tool                              │
├─────────────────────────────────────────────────────────┤
│  Agent → POST /api/tools/check_calendar                 │
│  Request: {                                              │
│    "user_id": "user_123",  ← From agent config          │
│    "date": "2025-01-03",                                │
│    "time": "19:00"                                      │
│  }                                                       │
│                                                          │
│  YOUR backend:                                           │
│  • Calls Google Calendar API                            │
│  • Checks availability                                  │
│                                                          │
│  Response: {                                             │
│    "available": true,                                   │
│    "conflicts": []                                      │
│  }                                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SECOND 7: Agent Responds                               │
├─────────────────────────────────────────────────────────┤
│  Agent: "Friday at 7pm is available. Shall I book it?"  │
│  TTS (your cloned voice) → Twilio → Caller hears        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SECOND 10: Caller Confirms                             │
├─────────────────────────────────────────────────────────┤
│  Caller: "Yes, please book it"                          │
│                                                          │
│  Agent → POST /api/tools/book_calendar                  │
│  YOUR backend → Google Calendar API → Creates event     │
│                                                          │
│  Response: {"success": true, "event_id": "evt_123"}     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SECOND 12: Confirmation                                │
├─────────────────────────────────────────────────────────┤
│  Agent: "Done! I've added it to your calendar."         │
│                                                          │
│  Background:                                             │
│  Google ADK Decision Agent:                             │
│    • Intent: reservation ✓                              │
│    • Action taken: booked ✓                             │
│    • Scam score: 0.01 (safe) ✓                         │
│    • Decision: COMPLETE SUCCESSFULLY                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SECOND 15: Call Ends                                   │
├─────────────────────────────────────────────────────────┤
│  Caller: "Thank you!"                                   │
│  Agent: "You're welcome! Have a great day."             │
│                                                          │
│  YOUR backend:                                           │
│  • Logs call to Supabase                                │
│  • Updates dashboard via WebSocket:                     │
│    "Reservation booked - Friday 7pm"                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary: Who Does What

| Component | Role | When Active |
|-----------|------|-------------|
| **Twilio** | Handles phone network (PSTN ↔ Internet) | Entire call |
| **ElevenLabs Agent** | Voice conversation (your cloned voice) | Entire call |
| **Tool: check_calendar** | Looks up availability | When agent needs to check |
| **Tool: book_calendar** | Creates events | When agent confirms booking |
| **Tool: check_contact** | Verifies whitelist | When agent wants to know caller |
| **Tool: block_scam** | Ends suspicious calls | When scam detected |
| **Agent: Scam Detector** | Analyzes for fraud (background) | Every transcript update |
| **Agent: Intent Classifier** | Understands caller goal (background) | After first sentences |
| **Agent: Entity Verifier** | Checks business legitimacy (background) | When entities mentioned |
| **Agent: Decision Maker** | Combines insights (background) | Continuously |

---

## 🔧 Configuration Order (Start Simple, Add Complexity)

### Phase 1: Basic Call (5 minutes)
1. ✅ Configure Twilio in ElevenLabs Studio
2. ✅ Test: Call works, AI responds in your voice
3. ✅ No tools yet - just conversation

### Phase 2: Add Calendar (10 minutes)
1. ✅ Deploy backend to Cloud Run
2. ✅ Add `check_calendar` tool in ElevenLabs
3. ✅ Test: "Can we meet Friday?"
4. ✅ Agent uses tool, responds with availability

### Phase 3: Add Booking (5 minutes)
1. ✅ Add `book_calendar` tool
2. ✅ Integrate Google Calendar API
3. ✅ Test: "Book it for 7pm"
4. ✅ Event appears in your calendar

### Phase 4: Add Scam Protection (10 minutes)
1. ✅ Add `block_scam` tool
2. ✅ Deploy Google ADK agents (background)
3. ✅ Test: "This is the IRS..."
4. ✅ Call gets blocked immediately

### Phase 5: Add Contacts (5 minutes)
1. ✅ Add `check_contact` tool
2. ✅ Add contacts to Supabase
3. ✅ Test: Whitelisted caller gets warm greeting

---

## 💡 Key Insights

**1. ElevenLabs Agent = Conversation Handler**
- Speaks in your voice
- Understands speech
- Uses tools when needed
- Doesn't know about scams (that's Google ADK's job)

**2. Google ADK Agents = Intelligence Layer**
- Run in parallel with conversation
- Analyze transcript for patterns
- Don't talk to caller directly
- Trigger tools when needed (e.g., block_scam)

**3. Tools = Bridge Between Them**
- ElevenLabs agent calls tools to get data
- YOUR backend runs Google ADK to generate insights
- Tools return structured responses
- Agent uses responses in conversation

**4. Supabase = Memory**
- Stores contacts, call logs, voice profiles
- Tools query it for data
- Agents update it with results

---

**Last Updated:** December 28, 2025
**Status:** Crystal-clear architecture
**Next:** Follow SIMPLE_SETUP.md to deploy!
