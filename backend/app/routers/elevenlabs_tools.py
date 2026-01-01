"""
ElevenLabs Server Tools: Custom tools for Conversational AI agent

When the agent needs information (calendar, whitelist, etc.),
it calls these webhooks and gets structured responses.
"""

import logging
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, validator

from app.services.database import db_service
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Import realtime broadcaster
from app.routers.realtime import (
    broadcast_call_updated,
    broadcast_scam_blocked,
    broadcast_tool_executed,
    broadcast_ai_thinking
)


# ======================
# REQUEST MODELS
# ======================

class ToolRequestBase(BaseModel):
    """Base model for all tool requests from ElevenLabs"""
    conversation_id: Optional[str] = None
    call_sid: str
    user_id: str

class CheckCalendarParams(BaseModel):
    """Parameters for check_calendar tool"""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    time: str = Field(..., description="Time in HH:MM format")
    duration_minutes: int = Field(default=60, ge=15, le=480)

class BookCalendarParams(BaseModel):
    """Parameters for book_calendar tool"""
    title: str = Field(..., min_length=1, max_length=200)
    date: str
    time: str
    duration_minutes: int = Field(default=60, ge=15, le=480)
    attendees: Optional[List[str]] = None

class CheckContactParams(BaseModel):
    """Parameters for check_contact tool"""
    phone_number: str = Field(..., min_length=10)
    caller_name: Optional[str] = None

class TransferCallParams(BaseModel):
    """Parameters for transfer_call tool"""
    reason: str = Field(..., min_length=1)

class LogCallParams(BaseModel):
    """Parameters for log_call tool"""
    intent: str
    summary: str = Field(..., min_length=1)
    action_taken: str
    sentiment: Optional[str] = None

class BlockScamParams(BaseModel):
    """Parameters for block_scam tool"""
    scam_type: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    red_flags: List[str] = Field(default_factory=list)


# ======================
# RESPONSE MODELS
# ======================

class ToolResponse(BaseModel):
    """Standard tool response format"""
    success: bool
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


def validate_tool_request(data: dict, user_id_required: bool = True) -> tuple[str, str, dict]:
    """
    Validate and extract common tool request fields

    Args:
        data: Raw request data
        user_id_required: Whether user_id is required

    Returns:
        Tuple of (call_sid, user_id, parameters)
    """
    call_sid = data.get("call_sid")
    if not call_sid:
        raise HTTPException(status_code=400, detail="Missing call_sid")

    user_id = data.get("user_id")
    if user_id_required and not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id")

    params = data.get("parameters", {})

    return call_sid, user_id, params


# ======================
# TOOL: Check Calendar
# ======================

@router.post("/tools/check_calendar")
async def check_calendar(request: Request):
    """
    Tool for agent to check user's Google Calendar availability

    Called by ElevenLabs agent during call:
    Agent: "Let me check your calendar for Friday at 7pm..."

    Request from ElevenLabs:
    {
        "conversation_id": "conv_123",
        "call_sid": "CA123",
        "user_id": "user_123",
        "parameters": {
            "date": "2025-01-03",
            "time": "19:00",
            "duration_minutes": 120
        }
    }

    Response to agent:
    {
        "success": true,
        "available": true,
        "conflicts": [],
        "suggested_times": ["19:00", "20:00", "21:00"],
        "message": "Calendar is available at 19:00"
    }
    """
    try:
        data = await request.json()
        call_sid, user_id, params = validate_tool_request(data)

        # Validate parameters
        try:
            calendar_params = CheckCalendarParams(**params)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid parameters: {e}")

        logger.info(f"🗓️ [Tool:check_calendar] User {user_id}: {calendar_params.date} {calendar_params.time} ({calendar_params.duration_minutes}min)")

        # Broadcast AI thinking
        await broadcast_ai_thinking(user_id, "calendar_agent", f"📅 Checking calendar for {calendar_params.date} at {calendar_params.time}...", {
            "date": calendar_params.date,
            "time": calendar_params.time
        })

        # TODO: Integrate with Google Calendar API
        # For now, return mock data assuming availability

        available = True
        conflicts = []
        suggested_times = [calendar_params.time, "20:00", "21:00"]

        response_data = {
            "success": True,
            "available": available,
            "conflicts": conflicts,
            "suggested_times": suggested_times,
            "date": calendar_params.date,
            "time": calendar_params.time,
            "duration_minutes": calendar_params.duration_minutes,
            "message": f"Calendar is available at {calendar_params.time} on {calendar_params.date}" if available else "Time slot is not available"
        }

        logger.info(f"✅ [Tool:check_calendar] Available: {available}")
        return response_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [Tool:check_calendar] Error: {e}", exc_info=True)
        return {
            "success": False,
            "available": False,
            "error": str(e),
            "message": "Failed to check calendar availability"
        }


