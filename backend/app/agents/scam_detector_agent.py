"""
Scam Detector Agent: Fraud pattern detection
Uses vector similarity + LLM analysis to detect scams
"""

import logging
from typing import Dict, Any, List

from app.services.gemini_service import get_gemini_service

logger = logging.getLogger(__name__)


# Known scam indicators (simple keyword matching for MVP)
SCAM_KEYWORDS = [
    # IRS scams
    "irs", "internal revenue", "tax refund", "owe taxes", "tax fraud",

    # Tech support scams
    "microsoft support", "apple support", "computer virus", "suspended account",

    # Social Security scams
    "social security", "ssn suspended", "social security number",

    # Warrant/Legal scams
    "warrant", "arrest warrant", "legal action", "lawsuit", "court case",

    # Financial scams
    "wire transfer", "gift cards", "bitcoin", "cryptocurrency", "bank account suspended",

    # Urgency tactics
    "immediate action", "act now", "within 24 hours", "last chance",

    # Prize/Lottery scams
    "congratulations you won", "lottery", "prize winner", "claim your prize",

    # Grandparent scams
    "grandson in trouble", "granddaughter arrested", "need bail money",
]


class ScamDetectorAgent:
    """
    Detects scam calls using multiple techniques:

    1. Keyword matching (fast, simple)
    2. Vector similarity against known scam scripts (accurate)
    3. LLM deep analysis (comprehensive)

    Runs in parallel with intent classification for speed
    """

    def __init__(self):
        self.vector_db = None  # TODO: Initialize vector store in vector_store.py

    async def run(
        self,
        transcript: str,
        caller_number: str
    ) -> Dict[str, Any]:
        """
        Detect if call is a scam

        Args:
            transcript: Call transcript
            caller_number: Caller's phone number

        Returns:
            {
                "is_scam": bool,
                "scam_type": "irs" | "tech_support" | null,
                "confidence": 0.0-1.0,
                "red_flags": List[str],
                "recommendation": "block" | "flag" | "allow"
            }
        """
        logger.info(f"[ScamDetector] Analyzing call from {caller_number}")

        # Quick keyword check (fast path)
        keyword_score = self._check_keywords(transcript)

        # If high keyword match, likely scam
        if keyword_score >= 0.8:
            logger.warning(f"🚨 [ScamDetector] High keyword match: {keyword_score}")
            return {
                "is_scam": True,
                "scam_type": "keyword_match",
                "confidence": keyword_score,
                "red_flags": self._extract_red_flags(transcript),
                "recommendation": "block"
            }

        # Deep LLM analysis (slower, more accurate)
        gemini_service = get_gemini_service()
        llm_analysis = await gemini_service.analyze_scam_indicators(
            transcript=transcript,
            caller_number=caller_number
        )

        logger.info(f"[ScamDetector] LLM analysis: {llm_analysis.get('recommendation')}")

        return llm_analysis

    def _check_keywords(self, transcript: str) -> float:
        """
        Quick keyword-based scam detection

        Args:
            transcript: Call transcript

        Returns:
            Score 0.0-1.0 (higher = more likely scam)
        """
        transcript_lower = transcript.lower()

        matches = sum(
            1 for keyword in SCAM_KEYWORDS
            if keyword in transcript_lower
        )

        # Normalize: 3+ keyword matches = likely scam
        score = min(matches / 3.0, 1.0)

        return score

    def _extract_red_flags(self, transcript: str) -> List[str]:
        """
        Extract specific red flag phrases from transcript

        Args:
            transcript: Call transcript

        Returns:
            List of suspicious phrases found
        """
        transcript_lower = transcript.lower()

        found = [
            keyword for keyword in SCAM_KEYWORDS
            if keyword in transcript_lower
        ]

        return found[:5]  # Return top 5

    async def check_vector_similarity(
        self,
        transcript: str
    ) -> float:
        """
        Check similarity against known scam scripts using vector search

        Args:
            transcript: Call transcript

        Returns:
            Similarity score 0.0-1.0 (higher = more similar to known scams)
        """
        # TODO: Implement vector search
        # This will use Vertex AI Vector Search to find similar scam scripts
        # For now, return 0.0 (not implemented)

        logger.debug("[ScamDetector] Vector search not implemented yet")
        return 0.0


def create_scam_detector_agent() -> ScamDetectorAgent:
    """Factory function to create scam detector agent"""
    return ScamDetectorAgent()
