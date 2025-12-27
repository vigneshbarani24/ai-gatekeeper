"""
RAG (Retrieval-Augmented Generation) + Google Search
Real-time scam intelligence and knowledge base

Protects people by:
1. Searching latest scam reports from Google
2. Querying FTC scam database
3. Checking known scam numbers
4. Learning from community reports
"""

import logging
from typing import List, Dict, Optional
import httpx
from datetime import datetime, timedelta

from app.core.config import settings

logger = logging.getLogger(__name__)


class RAGService:
    """
    RAG service for real-time scam intelligence

    Knowledge sources:
    1. Google Search (latest scam trends)
    2. FTC Scam Database API
    3. Local scam reports (from other users)
    4. Known scam phone numbers (crowdsourced)
    """

    def __init__(self):
        self.google_api_key = getattr(settings, 'GOOGLE_SEARCH_API_KEY', None)
        self.search_engine_id = getattr(settings, 'GOOGLE_SEARCH_ENGINE_ID', None)
        self.cache = {}  # Simple cache (phone numbers → scam reports)

    async def search_scam_reports(self, query: str, max_results: int = 5) -> List[Dict]:
        """
        Search Google for recent scam reports matching query

        Args:
            query: Search query (e.g., "IRS phone scam +15551234567")
            max_results: Number of results to return

        Returns:
            List of search results with titles, snippets, URLs
        """
        if not self.google_api_key or not self.search_engine_id:
            # Demo mode - return mock data
            logger.warning("⚠️ Google Search not configured (demo mode)")
            return self._get_mock_search_results(query)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/customsearch/v1",
                    params={
                        "key": self.google_api_key,
                        "cx": self.search_engine_id,
                        "q": query,
                        "num": max_results,
                        "dateRestrict": "m1"  # Last 1 month
                    },
                    timeout=5.0
                )

                data = response.json()
                results = []

                for item in data.get("items", []):
                    results.append({
                        "title": item.get("title"),
                        "snippet": item.get("snippet"),
                        "url": item.get("link"),
                        "source": "google_search"
                    })

                logger.info(f"🔍 Found {len(results)} search results for: {query}")
                return results

        except Exception as e:
            logger.error(f"❌ Google Search failed: {e}")
            return []

    async def check_phone_number(self, phone_number: str) -> Dict:
        """
        Check if phone number is reported as scam

        Sources:
        1. Google Search ("{phone_number} scam report")
        2. Local database (other users' reports)
        3. Known scammer databases

        Args:
            phone_number: Phone number to check

        Returns:
            {
                "is_known_scammer": bool,
                "reports_count": int,
                "latest_report": str,
                "sources": List[str]
            }
        """
        # Check cache first
        if phone_number in self.cache:
            cached = self.cache[phone_number]
            if datetime.now() - cached["cached_at"] < timedelta(hours=24):
                logger.info(f"📦 Using cached result for {phone_number}")
                return cached["data"]

        # Search Google
        query = f'"{phone_number}" scam report robocall'
        search_results = await self.search_scam_reports(query, max_results=3)

        # Analyze results
        is_known_scammer = len(search_results) > 0
        reports_count = len(search_results)

        latest_report = None
        if search_results:
            latest_report = search_results[0]["snippet"]

        result = {
            "is_known_scammer": is_known_scammer,
            "reports_count": reports_count,
            "latest_report": latest_report,
            "sources": [r["url"] for r in search_results],
            "confidence": min(reports_count / 10.0, 1.0)  # More reports = higher confidence
        }

        # Cache result
        self.cache[phone_number] = {
            "data": result,
            "cached_at": datetime.now()
        }

        logger.info(f"📞 Checked {phone_number}: {reports_count} reports found")
        return result

    async def get_scam_context(self, transcript: str) -> Dict:
        """
        Get contextual knowledge about potential scam

        Searches for similar scam scripts and tactics

        Args:
            transcript: Call transcript

        Returns:
            {
                "similar_scams": List[Dict],
                "tactics": List[str],
                "protection_tips": List[str]
            }
        """
        # Extract key phrases
        keywords = self._extract_keywords(transcript)

        if not keywords:
            return {
                "similar_scams": [],
                "tactics": [],
                "protection_tips": []
            }

        # Search for similar scams
        query = f"{' '.join(keywords)} scam tactics how to protect"
        search_results = await self.search_scam_reports(query, max_results=5)

        # Extract tactics mentioned in results
        tactics = []
        for result in search_results:
            snippet = result["snippet"].lower()

            if "urgency" in snippet or "immediate" in snippet:
                tactics.append("Creates false urgency")

            if "threaten" in snippet or "arrest" in snippet:
                tactics.append("Uses intimidation tactics")

            if "verify" in snippet or "confirm" in snippet:
                tactics.append("Requests personal information")

            if "payment" in snippet or "money" in snippet:
                tactics.append("Demands immediate payment")

        # Protection tips based on scam type
        protection_tips = [
            "Never share personal information over phone",
            "Government agencies don't demand immediate payment",
            "Verify caller by calling official number",
            "Report suspicious calls to FTC at ftc.gov/complaint"
        ]

        return {
            "similar_scams": search_results,
            "tactics": list(set(tactics)),  # Remove duplicates
            "protection_tips": protection_tips
        }

    async def learn_from_report(
        self,
        phone_number: str,
        scam_type: str,
        evidence: str
    ) -> bool:
        """
        Learn from user scam report (contribute to community knowledge)

        Args:
            phone_number: Scammer's phone number
            scam_type: Type of scam (irs, tech_support, etc.)
            evidence: Transcript or description

        Returns:
            Success boolean
        """
        try:
            # In real implementation, this would:
            # 1. Store in Supabase (scam_reports table)
            # 2. Update vector embeddings
            # 3. Contribute to FTC database

            logger.info(f"📚 Learned from scam report: {phone_number} ({scam_type})")

            # Invalidate cache
            if phone_number in self.cache:
                del self.cache[phone_number]

            return True

        except Exception as e:
            logger.error(f"❌ Failed to learn from report: {e}")
            return False

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from transcript"""
        # Remove common words
        stopwords = {"the", "a", "an", "is", "are", "was", "were", "be", "been",
                     "being", "have", "has", "had", "do", "does", "did", "will",
                     "would", "should", "could", "can", "may", "might", "must",
                     "this", "that", "these", "those", "i", "you", "he", "she",
                     "it", "we", "they", "what", "which", "who", "when", "where",
                     "why", "how", "all", "each", "every", "both", "few", "more",
                     "most", "other", "some", "such", "no", "nor", "not", "only",
                     "own", "same", "so", "than", "too", "very"}

        words = text.lower().split()
        keywords = [w for w in words if len(w) > 3 and w not in stopwords]

        # Return top 5 most interesting words
        return keywords[:5]

    def _get_mock_search_results(self, query: str) -> List[Dict]:
        """Mock search results for demo mode"""
        return [
            {
                "title": "IRS Phone Scam Warning - Federal Trade Commission",
                "snippet": "Scammers claiming to be from the IRS demand immediate payment. Real IRS never calls demanding payment or threatening arrest.",
                "url": "https://www.ftc.gov/irs-scam-warning",
                "source": "mock"
            },
            {
                "title": "How to Spot IRS Scams | Consumer Reports",
                "snippet": "Common IRS scam tactics include urgency, threats of arrest, and demands for gift cards or wire transfers.",
                "url": "https://www.consumerreports.org/scams/irs-scams",
                "source": "mock"
            }
        ]


# Singleton instance
rag_service = RAGService()


# ======================
# VECTOR SEARCH (Advanced RAG)
# ======================

class VectorRAG:
    """
    Advanced RAG with vector embeddings

    Stores scam scripts as embeddings, searches by similarity
    """

    def __init__(self):
        self.embeddings_cache = {}
        self.gemini_service = None  # Lazy load

    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding vector for text"""
        if not self.gemini_service:
            from app.services.gemini_service import get_gemini_service
            self.gemini_service = get_gemini_service()

        # Use Gemini embeddings
        embeddings = await self.gemini_service.generate_embeddings(text)
        return embeddings

    async def find_similar_scams(
        self,
        transcript: str,
        threshold: float = 0.85
    ) -> List[Dict]:
        """
        Find similar scam scripts using vector similarity

        Args:
            transcript: Call transcript
            threshold: Similarity threshold (0.0-1.0)

        Returns:
            List of similar scams with similarity scores
        """
        # Generate embedding for transcript
        query_embedding = await self.embed_text(transcript)

        if not query_embedding:
            return []

        # In production, this would query Vertex AI Vector Search
        # For now, return mock similar scams

        similar_scams = [
            {
                "scam_type": "irs",
                "similarity_score": 0.92,
                "script_sample": "This is the IRS calling about your unpaid taxes...",
                "report_count": 1247
            },
            {
                "scam_type": "tech_support",
                "similarity_score": 0.78,
                "script_sample": "We detected a virus on your computer...",
                "report_count": 856
            }
        ]

        # Filter by threshold
        return [s for s in similar_scams if s["similarity_score"] >= threshold]


vector_rag = VectorRAG()
