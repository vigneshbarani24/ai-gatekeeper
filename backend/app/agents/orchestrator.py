"""
AI Gatekeeper Orchestrator: Google ADK Patterns
Simple, effective agent coordination for call screening
"""

import asyncio
from typing import Dict, List, Any, Literal, Optional
from dataclasses import dataclass


# ======================
# INTENT TYPES
# ======================

Intent = Literal["friend", "family", "appointment", "sales", "scam", "unknown"]
Decision = Literal["pass_through", "screen_continue", "block", "transfer"]


@dataclass
class CallContext:
    """Shared context across all agents"""
    user_id: str
    user_name: str
    caller_number: str
    call_sid: str
    transcript: str = ""
    caller_name: Optional[str] = None


# ======================
# SIMPLE ORCHESTRATOR
# ======================

class GatekeeperOrchestrator:
    """
    Simple orchestrator following Google ADK patterns (from DreamVoice)

    Three execution patterns:
    - Sequential: One after another (contact check → screening)
    - Parallel: Multiple at once (scam detection + intent classification)
    - Decision: Final routing (pass through vs block)

    Agents:
    - ScreenerAgent: Primary coordinator, handles conversation
    - ScamDetectorAgent: Analyzes for fraud patterns (parallel)
    - ContactMatcherAgent: Fast whitelist check
    - DecisionAgent: Makes final routing decision
    """

    def __init__(self):
        # Lazy import agents (only load when needed)
        self.agents = {}

    def _get_agent(self, agent_name: str):
        """Lazy load agents"""
        if agent_name not in self.agents:
            if agent_name == "screener":
                from app.agents.screener_agent import create_screener_agent
                self.agents[agent_name] = create_screener_agent()
            elif agent_name == "scam_detector":
                from app.agents.scam_detector_agent import create_scam_detector_agent
                self.agents[agent_name] = create_scam_detector_agent()
            elif agent_name == "contact_matcher":
                from app.agents.contact_matcher_agent import create_contact_matcher_agent
                self.agents[agent_name] = create_contact_matcher_agent()
            elif agent_name == "decision":
                from app.agents.decision_agent import create_decision_agent
                self.agents[agent_name] = create_decision_agent()

        return self.agents[agent_name]

    # ========================
    # FAST PATH: Whitelist Check
    # ========================

    async def check_whitelist(self, context: CallContext) -> Optional[Dict]:
        """
        Fast path: Check if caller is whitelisted

        Returns contact data if whitelisted, None otherwise
        Sequential pattern: Check → Return early if match
        """
        print(f"[Orchestrator] Fast path: Checking whitelist for {context.caller_number}")

        contact_matcher = self._get_agent("contact_matcher")
        contact = await contact_matcher.run(
            user_id=context.user_id,
            caller_number=context.caller_number
        )

        if contact and contact.get("auto_pass"):
            print(f"✅ [Orchestrator] Whitelisted: {contact.get('name')}")
            return contact

        print(f"⚠️ [Orchestrator] Not whitelisted, proceeding to screening")
        return None

    # ========================
    # PARALLEL: Scam + Intent Analysis
    # ========================

    async def analyze_call_parallel(
        self,
        context: CallContext
    ) -> Dict[str, Any]:
        """
        Parallel execution: Run scam detection + intent classification concurrently

        ADK pattern: Don't wait when you don't have to!
        Both analyses are independent and can run simultaneously
        """
        print(f"[Orchestrator] Parallel analysis: Scam detection + Intent classification")

        # These run in parallel (independent)
        tasks = [
            # Scam detection (vector similarity + LLM)
            self._detect_scam(context),

            # Intent classification (Gemini 2.0 Flash)
            self._classify_intent(context)
        ]

        # Wait for both to complete
        scam_analysis, intent_analysis = await asyncio.gather(*tasks)

        # Combine results
        return {
            "scam": scam_analysis,
            "intent": intent_analysis,
            "transcript": context.transcript
        }

    async def _detect_scam(self, context: CallContext) -> Dict:
        """Helper: Run scam detection"""
        scam_detector = self._get_agent("scam_detector")
        return await scam_detector.run(
            transcript=context.transcript,
            caller_number=context.caller_number
        )

    async def _classify_intent(self, context: CallContext) -> Dict:
        """Helper: Classify caller intent"""
        screener = self._get_agent("screener")
        return await screener.classify_intent(
            transcript=context.transcript,
            caller_name=context.caller_name
        )

    # ========================
    # DECISION: Route Call
    # ========================

    async def make_decision(
        self,
        analysis: Dict,
        context: CallContext
    ) -> Dict[str, Any]:
        """
        Final decision: Pass through, screen more, or block

        Sequential pattern: Analysis → Decision → Action
        """
        print(f"[Orchestrator] Making decision...")

        decision_agent = self._get_agent("decision")
        decision = await decision_agent.run(
            scam_analysis=analysis["scam"],
            intent_analysis=analysis["intent"],
            context=context
        )

        print(f"✅ [Orchestrator] Decision: {decision['action']}")

        return decision

    # ========================
    # COMPLETE FLOW
    # ========================

    async def process_call(self, context: CallContext) -> Dict[str, Any]:
        """
        Complete call processing flow

        Flow:
        1. Fast path: Check whitelist (sequential)
        2. If not whitelisted → Parallel analysis (scam + intent)
        3. Make decision (sequential, depends on analysis)
        4. Return action (pass_through, screen_continue, block)
        """
        print(f"[Orchestrator] Processing call from {context.caller_number}")

        # Step 1: Fast whitelist check
        contact = await self.check_whitelist(context)
        if contact:
            return {
                "action": "pass_through",
                "reason": "whitelisted_contact",
                "contact": contact,
                "message": f"Hi! I'll connect you to {context.user_name} right away."
            }

        # Step 2: Parallel analysis (scam + intent)
        analysis = await self.analyze_call_parallel(context)

        # Step 3: Make decision
        decision = await self.make_decision(analysis, context)

        return decision