@router.post("/tools/book_calendar")
async def book_calendar(request: Request):
    """
    Tool for agent to book time on user's Google Calendar

    Called after user confirms:
    Agent: "I'll add that to your calendar now..."

    Request:
    {
        "user_id": "user_123",
        "parameters": {
            "title": "Dinner reservation at ABC Restaurant",
            "date": "2025-01-03",
            "time": "19:00",
            "duration_minutes": 120,
            "attendees": ["+15551234567"]  # Caller's phone
        }
    }

    Response:
    {
        "success": true,
        "event_id": "evt_abc123",
        "calendar_link": "https://calendar.google.com/..."
    }
    """
    try:
        data = await request.json()

        user_id = data.get("user_id")
        params = data.get("parameters", {})

        title = params.get("title")
        date = params.get("date")
        time = params.get("time")
        duration = params.get("duration_minutes", 120)

        logger.info(f"📅 [Tool] Booking calendar for user {user_id}: {title} on {date} {time}")

        # TODO: Call Google Calendar API
        # For now, return mock success

        return {
            "success": True,
            "event_id": "mock_event_123",
            "calendar_link": f"https://calendar.google.com/event?eid=mock_event_123",
            "title": title,
            "datetime": f"{date}T{time}:00"
        }

    except Exception as e:
        logger.error(f"❌ Calendar booking error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ======================
# TOOL: Check Whitelist
# ======================

@router.post("/tools/check_contact")
async def check_contact(request: Request):
    """
    Tool for agent to check if caller is in user's whitelist

    Called during conversation:
    Agent: "Let me see if I have you in my contacts..."

    Request:
    {
        "user_id": "user_123",
        "parameters": {
            "phone_number": "+15551234567",
            "caller_name": "John Smith"  # Optional, from caller
        }
    }

    Response:
    {
        "is_contact": true,
        "contact_name": "John Smith",
        "relationship": "friend",
        "notes": "College roommate"
    }
    """
    try:
        data = await request.json()

        user_id = data.get("user_id")
        params = data.get("parameters", {})

        phone_number = params.get("phone_number")

        logger.info(f"📞 [Tool] Checking contact for user {user_id}: {phone_number}")

        # Broadcast AI thinking
        await broadcast_ai_thinking(user_id, "contact_matcher", f"👤 Checking if {phone_number} is in your contacts...", {
            "phone_number": phone_number
        })

        # Query Supabase for contact
        contact = await db_service.get_contact_by_phone(user_id, phone_number)

        if contact:
            return {
                "is_contact": True,
                "contact_name": contact.get("name"),
                "relationship": contact.get("relationship", "contact"),
                "notes": contact.get("notes", ""),
                "auto_pass": contact.get("auto_pass", False)
            }
        else:
            return {
                "is_contact": False,
                "contact_name": None,
                "relationship": None,
                "notes": None
            }

    except Exception as e:
        logger.error(f"❌ Contact check error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ======================
# TOOL: Transfer to User
# ======================

@router.post("/tools/transfer_call")
async def transfer_call(request: Request):
    """
    Tool for agent to transfer call to user's actual phone

    Called when agent decides call is legitimate:
    Agent: "Let me connect you to them now..."

    Request:
    {
        "call_sid": "CA123",
        "user_id": "user_123",
        "parameters": {
            "reason": "Legitimate friend calling"
        }
    }

    Response:
    {
        "success": true,
        "message": "Transferring call now"
    }
    """
    try:
        data = await request.json()

        call_sid = data.get("call_sid")
        user_id = data.get("user_id")

        logger.info(f"📲 [Tool] Transferring call {call_sid} to user {user_id}")

        # Get user's actual phone number
        user = await db_service.get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user_phone = user.get("phone_number")

        # Update call via Twilio to dial user
        from app.services.twilio_service import twilio_service

        twilio_service.dial_user(user_phone, call_sid)

        return {
            "success": True,
            "message": "Transferring call to user",
            "user_phone": user_phone
        }

    except Exception as e:
        logger.error(f"❌ Transfer call error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ======================
# TOOL: Log Call Summary
# ======================

@router.post("/tools/log_call")
async def log_call(request: Request):
    """
    Tool for agent to log call details at end of conversation

    Called when call ends:
    Agent: "Logging call summary..."

    Request:
    {
        "call_sid": "CA123",
        "user_id": "user_123",
        "parameters": {
            "intent": "reservation",
            "summary": "Restaurant reservation for Friday 7pm",
            "action_taken": "booked_calendar",
            "sentiment": "positive"
        }
    }

    Response:
    {
        "success": true,
        "logged": true,
        "message": "Call logged successfully"
    }
    """
    try:
        data = await request.json()
        call_sid, user_id, params = validate_tool_request(data)

        # Validate parameters
        try:
            log_params = LogCallParams(**params)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid parameters: {e}")

        logger.info(f"📝 [Tool:log_call] Logging call {call_sid}")
        logger.info(f"   Intent: {log_params.intent}")
        logger.info(f"   Action: {log_params.action_taken}")
        logger.info(f"   Summary: {log_params.summary[:100]}...")

        # Broadcast AI thinking
        await broadcast_ai_thinking(user_id, "screener_agent", f"📝 Logging call as '{log_params.intent}' - {log_params.action_taken}", {
            "intent": log_params.intent,
            "action": log_params.action_taken,
            "summary_preview": log_params.summary[:80]
        })

        # Update call record in Supabase
        try:
            await db_service.update_call(
                call_sid=call_sid,
                intent=log_params.intent,
                status="completed",
                action_taken=log_params.action_taken
            )
            logger.info(f"✅ [Tool:log_call] Call record updated")

            # Broadcast update to frontend
            await broadcast_call_updated(user_id, call_sid, {
                "intent": log_params.intent,
                "action_taken": log_params.action_taken,
                "status": "completed"
            })
        except Exception as e:
            logger.error(f"❌ [Tool:log_call] Failed to update call: {e}")

        # Save transcript/summary
        try:
            await db_service.save_transcript(call_sid, log_params.summary)
            logger.info(f"✅ [Tool:log_call] Transcript saved")
        except Exception as e:
            logger.error(f"❌ [Tool:log_call] Failed to save transcript: {e}")

        # Broadcast tool execution
        await broadcast_tool_executed(user_id, "log_call", {
            "call_sid": call_sid,
            "intent": log_params.intent,
            "success": True
        })

        return {
            "success": True,
            "logged": True,
            "call_sid": call_sid,
            "intent": log_params.intent,
            "action_taken": log_params.action_taken,
            "logged_at": datetime.utcnow().isoformat(),
            "message": f"Call logged: {log_params.intent} - {log_params.action_taken}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [Tool:log_call] Error: {e}", exc_info=True)
        return {
            "success": False,
            "logged": False,
            "error": str(e),
            "message": "Failed to log call"
        }


# ======================
# TOOL: Block Scam
# ======================

@router.post("/tools/block_scam")
async def block_scam(request: Request):
    """
    Tool for agent to immediately end scam calls

    Called when scam detected:
    Agent: "This appears to be a scam. Ending call now..."

    Request:
    {
        "call_sid": "CA123",
        "user_id": "user_123",
        "parameters": {
            "scam_type": "irs_impersonation",
            "confidence": 0.95,
            "red_flags": ["threatens arrest", "demands gift cards"]
        }
    }

    Response:
    {
        "success": true,
        "action": "call_terminated",
        "blocked": true,
        "message": "Scam call blocked successfully"
    }
    """
    try:
        data = await request.json()
        call_sid, user_id, params = validate_tool_request(data)

        # Validate parameters
        try:
            scam_params = BlockScamParams(**params)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid parameters: {e}")

        logger.warning(f"🚨 [Tool:block_scam] BLOCKING SCAM: {call_sid}")
        logger.warning(f"   Type: {scam_params.scam_type}")
        logger.warning(f"   Confidence: {scam_params.confidence:.2%}")
        logger.warning(f"   Red Flags: {', '.join(scam_params.red_flags)}")

        # Broadcast AI thinking - CRITICAL DETECTION
        await broadcast_ai_thinking(user_id, "scam_detector", f"🚨 SCAM DETECTED: {scam_params.scam_type} ({scam_params.confidence:.0%} confidence) - BLOCKING NOW!", {
            "scam_type": scam_params.scam_type,
            "confidence": scam_params.confidence,
            "red_flags": scam_params.red_flags,
            "action": "blocking_call"
        })

        # End call via Twilio (CRITICAL - must happen immediately)
        from app.services.twilio_service import twilio_service
        try:
            await twilio_service.hangup_call(call_sid)
            logger.info(f"✅ [Tool:block_scam] Call {call_sid} terminated")
        except Exception as e:
            logger.error(f"❌ [Tool:block_scam] Failed to hangup call: {e}")
            # Continue with logging even if hangup fails

        # Log scam report to Supabase
        try:
            await db_service.create_scam_report(
                call_sid=call_sid,
                scam_type=scam_params.scam_type,
                confidence=scam_params.confidence,
                red_flags=scam_params.red_flags
            )
            logger.info(f"✅ [Tool:block_scam] Scam report logged")
        except Exception as e:
            logger.error(f"❌ [Tool:block_scam] Failed to log scam report: {e}")

        # Update call record
        try:
            await db_service.update_call(
                call_sid=call_sid,
                intent="scam",
                scam_score=scam_params.confidence,
                action_taken="blocked"
            )
            logger.info(f"✅ [Tool:block_scam] Call record updated")
        except Exception as e:
            logger.error(f"❌ [Tool:block_scam] Failed to update call: {e}")

        # Send SMS alert to user (optional, based on settings)
        try:
            user = await db_service.get_user_by_id(user_id)
            if user and user.get("phone_number"):
                # TODO: Uncomment when ready to send SMS alerts
                # from app.services.twilio_service import twilio_service
                # twilio_service.send_sms(
                #     user["phone_number"],
                #     f"🚨 AI Gatekeeper blocked a {scam_params.scam_type} scam call. Details in dashboard."
                # )
                pass
        except Exception as e:
            logger.error(f"⚠️ [Tool:block_scam] Failed to send SMS alert: {e}")

        logger.warning(f"🛡️ [Tool:block_scam] SCAM BLOCKED SUCCESSFULLY: {scam_params.scam_type} ({scam_params.confidence:.0%})")

        # Broadcast to frontend for real-time UI update
        await broadcast_scam_blocked(user_id, call_sid, scam_params.scam_type, scam_params.confidence)

        # Broadcast tool execution
        await broadcast_tool_executed(user_id, "block_scam", {
            "call_sid": call_sid,
            "scam_type": scam_params.scam_type,
            "confidence": scam_params.confidence,
            "blocked": True
        })

        return {
            "success": True,
            "action": "call_terminated",
            "blocked": True,
            "scam_type": scam_params.scam_type,
            "confidence": scam_params.confidence,
            "red_flags": scam_params.red_flags,
            "message": f"Scam call blocked: {scam_params.scam_type} (confidence: {scam_params.confidence:.0%})"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [Tool:block_scam] Critical error: {e}", exc_info=True)
        return {
            "success": False,
            "blocked": False,
            "error": str(e),
            "message": "Failed to block scam call - please report this error"
        }


# ======================
# TOOL REGISTRY
# ======================

def get_tool_definitions() -> List[Dict[str, Any]]:
    """
    Tool definitions for ElevenLabs agent configuration

    Copy these into your ElevenLabs agent settings:
    Dashboard → Agent → Tools → Add Custom Tool
    """
    return [
        {
            "name": "check_calendar",
            "description": "Check user's calendar availability for a specific date and time",
            "url": f"{settings.BACKEND_URL}/api/tools/check_calendar",
            "method": "POST",
            "parameters": {
                "date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
                "time": {"type": "string", "description": "Time in HH:MM format (24-hour)"},
                "duration_minutes": {"type": "integer", "description": "Duration in minutes"}
            }
        },
        {
            "name": "book_calendar",
            "description": "Book an event on user's Google Calendar",
            "url": f"{settings.BACKEND_URL}/api/tools/book_calendar",
            "method": "POST",
            "parameters": {
                "title": {"type": "string", "description": "Event title"},
                "date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
                "time": {"type": "string", "description": "Time in HH:MM format"},
                "duration_minutes": {"type": "integer", "description": "Duration in minutes"}
            }
        },
        {
            "name": "check_contact",
            "description": "Check if caller is in user's contact list",
            "url": f"{settings.BACKEND_URL}/api/tools/check_contact",
            "method": "POST",
            "parameters": {
                "phone_number": {"type": "string", "description": "Caller's phone number"},
                "caller_name": {"type": "string", "description": "Name provided by caller (optional)"}
            }
        },
        {
            "name": "transfer_call",
            "description": "Transfer call to user's actual phone",
            "url": f"{settings.BACKEND_URL}/api/tools/transfer_call",
            "method": "POST",
            "parameters": {
                "reason": {"type": "string", "description": "Reason for transfer"}
            }
        },
        {
            "name": "log_call",
            "description": "Log call summary at end of conversation",
            "url": f"{settings.BACKEND_URL}/api/tools/log_call",
            "method": "POST",
            "parameters": {
                "intent": {"type": "string", "description": "Call intent (reservation, friend, sales, etc.)"},
                "summary": {"type": "string", "description": "Brief summary of conversation"},
                "action_taken": {"type": "string", "description": "Action taken (booked, transferred, etc.)"}
            }
        },
        {
            "name": "block_scam",
            "description": "Immediately terminate scam call and log report",
            "url": f"{settings.BACKEND_URL}/api/tools/block_scam",
            "method": "POST",
            "parameters": {
                "scam_type": {"type": "string", "description": "Type of scam detected"},
                "confidence": {"type": "number", "description": "Confidence score 0-1"},
                "red_flags": {"type": "array", "description": "List of suspicious phrases detected"}
            }
        }
    ]
