"""
Gemini Service: Google Vertex AI for LLM reasoning and analysis
"""

import logging
from typing import Dict, List, Optional, Any
import json

from app.core.config import settings

logger = logging.getLogger(__name__)

# Conditional imports - only import Vertex AI when actually needed
# This prevents hanging on import when GOOGLE_APPLICATION_CREDENTIALS is not set
try:
    _VERTEX_AI_AVAILABLE = True
    # We'll import these inside _ensure_initialized to avoid hanging
except ImportError:
    _VERTEX_AI_AVAILABLE = False
    logger.warning("⚠️ Vertex AI libraries not available")


class GeminiService:
    """
    Manages Google Gemini models for:
    - Real-time intent classification (Gemini 2.0 Flash)
    - Deep scam analysis (Gemini 1.5 Pro)
    - Text embeddings for vector search
    """

    def __init__(self):
        # Lazy initialization - only init when needed
        self._initialized = False
        self.fast_model = None
        self.analysis_model = None
        self.embedding_model = None

    def _ensure_initialized(self):
        """Initialize Vertex AI and models on first use"""
        if not self._initialized:
            try:
                # Import Vertex AI libraries here to avoid hanging on module import
                from google.cloud import aiplatform
                from vertexai.generative_models import GenerativeModel
                from vertexai.language_models import TextEmbeddingModel

                # Initialize Vertex AI
                aiplatform.init(
                    project=settings.GOOGLE_CLOUD_PROJECT,
                    location=settings.VERTEX_AI_LOCATION
                )

                # Fast model for real-time screening
                self.fast_model = GenerativeModel(settings.GEMINI_MODEL_FAST)

                # Powerful model for deep analysis
                self.analysis_model = GenerativeModel(settings.GEMINI_MODEL_ANALYSIS)

                # Embedding model
                self.embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")

                self._initialized = True
                logger.info("✅ Gemini Service initialized")

            except Exception as e:
                logger.warning(f"⚠️ Gemini Service initialization failed (demo mode?): {e}")
                # In demo mode, these will remain None

    async def classify_caller_intent(
        self,
        transcript: str,
        caller_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Classify caller's intent using Gemini 2.0 Flash (fast)

        Args:
            transcript: Call transcript so far
            caller_name: Caller's stated name (if provided)

        Returns:
            Dict with intent classification:
            {
                "intent": "friend" | "sales" | "appointment" | "scam" | "unknown",
                "confidence": 0.0-1.0,
                "reasoning": "explanation",
                "should_pass_through": bool
            }
        """
        self._ensure_initialized()

        if not self.fast_model:
            # Return default for demo mode
            return {
                "intent": "unknown",
                "confidence": 0.5,
                "reasoning": "Demo mode - Gemini not initialized",
                "should_pass_through": False
            }

        prompt = f"""You are an expert at analyzing phone call intent.

Transcript:
{transcript}

Caller Name: {caller_name or "Unknown"}

Classify the caller's intent into ONE of these categories:
1. "friend" - Personal contact, someone who knows the user
2. "sales" - Cold call, telemarketing, solicitation
3. "appointment" - Scheduling, rescheduling, or confirming an appointment
4. "scam" - Fraudulent call (IRS scam, tech support, etc.)
5. "unknown" - Cannot determine yet

Also determine if this call should be passed through to the user immediately.

Respond in JSON format:
{{
    "intent": "one of the categories above",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation",
    "should_pass_through": true/false
}}

Important rules:
- If caller mentions "IRS", "Social Security", "warrant", "legal action", "owe money" → SCAM
- If caller is selling something → SALES (do not pass through)
- If caller states they're a friend/family → FRIEND (pass through after name verification)
- If caller wants to book/cancel appointment → APPOINTMENT (handle, don't pass through)
"""

        try:
            response = self.fast_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,  # Low for consistent classification
                    "max_output_tokens": 200,
                }
            )

            # Parse JSON response
            result = json.loads(response.text)
            logger.info(f"🎯 Intent classified: {result['intent']} (confidence: {result['confidence']})")
            return result

        except Exception as e:
            logger.error(f"❌ Failed to classify intent: {e}")
            return {
                "intent": "unknown",
                "confidence": 0.0,
                "reasoning": f"Error: {str(e)}",
                "should_pass_through": False
            }

    async def analyze_scam_indicators(
        self,
        transcript: str,
        caller_number: str
    ) -> Dict[str, Any]:
        """
        Deep scam analysis using Gemini 1.5 Pro (parallel to call)

        Args:
            transcript: Full call transcript
            caller_number: Caller's phone number

        Returns:
            Dict with scam analysis:
            {
                "is_scam": bool,
                "scam_type": "irs" | "tech_support" | "grandparent" | null,
                "confidence": 0.0-1.0,
                "red_flags": List[str],
                "recommendation": "block" | "flag" | "allow"
            }
        """
        self._ensure_initialized()

        if not self.analysis_model:
            # Return default for demo mode
            return {
                "is_scam": False,
                "scam_type": None,
                "confidence": 0.0,
                "red_flags": [],
                "recommendation": "allow"
            }

        prompt = f"""You are a fraud detection expert analyzing a phone call transcript.

Transcript:
{transcript}

Caller Number: {caller_number}

Analyze this call for scam indicators. Look for:
- IRS/tax scams (claims you owe taxes, threatens arrest)
- Tech support scams (fake Microsoft/Apple support)
- Grandparent scams (pretends to be grandchild in trouble)
- Lottery/prize scams (you've won something, need to pay fees)
- Romance scams (overly friendly, asks for money)
- Robocalls (scripted, unnatural speech patterns)

Respond in JSON format:
{{
    "is_scam": true/false,
    "scam_type": "irs" | "tech_support" | "grandparent" | "lottery" | "romance" | "robocall" | null,
    "confidence": 0.0-1.0,
    "red_flags": ["list", "of", "suspicious", "phrases"],
    "recommendation": "block" | "flag" | "allow"
}}

Recommendation rules:
- confidence >= 0.9 → "block" (terminate call immediately)
- confidence 0.7-0.89 → "flag" (warn user, let them decide)
- confidence < 0.7 → "allow" (likely legitimate)
"""

        try:
            response = self.analysis_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 300,
                }
            )

            result = json.loads(response.text)
            logger.info(f"🔍 Scam analysis: {result}")
            return result

        except Exception as e:
            logger.error(f"❌ Failed to analyze scam: {e}")
            return {
                "is_scam": False,
                "scam_type": None,
                "confidence": 0.0,
                "red_flags": [],
                "recommendation": "allow"
            }

    async def generate_embeddings(self, text: str) -> List[float]:
        """
        Generate text embeddings for vector similarity search

        Args:
            text: Text to embed (transcript, scam script, etc.)

        Returns:
            List of floats (768 dimensions for text-embedding-004)
        """
        self._ensure_initialized()

        if not self.embedding_model:
            # Return empty for demo mode
            return []

        try:
            embeddings = self.embedding_model.get_embeddings([text])
            return embeddings[0].values

        except Exception as e:
            logger.error(f"❌ Failed to generate embeddings: {e}")
            return []

    async def generate_call_summary(
        self,
        transcript: str,
        intent: str,
        duration_seconds: int
    ) -> str:
        """
        Generate a brief summary of the call for user dashboard

        Args:
            transcript: Full call transcript
            intent: Detected intent
            duration_seconds: Call duration

        Returns:
            Brief summary string (1-2 sentences)
        """
        self._ensure_initialized()

        if not self.fast_model:
            # Return default for demo mode
            return f"{intent.capitalize()} call, {duration_seconds}s (demo mode)"

        prompt = f"""Summarize this phone call in 1-2 sentences for the user's call log.

Intent: {intent}
Duration: {duration_seconds} seconds
Transcript:
{transcript}

Summary:"""

        try:
            response = self.fast_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.5,
                    "max_output_tokens": 100,
                }
            )

            summary = response.text.strip()
            logger.debug(f"📝 Generated summary: {summary}")
            return summary

        except Exception as e:
            logger.error(f"❌ Failed to generate summary: {e}")
            return f"{intent.capitalize()} call, {duration_seconds}s"


# Singleton instance (lazy-loaded)
_gemini_service_instance = None

def get_gemini_service() -> GeminiService:
    """Get or create the singleton Gemini service"""
    global _gemini_service_instance
    if _gemini_service_instance is None:
        _gemini_service_instance = GeminiService()
    return _gemini_service_instance

# Export function, not instance
gemini_service = None  # Will be set on first use
