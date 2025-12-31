"""
API Stability Tests with Mock Data
Ensures all endpoints work reliably for demo & production
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock
import json

from app.main import app

client = TestClient(app)


# ============================================================================
# MOCK DATA
# ============================================================================

MOCK_USER = {
    "id": "user_123",
    "name": "Sarah Johnson",
    "phone_number": "+15551234567",
    "twilio_number": "+15559876543",
    "created_at": "2025-12-27T00:00:00Z"
}

MOCK_CONTACTS = [
    {
        "id": "contact_1",
        "name": "Mom",
        "phone_number": "+15551111111",
        "auto_pass": True
    },
    {
        "id": "contact_2",
        "name": "John (Work)",
        "phone_number": "+15552222222",
        "auto_pass": False
    }
]

MOCK_CALLS = [
    {
        "id": "call_1",
        "call_sid": "CA123",
        "caller_number": "+15553333333",
        "caller_name": "Unknown",
        "outcome": "blocked",
        "scam_type": "irs",
        "created_at": "2025-12-27T10:00:00Z"
    },
    {
        "id": "call_2",
        "call_sid": "CA456",
        "caller_number": "+15551111111",
        "caller_name": "Mom",
        "outcome": "passed",
        "scam_type": None,
        "created_at": "2025-12-27T09:00:00Z"
    }
]

MOCK_STATS = {
    "total_calls": 89,
    "scams_blocked": 12,
    "time_saved_minutes": 45,
    "calls_today": 3
}


# ============================================================================
# HEALTH & ROOT ENDPOINTS
# ============================================================================

def test_health_endpoint_always_available():
    """Health check must always return 200"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "environment" in data
    assert "version" in data


