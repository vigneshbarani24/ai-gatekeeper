"""
AI Gatekeeper Demo - ElevenLabs + Google ADK Integration
Simple demo without Twilio dependency
"""

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client, Client
from datetime import datetime, timedelta
import uuid

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="AI Gatekeeper Demo",
    description="ElevenLabs + Google ADK Voice Intelligence",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Configure Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"✅ Supabase connected: {SUPABASE_URL}")
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "AI Gatekeeper Demo",
        "version": "1.0.0",
        "status": "running",
        "integrations": {
            "elevenlabs": "configured" if ELEVENLABS_API_KEY else "missing",
            "google_gemini": "configured" if GOOGLE_API_KEY else "missing"
        }
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "elevenlabs_key": "✓" if ELEVENLABS_API_KEY else "✗",
        "google_api_key": "✓" if GOOGLE_API_KEY else "✗"
    }

@app.get("/api/analyze-scam")
async def analyze_scam(text: str):
    """Analyze text for scam indicators using Google Gemini"""
    if not GOOGLE_API_KEY:
        return {"error": "Google API key not configured"}
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        prompt = f"""Analyze this phone call transcript for scam indicators:

"{text}"

Provide:
1. Is this likely a scam? (yes/no)
2. Scam confidence score (0.0-1.0)
3. Scam type (if applicable): IRS, tech_support, social_security, warranty, etc.
4. Red flags detected
5. Recommended action: block, warn, or allow

Format as JSON."""

        response = model.generate_content(prompt)
        
        return {
            "status": "success",
            "analysis": response.text,
            "model": "gemini-2.0-flash-exp"
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/elevenlabs/config")
async def get_elevenlabs_config():
    """Get ElevenLabs configuration for frontend"""
    return {
        "api_key": ELEVENLABS_API_KEY,
        "websocket_url": "wss://api.elevenlabs.io/v1/convai/conversation",
        "agent_id": os.getenv("ELEVENLABS_AGENT_ID", "demo_agent_id")
    }

@app.get("/api/calls")
async def get_calls(user_id: str = "00000000-0000-0000-0000-000000000001", limit: int = 20):
    """Get recent calls from Supabase"""
    if not supabase:
        return {"error": "Supabase not configured", "calls": []}
    
    try:
        response = supabase.table('calls').select('*').eq('user_id', user_id).order('started_at', desc=True).limit(limit).execute()
        return {"calls": response.data if response.data else []}
    except Exception as e:
        return {"error": str(e), "calls": []}

@app.get("/api/analytics/dashboard")
async def get_dashboard(user_id: str = "00000000-0000-0000-0000-000000000001"):
    """Get dashboard stats from Supabase"""
    if not supabase:
        # Return demo data if Supabase not configured
        return {
            "total_calls": 1247,
            "scams_blocked": 89,
            "time_saved_hours": 39,
            "block_rate": 99
        }
    
    try:
        # Get all calls for user
        calls_response = supabase.table('calls').select('*').eq('user_id', user_id).execute()
        calls = calls_response.data if calls_response.data else []
        
        total_calls = len(calls)
        scams_blocked = sum(1 for call in calls if call.get('intent') == 'scam' and call.get('status') == 'blocked')
        
        # Calculate time saved (assuming 2 min per blocked call)
        time_saved_hours = (scams_blocked * 2) // 60
        
        # Calculate block rate
        scam_calls = [c for c in calls if c.get('intent') == 'scam']
        block_rate = (scams_blocked / len(scam_calls) * 100) if scam_calls else 99
        
        return {
            "total_calls": total_calls,
            "scams_blocked": scams_blocked,
            "time_saved_hours": time_saved_hours,
            "block_rate": int(block_rate)
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/calls/log")
async def log_call(
    user_id: str = "00000000-0000-0000-0000-000000000001",
    caller_number: str = "Unknown",
    transcript: str = "",
    scam_score: float = 0.0,
    intent: str = "unknown"
):
    """Log a new call from ElevenLabs conversation"""
    if not supabase:
        return {"error": "Supabase not configured"}
    
    try:
        call_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "caller_number": caller_number,
            "caller_name": "ElevenLabs Call",
            "call_sid": f"CALL_{uuid.uuid4().hex[:12]}",
            "status": "blocked" if scam_score > 0.8 else "ended",
            "intent": intent,
            "scam_score": scam_score,
            "passed_through": scam_score < 0.5,
            "started_at": datetime.utcnow().isoformat(),
            "ended_at": datetime.utcnow().isoformat(),
            "duration_seconds": 60
        }
        
        response = supabase.table('calls').insert(call_data).execute()
        
        # Also log transcript if provided
        if transcript and response.data:
            call_id = response.data[0]['id']
            transcript_data = {
                "call_id": call_id,
                "transcript": transcript,
                "sentiment": "negative" if scam_score > 0.7 else "neutral",
                "summary": f"Call with scam score: {scam_score}"
            }
            supabase.table('call_transcripts').insert(transcript_data).execute()
        
        return {"success": True, "call_id": call_data["id"]}
    except Exception as e:
        return {"error": str(e)}


@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    """WebSocket for real-time voice communication"""
    await websocket.accept()
    
    try:
        while True:
            # Receive audio data from frontend
            data = await websocket.receive_json()
            
            # Process with Google ADK if needed
            if data.get("type") == "transcript":
                transcript = data.get("text", "")
                
                # Quick scam check
                if any(word in transcript.lower() for word in ["irs", "warrant", "arrest", "social security"]):
                    await websocket.send_json({
                        "type": "scam_alert",
                        "confidence": 0.95,
                        "message": "Potential scam detected!"
                    })
            
            # Echo back for now
            await websocket.send_json({"type": "ack", "data": data})
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
