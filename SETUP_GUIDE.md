# 🚀 AI Gatekeeper Setup Guide

## ✅ What's Already Done

- ✅ Backend deployed to Cloud Run: **https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app**
- ✅ ElevenLabs Agent created: **agent_6801kdt0jrjjf13bk24sywwy0kze** (Name: "AI Gatekeeper")
- ✅ `.env` configured with API keys

## 📋 What You Need to Do

### Step 1: Configure ElevenLabs Agent Tools

1. Go to [ElevenLabs Conversational AI Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Find and click on your agent: **"AI Gatekeeper"** (ID: `agent_6801kdt0jrjjf13bk24sywwy0kze`)
3. Go to the **"Tools"** tab
4. Click **"Add Tool"** and add each of the following 6 tools:

#### Tool 1: check_calendar
- **Name**: `check_calendar`
- **Description**: `Check user's calendar availability for a specific date and time`
- **Type**: Webhook
- **URL**: `https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/check_calendar`
- **Method**: POST
- **Parameters**:
  - `date` (string, required): Date in YYYY-MM-DD format
  - `time` (string, required): Time in HH:MM format
  - `duration_minutes` (integer, optional): Duration in minutes

#### Tool 2: book_calendar
- **Name**: `book_calendar`
- **Description**: `Book an event on user's Google Calendar`
- **Type**: Webhook
- **URL**: `https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/book_calendar`
- **Method**: POST
- **Parameters**:
  - `title` (string, required): Event title
  - `date` (string, required): Date in YYYY-MM-DD format
  - `time` (string, required): Time in HH:MM format
  - `duration_minutes` (integer, optional): Duration in minutes

#### Tool 3: check_contact
- **Name**: `check_contact`
- **Description**: `Check if caller is in user's contact list`
- **Type**: Webhook
- **URL**: `https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/check_contact`
- **Method**: POST
- **Parameters**:
  - `phone_number` (string, required): Caller's phone number
  - `caller_name` (string, optional): Name provided by caller

#### Tool 4: transfer_call
- **Name**: `transfer_call`
- **Description**: `Transfer call to user's actual phone`
- **Type**: Webhook
- **URL**: `https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/transfer_call`
- **Method**: POST
- **Parameters**:
  - `reason` (string, optional): Reason for transfer

#### Tool 5: log_call
- **Name**: `log_call`
- **Description**: `Log call summary at end of conversation`
- **Type**: Webhook
- **URL**: `https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/log_call`
- **Method**: POST
- **Parameters**:
  - `intent` (string, optional): Call intent
  - `summary` (string, optional): Brief summary
  - `action_taken` (string, optional): Action taken

#### Tool 6: block_scam
- **Name**: `block_scam`
- **Description**: `Immediately terminate scam call and log report`
- **Type**: Webhook
- **URL**: `https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/block_scam`
- **Method**: POST
- **Parameters**:
  - `scam_type` (string, optional): Type of scam detected
  - `confidence` (number, optional): Confidence score 0-1
  - `red_flags` (array, optional): List of suspicious phrases

### Step 2: Configure ElevenLabs Webhook

1. In the same agent settings, find **"Client Events"** or **"Webhooks"** section
2. Set the **Client Events Webhook URL** to:
   ```
   https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/elevenlabs/webhook
   ```

### Step 3: Configure Twilio

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on your Twilio phone number
4. Scroll to **Voice & Fax** section
5. Under **"A call comes in"**:
   - Set to: **Webhook**
   - URL: `https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/telephony/incoming`
   - Method: **HTTP POST**
6. Click **Save**

### Step 4: Update Your `.env` (Optional)

If you have Twilio credentials, update these in `backend/.env`:

```bash
TWILIO_ACCOUNT_SID=your_actual_sid
TWILIO_AUTH_TOKEN=your_actual_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

Then redeploy:
```bash
./deploy_backend.sh
```

## 🧪 Testing

Once configured, call your Twilio number and the AI Gatekeeper should:
1. Answer in the cloned voice (or default Rachel voice)
2. Screen the call
3. Use tools to check calendar, contacts, etc.
4. Block scams if detected

## 🔧 Troubleshooting

- **Tools not working?** Check that all 6 tools are added in ElevenLabs dashboard
- **Call not connecting?** Verify Twilio webhook is set correctly
- **Backend errors?** Check Cloud Run logs: `gcloud run logs read ai-gatekeeper-backend --region us-central1`

## 📞 Support

Your backend is live at: **https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app**

You can test it's running by visiting: https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/health
