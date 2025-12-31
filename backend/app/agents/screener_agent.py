"""
Screener Agent: Primary call coordinator
Handles greetings, intent classification, and natural conversation
"""

import logging
from typing import Dict, Any, Optional

from app.services.gemini_service import get_gemini_service

logger = logging.getLogger(__name__)


class ScreenerAgent:
    """
    Primary agent for call screening

    Responsibilities:
    - Greet caller professionally
    - Ask clarifying questions
    - Classify intent (friend, sales, appointment, scam)
    - Generate natural responses
    """

    def __init__(self):
        pass  # Lazy load Gemini service when needed

    async def greet(self, user_name: str) -> str:
        """
        Generate opening greeting

        FCC TCPA Compliance: Must disclose AI nature immediately

        Args:
            user_name: User's name for personalization

        Returns:
            Greeting message
        """
        # Legally required disclosure
        return f"Hello, this is {user_name}'s AI assistant. How can I help you?"

    async def classify_intent(
        self,
        transcript: str,
        caller_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Classify caller's intent using Gemini

        Args:
            transcript: Conversation so far
            caller_name: Caller's stated name

        Returns:
            {
                "intent": "friend" | "sales" | "appointment" | "scam" | "unknown",
                "confidence": 0.0-1.0,
                "reasoning": "explanation",
                "should_pass_through": bool,
                "next_question": "what to ask next" | null
            }
        """
        logger.info(f"[ScreenerAgent] Classifying intent for: {transcript[:100]}...")

        gemini_service = get_gemini_service()
        result = await gemini_service.classify_caller_intent(
            transcript=transcript,
            caller_name=caller_name
        )

        # Add next question if intent unclear
        if result["confidence"] < 0.7:
            result["next_question"] = self._get_clarifying_question(result["intent"])
        else:
            result["next_question"] = None

        return result

    def _get_clarifying_question(self, suspected_intent: str) -> str:
        """
        Generate clarifying question based on suspected intent

        Args:
            suspected_intent: Best guess of intent

        Returns:
            Question to ask caller
        """
        questions = {
            "friend": "May I ask your name and how you know them?",
            "sales": "Are you calling to offer a product or service?",
            "appointment": "Are you calling to schedule, reschedule, or confirm an appointment?",
            "scam": "Can you provide a callback number and reference number for this matter?",
            "unknown": "May I ask what you're calling about?"
        }

        return questions.get(suspected_intent, questions["unknown"])

    async def generate_response(
        self,
        intent: str,
        confidence: float,
        user_name: str,
        transcript: str
    ) -> str:
        """
        Generate natural response to caller based on intent

        Args:
            intent: Detected intent
            confidence: Confidence score
            user_name: User's name
            transcript: Conversation so far

        Returns:
            Response message to caller
        """
        # High confidence responses
        if confidence >= 0.85:
            if intent == "friend":
                return f"Let me check if {user_name} is available. One moment please."

            elif intent == "sales":
                return f"Thank you for calling, but {user_name} is not interested in any offers at this time. Have a great day!"

            elif intent == "appointment":
                return "I can help you with that. What would you like to do with the appointment?"

            elif intent == "scam":
                return "I'm not able to help with that. Goodbye."

        # Low confidence - ask clarifying questions
        else:
            return self._get_clarifying_question(intent)


def create_screener_agent() -> ScreenerAgent:
    """Factory function to create screener agent"""
    return ScreenerAgent()
