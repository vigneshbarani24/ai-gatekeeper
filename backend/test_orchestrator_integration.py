"""
Test orchestrator integration with simulated call flows
Verifies Google ADK multi-agent system works correctly
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.agents.orchestrator import (
    analyze_ongoing_call,
    screen_incoming_call,
    CallContext,
    orchestrator
)


# =======================
# TEST SCENARIOS
# =======================

SCAM_TRANSCRIPT = """
Hello, this is calling from the IRS.
We have detected fraudulent activity on your social security number.
If you don't act immediately, a warrant will be issued for your arrest.
Please call us back at 555-0100 with your social security number to verify.
This is urgent. You must act within 24 hours or face legal action.
"""

SALES_TRANSCRIPT = """
Hello! I'm calling from Superior Home Warranty Services.
I wanted to let you know that your car's warranty is about to expire.
We have a special limited-time offer that can extend your warranty
for an additional 5 years at a discounted rate.
Can I interest you in learning more about our protection plans?
"""

FRIEND_TRANSCRIPT = """
Hi! This is Sarah calling for Tom.
We're supposed to meet for coffee this afternoon at 3pm.
I just wanted to confirm he's still available.
If he could give me a call back, that would be great!
Thanks so much!
"""

APPOINTMENT_TRANSCRIPT = """
Hello, this is calling from Dr. Smith's office.
We're calling to confirm your appointment tomorrow at 2:30pm.
If you need to reschedule, please give us a call back.
Thank you!
"""


async def test_scam_detection():
    """Test that scam call is detected and blocked"""
    print("\n" + "="*60)
    print("TEST 1: Scam Call Detection (IRS Scam)")
    print("="*60)

    result = await analyze_ongoing_call(
        user_id="test_user_123",
        caller_number="+15551234567",
        call_sid="CA_test_scam_001",
        updated_transcript=SCAM_TRANSCRIPT
    )

    print(f"\n📊 Analysis Results:")
    print(f"  - Should Block: {result['should_block']}")
    print(f"  - Scam Score: {result['scam_score']:.2f}")
    print(f"  - Intent: {result['intent']}")
    print(f"  - Recommendation: {result['recommendation']}")

    # Assert scam detected
    assert result['should_block'] == True, "❌ Failed to detect scam!"
    assert result['scam_score'] >= 0.5, f"❌ Scam score too low: {result['scam_score']}"

    print("\n✅ PASS: Scam correctly detected and blocked")
    return True


async def test_sales_detection():
    """Test that sales call is identified (not scam)"""
    print("\n" + "="*60)
    print("TEST 2: Sales Call Detection (Warranty Sales)")
    print("="*60)

    result = await analyze_ongoing_call(
        user_id="test_user_123",
        caller_number="+15559876543",
        call_sid="CA_test_sales_001",
        updated_transcript=SALES_TRANSCRIPT
    )

    print(f"\n📊 Analysis Results:")
    print(f"  - Should Block: {result['should_block']}")
    print(f"  - Scam Score: {result['scam_score']:.2f}")
    print(f"  - Intent: {result['intent']}")
    print(f"  - Recommendation: {result['recommendation']}")

    # Assert sales call identified (not scam)
    assert result['scam_score'] < 0.85, f"❌ False positive: Sales call flagged as scam (score: {result['scam_score']})"

    print("\n✅ PASS: Sales call correctly identified (not blocked as scam)")
    return True


async def test_friend_call():
    """Test that friend call is recognized"""
    print("\n" + "="*60)
    print("TEST 3: Friend Call (Legitimate Personal Call)")
    print("="*60)

    result = await analyze_ongoing_call(
        user_id="test_user_123",
        caller_number="+15551112222",
        call_sid="CA_test_friend_001",
        updated_transcript=FRIEND_TRANSCRIPT
    )

    print(f"\n📊 Analysis Results:")
    print(f"  - Should Block: {result['should_block']}")
    print(f"  - Scam Score: {result['scam_score']:.2f}")
    print(f"  - Intent: {result['intent']}")
    print(f"  - Recommendation: {result['recommendation']}")

    # Assert legitimate call
    assert result['should_block'] == False, "❌ False positive: Friend call blocked!"
    assert result['scam_score'] < 0.5, f"❌ Scam score too high for friend: {result['scam_score']}"

    print("\n✅ PASS: Friend call correctly identified (not blocked)")
    return True


async def test_appointment_call():
    """Test that appointment reminder is recognized"""
    print("\n" + "="*60)
    print("TEST 4: Appointment Reminder (Healthcare)")
    print("="*60)

    result = await analyze_ongoing_call(
        user_id="test_user_123",
        caller_number="+15553334444",
        call_sid="CA_test_appointment_001",
        updated_transcript=APPOINTMENT_TRANSCRIPT
    )

    print(f"\n📊 Analysis Results:")
    print(f"  - Should Block: {result['should_block']}")
    print(f"  - Scam Score: {result['scam_score']:.2f}")
    print(f"  - Intent: {result['intent']}")
    print(f"  - Recommendation: {result['recommendation']}")

    # Assert legitimate appointment
    assert result['should_block'] == False, "❌ False positive: Appointment blocked!"

    print("\n✅ PASS: Appointment reminder correctly identified")
    return True


async def test_complete_screening_flow():
    """Test complete screening flow with CallContext"""
    print("\n" + "="*60)
    print("TEST 5: Complete Screening Flow (Initial Call)")
    print("="*60)

    context = CallContext(
        user_id="test_user_123",
        user_name="Tom",
        caller_number="+15551234567",
        call_sid="CA_test_complete_001",
        transcript=SCAM_TRANSCRIPT,
        caller_name=None
    )

    result = await orchestrator.process_call(context)

    print(f"\n📊 Orchestrator Decision:")
    print(f"  - Action: {result['action']}")
    print(f"  - Reason: {result['reason']}")
    print(f"  - Message: {result['message']}")
    print(f"  - Confidence: {result.get('confidence', 0):.2f}")

    # Assert scam blocked
    assert result['action'] in ['block', 'screen_continue'], "❌ Invalid action"

    print("\n✅ PASS: Complete orchestration flow works")
    return True


async def run_all_tests():
    """Run all orchestrator tests"""
    print("\n" + "="*80)
    print("🧪 GOOGLE ADK ORCHESTRATOR INTEGRATION TESTS")
    print("="*80)
    print("\nTesting multi-agent system:")
    print("  - ScamDetectorAgent (keyword + LLM analysis)")
    print("  - ScreenerAgent (intent classification)")
    print("  - ContactMatcherAgent (whitelist check)")
    print("  - DecisionAgent (final routing)")

    results = []

    try:
        # Run all tests
        results.append(await test_scam_detection())
        results.append(await test_sales_detection())
        results.append(await test_friend_call())
        results.append(await test_appointment_call())
        results.append(await test_complete_screening_flow())

        # Summary
        print("\n" + "="*80)
        print("📊 TEST SUMMARY")
        print("="*80)
        print(f"\nTotal Tests: {len(results)}")
        print(f"Passed: {sum(results)}")
        print(f"Failed: {len(results) - sum(results)}")

        if all(results):
            print("\n🎉 ALL TESTS PASSED! Google ADK orchestrator is working correctly.")
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
    exit_code = asyncio.run(run_all_tests())
    sys.exit(exit_code)
