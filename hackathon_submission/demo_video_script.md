# 🎬 DEMO VIDEO SCRIPT - AI Gatekeeper

**Target Length:** 2:00 minutes (120 seconds)
**Format:** Two-column table [VISUAL | AUDIO]
**Tone:** Emotional → Inspiring → Technical → Impactful

**Landing Page:** Linear-style dark mode design available at `hackathon_submission/landing_page.html`
- Features live animated transcript demo
- Deep blue → cyan gradient (#0a0f29, #06b6d4)
- Mermaid architecture diagram
- All 7 sections: Social Proof, Dual-Mode, Tech Stack, How It Works, Roadmap, Pricing, Waitlist

---

## PRODUCTION NOTES

**CRITICAL REQUIREMENTS:**
- Show **ACTUAL code files** (not generic screenshots)
- Use **REAL data** from Supabase database
- Display **ACTUAL API endpoints** from the codebase
- Show **REAL logs** from Cloud Run/local testing
- Consider recording demo using deployed landing page as intro/outro

**Files to show:**
- `backend/app/routers/telephony_optimized.py` (call routing)
- `backend/app/agents/scam_detector_agent.py` (0.16ms detection)
- `backend/app/routers/elevenlabs_tools.py` (6 server tools)
- `backend/app/services/database.py` (Supabase queries)
- Frontend onboarding screens (Next.js)

---

## SCENE-BY-SCENE BREAKDOWN

| Time | VISUAL | AUDIO |
|------|--------|-------|
| **0:00-0:15** | **THE HOOK** | |
| 0:00-0:05 | Black screen → White text fades in: "473 million people worldwide are deaf or hard of hearing." | [Silence] |
| 0:05-0:10 | Next line fades in: "They cannot use phones." | [Silence, building tension] |
| 0:10-0:15 | Cut to: Stock footage of Maria (young woman, 30s) staring at her phone. "MISSED CALL" notification appears. She looks frustrated. Her sister walks in, Maria gestures showing the phone. | **Voiceover:** "Maria is 32. She's a software engineer. But she can't use her phone. She waits for her sister to call back... every single time." |
| **0:15-0:20** | **THE SOLUTION REVEAL** | |
| 0:15-0:17 | Screen flashes white | **Voiceover:** "Until now." |
| 0:17-0:20 | Bold logo animates in: "**AI Gatekeeper**" with tagline: *"Your voice. Your ears. Your independence."* | **Voiceover:** "Introducing AI Gatekeeper: The first AI that gives deaf people full phone independence." |
| **0:20-0:35** | **DEMO START: Voice Cloning** | |
| 0:20-0:25 | Screen recording: Next.js frontend onboarding flow. Show actual app at `http://localhost:3000`. First screen: "Welcome to AI Gatekeeper" → Click "Get Started" → Second screen: "Clone Your Voice" | **Voiceover:** "Here's how it works. First, clone your voice. Just 30 seconds of audio." |
| 0:25-0:30 | Show file upload interface → User uploads `voice_sample.mp3` → Loading spinner → API call visual: `POST /api/voice/clone` with request body shown | **Voiceover:** "Upload your voice sample..." |
| 0:30-0:35 | Show success response from backend. Display actual JSON: `{"voice_id": "abc123", "status": "ready"}`. Show code snippet from `backend/app/routers/voice.py` on screen for 2 seconds. | **Voiceover:** "...and in seconds, your AI voice is ready." |
| **0:35-0:50** | **LIVE CALL SIMULATION** | |
| 0:35-0:40 | Split screen setup: Left: Phone dialing animation showing Twilio number `+1 (555) 123-4567`. Right: Terminal showing logs from `backend/app/routers/telephony_optimized.py` | **Voiceover:** "When someone calls, AI answers in YOUR voice. Watch." |
| 0:40-0:45 | Left: "Incoming call from +1 (555) 987-6543" → AI answers. Right: Show actual code from `telephony_optimized.py` lines 45-60 (ElevenLabs Register Call API integration) | **Voiceover:** "The call routes through Twilio to ElevenLabs Conversational AI..." |
| 0:45-0:50 | Left: Caller speaks: "Hi, I'd like to book a reservation for Friday at 7pm". Right: Real-time transcript appears on screen with WebSocket connection indicator. | **Voiceover:** "...and the conversation begins." |
| **0:50-1:05** | **ACCESSIBILITY MODE** | |
| 0:50-0:55 | Screen switches to frontend dashboard. Show Maria's view: Real-time transcript appearing word-by-word. Text input box at bottom. She types: "Yes, Friday at 7pm works for me." | **Voiceover:** "Deaf users see the transcript live. They type their response..." |
| 0:55-1:00 | Show backend processing: API call to `POST /api/tools/check_calendar` with parameters `{date: "2026-01-31", time: "19:00"}`. Show actual response JSON. | **Voiceover:** "...AI checks the calendar..." |
| 1:00-1:05 | Left: AI responds in cloned voice: "Perfect! I've added it to your calendar." Right: Show Supabase `calendar_events` table with new row inserted (actual database screenshot). | **Voiceover:** "...and speaks the response in their voice. Full independence." |
| **1:05-1:20** | **SCAM DETECTION DEMO** | |
| 1:05-1:10 | New call simulation. Left: Incoming call from "Unknown Number". Caller (robotic voice): "This is the IRS. You owe back taxes and will be arrested if you don't pay immediately." | **Voiceover:** "But here's the genius: AI blocks scams INSTANTLY." |
| 1:10-1:15 | Right: Show code from `backend/app/agents/scam_detector_agent.py` lines 28-45 (pattern matching logic). Highlight the line: `if any(flag in transcript.lower() for flag in SCAM_KEYWORDS)`. Show timestamp: `Detection time: 0.16ms` | **Voiceover:** "0.16 milliseconds. Faster than you can blink." |
| 1:15-1:20 | Left: AI responds: "I cannot help with this. Goodbye." Call ends. Right: Show Supabase `scam_reports` table with new entry: `{scam_type: "IRS", confidence: 0.95, red_flags: ["IRS", "arrest", "pay immediately"]}` | **Voiceover:** "The call is terminated. User protected." |
| **1:20-1:35** | **THE TECH** | |
| 1:20-1:25 | Animated architecture diagram (from `SUBMISSION_KIT/02_ARCHITECTURE_DIAGRAMS.md`). Show data flow: Twilio → ElevenLabs → FastAPI Backend → Google ADK | **Voiceover:** "Under the hood: 4 orchestrated agents, 6 server tools, real-time RAG, and Twilio integration." |
| 1:25-1:30 | Quick code montage (1 second each): 1) `backend/app/agents/orchestrator.py` 2) `backend/app/routers/elevenlabs_tools.py` 3) `backend/app/services/gemini_service.py` | **Voiceover:** "Built with Google Gemini 2.0 Flash..." |
| 1:30-1:35 | Show stack logos animating: ElevenLabs → Google Cloud → FastAPI → Next.js → Supabase | **Voiceover:** "...ElevenLabs Conversational AI, and FastAPI on Cloud Run." |
| **1:35-1:45** | **DASHBOARD & ANALYTICS** | |
| 1:35-1:40 | Frontend dashboard view: Show call history table with 5 calls listed. Columns: Caller, Duration, Status (Completed/Blocked), Summary. | **Voiceover:** "Users get complete transparency." |
| 1:40-1:45 | Click on a call → Detail modal opens showing: Full transcript, AI summary, Actions taken (e.g., "Booked calendar event"), Scam report if applicable. | **Voiceover:** "Every call logged. Every action explained." |
| **1:45-1:55** | **TEST RESULTS** | |
| 1:45-1:50 | Terminal showing `python test_complete_system.py` running. Show actual output: `Running 23 tests... ✓ Pass ✓ Pass ✓ Pass... Total: 23/23 PASSED ✅` | **Voiceover:** "Production-ready. 23 out of 23 tests passing." |
| 1:50-1:55 | Show deployment guide file `DEPLOYMENT_GUIDE.md` scrolling. Highlight sections: "Supabase Setup", "Twilio Configuration", "ElevenLabs Agent", "Cloud Run Deployment". | **Voiceover:** "Complete deployment guide. Ready to launch." |
| **1:55-2:00** | **THE IMPACT** | |
| 1:55-1:58 | Return to Maria. She's smiling, looking at her phone. Text overlay: "473 million people just gained independence." | **Voiceover:** "473 million people just gained independence." |
| 1:58-2:00 | Screen fades to logo: "AI Gatekeeper - Voice & Ears for the Voiceless". Below: "Built for AI Partner Catalyst 2025 | Google Cloud + ElevenLabs" | **Voiceover:** "And everyone else got protected. That's AI Gatekeeper." |

