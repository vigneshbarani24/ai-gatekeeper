"""
Calls Router: Call history and analytics
"""

from fastapi import APIRouter
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Any

from app.services.database import db_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/recent")
async def get_recent_calls(limit: int = 20, user_id: str = "demo_user"):
    """
    Get recent call history for display in call history list

    Returns list of calls with:
    - id: Call ID
    - caller_name: Caller's name
    - caller_number: Phone number
    - intent: Call intent (friend, sales, scam, appointment, unknown)
    - scam_score: Scam probability (0-1)
    - action: Action taken (passed, blocked, screened)
    - timestamp: ISO timestamp
    - duration: Call duration in seconds
    - summary: AI-generated summary
    """

    # Demo data (matches frontend expectations)
    demo_calls = [
        {
            "id": "20000000-0000-0000-0000-000000000001",
            "caller_name": "Sarah",
            "caller_number": "+15555551003",
            "intent": "friend",
            "scam_score": 0.05,
            "action": "passed",
            "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat() + "Z",
            "duration": 300,
            "summary": "Friend calling to make weekend plans for coffee"
        },
        {
            "id": "20000000-0000-0000-0000-000000000002",
            "caller_name": "Unknown",
            "caller_number": "+18005551234",
            "intent": "scam",
            "scam_score": 0.95,
            "action": "blocked",
            "timestamp": (datetime.utcnow() - timedelta(hours=5)).isoformat() + "Z",
            "duration": 15,
            "summary": "IRS impersonation scam with arrest threats"
        },
        {
            "id": "20000000-0000-0000-0000-000000000003",
            "caller_name": "Mom",
            "caller_number": "+15555551001",
            "intent": "friend",
            "scam_score": 0.02,
            "action": "passed",
            "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat() + "Z",
            "duration": 480,
            "summary": "Mother calling to check in and invite for dinner"
        },
        {
            "id": "20000000-0000-0000-0000-000000000004",
            "caller_name": "Unknown",
            "caller_number": "+18885559999",
            "intent": "sales",
            "scam_score": 0.35,
            "action": "blocked",
            "timestamp": (datetime.utcnow() - timedelta(days=1, hours=3)).isoformat() + "Z",
            "duration": 45,
            "summary": "Unsolicited car warranty sales call"
        },
        {
            "id": "20000000-0000-0000-0000-000000000005",
            "caller_name": "Dr. Smith's Office",
            "caller_number": "+15555551004",
            "intent": "appointment",
            "scam_score": 0.08,
            "action": "passed",
            "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat() + "Z",
            "duration": 120,
            "summary": "Doctor's office confirming appointment"
        },
        {
            "id": "20000000-0000-0000-0000-000000000006",
            "caller_name": "Unknown",
            "caller_number": "+18665554321",
            "intent": "scam",
            "scam_score": 0.92,
            "action": "blocked",
            "timestamp": (datetime.utcnow() - timedelta(days=3)).isoformat() + "Z",
            "duration": 22,
            "summary": "Tech support scam impersonating Microsoft"
        },
        {
            "id": "20000000-0000-0000-0000-000000000007",
            "caller_name": "Dad",
            "caller_number": "+15555551002",
            "intent": "friend",
            "scam_score": 0.01,
            "action": "passed",
            "timestamp": (datetime.utcnow() - timedelta(days=3, hours=6)).isoformat() + "Z",
            "duration": 360,
            "summary": "Father requesting help with computer"
        },
        {
            "id": "20000000-0000-0000-0000-000000000008",
            "caller_name": "Unknown",
            "caller_number": "+15555559876",
            "intent": "unknown",
            "scam_score": 0.15,
            "action": "passed",
            "timestamp": (datetime.utcnow() - timedelta(days=4)).isoformat() + "Z",
            "duration": 60,
            "summary": "Delivery driver requesting assistance"
        },
    ]

    try:
        if not db_service.client:
            logger.info("Database not initialized, returning demo calls")
            return demo_calls[:limit]

        # Get recent calls from database
        response = db_service.client.table('calls') \
            .select('*, call_transcripts(summary)') \
            .eq('user_id', user_id) \
            .order('started_at', desc=True) \
            .limit(limit) \
            .execute()

        if not response.data:
            logger.info("No calls found in database, returning demo calls")
            return demo_calls[:limit]

        # Format calls for frontend
        calls = []
        for call in response.data:
            # Determine action from status and passed_through
            if call.get('status') == 'blocked':
                action = 'blocked'
            elif call.get('passed_through'):
                action = 'passed'
            else:
                action = 'screened'

            # Get summary from transcript if available
            summary = ""
            if call.get('call_transcripts') and len(call['call_transcripts']) > 0:
                summary = call['call_transcripts'][0].get('summary', '')

            calls.append({
                "id": call['id'],
                "caller_name": call.get('caller_name', 'Unknown'),
                "caller_number": call.get('caller_number', ''),
                "intent": call.get('intent', 'unknown'),
                "scam_score": call.get('scam_score', 0.0),
                "action": action,
                "timestamp": call.get('started_at', datetime.utcnow().isoformat()),
                "duration": call.get('duration_seconds', 0),
                "summary": summary
            })

        return calls

    except Exception as e:
        logger.error(f"Error getting recent calls: {e}")
        return demo_calls[:limit]


@router.get("/")
async def list_calls():
    """List call history (alias for /recent)"""
    return await get_recent_calls()


@router.get("/{call_id}")
async def get_call(call_id: str):
    """
    Get full call details including transcript

    Returns:
    - Complete call record
    - Full transcript
    - Scam report if applicable
    - All metadata
    """
    try:
        if not db_service.client:
            logger.warning("Database not initialized")
            return {
                "id": call_id,
                "error": "Database not available"
            }

        # Get call with transcript
        response = db_service.client.table('calls') \
            .select('*, call_transcripts(*), scam_reports(*)') \
            .eq('id', call_id) \
            .single() \
            .execute()

        if not response.data:
            return {"error": "Call not found"}

        call = response.data

        # Format response
        return {
            "id": call['id'],
            "call_sid": call.get('call_sid'),
            "caller_number": call.get('caller_number'),
            "caller_name": call.get('caller_name', 'Unknown'),
            "intent": call.get('intent', 'unknown'),
            "scam_score": call.get('scam_score', 0.0),
            "action_taken": call.get('action_taken'),
            "status": call.get('status'),
            "started_at": call.get('started_at'),
            "duration_seconds": call.get('duration_seconds', 0),
            "transcript": call['call_transcripts'][0] if call.get('call_transcripts') else None,
            "scam_report": call['scam_reports'][0] if call.get('scam_reports') else None,
            "passed_through": call.get('passed_through', False)
        }

    except Exception as e:
        logger.error(f"Error getting call {call_id}: {e}")
        return {"error": str(e)}
