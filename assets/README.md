# AI Gatekeeper - Visual Assets

This directory contains all visual assets for the AI Gatekeeper project, including product screenshots and architecture diagrams.

## 📱 Product Screenshots

Located in `screenshots/`:

### Main Dashboard Views
![Home Dashboard - Orb View](screenshots/home-orb.png)
*Main dashboard with glowing orb showing threats blocked and protection status*

![Home Dashboard - Stats](screenshots/home.png)
*Dashboard with detailed statistics and call history*

![Dashboard Analytics](screenshots/dashboard.png)
*Analytics view tracking protection metrics over time*

![Dashboard Stats Detail](screenshots/dashboard-stats.png)
*Detailed statistics showing total calls, time saved, block rate, and today's activity*

### Call Management
![Calls Log](screenshots/calls.png)
*Complete call history with filtering options*

![Calls List Detail](screenshots/calls-list.png)
*Detailed call list showing blocked and passed calls with timestamps*

### Voice & Settings
![Voice Interface](screenshots/voice-interface.png)
*Voice control interface for hands-free interaction*

![Voice Interface Full](screenshots/voice-interface-full.png)
*Full voice interface with "Tap to Start" prompt*

![Settings](screenshots/settings.png)
*Settings overview with profile, voice, notifications, and privacy options*

![Settings Full](screenshots/settings-full.png)
*Complete settings page with all configuration options*

---

## 🏗️ Architecture Diagrams

Located in `architecture/`:

### System Overview
![System Architecture](architecture/system-overview.png)
*Complete system architecture showing integration between Twilio, ElevenLabs, and Google Cloud services*

### Call Flow
![Call Flow Diagram](architecture/call-flow.png)
*Detailed call routing logic for Accessibility and Gatekeeper modes with parallel agent execution*

### Agent Architecture
![Agent Architecture](architecture/agent-architecture.png)
*Multi-agent system with specialized agents for screening, detection, and decision-making*

### Sequence Diagram
![Sequence Diagram](architecture/sequence-diagram.png)
*Real-time interaction flow showing sub-100ms response times and parallel processing*

### Database Schema
![Database Schema](architecture/database-schema.png)
*Supabase database schema with optimized tables for users, calls, contacts, and vector embeddings*

---

## 📝 Usage

### For GitHub README
```markdown
![Dashboard](assets/screenshots/home.png)
```

### For Devpost Submission
Upload images from:
- `assets/screenshots/` - Product interface screenshots
- `assets/architecture/` - Technical architecture diagrams

### For Documentation
All images are also available in the web app at:
- Product screenshots: `/images/features/`
- Architecture diagrams: `/images/architecture/`

---

## 🎨 Image Details

### Screenshots
- **Format**: PNG
- **Purpose**: Showcase the user interface and user experience
- **Total**: 10 images
- **Size**: ~160-240 KB each

### Architecture Diagrams
- **Format**: PNG
- **Purpose**: Technical documentation and system design
- **Total**: 5 diagrams
- **Size**: ~60-110 KB each

---

## 🎯 Proof of Working

Located in `proofs/`:

### ElevenLabs Integration Evidence
![Tool Check Contact](proofs/elevenlabs-tool-check-contact.png)
*Server tool `check_contact` successfully executing - 524ms LLM, 74ms result*

![Contact Response](proofs/elevenlabs-contact-response.png)
*Structured JSON response from backend showing contact lookup results*

![Conversation Transcript](proofs/elevenlabs-conversation-transcript.png)
*Live conversation with performance metrics - 418ms LLM, 192ms TTS, 119ms ASR*

![Tool Block Scam](proofs/elevenlabs-tool-block-scam.png)
*Server tool `block_scam` successfully executing - 471ms LLM, 150ms result*

![Scam Detection](proofs/elevenlabs-scam-detection.png)
*Scam detection details - IRS scam identified with 90% confidence*

---

Built for **AI Partner Catalyst 2025** 🚀