---

## EXACT FILE PATHS TO SHOW

### Backend Files (show actual code):
1. `backend/app/routers/telephony_optimized.py` (lines 45-75: ElevenLabs Register Call API)
2. `backend/app/agents/scam_detector_agent.py` (lines 28-45: Pattern matching + 0.16ms logic)
3. `backend/app/routers/elevenlabs_tools.py` (lines 10-30: check_calendar tool)
4. `backend/app/services/database.py` (lines 50-70: get_voice_profile method)
5. `backend/test_complete_system.py` (show test output)

### Frontend Screens (show actual UI):
1. Onboarding flow: `frontend/app/onboarding/page.tsx`
2. Dashboard: `frontend/app/dashboard/page.tsx`
3. Call detail modal: `frontend/components/CallDetailModal.tsx`

### Database Screenshots:
1. Supabase `calls` table (show 3-5 real call entries)
2. Supabase `scam_reports` table (show 2-3 scam entries)
3. Supabase `calendar_events` table (show 1-2 booked events)

### API Endpoints to Display:
```
POST /api/voice/clone
POST /api/telephony/incoming
POST /api/tools/check_calendar
POST /api/tools/book_calendar
POST /api/tools/block_scam
GET /api/analytics/calls
```

---

## VOICEOVER SCRIPT (Full Text)

