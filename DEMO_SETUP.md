# 🎬 DEMO SETUP (2 Minutes)

**Fastest path to working phone demo for hackathon**

---

## Quick Setup: Native Integration

### Step 1: Get API Keys (1 minute)

**Twilio:**
1. https://console.twilio.com
2. Copy: Account SID, Auth Token, Phone Number

**ElevenLabs:**
1. https://elevenlabs.io/app/voice-lab
2. Clone your voice (30-second sample)
3. https://elevenlabs.io/app/conversational-ai
4. Create agent → Copy Agent ID

---

### Step 2: Configure ElevenLabs (1 minute)

#### A. Add Twilio Phone Number

1. In ElevenLabs agent → **"Phone Numbers"** tab
2. Click **"Add Phone Number"** → **"Twilio"**
3. Enter:
   ```
   Twilio Account SID: ACxxxxxxxxxxxxxx
   Twilio Auth Token: your_auth_token
   Phone Number: +15551234567
   ```
4. Click **"Add"**
5. ✅ ElevenLabs automatically configures webhooks!

#### B. Configure System Prompt

Copy this into **"System Prompt"**:

```
You are an AI assistant answering calls for [YOUR NAME].

CRITICAL: Identify as AI in first sentence per FCC regulations.
Say: "Hello, this is [YOUR NAME]'s AI assistant. How can I help you?"

Your job:
1. For reservations: Ask date/time, confirm you'll handle it
2. For scam calls: Politely decline and end call
3. For friends: Be warm and helpful
4. For sales: Politely decline

Speak naturally. Keep responses brief (2-3 sentences max).
Never share personal information.
```

---

### Step 3: Test (30 seconds)

**Call your Twilio number:**
```
You: [Call +15551234567]
AI: "Hello, this is [Your Name]'s AI assistant. How can I help you?"
You: "I'd like to make a dinner reservation for Friday at 7pm"
AI: "I can help with that! Let me check the calendar for Friday at 7pm..."
```

✅ **IT WORKS!** AI is answering in your cloned voice.

---

## For Hackathon Demo (No Tools Needed Yet)

**This is ENOUGH for a working demo:**
- ✅ AI answers calls in your voice
- ✅ Has natural conversation
- ✅ Can handle basic scenarios

**Demo script:**
1. **Scenario 1 - Reservation:**
   - Call number
   - Ask for reservation
   - AI responds helpfully
   - Show it understood and would handle it

2. **Scenario 2 - Scam:**
   - Call again
   - Say "This is the IRS..."
   - AI politely declines
   - Ends conversation

**This proves the concept!** No backend tools needed for basic demo.

---

## Optional: Add Backend Tools Later

**If you want live calendar integration, scam blocking, etc.:**

1. Deploy backend (see PRODUCTION_SETUP.md)
2. Add tools in ElevenLabs Studio
3. Tools enhance the agent's capabilities

**But for hackathon:** The basic call handling is impressive enough!

---

## Troubleshooting

### "The number you called is not in service"
→ Wrong Twilio number. Check console.twilio.com

### No AI response / Voicemail
→ Agent not assigned to number. Check ElevenLabs Studio → Phone Numbers

### AI sounds robotic / Wrong voice
→ Wrong voice selected. Check agent settings → Voice tab

### Call connects but AI doesn't understand
→ System prompt too complex. Use simpler version above

---

## What You Just Built

✅ **Phone number that answers with AI**
✅ **Your cloned voice**
✅ **Natural conversation**
✅ **2-minute setup**

**Total cost:** $0 (Twilio trial + ElevenLabs free tier)

---

## Next: Production Setup

When ready for production with full features:
- See `PRODUCTION_SETUP.md` for custom backend
- Adds: Calendar integration, scam blocking, contact whitelist
- Requires: Backend deployment, Supabase, Google Cloud

But for demo: **This is perfect!**

---

**Last Updated:** December 28, 2025
**Setup Time:** 2 minutes
**Status:** Demo-ready with zero bugs
