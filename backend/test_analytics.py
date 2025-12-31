#!/usr/bin/env python3
"""
Quick test script for analytics endpoint
"""

import asyncio
import sys
sys.path.insert(0, '/home/user/Storytopia/ai-gatekeeper/backend')

from app.routers.analytics import get_user_stats, get_recent_calls, generate_summary_text, generate_insights, generate_tip


async def test_analytics():
    """Test the analytics functions"""

    print("🧪 Testing Analytics Functions\n")
    print("=" * 60)

    # Test 1: Get user stats (will use demo data)
    print("\n1️⃣ Testing get_user_stats()...")
    stats = await get_user_stats("demo_user")
    print(f"✅ Stats: {stats}")

    # Test 2: Get recent calls (will use demo data)
    print("\n2️⃣ Testing get_recent_calls()...")
    recent_calls = await get_recent_calls("demo_user", limit=10)
    print(f"✅ Recent calls: {len(recent_calls)} calls")
    for call in recent_calls[:3]:
        print(f"   - {call['caller_number']} ({call['action_taken']})")

    # Test 3: Generate summary text (now async with Gemini integration)
    print("\n3️⃣ Testing generate_summary_text() with Gemini Flash integration...")
    summary = await generate_summary_text(stats, recent_calls, "demo_user")
    print(f"✅ Summary: {summary}")

    # Test 4: Generate insights
    print("\n4️⃣ Testing generate_insights()...")
    insights = generate_insights(stats, recent_calls)
    print(f"✅ Insights: {len(insights)} insights")
    for insight in insights:
        print(f"   {insight['icon']} {insight['text']}")

    # Test 5: Generate tip
    print("\n5️⃣ Testing generate_tip()...")
    tip = generate_tip(stats)
    print(f"✅ Tip: {tip['title']}")
    print(f"   {tip['description']}")

    # Test 6: Full response (simulate the endpoint)
    print("\n6️⃣ Full Analytics Response:")
    print("=" * 60)
    response = {
        "summary": summary,
        "stats": stats,
        "insights": insights,
        "tip": tip,
    }

    import json
    print(json.dumps(response, indent=2))

    print("\n" + "=" * 60)
    print("✅ All tests passed!")


if __name__ == "__main__":
    asyncio.run(test_analytics())
