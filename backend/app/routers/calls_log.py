"""
Calls Logging Router - Add calls to database from voice interactions
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import logging
import uuid
import asyncio

from app.services.database import db_service
from app.services.gemini_service import get_gemini_service

logger = logging.getLogger(__name__)

router = APIRouter()


class CallLogRequest(BaseModel):
    """Request model for logging a call"""
    caller_number: str = "Unknown"
    transcript: str = ""
    scam_score: float = 0.0
    intent: str = "unknown"
    user_id: str = "00000000-0000-0000-0000-000000000001"


@router.post("/log")
async def log_call(request: CallLogRequest):
    """
    Log a new call from ElevenLabs voice interaction
    
    This endpoint is called by the frontend when a voice conversation ends.
    It creates a new call record and transcript in Supabase.
    """
    
    if not db_service.client:
        logger.error("Database not initialized")
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        # Create call record
        call_id = str(uuid.uuid4())
        call_data = {
            "id": call_id,
            "user_id": request.user_id,
            "caller_number": request.caller_number,
            "caller_name": "Voice Test" if request.caller_number == "Test" else request.caller_number,
            "call_sid": f"CALL_{uuid.uuid4().hex[:12]}",
            "status": "blocked" if request.scam_score > 0.7 else "ended",
            "intent": request.intent,
            "scam_score": request.scam_score,
            "passed_through": request.scam_score < 0.5,
            "started_at": datetime.utcnow().isoformat(),
            "ended_at": datetime.utcnow().isoformat(),
            "duration_seconds": 60  # Default duration
        }
        
        logger.info(f"Logging call: {call_data['caller_number']} - scam_score: {request.scam_score}")
        
        # Insert call record
        db_service.client.table('calls').insert(call_data).execute()
        
        # Generate AI summary if transcript exists
        summary = f"Voice call - scam score: {request.scam_score:.2f}"
        if request.transcript:
            try:
                gemini = get_gemini_service()
                # Run summarization (non-blocking if possible, but for now we wait)
                summary = await gemini.generate_call_summary(
                    transcript=request.transcript,
                    intent=request.intent,
                    duration_seconds=60
                )
            except Exception as e:
                logger.error(f"Failed to generate AI summary: {e}")
                summary = f"Voice call (Summary failed) - scam score: {request.scam_score:.2f}"

        # Log transcript with summary
        if request.transcript:
            transcript_data = {
                "call_id": call_id,
                "transcript": request.transcript,
                "sentiment": "negative" if request.scam_score > 0.7 else "neutral",
                "summary": summary
            }
            
            db_service.client.table('call_transcripts').insert(transcript_data).execute()
            logger.info(f"Transcript and summary logged for call {call_id}: {summary}")
        
        return {
            "success": True,
            "call_id": call_id,
            "message": "Call logged successfully",
            "summary": summary
        }
        
    except Exception as e:
        logger.error(f"Error logging call: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def get_calls(user_id: str = "00000000-0000-0000-0000-000000000001", limit: int = 50):
    """
    Get recent calls from database
    
    Returns list of calls for the specified user, ordered by most recent first.
    """
    
    if not db_service.client:
        logger.error("Database not initialized")
        return {"calls": [], "error": "Database not connected"}
    
    try:
        response = db_service.client.table('calls') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('started_at', desc=True) \
            .limit(limit) \
            .execute()
        
        calls = response.data if response.data else []
        logger.info(f"Retrieved {len(calls)} calls for user {user_id}")
        
        return {"calls": calls}
        
    except Exception as e:
        logger.error(f"Error getting calls: {e}")
        return {"calls": [], "error": str(e)}


@router.get("/{call_id}")
async def get_call_details(call_id: str):
    """
    Get full details for a specific call, including transcript
    """
    if not db_service.client:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        # Fetch call data
        call_response = db_service.client.table('calls').select('*').eq('id', call_id).single().execute()
        if not call_response.data:
            raise HTTPException(status_code=404, detail="Call not found")
            
        call_data = call_response.data

        # Fetch transcript
        transcript_response = db_service.client.table('call_transcripts').select('*').eq('call_id', call_id).execute()
        transcript_data = transcript_response.data[0] if transcript_response.data else None

        return {
            "call": call_data,
            "transcript": transcript_data,
            "summary": transcript_data.get('summary') if transcript_data else None
        }

    except Exception as e:
        logger.error(f"Error fetching call details: {e}")
        raise HTTPException(status_code=500, detail=str(e))