# ======================
# SINGLETON
# ======================

orchestrator = GatekeeperOrchestrator()


# ======================
# SIMPLE API
# ======================

async def screen_incoming_call(
    user_id: str,
    user_name: str,
    caller_number: str,
    call_sid: str,
    transcript: str = "",
    caller_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Simple API: Screen an incoming call

    Usage:
        decision = await screen_incoming_call(
            user_id="user_123",
            user_name="Sarah",
            caller_number="+15551234567",
            call_sid="CA123",
            transcript="Hello, this is...",
            caller_name="John"
        )

    Returns:
        {
            "action": "pass_through" | "screen_continue" | "block",
            "reason": "whitelisted_contact" | "scam_detected" | "sales_call",
            "message": "AI response to caller",
            "confidence": 0.0-1.0
        }
    """
    context = CallContext(
        user_id=user_id,
        user_name=user_name,
        caller_number=caller_number,
        call_sid=call_sid,
        transcript=transcript,
        caller_name=caller_name
    )

    return await orchestrator.process_call(context)


async def analyze_ongoing_call(
    user_id: str,
    caller_number: str,
    call_sid: str,
    updated_transcript: str
) -> Dict[str, Any]:
    """
    Analyze ongoing call (transcript updated)

    Usage:
        analysis = await analyze_ongoing_call(
            user_id="user_123",
            caller_number="+15551234567",
            call_sid="CA123",
            updated_transcript="Hello, this is the IRS..."
        )

    Returns:
        {
            "should_block": bool,
            "scam_score": 0.0-1.0,
            "intent": "scam" | "sales" | "friend",
            "recommendation": "continue" | "block" | "transfer"
        }
    """
    context = CallContext(
        user_id=user_id,
        user_name="",  # Not needed for analysis
        caller_number=caller_number,
        call_sid=call_sid,
        transcript=updated_transcript
    )

    # Just run parallel analysis (skip whitelist check)
    analysis = await orchestrator.analyze_call_parallel(context)

    scam_score = analysis["scam"].get("confidence", 0.0)
    should_block = scam_score >= 0.85  # Threshold

    return {
        "should_block": should_block,
        "scam_score": scam_score,
        "intent": analysis["intent"].get("intent", "unknown"),
        "recommendation": "block" if should_block else "continue"
    }
