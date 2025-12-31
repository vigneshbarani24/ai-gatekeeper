# 🎯 LAPTOP TASKS - AI GATEKEEPER FINAL CHECKLIST

**Everything you need to do on your laptop to submit and win.**

---

## 📋 PRE-FLIGHT CHECK

Before starting, ensure you have:
- [ ] Laptop with stable internet
- [ ] Google Cloud SDK installed (`gcloud --version`)
- [ ] Vercel CLI installed (`vercel --version`)
- [ ] All API keys ready (ElevenLabs, Twilio, Supabase, Google Cloud)
- [ ] Video recording software (OBS, Loom, or QuickTime)

**Estimated Total Time:** 3-4 hours

---

## ⚡ CRITICAL PATH (DO THESE FIRST)

### TASK 1: Deploy Backend to Cloud Run ⏱️ 15 minutes

```bash
cd ai-gatekeeper/backend

# Set Google Cloud project
gcloud config set project YOUR_PROJECT_ID

# Create secrets
echo -n "YOUR_ELEVENLABS_KEY" | gcloud secrets create elevenlabs-api-key --data-file=-
echo -n "YOUR_TWILIO_TOKEN" | gcloud secrets create twilio-auth-token --data-file=-
echo -n "YOUR_SUPABASE_KEY" | gcloud secrets create supabase-service-role-key --data-file=-

# Deploy (single command)
gcloud run deploy ai-gatekeeper \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ENVIRONMENT=production,TWILIO_ACCOUNT_SID=ACxxxxx,ELEVENLABS_AGENT_ID=xxxxx \
  --set-secrets ELEVENLABS_API_KEY=elevenlabs-api-key:latest,TWILIO_AUTH_TOKEN=twilio-auth-token:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest
```

**Get backend URL:**
```bash
gcloud run services describe ai-gatekeeper --region us-central1 --format='value(status.url)'
```

**Expected:** `https://ai-gatekeeper-xxxxx-uc.a.run.app`

**✅ Checklist:**
- [ ] Backend deployed successfully
- [ ] Health check passes: `curl YOUR_URL/health`
- [ ] Copy backend URL (needed for frontend + ElevenLabs tools)

---

### TASK 2: Update ElevenLabs Server Tools ⏱️ 5 minutes

Go to https://elevenlabs.io/app/conversational-ai → Your Agent → Tools

Update all 6 tools to use YOUR backend URL:

**Replace:** `https://YOUR-BACKEND-URL.run.app`
**With:** `https://ai-gatekeeper-xxxxx-uc.a.run.app` (your actual URL)

Tools to update:
- [ ] check_calendar
- [ ] book_calendar
- [ ] check_contact
- [ ] transfer_call
- [ ] log_call
- [ ] block_scam

---

### TASK 3: Deploy Frontend to Vercel ⏱️ 5 minutes

```bash
cd ai-gatekeeper/frontend

# Create .env.production
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://ai-gatekeeper-xxxxx-uc.a.run.app
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
NEXT_PUBLIC_ENVIRONMENT=production
EOF

# Deploy
vercel login
vercel --prod
```

**Expected:** `https://ai-gatekeeper-app.vercel.app`

**✅ Checklist:**
- [ ] Frontend deployed
- [ ] Can access welcome screen
- [ ] Copy frontend URL (needed for demo video)

---

### TASK 4: Deploy Landing Page ⏱️ 3 minutes

```bash
cd ai-gatekeeper/hackathon_submission

# Create simple Vercel project for landing page
mkdir landing-page-deploy
cp landing_page.html landing-page-deploy/index.html
cd landing-page-deploy

# Deploy
vercel --prod
```

**Expected:** `https://ai-gatekeeper-landing.vercel.app`

**✅ Checklist:**
- [ ] Landing page live
- [ ] All sections load correctly
- [ ] Copy landing page URL

---

## 🎥 CONTENT CREATION

### TASK 5: Record Demo Video ⏱️ 1-2 hours

**Script:** See `SUBMISSION_KIT.md` → Section 3 (Demo Video Script)

