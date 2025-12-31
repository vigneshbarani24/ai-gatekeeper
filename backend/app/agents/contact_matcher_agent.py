"""
Contact Matcher Agent: Whitelist checking
Fast path for trusted contacts
"""

import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class ContactMatcherAgent:
    """
    Checks if caller is in user's whitelist

    Fast path: If match found, pass through immediately
    No AI needed - simple database lookup
    """

    async def run(
        self,
        user_id: str,
        caller_number: str
    ) -> Optional[Dict]:
        """
        Check if caller is whitelisted

        Args:
            user_id: User ID
            caller_number: Caller's phone number

        Returns:
            Contact data if whitelisted, None otherwise
            {
                "id": "contact_123",
                "name": "John Smith",
                "phone_number": "+15551234567",
                "relationship": "friend",
                "priority": 10,
                "auto_pass": true
            }
        """
        logger.info(f"[ContactMatcher] Checking whitelist for {caller_number}")

        # TODO: Query database (Supabase)
        # from app.services.database import db_service
        # contact = await db_service.get_contact_by_phone(user_id, caller_number)

        # For now, return None (no match)
        # This will be implemented when database service is ready
        logger.debug(f"[ContactMatcher] Database lookup not implemented yet")

        return None


def create_contact_matcher_agent() -> ContactMatcherAgent:
    """Factory function to create contact matcher agent"""
    return ContactMatcherAgent()