> "Maria is 32. She's a software engineer. But she can't use her phone. She waits for her sister to call back... every single time.
>
> Until now.
>
> Introducing AI Gatekeeper: The first AI that gives deaf people full phone independence.
>
> Here's how it works. First, clone your voice. Just 30 seconds of audio. Upload your voice sample... and in seconds, your AI voice is ready.
>
> When someone calls, AI answers in YOUR voice. Watch. The call routes through Twilio to ElevenLabs Conversational AI... and the conversation begins.
>
> Deaf users see the transcript live. They type their response... AI checks the calendar... and speaks the response in their voice. Full independence.
>
> But here's the genius: AI blocks scams INSTANTLY. 0.16 milliseconds. Faster than you can blink. The call is terminated. User protected.
>
> Under the hood: 4 orchestrated agents, 6 server tools, real-time RAG, and Twilio integration. Built with Google Gemini 2.0 Flash... ElevenLabs Conversational AI, and FastAPI on Cloud Run.
>
> Users get complete transparency. Every call logged. Every action explained.
>
> Production-ready. 23 out of 23 tests passing. Complete deployment guide. Ready to launch.
>
> 473 million people just gained independence. And everyone else got protected.
>
> That's AI Gatekeeper."

**Total Word Count:** ~180 words (perfect for 2-minute delivery at 90 words/min)

---

## VISUAL ASSETS NEEDED

### Stock Footage:
- [ ] Young woman (deaf, 30s) looking frustrated at phone
- [ ] Sister helping her make a call
- [ ] Same woman smiling confidently on phone (ending)

### Screen Recordings:
- [ ] Frontend onboarding flow (local development)
- [ ] Live call simulation with transcript
- [ ] Dashboard with call history
- [ ] Supabase database tables

### Code Screens:
- [ ] VSCode with actual backend files open
- [ ] Terminal showing test results
- [ ] API request/response in Postman or curl

### Graphics:
- [ ] Architecture diagram (animated)
- [ ] Stack logos (ElevenLabs, Google Cloud, etc.)
- [ ] Logo animation

---

## MUSIC & SOUND

**Background Music:**
- 0:00-0:20: Ambient, emotional (low volume)
- 0:20-1:20: Upbeat, inspiring (builds gradually)
- 1:20-1:35: Techy, fast-paced (code montage)
- 1:35-2:00: Triumphant, hopeful (conclusion)

**Sound Effects:**
- Phone ringing (0:35)
- Notification ding (calendar booked at 1:05)
- Error/warning sound (scam blocked at 1:15)
- Success chime (tests passing at 1:50)

---

## EXPORT SETTINGS

- **Resolution:** 1920x1080 (Full HD)
- **Frame Rate:** 30fps
- **Format:** MP4 (H.264 codec)
- **Aspect Ratio:** 16:9
- **Max File Size:** <100MB (for Devpost)
- **Subtitles:** Embed closed captions (accessibility!)

---

## POST-PRODUCTION CHECKLIST

- [ ] Color grading (darker tones for tech, warm tones for emotional scenes)
- [ ] Text overlays (clean sans-serif font)
- [ ] Logo watermark (bottom right)
- [ ] End screen with links (GitHub, Devpost, Demo)
- [ ] YouTube optimized thumbnail
- [ ] Upload to YouTube (unlisted or public)
- [ ] Generate shareable link for Devpost

---

**FINAL NOTE:** This video should make judges FEEL the impact (accessibility-first) while RESPECTING the technical complexity (show real code, not mockups).
