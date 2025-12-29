"""
Test orchestrator structure and agent wiring (no API calls)
Validates Google ADK pattern implementation without cloud dependencies
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.agents.orchestrator import (
    GatekeeperOrchestrator,
    CallContext,
    orchestrator
)
from app.agents.scam_detector_agent import ScamDetectorAgent, SCAM_KEYWORDS
from app.agents.contact_matcher_agent import ContactMatcherAgent
from app.agents.screener_agent import ScreenerAgent
from app.agents.decision_agent import DecisionAgent


def test_orchestrator_structure():
    """Test orchestrator has correct structure"""
    print("\n" + "="*60)
    print("TEST 1: Orchestrator Structure")
    print("="*60)

    # Verify orchestrator exists and has required methods
    assert hasattr(orchestrator, 'check_whitelist'), "❌ Missing check_whitelist method"
    assert hasattr(orchestrator, 'analyze_call_parallel'), "❌ Missing analyze_call_parallel method"
    assert hasattr(orchestrator, 'make_decision'), "❌ Missing make_decision method"
    assert hasattr(orchestrator, 'process_call'), "❌ Missing process_call method"

    print("✅ Orchestrator has all required methods")
    print(f"  - check_whitelist: {type(orchestrator.check_whitelist)}")
    print(f"  - analyze_call_parallel: {type(orchestrator.analyze_call_parallel)}")
    print(f"  - make_decision: {type(orchestrator.make_decision)}")
    print(f"  - process_call: {type(orchestrator.process_call)}")

    return True


def test_lazy_agent_loading():
    """Test lazy agent loading pattern (Google ADK best practice)"""
    print("\n" + "="*60)
    print("TEST 2: Lazy Agent Loading")
    print("="*60)

    # Create new orchestrator instance
    orch = GatekeeperOrchestrator()

    # Verify agents not loaded yet
    assert len(orch.agents) == 0, "❌ Agents should not be loaded on init"
    print("✅ Agents not loaded on initialization (lazy loading)")

    # Load each agent
    scam_detector = orch._get_agent("scam_detector")
    assert isinstance(scam_detector, ScamDetectorAgent), "❌ Wrong agent type"
    print(f"  - scam_detector loaded: {type(scam_detector).__name__}")

    contact_matcher = orch._get_agent("contact_matcher")
    assert isinstance(contact_matcher, ContactMatcherAgent), "❌ Wrong agent type"
    print(f"  - contact_matcher loaded: {type(contact_matcher).__name__}")

    screener = orch._get_agent("screener")
    assert isinstance(screener, ScreenerAgent), "❌ Wrong agent type"
    print(f"  - screener loaded: {type(screener).__name__}")

    decision = orch._get_agent("decision")
    assert isinstance(decision, DecisionAgent), "❌ Wrong agent type"
    print(f"  - decision loaded: {type(decision).__name__}")

    # Verify agents cached
    assert len(orch.agents) == 4, f"❌ Expected 4 agents, got {len(orch.agents)}"
    print(f"\n✅ All 4 agents loaded and cached")

    return True


def test_scam_keywords():
    """Test scam detection keywords database"""
    print("\n" + "="*60)
    print("TEST 3: Scam Detection Keywords")
    print("="*60)

    # Verify comprehensive keyword database (list of strings)
    assert isinstance(SCAM_KEYWORDS, list), "❌ SCAM_KEYWORDS should be a list"
    assert len(SCAM_KEYWORDS) > 0, "❌ SCAM_KEYWORDS is empty"

    # Check for key scam indicators
    keyword_str = " ".join(SCAM_KEYWORDS).lower()
    assert "irs" in keyword_str, "❌ Missing IRS keywords"
    assert "microsoft" in keyword_str or "apple" in keyword_str, "❌ Missing tech support keywords"
    assert "social security" in keyword_str, "❌ Missing social security keywords"
    assert "warrant" in keyword_str, "❌ Missing legal threat keywords"
    assert "bitcoin" in keyword_str or "gift cards" in keyword_str, "❌ Missing financial keywords"

    print(f"✅ Scam keyword database loaded")
    print(f"  - Total keywords: {len(SCAM_KEYWORDS)}")

    # Show some examples
    print("\n  Example keywords:")
    for keyword in SCAM_KEYWORDS[:10]:
        print(f"    - {keyword}")
    print(f"    ... and {len(SCAM_KEYWORDS) - 10} more")

    return True


def test_call_context():
    """Test CallContext dataclass"""
    print("\n" + "="*60)
    print("TEST 4: CallContext Structure")
    print("="*60)

    context = CallContext(
        user_id="test_123",
        user_name="Tom",
        caller_number="+15551234567",
        call_sid="CA_test_001",
        transcript="Hello this is a test",
        caller_name="Sarah"
    )

    assert context.user_id == "test_123", "❌ user_id mismatch"
    assert context.user_name == "Tom", "❌ user_name mismatch"
    assert context.caller_number == "+15551234567", "❌ caller_number mismatch"
    assert context.call_sid == "CA_test_001", "❌ call_sid mismatch"
    assert context.transcript == "Hello this is a test", "❌ transcript mismatch"
    assert context.caller_name == "Sarah", "❌ caller_name mismatch"

    print("✅ CallContext has all required fields")
    print(f"  - user_id: {context.user_id}")
    print(f"  - user_name: {context.user_name}")
    print(f"  - caller_number: {context.caller_number}")
    print(f"  - call_sid: {context.call_sid}")
    print(f"  - transcript: {context.transcript[:30]}...")
    print(f"  - caller_name: {context.caller_name}")

    return True


async def test_scam_detector_keyword_matching():
    """Test scam detector keyword matching (no API calls)"""
    print("\n" + "="*60)
    print("TEST 5: Scam Detector Keyword Matching")
    print("="*60)

    detector = ScamDetectorAgent()

    # Test IRS scam
    irs_transcript = "This is the IRS calling about your tax debt. You have a warrant."
    score = detector._check_keywords(irs_transcript.lower())
    print(f"\n  IRS scam transcript:")
    print(f"    Keyword score: {score:.2f}")
    assert score > 0.0, f"❌ Failed to detect IRS scam keywords (score: {score})"
    print(f"    ✅ IRS scam keywords detected ({score:.2f})")

    # Test tech support scam
    tech_transcript = "This is Microsoft support. Your computer has a virus."
    score = detector._check_keywords(tech_transcript.lower())
    print(f"\n  Tech support scam transcript:")
    print(f"    Keyword score: {score:.2f}")
    assert score > 0.0, f"❌ Failed to detect tech support scam keywords (score: {score})"
    print(f"    ✅ Tech support scam keywords detected ({score:.2f})")

    # Test legitimate call
    friend_transcript = "Hi Tom, it's Sarah. Want to grab coffee later?"
    score = detector._check_keywords(friend_transcript.lower())
    print(f"\n  Legitimate call transcript:")
    print(f"    Keyword score: {score:.2f}")
    assert score == 0.0, f"❌ False positive on legitimate call (score: {score})"
    print(f"    ✅ No scam keywords detected (legitimate)")

    return True


async def test_screener_greeting():
    """Test screener agent greeting generation"""
    print("\n" + "="*60)
    print("TEST 6: Screener Greeting (TCPA Compliance)")
    print("="*60)

    screener = ScreenerAgent()

    greeting = await screener.greet("Tom")
    print(f"\n  Generated greeting:")
    print(f"    {greeting}")

    # FCC TCPA requires AI disclosure
    assert "AI" in greeting or "assistant" in greeting, "❌ Missing AI disclosure!"
    assert "Tom" in greeting, "❌ Missing user name!"

    print(f"\n  ✅ Greeting includes required AI disclosure")
    print(f"  ✅ Greeting personalized with user name")

    return True


def run_all_tests():
    """Run all structure tests"""
    print("\n" + "="*80)
    print("🧪 GOOGLE ADK ORCHESTRATOR STRUCTURE TESTS")
    print("="*80)
    print("\nValidating:")
    print("  - Orchestrator structure and methods")
    print("  - Lazy agent loading (Google ADK pattern)")
    print("  - Agent instantiation and caching")
    print("  - Scam detection keyword database")
    print("  - CallContext dataclass")

    results = []

    try:
        # Synchronous tests
        results.append(test_orchestrator_structure())
        results.append(test_lazy_agent_loading())
        results.append(test_scam_keywords())
        results.append(test_call_context())

        # Async tests
        loop = asyncio.get_event_loop()
        results.append(loop.run_until_complete(test_scam_detector_keyword_matching()))
        results.append(loop.run_until_complete(test_screener_greeting()))

        # Summary
        print("\n" + "="*80)
        print("📊 TEST SUMMARY")
        print("="*80)
        print(f"\nTotal Tests: {len(results)}")
        print(f"Passed: {sum(results)}")
        print(f"Failed: {len(results) - sum(results)}")

        if all(results):
            print("\n🎉 ALL TESTS PASSED!")
            print("\n✅ Google ADK orchestrator structure is correct")
            print("✅ All 4 agents are properly wired")
            print("✅ Lazy loading pattern implemented")
            print("✅ Keyword matching works (no API calls needed)")
            print("✅ TCPA-compliant AI disclosure")
            return 0
        else:
            print("\n❌ SOME TESTS FAILED! Check output above.")
            return 1

    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
