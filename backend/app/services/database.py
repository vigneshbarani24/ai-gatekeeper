"""
Database Service: Supabase PostgreSQL client
Handles all database operations for AI Gatekeeper
"""

import logging
from typing import Dict, List, Optional
from supabase import create_client, Client

from app.core.config import settings

logger = logging.getLogger(__name__)


class DatabaseService:
    """
    Supabase database client

    Tables:
    - users: User profiles and settings
    - contacts: Whitelisted contacts
    - calls: Call records
    - call_transcripts: Full transcripts
    - scam_reports: Detected scams
    """

    def __init__(self):
        self.client: Optional[Client] = None

    async def init(self) -> None:
        """Initialize Supabase client"""
        try:
            # Check for valid keys or Demo Mode
            # If keys are placeholders ("demo_"), and DEMO_MODE is True, use mock.
            # If keys are REAL, connect even if DEMO_MODE is True (Partial Live Mode).
            is_demo_key = "demo_" in settings.SUPABASE_URL or "demo_" in settings.SUPABASE_SERVICE_ROLE_KEY
            
            if settings.DEMO_MODE and is_demo_key:
                logger.warning("⚠️  Using Mock Database (Demo Mode + Placeholder Keys)")
                self.client = None
                return

            self.client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            logger.info("✅ Database initialized")

        except Exception as e:
            logger.error(f"❌ Failed to initialize database: {e}")
            # Don't raise in development/demo to allow startup
            if settings.is_development():
                self.client = None
                return
            raise

    # ========================
    # USERS
    # ========================

    async def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        if not self.client:
            return {"id": user_id, "name": "Demo User"} if settings.DEMO_MODE else None

        try:
            response = self.client.table("users").select("*").eq("id", user_id).single().execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None

    async def get_user_by_twilio_number(self, twilio_number: str) -> Optional[Dict]:
        """Get user by their Twilio phone number"""
        if not self.client:
             # Return demo user for ANY number in demo mode
             return {"id": "demo_user", "name": "Demo User"} if settings.DEMO_MODE else None

        try:
            response = self.client.table("users").select("*").eq("twilio_phone_number", twilio_number).single().execute()
            return response.data
        except Exception as e:
            logger.debug(f"No user found for Twilio number {twilio_number}")
            return None

    # ========================
    # CONTACTS
    # ========================

    async def get_contact_by_phone(self, user_id: str, phone_number: str) -> Optional[Dict]:
        """Check if phone number is in user's whitelist"""
        if not self.client:
            return None

        try:
            response = (
                self.client.table("contacts")
                .select("*")
                .eq("user_id", user_id)
                .eq("phone_number", phone_number)
                .single()
                .execute()
            )
            return response.data
        except Exception as e:
            logger.debug(f"No contact found for {phone_number}")
            return None

    # ========================
    # CALLS
    # ========================

    async def create_call(
        self,
        user_id: str,
        caller_number: str,
        call_sid: str,
        status: str = "ringing",
        **kwargs
    ) -> Dict:
        """Create new call record"""
        if not self.client:
            return {"id": "demo_call_id", "status": status}

        try:
            data = {
                "user_id": user_id,
                "caller_number": caller_number,
                "call_sid": call_sid,
                "status": status
            }
            # Add extra fields if provided
            for key in ["intent", "scam_score", "action_taken"]:
                if key in kwargs:
                    data[key] = kwargs[key]

            response = (
                self.client.table("calls")
                .insert(data)
                .execute()
            )
            return response.data[0] if response.data else {}
        except Exception as e:
            logger.error(f"Error creating call record: {e}")
            return {}

    async def get_call_by_sid(self, call_sid: str) -> Optional[Dict]:
        """Get call record by Twilio SID"""
        if not self.client:
            return {"id": "demo_call_id", "call_sid": call_sid} if settings.DEMO_MODE else None

        try:
            response = (
                self.client.table("calls")
                .select("*")
                .eq("call_sid", call_sid)
                .single()
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error getting call {call_sid}: {e}")
            return None

    async def update_call(
        self,
        call_sid: str,
        status: Optional[str] = None,
        intent: Optional[str] = None,
        scam_score: Optional[float] = None,
        passed_through: Optional[bool] = None,
        transcript: Optional[str] = None,
        updates: Optional[Dict] = None,
        **kwargs
    ) -> None:
        """Update call record"""
        if not self.client:
            return

        try:
            update_data = updates or {}
            
            # Add explicit args if provided
            if status:
                update_data["status"] = status
            if intent:
                update_data["intent"] = intent
            if scam_score is not None:
                update_data["scam_score"] = scam_score
            if passed_through is not None:
                update_data["passed_through"] = passed_through
                
            # Add kwargs
            for key, value in kwargs.items():
                update_data[key] = value

            if update_data:
                self.client.table("calls").update(update_data).eq("call_sid", call_sid).execute()

            # Update transcript separately if provided
            if transcript:
                await self.save_transcript(call_sid, transcript)

        except Exception as e:
            logger.error(f"Error updating call {call_sid}: {e}")

    async def save_transcript(self, call_sid: str, transcript: str) -> None:
        """Save call transcript"""
        if not self.client:
            return

        try:
            # Get call ID
            call = await self.get_call_by_sid(call_sid)
            if not call:
                return

            # Upsert transcript
            self.client.table("call_transcripts").upsert({
                "call_id": call["id"],
                "transcript": transcript
            }).execute()

        except Exception as e:
            logger.error(f"Error saving transcript: {e}")

    async def update_call_transcript(self, call_sid: str, transcript: str) -> None:
        """
        Update call transcript (alias for save_transcript for consistency)

        Args:
            call_sid: Twilio Call SID
            transcript: Full transcript text
        """
        await self.save_transcript(call_sid, transcript)

    # ========================
    # VOICE PROFILES
    # ========================

    async def get_voice_profile(self, user_id: str) -> Optional[Dict]:
        """
        Get user's voice profile (ElevenLabs cloned voice)

        Returns:
        - voice_id: ElevenLabs voice ID
        - voice_name: Display name
        - language: Voice language (for multilingual support)
        - created_at: When voice was cloned
        """
        try:
            response = (
                self.client.table("voice_profiles")
                .select("*")
                .eq("user_id", user_id)
                .eq("is_active", True)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            if response.data and len(response.data) > 0:
                return response.data[0]

            return None

        except Exception as e:
            logger.error(f"Error getting voice profile for user {user_id}: {e}")
            return None

    async def create_voice_profile(
        self,
        user_id: str,
        voice_id: str,
        voice_name: str,
        language: str = "en"
    ) -> Dict:
        """Create new voice profile record"""
        try:
            # Deactivate old voice profiles
            self.client.table("voice_profiles").update({"is_active": False}).eq("user_id", user_id).execute()

            # Insert new voice profile
            response = (
                self.client.table("voice_profiles")
                .insert({
                    "user_id": user_id,
                    "voice_id": voice_id,
                    "voice_name": voice_name,
                    "language": language,
                    "is_active": True
                })
                .execute()
            )

            logger.info(f"✅ Created voice profile for user {user_id}: {voice_id}")
            return response.data[0] if response.data else {}

        except Exception as e:
            logger.error(f"Error creating voice profile: {e}")
            return {}

    # ========================
    # SCAM REPORTS
    # ========================

    async def create_scam_report(
        self,
        call_sid: str,
        scam_type: str,
        confidence: float,
        pattern_matched: str = None,
        red_flags: list = None
    ) -> None:
        """
        Log a detected scam

        Args:
            call_sid: Twilio Call SID
            scam_type: Type of scam detected
            confidence: Confidence score (0-1)
            pattern_matched: Pattern that matched (deprecated, use red_flags)
            red_flags: List of red flags detected
        """
        if not self.client:
            return

        try:
            call = await self.get_call_by_sid(call_sid)
            if not call:
                return

            # Support both old and new parameter names
            if red_flags and not pattern_matched:
                pattern_matched = ", ".join(red_flags) if isinstance(red_flags, list) else str(red_flags)

            self.client.table("scam_reports").insert({
                "call_id": call["id"],
                "scam_type": scam_type,
                "confidence": confidence,
                "pattern_matched": pattern_matched or "unknown",
                "action_taken": "blocked"
            }).execute()

            logger.info(f"✅ Logged scam report for call {call_sid}")

        except Exception as e:
            logger.error(f"Error creating scam report: {e}")

    # ========================
    # ANALYTICS
    # ========================

    async def update_analytics(
        self,
        user_id: str,
        date: str,
        total_calls_increment: int = 0,
        scams_blocked_increment: int = 0,
        time_saved_minutes: int = 0
    ) -> None:
        """
        Update user analytics (daily aggregates)

        Args:
            user_id: User ID
            date: Date (YYYY-MM-DD format)
            total_calls_increment: Number to add to total calls
            scams_blocked_increment: Number to add to scams blocked
            time_saved_minutes: Minutes to add to time saved
        """
        if not self.client:
            return

        try:
            from datetime import date as date_type

            # Convert date to string if it's a date object
            if isinstance(date, date_type):
                date = date.isoformat()

            # Check if record exists for this user and date
            response = (
                self.client.table("analytics")
                .select("*")
                .eq("user_id", user_id)
                .eq("date", date)
                .execute()
            )

            if response.data and len(response.data) > 0:
                # Update existing record
                existing = response.data[0]
                self.client.table("analytics").update({
                    "total_calls": existing.get("total_calls", 0) + total_calls_increment,
                    "scams_blocked": existing.get("scams_blocked", 0) + scams_blocked_increment,
                    "time_saved_minutes": existing.get("time_saved_minutes", 0) + time_saved_minutes
                }).eq("user_id", user_id).eq("date", date).execute()
            else:
                # Create new record
                self.client.table("analytics").insert({
                    "user_id": user_id,
                    "date": date,
                    "total_calls": total_calls_increment,
                    "scams_blocked": scams_blocked_increment,
                    "time_saved_minutes": time_saved_minutes
                }).execute()

            logger.debug(f"✅ Updated analytics for user {user_id} on {date}")

        except Exception as e:
            logger.error(f"Error updating analytics: {e}")


# Singleton instance
db_service = DatabaseService()


async def init_database() -> None:
    """Initialize database connection (called on app startup)"""
    await db_service.init()
