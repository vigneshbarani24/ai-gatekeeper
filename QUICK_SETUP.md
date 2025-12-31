# 🎯 Step-by-Step Setup Guide

## Part 1: ElevenLabs Tools Setup

### Step 1: Access Your Agent
1. Go to https://elevenlabs.io/app/conversational-ai
2. Find your agent: **"AI Gatekeeper"**
3. Click on it to open settings

### Step 2: Add Tools (Repeat for each of 6 tools)

Click **"Add Tool"** or **"Tools"** tab, then for each tool below:

---

#### 🗓️ Tool 1: check_calendar

**Copy these exact values:**

```
Name: check_calendar
Description: Check user's calendar availability for a specific date and time
Type: Webhook
URL: https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/check_calendar
Method: POST
```

**Parameters to add:**
1. Click "Add Parameter"
   - Name: `date`
   - Type: `string`
   - Required: ✅ Yes
   - Description: `Date in YYYY-MM-DD format`

2. Click "Add Parameter"
   - Name: `time`
   - Type: `string`
   - Required: ✅ Yes
   - Description: `Time in HH:MM format`

3. Click "Add Parameter"
   - Name: `duration_minutes`
   - Type: `integer`
   - Required: ❌ No
   - Description: `Duration in minutes`

Click **Save**

---

#### 📅 Tool 2: book_calendar

```
Name: book_calendar
Description: Book an event on user's Google Calendar
Type: Webhook
URL: https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/book_calendar
Method: POST
```

**Parameters:**
1. `title` (string, required) - Event title
2. `date` (string, required) - Date in YYYY-MM-DD format
3. `time` (string, required) - Time in HH:MM format
4. `duration_minutes` (integer, optional) - Duration in minutes

Click **Save**

---

#### 👤 Tool 3: check_contact

```
Name: check_contact
Description: Check if caller is in user's contact list
Type: Webhook
URL: https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/check_contact
Method: POST
```

**Parameters:**
1. `phone_number` (string, required) - Caller's phone number
2. `caller_name` (string, optional) - Name provided by caller

Click **Save**

---

#### 📞 Tool 4: transfer_call

```
Name: transfer_call
Description: Transfer call to user's actual phone
Type: Webhook
URL: https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/transfer_call
Method: POST
```

**Parameters:**
1. `reason` (string, optional) - Reason for transfer

Click **Save**

---

#### 📝 Tool 5: log_call

```
Name: log_call
Description: Log call summary at end of conversation
Type: Webhook
URL: https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/log_call
Method: POST
```

**Parameters:**
1. `intent` (string, optional) - Call intent
2. `summary` (string, optional) - Brief summary
3. `action_taken` (string, optional) - Action taken

Click **Save**

---

#### 🚫 Tool 6: block_scam

```
Name: block_scam
Description: Immediately terminate scam call and log report
Type: Webhook
URL: https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/block_scam
Method: POST
```

**Parameters:**
1. `scam_type` (string, optional) - Type of scam detected
2. `confidence` (number, optional) - Confidence score 0-1
3. `red_flags` (array, optional) - List of suspicious phrases

Click **Save**

---

### Step 3: Configure Webhook for Events

In your agent settings, find the **"Client Events"** or **"Advanced"** section:

```
Client Events Webhook URL: https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/elevenlabs/webhook
```

Enable these events:
- ✅ User Transcript
- ✅ Agent Response
- ✅ Tool Response

---

## Part 2: Twilio Setup

### Step 1: Access Twilio Console
1. Go to https://console.twilio.com
2. Log in to your account

### Step 2: Configure Phone Number
1. Click **Phone Numbers** in left sidebar
2. Click **Manage** → **Active Numbers**
3. Click on your phone number

### Step 3: Set Voice Webhook
Scroll to **"Voice & Fax"** section:

```
A call comes in:
  Type: Webhook
  URL: https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/telephony/incoming
  Method: HTTP POST
```

Click **Save** at the bottom

### Step 4: (Optional) Get Twilio Credentials

If you want to enable call transfer features:

1. From Twilio Console home, copy:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click "Show" to reveal)
   - **Phone Number** (your Twilio number)

2. Update `backend/.env`:
```bash
TWILIO_ACCOUNT_SID=AC...your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

3. Redeploy:
```bash
cd /Users/apple/Gatekeeper/Storytopia/ai-gatekeeper
./deploy_backend.sh
```

---

## ✅ Verification Checklist

- [ ] All 6 tools added in ElevenLabs
- [ ] Client Events webhook configured in ElevenLabs
- [ ] Twilio phone number webhook configured
- [ ] (Optional) Twilio credentials in `.env` and redeployed

## 🧪 Test Your Setup

Call your Twilio number and you should hear the AI assistant answer!

## 🆘 Need Help?

If you get stuck on any step, let me know which part and I can provide more specific guidance.
