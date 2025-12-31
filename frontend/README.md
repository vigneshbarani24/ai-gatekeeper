# AI Gatekeeper Frontend

> Industry-grade AI-powered call screening application built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Voice AI Integration**: Real-time voice interaction with ElevenLabs AI agents
- **Call Screening**: Intelligent scam detection and call filtering
- **Dashboard Analytics**: Comprehensive call statistics and insights
- **Dark Theme UI**: Modern, professional glassmorphism design
- **Type-Safe**: Full TypeScript coverage with strict type checking
- **Error Handling**: Comprehensive error boundaries and retry logic
- **Responsive**: Mobile-first design with optimized performance

## 📋 Prerequisites

- Node.js 18+ and npm
- ElevenLabs API key and Agent ID
- Backend API running (see backend README)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js 14 App Router pages
│   ├── page.tsx             # Homepage
│   ├── dashboard/           # Voice interface
│   ├── calls/               # Call history
│   ├── contacts/            # Trusted contacts
│   ├── settings/            # App settings
│   └── welcome/             # Landing page
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx       # Button component
│   │   └── Card.tsx         # Card component
│   ├── ErrorBoundary.tsx    # Error boundary
│   ├── VoiceOrb.tsx         # Voice interface component
│   └── BentoDashboard.tsx   # Dashboard component
├── types/                   # TypeScript type definitions
│   └── index.ts             # Shared types
├── utils/                   # Utility functions
│   └── api.ts               # API client with retry logic
├── config/                  # Configuration
│   └── index.ts             # Environment config
└── public/                  # Static assets
```

## 🎨 Design System

### Colors
- **Background**: `#020408` (Deep slate)
- **Surface**: `#0E121A` (Dark slate)
- **Primary**: Indigo-500 to Purple-500 gradient
- **Success**: Emerald-500
- **Error**: Rose-500

### Components
- `.glass-card`: Glassmorphism effect with blur
- `.premium-card`: Gradient background cards
- `.btn-premium`: Gradient button with shadow
- `.btn-secondary`: Subtle secondary button

### Typography
- **Body**: Plus Jakarta Sans
- **Headers**: Outfit
- **Consistent tracking and leading**

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting (recommended)

## 🏗️ Architecture

### Type Safety
All components and functions use proper TypeScript types defined in `types/index.ts`:
- API response types
- Component prop types
- Utility types
- Error types

### Error Handling
- **Error Boundary**: Catches React errors gracefully
- **API Retry Logic**: Exponential backoff for failed requests
- **Loading States**: Skeleton loaders for async content
- **Fallback Data**: Graceful degradation on errors

### API Client
The API client (`utils/api.ts`) provides:
- Automatic retry with exponential backoff
- Request timeout handling
- Type-safe responses
- Centralized error handling

## 🔐 Security

- Environment variable validation at startup
- Type-safe configuration access
- Input sanitization (recommended to implement)
- CORS configuration (backend)

## 📱 Pages

### Homepage (`/`)
- Dashboard statistics
- Recent call activity
- Quick access to features

### Voice Interface (`/dashboard`)
- VoiceOrb component
- Real-time AI interaction
- Voice session management

### Call History (`/calls`)
- Filterable call list
- Call details and transcripts
- Outcome tracking

### Contacts (`/contacts`)
- Trusted contact management
- Whitelist functionality

### Settings (`/settings`)
- Profile management
- AI voice configuration
- Notification preferences

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Update documentation

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
