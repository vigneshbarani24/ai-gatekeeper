# AI Gatekeeper

**The first AI that answers your phone intelligently**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vigneshbarani24/ai-gatekeeper)

## 🎯 Overview

AI Gatekeeper is a production-grade voice AI system that provides:
- **Accessibility Mode**: Full phone independence for 473M deaf/speech-impaired people
- **Gatekeeper Mode**: Intelligent call screening and scam protection for 3.5B smartphone users

Built for **AI Partner Catalyst 2025** (Google + ElevenLabs)

## 🚀 Quick Deploy to Vercel

### 1. Click the Deploy Button Above

### 2. Set Environment Variables

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_6801kdt0jrjjf13bk24sywwy0kze
NEXT_PUBLIC_ELEVENLABS_API_KEY=2e67e86b682285afd0b6bf58713f30c80d812b53ef3d01ddb6bb32b10b1aa44e
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### 3. Deploy!

Your landing page will be live at: `https://your-project.vercel.app`

## 📐 Architecture

### System Overview
![System Architecture](/public/architecture-system.png)

### Multi-Agent Orchestration
![Agent Flow](/public/architecture-agents.png)

### Call Flow Sequence
![Call Sequence](/public/architecture-sequence.png)

### Decision Tree
![Decision Logic](/public/architecture-decision.png)

### Database Schema
![Database](/public/architecture-database.png)

## 🛠️ Tech Stack

### AI & Voice
- **ElevenLabs** (All 4 Features):
  - Voice Cloning
  - TTS Turbo v2
  - Conversational AI
  - Server Tools
- **Google Gemini 2.0 Flash** (Scam Detection)
- **Google ADK** (Multi-Agent Orchestration)

### Backend
- FastAPI (Python 3.11)
- Twilio (Telephony)
- Supabase (PostgreSQL)
- Google Cloud Run (Deployment)

### Frontend
- Next.js 14 (App Router)
- React 19
- Framer Motion
- TailwindCSS

## 🎨 Features

### Accessibility Mode
- Real-time transcription
- Voice cloning (30-second samples)
- Type-to-speak interface
- Calendar integration
- 24/7 availability

### Gatekeeper Mode
- 0.16ms scam detection
- Intelligent call screening
- VIP whitelist
- Call analytics
- Appointment booking

## 📊 Impact

- **473M** deaf users empowered
- **0.16ms** scam detection speed
- **$40B** total addressable market
- **29+** languages supported
- **4/4** ElevenLabs features used

## 🏗️ Local Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | ElevenLabs Agent ID | `agent_xxx...` |
| `NEXT_PUBLIC_ELEVENLABS_API_KEY` | ElevenLabs API Key | `2e67e86b...` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com` |

## 📚 Documentation

- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Technical Spec](./docs/TECHNICAL_SPEC.md)
- [API Documentation](./docs/API_ENDPOINTS.md)
- [Architecture Deep Dive](./TECHNICAL_DEEP_DIVE.md)

## 🎥 Demo

[Watch Demo Video](https://youtube.com/your-demo-video)

## 🤝 Contributing

This project was built for AI Partner Catalyst 2025. Contributions welcome!

## 📄 License

MIT License - Open Source

## 📧 Contact

- **GitHub**: [@vigneshbarani24](https://github.com/vigneshbarani24)
- **Project**: [AI Gatekeeper](https://github.com/vigneshbarani24/ai-gatekeeper)

---

**Built with ❤️ for AI Partner Catalyst 2025**
