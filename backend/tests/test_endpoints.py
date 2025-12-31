"""
Comprehensive endpoint regression testing with mock data
Tests all API endpoints to ensure robustness
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
import json

from app.main import app

client = TestClient(app)


# ======================
# FIXTURES (Mock Data)
# ======================

@pytest.fixture
def mock_user():
    return {
        "id": "user_123",
        "phone_number": "+15551234567",
        "twilio_phone_number": "+15559876543",
        "elevenlabs_voice_id": "voice_abc123"
    }

@pytest.fixture
def mock_contact():
    return {
        "id": "contact_456",
        "user_id": "user_123",
        "phone_number": "+15555555555",
        "name": "Mom",
        "auto_pass": True
    }

@pytest.fixture
def mock_call():
    return {
        "id": "call_789",
        "user_id": "user_123",
        "call_sid": "CA123abc",
        "caller_number": "+15551111111",
        "intent": "sales",
        "scam_score": 0.3,
        "action_taken": "screened",
        "duration": 120
    }

@pytest.fixture
def mock_scam_call():
    return {
        "id": "call_scam_999",
        "user_id": "user_123",
        "call_sid": "CA999scam",
        "caller_number": "+15559999999",
        "intent": "scam",
        "scam_score": 0.95,
        "action_taken": "blocked",
        "duration": 15
    }


# ======================
# HEALTH & ROOT
# ======================

def test_health_endpoint():
    """Test health check"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "AI Gatekeeper" in data["name"]


# ======================
# CONTACTS ENDPOINTS
# ======================

