# 🎙️ ElevenLabs & Twilio Setup Guide

This guide describes how to configure your ElevenLabs Conversational AI agent and Twilio to work with the AI Gatekeeper.

## 1. ElevenLabs Configuration

### Create your Agent
1. Go to [ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai).
2. Create a new agent.
3. Select your **Cloned Voice** (or a default one).
4. Use the **System Prompt** found in `backend/app/core/config.py`.

### Add Server Tools
In the ElevenLabs Dashboard, go to **Tools** and add the following 6 tools. Replace `<your-ngrok-or-backend-url>` with your actual URL (e.g., `https://xxxx.ngrok-free.app`).

#### 1. `check_calendar`
- **Description**: Check user's calendar availability for a specific date and time
- **URL**: `<your-backend-url>/api/tools/check_calendar`
- **Method**: `POST`
- **Parameters**:
  - `date` (string): Date in YYYY-MM-DD format
  - `time` (string): Time in HH:MM format (24-hour)
  - `duration_minutes` (integer): Duration in minutes

#### 2. `book_calendar`
- **Description**: Book an event on user's Google Calendar
- **URL**: `<your-backend-url>/api/tools/book_calendar`
- **Method**: `POST`
- **Parameters**:
  - `title` (string): Event title
  - `date` (string): Date in YYYY-MM-DD format
  - `time` (string): Time in HH:MM format
  - `duration_minutes` (integer): Duration in minutes

#### 3. `check_contact`
- **Description**: Check if caller is in user's contact list
- **URL**: `<your-backend-url>/api/tools/check_contact`
- **Method**: `POST`
- **Parameters**:
  - `phone_number` (string): Caller's phone number
  - `caller_name` (string): Name provided by caller (optional)

#### 4. `transfer_call`
- **Description**: Transfer call to user's actual phone
- **URL**: `<your-backend-url>/api/tools/transfer_call`
- **Method**: `POST`
- **Parameters**:
  - `reason` (string): Reason for transfer

#### 5. `log_call`
- **Description**: Log call summary at end of conversation
- **URL**: `<your-backend-url>/api/tools/log_call`
- **Method**: `POST`
- **Parameters**:
  - `intent` (string): Call intent (reservation, friend, sales, etc.)
  - `summary` (string): Brief summary of conversation
  - `action_taken` (string): Action taken (booked, transferred, etc.)

#### 6. `block_scam`
- **Description**: Immediately terminate scam call and log report
- **URL**: `<your-backend-url>/api/tools/block_scam`
- **Method**: `POST`
- **Parameters**:
  - `scam_type` (string): Type of scam detected
  - `confidence` (number): Confidence score 0-1
  - `red_flags` (array): List of suspicious phrases detected

### Webhook Configuration
In ElevenLabs Agent settings, set the **Client Events Webhook** to:
`<your-backend-url>/api/elevenlabs/webhook`

---

## 2. Twilio Configuration

1. In the [Twilio Console](https://console.twilio.com), go to your Phone Number settings.
2. Under **Voice & Fax**, find **A call comes in**.
3. Set the **Webhook** to:
   `<your-backend-url>/api/telephony/incoming`
4. Set the method to `HTTP POST`.

---

## 3. Environment Variables

Ensure your `backend/.env` has the following set:
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key.
- `ELEVENLABS_AGENT_ID`: The ID of the agent you just created.
- `ELEVENLABS_VOICE_ID`: Your cloned voice ID.
- `TWILIO_ACCOUNT_SID`: Your Twilio SID.
- `TWILIO_AUTH_TOKEN`: Your Twilio token.
- `TWILIO_PHONE_NUMBER`: Your Twilio number.
- `BACKEND_URL`: Your ngrok or production URL.
- `WEBHOOK_SECRET`: A secret string for security.

---

## 4. Local Testing with ngrok

1. Start the backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
2. Start ngrok (in a new terminal):
   ```bash
   ngrok http 8000
   ```
3. Update `BACKEND_URL` in `.env` and all URLs in ElevenLabs/Twilio dashboards with the ngrok URL.
