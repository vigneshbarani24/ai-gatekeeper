"""
Decision Agent: Final call routing decision
Combines analysis from all agents to decide: pass through, screen more, or block
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class DecisionAgent:
    """
    Makes final routing decision based on multi-agent analysis

    Decision tree:
    1. Scam detected (confidence >= 0.85) → BLOCK
    2. Sales call (confidence >= 0.8) → BLOCK (politely decline)
    3. Friend/Family (confidence >= 0.7) → PASS THROUGH (after name verification)
    4. Appointment → SCREEN (handle booking, don't pass through)
    5. Unknown/Low confidence → SCREEN (ask clarifying questions)
    """

    async def run(
        self,
        scam_analysis: Dict[str, Any],
        intent_analysis: Dict[str, Any],
        context: Any  # CallContext
    ) -> Dict[str, Any]:
        """
        Make final routing decision

        Args:
            scam_analysis: Results from ScamDetectorAgent
            intent_analysis: Results from ScreenerAgent
            context: Call context

        Returns:
            {
                "action": "pass_through" | "screen_continue" | "block",
                "reason": "scam_detected" | "sales_call" | "friend",
                "message": "AI response to caller",
                "confidence": 0.0-1.0
            }
        """
        logger.info(f"[DecisionAgent] Making decision for call {context.call_sid}")

        scam_score = scam_analysis.get("confidence", 0.0)
        is_scam = scam_analysis.get("is_scam", False)

        intent = intent_analysis.get("intent", "unknown")
        intent_confidence = intent_analysis.get("confidence", 0.0)

        # Priority 1: Block scams
        if is_scam or scam_score >= 0.85:
            logger.warning(f"🚨 [DecisionAgent] BLOCKING scam call")
            return {
                "action": "block",
                "reason": "scam_detected",
                "message": "I'm not able to help with that. Goodbye.",
                "confidence": scam_score,
                "scam_type": scam_analysis.get("scam_type")
            }

        # Priority 2: Decline sales calls
        if intent == "sales" and intent_confidence >= 0.8:
            logger.info(f"📵 [DecisionAgent] BLOCKING sales call")
            return {
                "action": "block",
                "reason": "sales_call",
                "message": f"Thank you for calling, but {context.user_name} is not interested in any offers at this time. Have a great day!",
                "confidence": intent_confidence
            }

        # Priority 3: Pass through friends/family
        if intent in ["friend", "family"] and intent_confidence >= 0.7:
            logger.info(f"✅ [DecisionAgent] PASSING THROUGH to user")
            return {
                "action": "pass_through",
                "reason": "friend_or_family",
                "message": f"Let me connect you to {context.user_name}. One moment please.",
                "confidence": intent_confidence
            }

        # Priority 4: Handle appointments (don't pass through)
        if intent == "appointment" and intent_confidence >= 0.7:
            logger.info(f"📅 [DecisionAgent] SCREENING appointment request")
            return {
                "action": "screen_continue",
                "reason": "appointment_handling",
                "message": "I can help you with that. Are you looking to schedule, reschedule, or cancel an appointment?",
                "confidence": intent_confidence
            }

        # Default: Continue screening (low confidence)
        logger.info(f"❓ [DecisionAgent] SCREENING continue (low confidence)")
        next_question = intent_analysis.get("next_question", "May I ask what you're calling about?")

        return {
            "action": "screen_continue",
            "reason": "unknown_intent",
            "message": next_question,
            "confidence": intent_confidence
        }


def create_decision_agent() -> DecisionAgent:
    """Factory function to create decision agent"""
    return DecisionAgent()
