"""
Analytics router - AI summaries and insights
Provides conversational summaries of call activity
"""

import logging
from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.services.database import db_service
from app.services.gemini_service import get_gemini_service
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["analytics"])


@router.get("/analyze-scam")
async def analyze_scam(text: str):
    """
    Analyze text for scam indicators using Google Gemini
    
    Args:
        text: The text/transcript to analyze
        
    Returns:
        Analysis result with scam detection status
    """
    try:
        # Check if Google API key is configured
        if not settings.GOOGLE_GENERATIVE_AI_API_KEY:
            return {
                "status": "error",
                "message": "Google Generative AI API key not configured"
            }
        
        # Use Gemini service for analysis
        gemini = get_gemini_service()
        
        # Use Gemini service for analysis
        gemini = get_gemini_service()
        
        # Perform deep analysis
        result = await gemini.analyze_scam_indicators(
            transcript=text, 
            caller_number="Unknown" # Context will improve if we pass this
        )
        
        # Add reasoning string for the UI logs
        reasoning = []
        if result.get('is_scam'):
            reasoning.append(f"❌ DETECTED SCAM PATTERN: {result.get('scam_type', 'unknown').upper()}")
        
        if result.get('red_flags'):
            reasoning.append(f"🚩 Red Flags: {', '.join(result['red_flags'][:2])}")
            
        confidence = result.get('confidence', 0.0)
        reasoning.append(f"📊 Confidence Score: {confidence:.2f}")
        
        if confidence < 0.3:
            reasoning.append("✅ Context appears safe so far.")
        elif confidence < 0.7:
            reasoning.append("⚠️ Potentially suspicious activity detected.")
            
        return {
            "status": "success",
            "is_scam": result.get('is_scam', False),
            "score": confidence,
            "reasoning": " | ".join(reasoning),
            "full_analysis": result,
            "model": settings.GEMINI_MODEL_ANALYSIS
        }
        
    except Exception as e:
        logger.error(f"Scam analysis error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }



@router.get("/dashboard")
async def get_dashboard_stats(user_id: str = "00000000-0000-0000-0000-000000000001"):
    """
    Get dashboard statistics from Supabase
    
    Returns real-time stats from database
    """
    
    try:
        if not db_service.client:
            logger.error("Database not initialized!")
            return {
                "error": "Database not connected",
                "total_calls": 0,
                "scams_blocked": 0,
                "time_saved_minutes": 0,
                "current_status": "error",
                "today_calls": 0,
                "block_rate": 0,
                "avg_call_duration": 0,
            }

        # Get all calls for user from Supabase
        all_calls = db_service.client.table('calls').select('*').eq('user_id', user_id).execute()
        calls_data = all_calls.data if all_calls.data else []
        
        logger.info(f"Found {len(calls_data)} calls in database for user {user_id}")

        total_calls = len(calls_data)
        scams_blocked = sum(1 for call in calls_data if call.get('intent') == 'scam' and call.get('status') == 'blocked')

        # Get today's calls
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_calls_response = db_service.client.table('calls').select('*').eq('user_id', user_id).gte('started_at', today_start.isoformat()).execute()
        today_calls_data = today_calls_response.data if today_calls_response.data else []
        today_calls = len(today_calls_data)

        # Calculate block rate
        scam_calls = [c for c in calls_data if c.get('intent') == 'scam']
        blocked_scams = sum(1 for call in scam_calls if call.get('status') == 'blocked')
        block_rate = blocked_scams / len(scam_calls) if len(scam_calls) > 0 else 1.0

        # Calculate average call duration
        durations = [c.get('duration_seconds', 0) for c in calls_data if c.get('duration_seconds')]
        avg_call_duration = sum(durations) / len(durations) if durations else 45

        # Calculate time saved (blocked calls * avg duration / 60)
        time_saved_minutes = int((scams_blocked * avg_call_duration) / 60)

        # Determine current status
        current_status = "active" if today_calls > 0 else "idle"

        return {
            "total_calls": total_calls,
            "scams_blocked": scams_blocked,
            "time_saved_minutes": time_saved_minutes,
            "current_status": current_status,
            "today_calls": today_calls,
            "block_rate": round(block_rate, 3),
            "avg_call_duration": int(avg_call_duration),
        }

    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return {
            "error": str(e),
            "total_calls": 0,
            "scams_blocked": 0,
            "time_saved_minutes": 0,
            "current_status": "error",
            "today_calls": 0,
            "block_rate": 0,
            "avg_call_duration": 0,
        }


@router.get("/summary")
async def get_ai_summary(user_id: str = "demo_user"):
    """
    Get AI-generated summary of recent call activity

    Returns:
    - Personalized summary text
    - Quick stats
    - Recent activity insights
    - Context-aware tips
    """

    # 1. Get user stats from database
    stats = await get_user_stats(user_id)

    # 2. Get recent calls from database
    recent_calls = await get_recent_calls(user_id, limit=10)

    # 3. Generate AI summary (uses Gemini Flash in production, template in demo)
    summary = await generate_summary_text(stats, recent_calls, user_id)

    # 4. Generate insights
    insights = generate_insights(stats, recent_calls)

    # 5. Generate personalized tip
    tip = generate_tip(stats)

    return {
        "summary": summary,
        "stats": stats,
        "insights": insights,
        "tip": tip,
        "generated_at": datetime.utcnow().isoformat()
    }


async def get_user_stats(user_id: str) -> Dict[str, Any]:
    """Get aggregated stats for user"""

    # Demo data fallback
    demo_stats = {
        "calls_today": 3,
        "scams_blocked": 2,
        "calls_handled": 1,
        "time_saved_minutes": 24,
        "whitelist_count": 5,
        "total_calls_week": 12
    }

    try:
        if not db_service.client:
            logger.warning("Database not initialized, returning demo stats")
            return demo_stats

        # Get today's calls
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        # Count calls by outcome
        calls_today_response = db_service.client.table('calls').select('action_taken').eq('user_id', user_id).gte('created_at', today_start.isoformat()).execute()

        calls_data = calls_today_response.data if calls_today_response.data else []

        scams_blocked = sum(1 for call in calls_data if call.get('action_taken') == 'blocked')
        calls_handled = sum(1 for call in calls_data if call.get('action_taken') == 'screened')
        calls_today = len(calls_data)

        # Get week's calls for time saved calculation
        week_start = datetime.utcnow() - timedelta(days=7)
        week_calls_response = db_service.client.table('calls').select('*').eq('user_id', user_id).gte('created_at', week_start.isoformat()).execute()

        week_calls = week_calls_response.data if week_calls_response.data else []
        # Assuming average call duration of 2 minutes for now
        time_saved_minutes = len(week_calls) * 2

        # Get whitelist count
        whitelist_response = db_service.client.table('contacts').select('id', count='exact').eq('user_id', user_id).execute()
        whitelist_count = len(whitelist_response.data) if whitelist_response.data else 0

        return {
            "calls_today": calls_today,
            "scams_blocked": scams_blocked,
            "calls_handled": calls_handled,
            "time_saved_minutes": time_saved_minutes,
            "whitelist_count": whitelist_count,
            "total_calls_week": len(week_calls)
        }

    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        # Fallback to demo data on error
        return demo_stats


async def get_recent_calls(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent call history"""

    # Demo data fallback
    demo_calls = [
        {
            "id": "1",
            "caller_number": "+1 (555) 999-0000",
            "action_taken": "blocked",
            "intent": "scam",
            "scam_score": 0.95,
            "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat()
        },
        {
            "id": "2",
            "caller_number": "+1 (555) 321-7654",
            "action_taken": "screened",
            "intent": "appointment",
            "scam_score": 0.05,
            "created_at": (datetime.utcnow() - timedelta(hours=5)).isoformat()
        },
        {
            "id": "3",
            "caller_number": "+1 (555) 888-7777",
            "action_taken": "screened",
            "intent": "reservation",
            "scam_score": 0.02,
            "created_at": (datetime.utcnow() - timedelta(hours=8)).isoformat()
        }
    ]

    try:
        if not db_service.client:
            logger.warning("Database not initialized, returning demo calls")
            return demo_calls

        response = db_service.client.table('calls').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()

        return response.data if response.data else demo_calls

    except Exception as e:
        logger.error(f"Error getting recent calls: {e}")
        # Fallback to demo data
        return demo_calls


async def generate_summary_text(stats: Dict[str, Any], recent_calls: List[Dict[str, Any]], user_id: str) -> str:
    """
    Generate conversational summary text using Google Gemini Flash AI

    In production mode, uses Gemini 2.0 Flash for natural language generation.
    In demo mode, falls back to template-based generation.
    """

    user_name = "Friend"  # TODO: Get from user profile in database

    # Try to use Gemini AI in production mode
    if settings.is_production():
        try:
            gemini = get_gemini_service()
            summary = await gemini.generate_analytics_summary(stats, recent_calls, user_name)
            return summary
        except Exception as e:
            logger.warning(f"Gemini AI failed, using template fallback: {e}")
            # Continue to template-based fallback below

    # Template-based generation for demo mode or fallback
    if stats["calls_today"] == 0:
        return f"It's been quiet today, {user_name}. I'm standing by, ready to catch any calls you can't take."

    summary_parts = []

    if stats["calls_today"] > 0:
        summary_parts.append(f"I handled {stats['calls_today']} call{'s' if stats['calls_today'] > 1 else ''} while you were busy")

    if stats["scams_blocked"] > 0:
        summary_parts.append(f"blocked {stats['scams_blocked']} scam{'s' if stats['scams_blocked'] > 1 else ''}")

    if stats["calls_handled"] > 0:
        # Get most recent handled call for context
        handled_call = next((c for c in recent_calls if c.get('action_taken') == 'screened'), None)
        if handled_call:
            caller_number = handled_call.get('caller_number', 'a caller')
            summary_parts.append(f"handled a call from {caller_number}")

    if stats["time_saved_minutes"] > 0:
        summary_parts.append(f"saved you {stats['time_saved_minutes']} minutes this week")

    summary = f"Hi {user_name}! {', '.join(summary_parts)}. You never missed an opportunity."

    return summary


def generate_insights(stats: Dict[str, Any], recent_calls: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate actionable insights from call data"""

    insights = []

    # Last scam blocked
    last_scam = next((c for c in recent_calls if c.get('action_taken') == 'blocked'), None)
    if last_scam:
        created_at = datetime.fromisoformat(last_scam['created_at'].replace('Z', '+00:00'))
        time_str = created_at.strftime('%I:%M %p')
        insights.append({
            "icon": "🛡️",
            "text": f"Last scam blocked: {time_str}",
            "color": "text-red-600 bg-red-50"
        })

    # Important call handled
    last_handled = next((c for c in recent_calls if c.get('action_taken') == 'screened'), None)
    if last_handled:
        caller_number = last_handled.get('caller_number', 'Unknown')
        insights.append({
            "icon": "✅",
            "text": f"Handled call from {caller_number}",
            "color": "text-green-600 bg-green-50"
        })

    # Whitelist stats
    if stats["whitelist_count"] > 0:
        insights.append({
            "icon": "👥",
            "text": f"{stats['whitelist_count']} contacts ring through directly",
            "color": "text-blue-600 bg-blue-50"
        })

    # Time saved
    if stats["time_saved_minutes"] > 15:
        hours = stats["time_saved_minutes"] // 60
        minutes = stats["time_saved_minutes"] % 60
        time_str = f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"
        insights.append({
            "icon": "⏰",
            "text": f"Saved {time_str} this week",
            "color": "text-purple-600 bg-purple-50"
        })

    return insights


def generate_tip(stats: Dict[str, Any]) -> Dict[str, Any]:
    """Generate personalized tip based on usage patterns"""

    # Tip: Add more to whitelist if handling many calls
    if stats["calls_handled"] > 5 and stats["whitelist_count"] < 10:
        return {
            "icon": "💡",
            "title": "Tip: Build Your Whitelist",
            "description": f"You've had {stats['calls_handled']} calls screened. Add trusted contacts to your whitelist so they ring through directly!",
            "action": "Add Contacts",
            "action_link": "/contacts"
        }

    # Tip: Share success if blocking lots of scams
    if stats["scams_blocked"] > 10:
        return {
            "icon": "🎉",
            "title": "You're Protected!",
            "description": f"I've blocked {stats['scams_blocked']} scams this week. Your phone number is well-guarded.",
            "action": "View Blocked Calls",
            "action_link": "/calls?filter=blocked"
        }

    # Default tip
    return {
        "icon": "📱",
        "title": "AI Gatekeeper is Active",
        "description": "I'm standing by to catch important calls when you're busy. Your opportunities are protected.",
        "action": "View Settings",
        "action_link": "/settings"
    }