**What to record:**
1. **0:00-0:15** - Hook (Maria's story - use stock footage or text slides)
2. **0:15-0:35** - Voice cloning flow (screen record frontend)
3. **0:35-1:05** - Live call demo (simulate call with Twilio number)
4. **1:05-1:20** - Scam blocking demo (show logs, scam_detector_agent.py)
5. **1:20-1:35** - Architecture diagram (show Mermaid diagrams)
6. **1:35-1:45** - Code montage (VSCode with actual files)
7. **1:45-2:00** - Impact (Maria smiling, logo reveal)

**Tools:**
- **Screen recording:** OBS Studio (free) or Loom
- **Video editing:** DaVinci Resolve (free) or iMovie
- **Voiceover:** Audacity or built-in mic

**Export settings:**
- Resolution: 1920x1080
- Format: MP4 (H.264)
- Max size: 100MB
- Subtitles: Embed (accessibility!)

**Upload:**
```bash
# Upload to YouTube
# Set to: Unlisted (or Public if confident)
# Copy YouTube link
```

**✅ Checklist:**
- [ ] Video recorded (2 minutes)
- [ ] Voiceover clear
- [ ] Shows ACTUAL code (not mockups)
- [ ] Uploaded to YouTube
- [ ] Copy YouTube URL

---

### TASK 6: Update Landing Page with Video ⏱️ 2 minutes

Edit `landing_page.html` line ~672:

```javascript
// Replace YOUR_VIDEO_ID with actual YouTube ID
video.src = 'https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1';
```

**Example:** If YouTube URL is `https://youtu.be/dQw4w9WgXcQ`
→ Video ID is: `dQw4w9WgXcQ`

Redeploy:
```bash
cd landing-page-deploy
# Edit index.html
vercel --prod
```

---

## 📝 SUBMISSION

### TASK 7: Submit to Devpost ⏱️ 15 minutes

**Go to:** https://devpost.com/[hackathon-url]

**Use:** `SUBMISSION_KIT.md` → Section 2 (Devpost Submission)

**Copy-paste sections:**
1. **Tagline:** "Voice & ears for 473M voiceless people worldwide"
2. **Inspiration:** Full text from SUBMISSION_KIT
3. **What it does:** Full text from SUBMISSION_KIT
4. **How we built it:** Full text from SUBMISSION_KIT
5. **Challenges:** Full text from SUBMISSION_KIT
6. **Accomplishments:** Bullet points from SUBMISSION_KIT
7. **What we learned:** Bullet points from SUBMISSION_KIT
8. **What's next:** Bullet points from SUBMISSION_KIT

**Links to add:**
- **GitHub Repo:** https://github.com/vigneshbarani24/Storytopia/tree/main/ai-gatekeeper
- **Demo Video:** https://youtu.be/YOUR_VIDEO_ID
- **Live Demo:** https://ai-gatekeeper-app.vercel.app
- **Landing Page:** https://ai-gatekeeper-landing.vercel.app

**Built With (select these):**
- ElevenLabs
- Google Cloud
- Gemini
- Twilio
- Supabase
- FastAPI
- Next.js
- React
- TailwindCSS
- Vercel

**✅ Checklist:**
- [ ] All text sections filled
- [ ] All links working
- [ ] Demo video embedded
- [ ] "Built With" tags selected
- [ ] Team member added (if applicable)
- [ ] Submission submitted ✅

---

## 🎨 OPTIONAL (IF TIME PERMITS)

### TASK 8: Create Pitch Deck Slides ⏱️ 30 minutes

**Use:** `SUBMISSION_KIT.md` → Section 4 (Pitch Deck)

**Tools:**
- **Marp:** https://marp.app (renders Markdown → slides)
- **Or:** Copy content into Google Slides/PowerPoint

**Export as PDF** for backup

---

### TASK 9: Export Architecture Diagrams ⏱️ 10 minutes

**Use:** `SUBMISSION_KIT.md` → Section 5 (Architecture Diagrams)

Go to https://mermaid.live

Copy-paste each Mermaid diagram, export as:
- PNG (high resolution)
- SVG (for README)

**Diagrams to export:**
- [ ] C4 Context Diagram
- [ ] Sequence Diagram (Scam Detection)
- [ ] Entity Relationship Diagram
- [ ] Agent Orchestration Flow
- [ ] Data Flow Diagram

---

### TASK 10: Update README ⏱️ 5 minutes

**Replace** current `ai-gatekeeper/README.md` with content from:
`SUBMISSION_KIT.md` → Section 6 (Production README)

**Update these placeholders:**
- [ ] `[your-email@example.com]` → Your email
- [ ] `[linkedin.com/in/your-profile]` → Your LinkedIn
- [ ] `[@your_handle]` → Your Twitter
- [ ] Demo video link
- [ ] Live demo URL

```bash
cd ai-gatekeeper
# Copy content from SUBMISSION_KIT.md Section 6
# Paste into README.md
git add README.md
git commit -m "docs: Update README with production version"
git push
```

---

## 🧪 END-TO-END TEST

### TASK 11: Test Complete User Flow ⏱️ 10 minutes

**Test Accessibility Mode:**
1. Call your Twilio number: `+15551234567`
2. AI should answer in ElevenLabs agent voice
3. Say: "I'd like to book an appointment for Friday at 7pm"
4. AI should use `check_calendar` tool
5. Check Supabase `calendar_events` table → New row created

**Test Gatekeeper Mode (Scam):**
1. Call your Twilio number
2. Say: "This is the IRS. You owe back taxes..."
3. AI should immediately hang up
4. Check Supabase `scam_reports` table → Scam logged

**✅ Checklist:**
- [ ] Phone calls connect
- [ ] AI responds in voice
- [ ] Tools work (calendar, scam blocking)
- [ ] Database updates
- [ ] Frontend dashboard shows calls

---

## 🏆 FINAL CHECKLIST

Before submitting, verify:

### Infrastructure
- [ ] ✅ Backend deployed to Cloud Run
- [ ] ✅ Frontend deployed to Vercel
- [ ] ✅ Landing page deployed to Vercel
- [ ] ✅ All services healthy

### Telephony
- [ ] ✅ Twilio number configured
- [ ] ✅ ElevenLabs agent configured
- [ ] ✅ ElevenLabs tools updated with backend URL
- [ ] ✅ Test call succeeds

### Content
- [ ] ✅ Demo video recorded (2 min)
- [ ] ✅ Demo video uploaded to YouTube
- [ ] ✅ Landing page has video embed

### Submission
- [ ] ✅ Devpost form completed
- [ ] ✅ All links working
- [ ] ✅ GitHub repo public
- [ ] ✅ Submission submitted

### Documentation
- [ ] ✅ README updated with production version
- [ ] ✅ All placeholders replaced (email, links, etc.)
- [ ] ✅ Architecture diagrams exported

---

## 🚨 TROUBLESHOOTING

### "Backend won't deploy"
```bash
# Check logs
gcloud run services logs read ai-gatekeeper --limit 50

# Common fix: Check secrets exist
gcloud secrets list
```

### "Frontend shows API error"
```bash
# Verify backend URL in .env.production
cat frontend/.env.production

# Should match Cloud Run URL exactly
```

### "Calls not connecting"
1. Check Twilio webhook: Console → Phone Numbers → Your Number → Voice webhook
2. Should be: `https://ai-gatekeeper-xxxxx-uc.a.run.app/api/telephony/incoming`
3. Method: HTTP POST

### "ElevenLabs tools not working"
1. Go to ElevenLabs Studio → Agent → Tools
2. Each tool URL must match: `https://ai-gatekeeper-xxxxx-uc.a.run.app/api/tools/TOOL_NAME`
3. No typos, must be HTTPS

---

## ⏱️ TIME ESTIMATES

| Task | Time | Critical? |
|------|------|-----------|
| Deploy Backend | 15 min | ✅ YES |
| Update ElevenLabs Tools | 5 min | ✅ YES |
| Deploy Frontend | 5 min | ✅ YES |
| Deploy Landing Page | 3 min | ✅ YES |
| Record Demo Video | 1-2 hours | ✅ YES |
| Submit to Devpost | 15 min | ✅ YES |
| Update README | 5 min | Optional |
| Export Diagrams | 10 min | Optional |
| E2E Test | 10 min | ✅ YES |

**TOTAL CRITICAL PATH:** ~2.5 hours
**TOTAL WITH OPTIONAL:** ~3.5 hours

---

## 📧 WHAT TO DO AFTER SUBMISSION

1. **Tweet about it** (tag @ElevenLabs, @GoogleCloud, @GoogleDevs)
2. **Post on LinkedIn** (tag companies, add demo video)
3. **Email judges** (if allowed) with your submission link
4. **Monitor Devpost** for comments/questions
5. **Prepare for demo day** (if there is one)

---

## 🎉 YOU'RE DONE!

Once all critical tasks are ✅, you've successfully:
- Deployed production infrastructure
- Created professional marketing materials
- Submitted to hackathon
- Built something that helps 473M people

**Now wait for results and celebrate! 🏆**

---

**Last Updated:** December 28, 2025
**Estimated Completion:** 2.5-3.5 hours
**Difficulty:** Moderate (clear instructions, just follow steps)

**Questions?** Check `DEPLOYMENT_GUIDE.md` or `SUBMISSION_KIT.md`
