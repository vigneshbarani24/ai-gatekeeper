"""
Call routing action executors: Ring user, transfer, hangup
"""

import logging
from typing import Dict, Any

from app.workflows.executors.base import ActionExecutor

logger = logging.getLogger(__name__)


class RingUserExecutor(ActionExecutor):
    """
    Ring the user's phone (pass through call)

    Params:
        priority: "normal" or "high" (for emergency)
        timeout_seconds: Max ring time
        override_dnd: Override Do Not Disturb mode
    """

    def __init__(self):
        super().__init__("ring_user")
        self.twilio_service = None

    async def execute(self, context, params: Dict[str, Any]):
        try:
            # Initialize Twilio (lazy)
            if not self.twilio_service:
                from app.services.twilio_service import twilio_service
                self.twilio_service = twilio_service

            # Get user's phone number from database
            from app.services.database import db_service
            user = await db_service.get_user_by_id(context.user_id)

            if not user or not user.get("phone_number"):
                return {
                    "success": False,
                    "message": "User phone number not found",
                    "data": None
                }

            user_phone = user["phone_number"]
            priority = params.get("priority", "normal")

            logger.info(f"📞 Ringing user at {user_phone} (priority: {priority})")

            # Dial the user via Twilio
            self.twilio_service.dial_user(user_phone, context.call_sid)

            return {
                "success": True,
                "message": f"Ringing user at {user_phone}",
                "data": {
                    "user_phone": user_phone,
                    "priority": priority,
                    "call_sid": context.call_sid
                }
            }

        except Exception as e:
            logger.error(f"❌ Failed to ring user: {e}")
            return {
                "success": False,
                "message": f"Ring user error: {str(e)}",
                "data": None
            }


class HangupExecutor(ActionExecutor):
    """
    Terminate the call

    Params:
        reason: Reason for hanging up (logged)
    """

    def __init__(self):
        super().__init__("hangup")
        self.twilio_service = None

    async def execute(self, context, params: Dict[str, Any]):
        try:
            if not self.twilio_service:
                from app.services.twilio_service import twilio_service
                self.twilio_service = twilio_service

            reason = params.get("reason", "workflow_action")

            logger.info(f"📵 Hanging up call (reason: {reason})")

            # Terminate call via Twilio
            self.twilio_service.hangup_call(context.call_sid)

            return {
                "success": True,
                "message": f"Call terminated: {reason}",
                "data": {
                    "reason": reason,
                    "call_sid": context.call_sid
                }
            }

        except Exception as e:
            logger.error(f"❌ Failed to hang up: {e}")
            return {
                "success": False,
                "message": f"Hangup error: {str(e)}",
                "data": None
            }
