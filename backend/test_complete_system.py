#!/usr/bin/env python3
"""
COMPREHENSIVE SYSTEM TEST
Tests EVERY critical component before deployment

Run this before ANY deployment to catch bugs early.
"""

import sys
import asyncio
import traceback
from typing import Dict, List

# Color output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}{text:^60}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_test(name, passed, error=None):
    status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
    print(f"  {status} {name}")
    if error:
        print(f"    {Colors.RED}Error: {error}{Colors.END}")

results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "errors": []
}

def test(name):
    """Decorator for test functions"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            results["total"] += 1
            try:
                if asyncio.iscoroutinefunction(func):
                    # For async functions, we'll handle them separately
                    return func(*args, **kwargs)
                else:
                    # For sync functions, execute immediately
                    func(*args, **kwargs)
                    results["passed"] += 1
                    print_test(name, True)
                    return True
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({
                    "test": name,
                    "error": str(e),
                    "traceback": traceback.format_exc()
                })
                print_test(name, False, str(e))
                return False
        return wrapper
    return decorator


# ============================================================================
# TEST SUITE 1: IMPORTS
# ============================================================================

print_header("TEST SUITE 1: Import Tests")

@test("Import FastAPI main app")
def test_import_main():
    from app.main import app
    assert app is not None

@test("Import telephony router")
def test_import_telephony():
    from app.routers.telephony_optimized import router
    assert router is not None

@test("Import analytics router")
def test_import_analytics():
    from app.routers.analytics import router
    assert router is not None

@test("Import elevenlabs_tools router")
def test_import_elevenlabs_tools():
    from app.routers.elevenlabs_tools import router
    assert router is not None

@test("Import database service")
def test_import_database():
    from app.services.database import db_service
    assert db_service is not None

@test("Import config settings")
def test_import_config():
    from app.core.config import settings
    assert settings is not None

@test("Import gemini service")
def test_import_gemini():
    from app.services.gemini_service import get_gemini_service
    gemini = get_gemini_service()
    assert gemini is not None

@test("Import twilio service")
def test_import_twilio():
    from app.services.twilio_service import twilio_service
    assert twilio_service is not None

@test("Import orchestrator")
def test_import_orchestrator():
    from app.agents.orchestrator import orchestrator
    assert orchestrator is not None

# Run import tests
test_import_main()
test_import_telephony()
test_import_analytics()
test_import_elevenlabs_tools()
test_import_database()
test_import_config()
test_import_gemini()
test_import_twilio()
test_import_orchestrator()


# ============================================================================
# TEST SUITE 2: DATABASE OPERATIONS
# ============================================================================

print_header("TEST SUITE 2: Database Methods")

@test("Database service has get_voice_profile method")
def test_db_voice_profile_method():
    from app.services.database import db_service
    assert hasattr(db_service, 'get_voice_profile')
    assert hasattr(db_service, 'create_voice_profile')

@test("Database service has contact methods")
def test_db_contact_methods():
    from app.services.database import db_service
    assert hasattr(db_service, 'get_contact_by_phone')

@test("Database service has call methods")
def test_db_call_methods():
    from app.services.database import db_service
    assert hasattr(db_service, 'create_call')
    assert hasattr(db_service, 'update_call')
    assert hasattr(db_service, 'get_call_by_sid')

@test("Database service has scam_report method")
def test_db_scam_methods():
    from app.services.database import db_service
    assert hasattr(db_service, 'create_scam_report')

# Run database tests
test_db_voice_profile_method()
test_db_contact_methods()
test_db_call_methods()
test_db_scam_methods()


# ============================================================================
# TEST SUITE 3: API ENDPOINTS
# ============================================================================

print_header("TEST SUITE 3: API Endpoint Structure")

@test("FastAPI app has all required routers")
def test_app_routers():
    from app.main import app
    routes = [route.path for route in app.routes]

    # Check critical endpoints exist
    assert any('/api/telephony/incoming' in route for route in routes), "Missing telephony endpoint"
    assert any('/api/analytics/summary' in route for route in routes), "Missing analytics endpoint"
    assert any('/api/tools/check_calendar' in route for route in routes), "Missing tools endpoint"

@test("Telephony router has incoming endpoint")
def test_telephony_incoming():
    from app.routers.telephony_optimized import router
    routes = [route.path for route in router.routes]
    assert any('incoming' in route for route in routes)

@test("Tools router has all 6 tools")
def test_tools_endpoints():
    from app.routers.elevenlabs_tools import router
    routes = [route.path for route in router.routes]

    required_tools = [
        'check_calendar',
        'book_calendar',
        'check_contact',
        'transfer_call',
        'log_call',
        'block_scam'
    ]

    for tool in required_tools:
        assert any(tool in route for route in routes), f"Missing tool: {tool}"

# Run API tests
test_app_routers()
test_telephony_incoming()
test_tools_endpoints()


# ============================================================================
# TEST SUITE 4: CONFIGURATION
# ============================================================================

print_header("TEST SUITE 4: Configuration")

@test("Settings has all required fields")
def test_settings_fields():
    from app.core.config import settings

    required_fields = [
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_PHONE_NUMBER',
        'ELEVENLABS_API_KEY',
        'ELEVENLABS_AGENT_ID',
        'BACKEND_URL',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ]

    for field in required_fields:
        assert hasattr(settings, field), f"Missing config field: {field}"

@test("Settings has helper methods")
def test_settings_methods():
    from app.core.config import settings
    assert hasattr(settings, 'is_production')
    assert hasattr(settings, 'is_development')

# Run config tests
test_settings_fields()
test_settings_methods()


# ============================================================================
# TEST SUITE 5: AGENTS
# ============================================================================

print_header("TEST SUITE 5: Agent System")

@test("Orchestrator has required methods")
def test_orchestrator_methods():
    from app.agents.orchestrator import orchestrator
    assert hasattr(orchestrator, 'check_whitelist')
    assert hasattr(orchestrator, 'analyze_call_parallel')
    assert hasattr(orchestrator, 'make_decision')
    assert hasattr(orchestrator, 'process_call')

@test("Scam detector agent exists")
def test_scam_detector():
    from app.agents.scam_detector_agent import create_scam_detector_agent
    agent = create_scam_detector_agent()
    assert agent is not None
    assert hasattr(agent, 'run')

@test("Contact matcher agent exists")
def test_contact_matcher():
    from app.agents.contact_matcher_agent import create_contact_matcher_agent
    agent = create_contact_matcher_agent()
    assert agent is not None

# Run agent tests
test_orchestrator_methods()
test_scam_detector()
test_contact_matcher()


# ============================================================================
# TEST SUITE 6: INTEGRATION (Async)
# ============================================================================

print_header("TEST SUITE 6: Integration Tests")

@test("Analytics endpoint structure")
async def test_analytics_structure():
    from app.routers.analytics import get_user_stats, get_recent_calls

    # Test with demo data
    stats = await get_user_stats("demo_user")
    assert "calls_today" in stats
    assert "scams_blocked" in stats

    calls = await get_recent_calls("demo_user")
    assert isinstance(calls, list)

@test("Tool endpoint callable")
async def test_tool_check_contact():
    from app.routers.elevenlabs_tools import check_contact
    # Just verify the function exists and is async
    assert asyncio.iscoroutinefunction(check_contact)

# Run async tests
async def run_async_tests():
    # Call the decorated functions which return coroutines
    coro1 = test_analytics_structure()
    coro2 = test_tool_check_contact()

    # Now await them and handle results
    try:
        await coro1
        results["passed"] += 1
        print_test("Analytics endpoint structure", True)
    except Exception as e:
        results["failed"] += 1
        results["errors"].append({
            "test": "Analytics endpoint structure",
            "error": str(e),
            "traceback": traceback.format_exc()
        })
        print_test("Analytics endpoint structure", False, str(e))

    try:
        await coro2
        results["passed"] += 1
        print_test("Tool endpoint callable", True)
    except Exception as e:
        results["failed"] += 1
        results["errors"].append({
            "test": "Tool endpoint callable",
            "error": str(e),
            "traceback": traceback.format_exc()
        })
        print_test("Tool endpoint callable", False, str(e))

asyncio.run(run_async_tests())


# ============================================================================
# FINAL REPORT
# ============================================================================

print_header("TEST RESULTS")

print(f"Total Tests: {results['total']}")
print(f"{Colors.GREEN}Passed: {results['passed']}{Colors.END}")
print(f"{Colors.RED}Failed: {results['failed']}{Colors.END}")

if results['failed'] > 0:
    print(f"\n{Colors.RED}FAILED TESTS:{Colors.END}")
    for error in results['errors']:
        print(f"\n  {Colors.YELLOW}Test: {error['test']}{Colors.END}")
        print(f"  Error: {error['error']}")
        if '--verbose' in sys.argv:
            print(f"\n{error['traceback']}")

print(f"\n{'='*60}")

if results['failed'] == 0:
    print(f"{Colors.GREEN}ALL TESTS PASSED ✓{Colors.END}")
    print(f"{Colors.GREEN}System is ready for deployment!{Colors.END}")
    sys.exit(0)
else:
    print(f"{Colors.RED}TESTS FAILED ✗{Colors.END}")
    print(f"{Colors.RED}Fix errors before deploying!{Colors.END}")
    sys.exit(1)
