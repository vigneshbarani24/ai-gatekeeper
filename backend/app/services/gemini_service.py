"""
Gemini Service: Google Generative AI for LLM reasoning and analysis
"""

import logging
from typing import Dict, List, Optional, Any
import json
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content

from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Manages Google Gemini models via Generative AI API:
    - Real-time intent classification (Gemini 1.5 Flash)
    - Deep scam analysis (Gemini 1.5 Pro)
    - Text embeddings
    """

    def __init__(self):
        # Lazy initialization
        self._initialized = False
        self.fast_model = None
        self.analysis_model = None

    def _ensure_initialized(self):
        """Initialize Google Generative AI on first use"""
        if not self._initialized:
            try:
                if not settings.GOOGLE_GENERATIVE_AI_API_KEY:
                    logger.warning("⚠️ GOOGLE_GENERATIVE_AI_API_KEY not set")
                    return

                genai.configure(api_key=settings.GOOGLE_GENERATIVE_AI_API_KEY)

                # Models
                # Use 'gemini-2.0-flash-exp' as it is available and faster
                self.fast_model = genai.GenerativeModel('gemini-2.0-flash-exp')
                self.analysis_model = genai.GenerativeModel('gemini-2.0-flash-exp')

                self._initialized = True
                logger.info("✅ Gemini Service initialized (Generative AI - Gemini 2.0 Flash)")

            except Exception as e:
                logger.warning(f"⚠️ Gemini Service initialization failed: {e}")

    async def classify_caller_intent(
        self,
        transcript: str,
        caller_name: Optional[str] = None
    ) -> Dict[str, Any]:
        self._ensure_initialized()

        if not self.fast_model:
            return {
                "intent": "unknown",
                "confidence": 0.5,
                "reasoning": "Service not initialized",
                "should_pass_through": False
            }

        prompt = f"""You are an expert at analyzing phone call intent.

Transcript:
{transcript}

Caller Name: {caller_name or "Unknown"}

Classify the caller's intent into ONE of these categories:
1. "friend" - Personal contact
2. "sales" - Cold call/Solicitation
3. "appointment" - Scheduling
4. "scam" - Fraudulent call (IRS, tech support, etc.)
5. "unknown" - Cannot determine yet

Respond in JSON format:
{{
    "intent": "category",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation",
    "should_pass_through": true/false
}}"""

        try:
            response = await self.fast_model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    response_mime_type="application/json"
                )
            )
            
            result = json.loads(response.text)
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
        self._ensure_initialized()

        if not self.analysis_model:
            return {
                "is_scam": False,
                "scam_type": None,
                "confidence": 0.0,
                "red_flags": [],
                "recommendation": "allow"
            }

        prompt = f"""You are a fraud detection expert. Analyze this call.

Transcript:
{transcript}

Caller: {caller_number}

Analyze for: IRS scams, Tech support, Grandparent scams, Robocalls.

Respond in JSON format:
{{
    "is_scam": true/false,
    "scam_type": "type or null",
    "confidence": 0.0-1.0,
    "red_flags": ["list", "of", "flags"],
    "recommendation": "block" | "flag" | "allow"
}}"""

        try:
            response = await self.analysis_model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,
                    response_mime_type="application/json"
                )
            )

            result = json.loads(response.text)
            return result

        except Exception as e:
            logger.error(f"❌ Failed to analyze scam: {e}")
            return {
                "is_scam": False,
                "scam_type": None,
                "confidence": 0.0,
                "red_flags": ["Analysis failed"],
                "recommendation": "allow"
            }

    async def generate_call_summary(
        self,
        transcript: str,
        intent: str,
        duration_seconds: int
    ) -> str:
        self._ensure_initialized()

        if not self.fast_model:
            return f"{intent.capitalize()} call, {duration_seconds}s"

        prompt = f"""Summarize this phone call in 1-2 sentences.
Intent: {intent}
Transcript:
{transcript}

Summary:"""

        try:
            response = await self.fast_model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.5,
                    max_output_tokens=100
                )
            )
            return response.text.strip()

        except Exception as e:
            logger.error(f"❌ Failed to generate summary: {e}")
            return f"{intent.capitalize()} call (Summary unavailable)"

# Singleton instance
_gemini_service_instance = None

def get_gemini_service() -> GeminiService:
    global _gemini_service_instance
    if _gemini_service_instance is None:
        _gemini_service_instance = GeminiService()
    return _gemini_service_instance
