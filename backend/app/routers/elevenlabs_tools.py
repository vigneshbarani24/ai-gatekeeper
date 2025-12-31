"""
ElevenLabs Server Tools: Custom tools for Conversational AI agent

When the agent needs information (calendar, whitelist, etc.),
it calls these webhooks and gets structured responses.
"""

import logging
from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any, List
from datetime import datetime, timedelta

from app.services.database import db_service
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


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
        "user_id": "user_123",  # From conversation_initiation_client_data
        "parameters": {
            "date": "2025-01-03",
            "time": "19:00",
            "duration_minutes": 120
        }
    }

    Response to agent:
    {
        "available": true,
        "conflicts": [],
        "suggested_times": ["19:00", "20:00"]
    }
    """
    try:
        data = await request.json()

        user_id = data.get("user_id")
        params = data.get("parameters", {})

        date = params.get("date")  # "2025-01-03"
        time = params.get("time")  # "19:00"
        duration = params.get("duration_minutes", 120)

        logger.info(f"🗓️ [Tool] Checking calendar for user {user_id}: {date} {time}")

        # TODO: Integrate with Google Calendar API
        # For now, return mock data

        # Mock: Check if time slot is available
        # In production, this calls Google Calendar API
        available = True  # Assume available for demo
        conflicts = []

        return {
            "available": available,
            "conflicts": conflicts,
            "suggested_times": [time, "20:00", "21:00"],
            "date": date,
            "duration_minutes": duration
        }

    except Exception as e:
        logger.error(f"❌ Calendar check error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


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
        "call_id": "call_123"
    }
    """
    try:
        data = await request.json()

        call_sid = data.get("call_sid")
        user_id = data.get("user_id")
        params = data.get("parameters", {})

        intent = params.get("intent")
        summary = params.get("summary")
        action_taken = params.get("action_taken")

        logger.info(f"📝 [Tool] Logging call {call_sid}: {intent}")

        # Update call record in Supabase
        await db_service.update_call(
            call_sid=call_sid,
            intent=intent,
            status="completed"
        )

        # Save summary
        await db_service.save_transcript(call_sid, summary)

        return {
            "success": True,
            "call_sid": call_sid,
            "logged_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"❌ Log call error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


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
        "report_id": "scam_123"
    }
    """
    try:
        data = await request.json()

        call_sid = data.get("call_sid")
        user_id = data.get("user_id")
        params = data.get("parameters", {})

        scam_type = params.get("scam_type")
        confidence = params.get("confidence", 0.0)
        red_flags = params.get("red_flags", [])

        logger.warning(f"🚨 [Tool] Blocking scam call {call_sid}: {scam_type} ({confidence})")

        # End call via Twilio
        from app.services.twilio_service import twilio_service
        twilio_service.hangup_call(call_sid)

        # Log scam report to Supabase
        await db_service.create_scam_report(
            call_sid=call_sid,
            scam_type=scam_type,
            confidence=confidence,
            pattern_matched=", ".join(red_flags)
        )

        # Update call record
        await db_service.update_call(
            call_sid=call_sid,
            intent="scam",
            scam_score=confidence
        )

        return {
            "success": True,
            "action": "call_terminated",
            "scam_type": scam_type,
            "confidence": confidence
        }

    except Exception as e:
        logger.error(f"❌ Block scam error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


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