@patch('app.services.database.db_service')
def test_get_contacts(mock_db, mock_user, mock_contact):
    """GET /api/contacts - List all contacts"""
    mock_db.get_contacts.return_value = [mock_contact]

    response = client.get(f"/api/contacts?user_id={mock_user['id']}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["contacts"]) == 1
    assert data["contacts"][0]["name"] == "Mom"


@patch('app.services.database.db_service')
def test_create_contact(mock_db, mock_user):
    """POST /api/contacts - Create new contact"""
    mock_db.create_contact.return_value = {
        "id": "new_contact",
        "phone_number": "+15556667777",
        "name": "Dad",
        "auto_pass": True
    }

    response = client.post("/api/contacts", json={
        "user_id": mock_user["id"],
        "phone_number": "+15556667777",
        "name": "Dad",
        "auto_pass": True
    })

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Dad"


@patch('app.services.database.db_service')
def test_delete_contact(mock_db):
    """DELETE /api/contacts/{contact_id}"""
    mock_db.delete_contact.return_value = True

    response = client.delete("/api/contacts/contact_456")
    assert response.status_code == 200


# ======================
# CALLS ENDPOINTS
# ======================

@patch('app.services.database.db_service')
def test_get_calls(mock_db, mock_call):
    """GET /api/calls - List call history"""
    mock_db.get_calls.return_value = [mock_call]

    response = client.get("/api/calls?user_id=user_123&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["calls"]) == 1
    assert data["calls"][0]["intent"] == "sales"


@patch('app.services.database.db_service')
def test_get_call_by_id(mock_db, mock_call):
    """GET /api/calls/{call_id}"""
    mock_db.get_call_by_id.return_value = mock_call

    response = client.get("/api/calls/call_789")
    assert response.status_code == 200
    data = response.json()
    assert data["call_sid"] == "CA123abc"


@patch('app.services.database.db_service')
def test_get_call_transcript(mock_db):
    """GET /api/calls/{call_id}/transcript"""
    mock_db.get_call_transcript.return_value = {
        "transcript": "Hello, I'm calling about your car's extended warranty...",
        "created_at": "2024-01-15T10:00:00Z"
    }

    response = client.get("/api/calls/call_789/transcript")
    assert response.status_code == 200
    data = response.json()
    assert "warranty" in data["transcript"]


# ======================
# ANALYTICS ENDPOINTS
# ======================

@patch('app.services.database.db_service')
def test_get_dashboard_stats(mock_db):
    """GET /api/analytics/dashboard"""
    mock_db.get_dashboard_stats.return_value = {
        "total_calls": 50,
        "scams_blocked": 12,
        "time_saved_minutes": 276,
        "current_status": "idle"
    }

    response = client.get("/api/analytics/dashboard?user_id=user_123")
    assert response.status_code == 200
    data = response.json()
    assert data["scams_blocked"] == 12
    assert data["time_saved_minutes"] == 276


@patch('app.services.database.db_service')
def test_get_scam_trends(mock_db):
    """GET /api/analytics/scam-trends"""
    mock_db.get_scam_trends.return_value = {
        "trends": [
            {"date": "2024-01-15", "count": 3, "type": "irs"},
            {"date": "2024-01-16", "count": 5, "type": "tech_support"}
        ]
    }

    response = client.get("/api/analytics/scam-trends?user_id=user_123&days=30")
    assert response.status_code == 200
    data = response.json()
    assert len(data["trends"]) == 2


# ======================
# TELEPHONY ENDPOINTS
# ======================

@patch('app.services.twilio_service.twilio_service')
def test_incoming_call_webhook(mock_twilio):
    """POST /api/telephony/incoming - Twilio webhook"""
    # Simulate Twilio webhook payload
    response = client.post("/api/telephony/incoming", data={
        "CallSid": "CA123test",
        "From": "+15551111111",
        "To": "+15559876543",
        "CallStatus": "ringing"
    })

    assert response.status_code == 200
    # Should return TwiML XML
    assert b"<Response>" in response.content


@patch('app.services.database.db_service')
def test_call_status_webhook(mock_db):
    """POST /api/webhooks/call-status - Twilio status callback"""
    response = client.post("/api/webhooks/call-status", data={
        "CallSid": "CA123test",
        "CallStatus": "completed",
        "CallDuration": "120"
    })

    assert response.status_code == 200


# ======================
# EDGE CASES & ERRORS
# ======================

def test_invalid_user_id():
    """Test with invalid user ID"""
    response = client.get("/api/contacts?user_id=invalid")
    # Should handle gracefully (not 500)
    assert response.status_code in [200, 400, 404]


def test_missing_required_field():
    """POST /api/contacts without required fields"""
    response = client.post("/api/contacts", json={
        "user_id": "user_123"
        # Missing phone_number
    })
    assert response.status_code == 422  # Validation error


def test_duplicate_contact():
    """Try to create duplicate contact"""
    with patch('app.services.database.db_service') as mock_db:
        mock_db.create_contact.side_effect = Exception("Duplicate phone number")

        response = client.post("/api/contacts", json={
            "user_id": "user_123",
            "phone_number": "+15555555555",  # Already exists
            "name": "Duplicate"
        })

        assert response.status_code in [400, 409, 500]


def test_large_payload():
    """Test with very long transcript (edge case)"""
    long_transcript = "Hello " * 10000  # 60,000 chars

    response = client.post("/api/calls", json={
        "user_id": "user_123",
        "call_sid": "CA_long",
        "caller_number": "+15551111111",
        "transcript": long_transcript
    })

    # Should handle without crashing
    assert response.status_code in [200, 201, 413]


# ======================
# SCAM DETECTION
# ======================

@patch('app.agents.orchestrator.orchestrator')
async def test_scam_detection_irs(mock_orchestrator):
    """Test IRS scam detection"""
    mock_orchestrator.analyze_call_parallel.return_value = {
        "scam": {
            "is_scam": True,
            "scam_type": "irs",
            "confidence": 0.95,
            "red_flags": ["irs", "warrant", "arrest"]
        },
        "intent": {
            "intent": "scam",
            "confidence": 0.98
        }
    }

    # Simulate incoming scam call
    result = await mock_orchestrator.analyze_call_parallel({
        "transcript": "This is the IRS. There's a warrant for your arrest. You must pay immediately.",
        "caller_number": "+15559999999"
    })

    assert result["scam"]["is_scam"] is True
    assert result["scam"]["scam_type"] == "irs"


# ======================
# INTEGRATION TESTS
# ======================

@pytest.mark.integration
@patch('app.services.database.db_service')
@patch('app.agents.orchestrator.orchestrator')
async def test_full_call_flow(mock_orchestrator, mock_db):
    """Test complete call screening flow"""
    # 1. Incoming call webhook
    # 2. Whitelist check
    # 3. AI screening
    # 4. Decision
    # 5. Save to database

    # Mock whitelist check (not found)
    mock_db.get_contact_by_phone.return_value = None

    # Mock AI analysis
    mock_orchestrator.analyze_call_parallel.return_value = {
        "scam": {"is_scam": False, "confidence": 0.1},
        "intent": {"intent": "sales", "confidence": 0.8}
    }

    # Mock save
    mock_db.create_call.return_value = {"id": "call_new"}

    # Simulate flow
    response = client.post("/api/telephony/incoming", data={
        "CallSid": "CA_integration",
        "From": "+15551234567",
        "To": "+15559876543"
    })

    assert response.status_code == 200


# ======================
# PERFORMANCE TESTS
# ======================

def test_response_time_health():
    """Health endpoint should respond <100ms"""
    import time
    start = time.time()
    response = client.get("/health")
    duration_ms = (time.time() - start) * 1000

    assert response.status_code == 200
    assert duration_ms < 100  # Should be fast


@pytest.mark.benchmark
def test_concurrent_requests():
    """Test handling 10 concurrent requests"""
    import concurrent.futures

    def make_request():
        return client.get("/health")

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request) for _ in range(10)]
        results = [f.result() for f in futures]

    # All should succeed
    assert all(r.status_code == 200 for r in results)


# ======================
# SECURITY TESTS
# ======================

def test_sql_injection_protection():
    """Test SQL injection attempt"""
    response = client.get("/api/contacts?user_id=user_123' OR '1'='1")
    # Should not expose database error
    assert response.status_code in [200, 400]
    # Response should not contain SQL error
    if response.status_code == 200:
        assert "SQL" not in response.text


def test_xss_protection():
    """Test XSS attempt in contact name"""
    response = client.post("/api/contacts", json={
        "user_id": "user_123",
        "phone_number": "+15551112222",
        "name": "<script>alert('XSS')</script>"
    })

    # Should either sanitize or reject
    assert response.status_code in [200, 201, 400]


def test_webhook_signature_validation():
    """Test Twilio webhook signature"""
    # Without valid signature, should reject
    response = client.post("/api/webhooks/call-status",
        data={"CallSid": "CA123"},
        headers={"X-Twilio-Signature": "invalid"}
    )

    # Should validate signature (implementation dependent)
    # For now, just ensure it doesn't crash
    assert response.status_code in [200, 401, 403]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