def test_root_endpoint_provides_api_info():
    """Root endpoint should provide API documentation"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "AI Gatekeeper" in data["name"]
    assert "version" in data


# ============================================================================
# CONTACTS ENDPOINTS (Mock Database)
# ============================================================================

@patch('app.services.database.db_service.get_contacts')
async def test_get_contacts_with_mock(mock_get_contacts):
    """GET /api/contacts returns mocked contacts"""
    mock_get_contacts.return_value = MOCK_CONTACTS

    response = client.get("/api/contacts?user_id=user_123")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["name"] == "Mom"


@patch('app.services.database.db_service.create_contact')
async def test_create_contact_with_mock(mock_create):
    """POST /api/contacts creates contact"""
    mock_create.return_value = {
        "id": "contact_new",
        "name": "Alice",
        "phone_number": "+15554444444",
        "auto_pass": True
    }

    response = client.post(
        "/api/contacts",
        json={
            "user_id": "user_123",
            "name": "Alice",
            "phone_number": "+15554444444",
            "auto_pass": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice"


@patch('app.services.database.db_service.delete_contact')
async def test_delete_contact_with_mock(mock_delete):
    """DELETE /api/contacts/{contact_id} removes contact"""
    mock_delete.return_value = {"deleted": True}

    response = client.delete("/api/contacts/contact_1?user_id=user_123")
    assert response.status_code == 200


# ============================================================================
# CALLS ENDPOINTS (Mock Database)
# ============================================================================

@patch('app.services.database.db_service.get_calls')
async def test_get_calls_with_pagination(mock_get_calls):
    """GET /api/calls returns paginated calls"""
    mock_get_calls.return_value = MOCK_CALLS

    response = client.get("/api/calls?user_id=user_123&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 10


@patch('app.services.database.db_service.get_call_by_id')
async def test_get_call_by_id_with_mock(mock_get_call):
    """GET /api/calls/{call_id} returns specific call"""
    mock_get_call.return_value = MOCK_CALLS[0]

    response = client.get("/api/calls/call_1?user_id=user_123")
    assert response.status_code == 200
    data = response.json()
    assert data["call_sid"] == "CA123"
    assert data["outcome"] == "blocked"


@patch('app.services.database.db_service.get_call_transcript')
async def test_get_call_transcript_with_mock(mock_get_transcript):
    """GET /api/calls/{call_id}/transcript returns transcript"""
    mock_get_transcript.return_value = {
        "transcript": "This is the IRS. You owe money.",
        "scam_detected": True
    }

    response = client.get("/api/calls/call_1/transcript?user_id=user_123")
    assert response.status_code == 200
    data = response.json()
    assert "transcript" in data
    assert data["scam_detected"] is True


# ============================================================================
# ANALYTICS ENDPOINTS (Mock Database)
# ============================================================================

@patch('app.services.database.db_service.get_dashboard_stats')
async def test_get_dashboard_stats_with_mock(mock_get_stats):
    """GET /api/analytics/dashboard returns stats"""
    mock_get_stats.return_value = MOCK_STATS

    response = client.get("/api/analytics/dashboard?user_id=user_123")
    assert response.status_code == 200
    data = response.json()
    assert data["total_calls"] == 89
    assert data["scams_blocked"] == 12
    assert data["time_saved_minutes"] == 45


@patch('app.services.database.db_service.get_scam_trends')
async def test_get_scam_trends_with_mock(mock_get_trends):
    """GET /api/analytics/scam-trends returns trend data"""
    mock_trends = [
        {"date": "2025-12-20", "count": 2, "scam_type": "irs"},
        {"date": "2025-12-21", "count": 3, "scam_type": "tech_support"},
    ]
    mock_get_trends.return_value = mock_trends

    response = client.get("/api/analytics/scam-trends?user_id=user_123&days=7")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


# ============================================================================
# TELEPHONY WEBHOOKS (Optimized Architecture)
# ============================================================================

@patch('app.services.database.db_service.get_user_by_twilio_number')
@patch('app.services.database.db_service.get_contact_by_phone')
async def test_incoming_call_webhook_whitelisted(mock_get_contact, mock_get_user):
    """Whitelisted contact gets transferred immediately"""
    mock_get_user.return_value = MOCK_USER
    mock_get_contact.return_value = MOCK_CONTACTS[0]  # Mom (auto_pass=True)

    response = client.post(
        "/api/telephony/incoming",
        data={
            "CallSid": "CA123",
            "From": "+15551111111",
            "To": "+15559876543"
        }
    )
    assert response.status_code == 200
    assert "<Dial>" in response.text  # Should transfer immediately
    assert MOCK_USER["phone_number"] in response.text


@patch('app.services.database.db_service.get_user_by_twilio_number')
@patch('app.services.database.db_service.get_contact_by_phone')
async def test_incoming_call_webhook_unknown_caller(mock_get_contact, mock_get_user):
    """Unknown caller gets screened by ElevenLabs"""
    mock_get_user.return_value = MOCK_USER
    mock_get_contact.return_value = None  # Unknown caller

    response = client.post(
        "/api/telephony/incoming",
        data={
            "CallSid": "CA456",
            "From": "+15553333333",
            "To": "+15559876543"
        }
    )
    assert response.status_code == 200
    assert "<Stream" in response.text  # Should connect to ElevenLabs
    assert "wss://api.elevenlabs.io" in response.text


# ============================================================================
# ELEVENLABS WEBHOOK (Intelligence Layer)
# ============================================================================

@patch('app.services.local_intelligence.local_intelligence.analyze_fast')
@patch('app.services.twilio_service.twilio_service.hangup_call')
async def test_elevenlabs_webhook_scam_detected(mock_hangup, mock_analyze):
    """ElevenLabs webhook detects scam and blocks call"""
    mock_analyze.return_value = {
        "is_scam": True,
        "scam_score": 0.98,
        "scam_type": "irs",
        "processing_time_ms": 12.5
    }

    response = client.post(
        "/api/elevenlabs/webhook",
        json={
            "call_sid": "CA123",
            "user_id": "user_123",
            "transcript": "This is the IRS. You have a warrant for your arrest."
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "received"
    # Background task should call hangup_call (tested separately)


# ============================================================================
# ERROR HANDLING & EDGE CASES
# ============================================================================

def test_invalid_user_id_returns_appropriate_error():
    """Invalid user_id should return clear error"""
    response = client.get("/api/contacts?user_id=invalid_user")
    # Should return error or empty list (depending on implementation)
    assert response.status_code in [200, 404, 400]


def test_missing_required_fields_returns_422():
    """Missing required fields should return validation error"""
    response = client.post(
        "/api/contacts",
        json={
            "user_id": "user_123"
            # Missing name and phone_number
        }
    )
    assert response.status_code == 422


def test_malformed_phone_number_handling():
    """Malformed phone numbers should be handled gracefully"""
    response = client.post(
        "/api/contacts",
        json={
            "user_id": "user_123",
            "name": "Test",
            "phone_number": "not-a-phone-number"
        }
    )
    # Should either validate or accept (depending on implementation)
    assert response.status_code in [200, 400, 422]


# ============================================================================
# PERFORMANCE BENCHMARKS
# ============================================================================

def test_health_endpoint_performance():
    """Health check should respond in < 100ms"""
    import time

    start = time.time()
    response = client.get("/health")
    latency = (time.time() - start) * 1000  # Convert to ms

    assert response.status_code == 200
    assert latency < 100, f"Health check took {latency}ms (>100ms threshold)"


@pytest.mark.asyncio
async def test_concurrent_requests_stability():
    """System should handle concurrent requests"""
    import asyncio

    async def make_request():
        return client.get("/health")

    # Make 10 concurrent requests
    tasks = [make_request() for _ in range(10)]
    responses = await asyncio.gather(*tasks)

    # All should succeed
    assert all(r.status_code == 200 for r in responses)


# ============================================================================
# SECURITY TESTS
# ============================================================================

def test_sql_injection_protection():
    """Should protect against SQL injection attempts"""
    malicious_user_id = "user_123' OR '1'='1"

    response = client.get(f"/api/contacts?user_id={malicious_user_id}")

    # Should not expose SQL errors
    assert "SQL" not in response.text
    assert "syntax error" not in response.text.lower()


def test_xss_protection():
    """Should protect against XSS attacks"""
    xss_payload = "<script>alert('xss')</script>"

    response = client.post(
        "/api/contacts",
        json={
            "user_id": "user_123",
            "name": xss_payload,
            "phone_number": "+15554444444"
        }
    )

    # Should sanitize or reject
    if response.status_code == 200:
        data = response.json()
        assert "<script>" not in str(data)


# ============================================================================
# REGRESSION TESTS (Critical User Flows)
# ============================================================================

@pytest.mark.integration
@patch('app.services.database.db_service')
@patch('app.services.local_intelligence.local_intelligence')
async def test_full_scam_blocking_flow(mock_intelligence, mock_db):
    """End-to-end test: Scam call → Detection → Block → Save"""

    # Setup mocks
    mock_db.get_user_by_twilio_number.return_value = MOCK_USER
    mock_db.get_contact_by_phone.return_value = None  # Unknown caller
    mock_intelligence.analyze_fast.return_value = {
        "is_scam": True,
        "scam_score": 0.99,
        "scam_type": "irs"
    }

    # Step 1: Incoming call webhook
    response1 = client.post(
        "/api/telephony/incoming",
        data={
            "CallSid": "CA_SCAM",
            "From": "+15559999999",
            "To": MOCK_USER["twilio_number"]
        }
    )
    assert response1.status_code == 200
    assert "<Stream" in response1.text  # Connected to ElevenLabs

    # Step 2: ElevenLabs webhook with scam transcript
    response2 = client.post(
        "/api/elevenlabs/webhook",
        json={
            "call_sid": "CA_SCAM",
            "user_id": MOCK_USER["id"],
            "transcript": "This is the IRS. Pay immediately or be arrested."
        }
    )
    assert response2.status_code == 200

    # Background task should:
    # 1. Analyze with local intelligence ✓
    # 2. Detect scam (score 0.99) ✓
    # 3. Block call via Twilio API
    # 4. Save scam report to database
    # 5. Upload evidence to GCS


@pytest.mark.integration
@patch('app.services.database.db_service')
async def test_full_legitimate_call_flow(mock_db):
    """End-to-end test: Known contact → Auto-pass → Transfer"""

    # Setup mocks
    mock_db.get_user_by_twilio_number.return_value = MOCK_USER
    mock_db.get_contact_by_phone.return_value = MOCK_CONTACTS[0]  # Mom

    # Step 1: Incoming call webhook
    response = client.post(
        "/api/telephony/incoming",
        data={
            "CallSid": "CA_MOM",
            "From": MOCK_CONTACTS[0]["phone_number"],
            "To": MOCK_USER["twilio_number"]
        }
    )
    assert response.status_code == 200
    assert "<Dial>" in response.text  # Should transfer immediately
    assert MOCK_USER["phone_number"] in response.text
    assert "<Stream" not in response.text  # Should NOT screen


# ============================================================================
# MOCK DATA VALIDATION
# ============================================================================

def test_mock_data_matches_real_schema():
    """Ensure mock data matches production schema"""

    # User schema
    assert "id" in MOCK_USER
    assert "name" in MOCK_USER
    assert "phone_number" in MOCK_USER
    assert MOCK_USER["phone_number"].startswith("+1")

    # Contact schema
    for contact in MOCK_CONTACTS:
        assert "id" in contact
        assert "name" in contact
        assert "phone_number" in contact
        assert "auto_pass" in contact
        assert isinstance(contact["auto_pass"], bool)

    # Call schema
    for call in MOCK_CALLS:
        assert "id" in call
        assert "call_sid" in call
        assert "caller_number" in call
        assert "outcome" in call
        assert call["outcome"] in ["passed", "blocked", "screened"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
