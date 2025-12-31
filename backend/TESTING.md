# 🧪 AI Gatekeeper - Testing Guide

**Comprehensive testing strategy for hackathon-ready confidence**

---

## Quick Start

```bash
# 5-second health check
./quick_check.sh

# Full test suite
./run_tests.sh

# Watch mode (auto-rerun on changes)
./run_tests.sh --watch

# Coverage report
./run_tests.sh --coverage
```

---

## Test Scripts

### 1. `quick_check.sh` - Lightning Fast (5 seconds)

**Purpose**: Pre-commit validation and quick smoke test

**What it checks**:
- ✅ All imports working
- ✅ Runtime validation system functional
- ✅ API health endpoint (if server running)

**When to use**:
- Before committing code
- After pulling changes
- Quick sanity check

**Example**:
```bash
./quick_check.sh

⚡ Quick Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1/3 Testing imports...
    ✅ Imports OK
2/3 Testing runtime validation...
    ✅ Runtime checks OK
3/3 Testing API endpoints...
    ✅ API health OK (status: healthy)

╔════════════════════════════════════════╗
║    ✅ QUICK CHECK PASSED              ║
╚════════════════════════════════════════╝
```

---

### 2. `run_tests.sh` - Comprehensive Test Suite

**Purpose**: Full test coverage with multiple modes

**Modes**:

#### Standard Mode (default)
```bash
./run_tests.sh
```
Runs all 19 tests with quiet output

#### Verbose Mode
```bash
./run_tests.sh --verbose
```
Detailed output showing each test

#### Watch Mode
```bash
./run_tests.sh --watch
```
Auto-reruns tests when files change (great for development)

#### Coverage Mode
```bash
./run_tests.sh --coverage
```
Generates HTML coverage report at `htmlcov/index.html`

#### Quick Mode
```bash
./run_tests.sh --quick
```
Only runs smoke tests (fastest subset)

---

## Test Categories

### ✅ Currently Passing (12/19 tests - 63%)

#### Core Functionality
- **Health Checks** - API health endpoint, status reporting
- **Root Endpoint** - API metadata
- **Scam Detection** - Local intelligence layer (0.16ms)
- **Legitimate Calls** - Proper routing for real inquiries
- **Performance** - Scam detection <200ms
- **Concurrency** - 10 simultaneous requests
- **Mock Data** - Schema validation
- **Runtime Validation** - Comprehensive checks

#### What This Proves
- ✅ API is running and responding
- ✅ Core scam detection works
- ✅ Performance is excellent
- ✅ System handles concurrent load
- ✅ Runtime validation catches issues

---

### ⚠️ Failing Tests (7/19 tests - Need Database)

These tests fail with **307 redirects** because they require database:

#### Voice Endpoints
- `POST /api/voice/clone` - Clone parent voice
- `POST /api/voice/demo` - Get demo voice

#### Character Analysis
- `POST /api/character/analyze` - Analyze drawing
- `POST /api/character/demo` - Get demo character

#### Calls
- `POST /api/calls/incoming` - Handle incoming call
- `GET /api/calls/{call_id}` - Get call details

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats

**Fix**: Create Supabase database and run seed data (see DEPLOYMENT_GUIDE.md)

---

## Manual Testing

### Test Demo Mode (No API Keys Required)

```bash
# 1. Set demo environment
export ENVIRONMENT=demo

# 2. Start server
uvicorn app.main:app --reload --port 8000

# 3. Test endpoints
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/voice/demo
curl -X POST http://localhost:8000/api/character/demo
```

### Test with Real API Keys

```bash
# 1. Set production environment
export ENVIRONMENT=production

# 2. Ensure .env has real keys
cat .env  # Verify API keys

# 3. Start server
uvicorn app.main:app --reload --port 8000

# 4. Test real voice cloning
curl -X POST http://localhost:8000/api/voice/clone \
  -F "audio=@test_sample.mp3" \
  -F "parent_name=Sarah"

# 5. Test real character analysis
curl -X POST http://localhost:8000/api/character/analyze \
  -F "drawing=@test_drawing.png" \
  -F "child_name=Emma"
```

---

## Integration Testing

### End-to-End Call Flow

**Test a complete call scenario**:

```bash
# 1. Start ngrok tunnel
ngrok http 8000

# 2. Configure Twilio webhook to ngrok URL
# Set to: https://YOUR_NGROK_URL/api/twilio/voice

# 3. Call your Twilio number

# 4. Verify flow:
#    - Scam call → Blocked
#    - Legitimate call → Screened or passed
#    - Whitelisted caller → Auto-passed

# 5. Check logs
tail -f logs/app.log
```

---

## Performance Benchmarking

### Latency Tests

```python
# Run in Python shell
import time
import httpx

# Test scam detection speed
async def benchmark_scam_detection():
    async with httpx.AsyncClient() as client:
        times = []
        for _ in range(100):
            start = time.perf_counter()
            await client.post(
                "http://localhost:8000/api/calls/incoming",
                json={"from": "+11234567890", "message": "This is the IRS"}
            )
            times.append(time.perf_counter() - start)

        avg = sum(times) / len(times) * 1000
        print(f"Average: {avg:.2f}ms")
        print(f"Min: {min(times) * 1000:.2f}ms")
        print(f"Max: {max(times) * 1000:.2f}ms")
```

**Expected Results**:
- Scam detection: <200ms average
- Health endpoint: <100ms
- Voice cloning: 15-30 seconds (ElevenLabs API)
- Character analysis: 5-10 seconds (Gemini Vision)

---

## Coverage Goals

### Current Coverage: ~65%

**Uncovered Areas**:
1. Error handling in edge cases
2. Database connection failures
3. API key validation with invalid keys
4. Concurrent stress testing (>100 requests)
5. WebSocket handling (Twilio streams)

**Target Coverage**: 85%

**How to Improve**:
```bash
# Generate coverage report
./run_tests.sh --coverage

# Open HTML report
open htmlcov/index.html

# Find uncovered lines (red highlighting)
# Write tests for those sections
```

---

## CI/CD Integration

### GitHub Actions (Future)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - run: pip install -r requirements-fixed.txt
      - run: ./run_tests.sh --coverage
      - uses: codecov/codecov-action@v2
```

---

## Troubleshooting

### Tests Fail to Start

**Error**: `ModuleNotFoundError: No module named 'pytest'`

**Fix**:
```bash
pip install -r requirements-fixed.txt
```

### AsyncClient Errors

**Error**: `TypeError: AsyncClient.__init__() got an unexpected keyword argument 'app'`

**Fix**: Update to use `ASGITransport`:
```python
from httpx import AsyncClient, ASGITransport

async with AsyncClient(
    transport=ASGITransport(app=app),
    base_url="http://test"
) as ac:
    response = await ac.get("/health")
```

### Database Connection Errors

**Error**: `307 Temporary Redirect` on endpoint tests

**Fix**: Create Supabase database (see DEPLOYMENT_GUIDE.md)

### Import Errors

**Error**: `ImportError: cannot import name 'quest_orchestrator'`

**Fix**: Check file exists at expected path:
```bash
ls -la app/agents/quest_orchestrator.py
```

---

## Test Maintenance

### Adding New Tests

**1. Create test file** in `tests/`:
```python
# tests/test_new_feature.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_new_feature():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        response = await ac.post("/api/new-feature")
        assert response.status_code == 200
```

**2. Run tests**:
```bash
./run_tests.sh --verbose
```

**3. Check coverage**:
```bash
./run_tests.sh --coverage
```

### Updating Existing Tests

**When to update**:
- API contract changes
- New validation rules
- Performance requirements change
- Bug fixes

**Example**:
```python
# Before: Expected 200
assert response.status_code == 200

# After: Accept 200 or 201
assert response.status_code in [200, 201]
```

---

## Test Data

### Mock Data Location

**File**: `tests/mock_data.py`

**Contents**:
- Mock ElevenLabs responses
- Mock Gemini responses
- Mock Supabase data
- Sample audio files
- Sample images

**Usage**:
```python
from tests.mock_data import MOCK_VOICE_ID, MOCK_CHARACTER

response = await client.post(
    "/api/voice/demo",
    json={"voice_id": MOCK_VOICE_ID}
)
```

---

## Best Practices

### 1. Test Naming
✅ **Good**: `test_voice_clone_creates_new_voice`
❌ **Bad**: `test_voice_1`

### 2. Test Independence
Each test should run independently (no shared state)

### 3. Use Fixtures
```python
@pytest.fixture
async def api_client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac
```

### 4. Test Edge Cases
- Empty input
- Invalid formats
- Unauthorized access
- Rate limiting

### 5. Performance Tests
```python
@pytest.mark.asyncio
async def test_scam_detection_speed():
    start = time.perf_counter()
    result = detect_scam("This is the IRS")
    duration = (time.perf_counter() - start) * 1000

    assert result["is_scam"] is True
    assert duration < 200  # Must be <200ms
```

---

## Summary

**Quick Commands**:
```bash
./quick_check.sh              # 5-second smoke test
./run_tests.sh                # Full test suite
./run_tests.sh --watch        # Development mode
./run_tests.sh --coverage     # Coverage report
```

**Current Status**:
- ✅ 12/19 tests passing (63%)
- ✅ Core functionality validated
- ⚠️ 7 tests need database
- 🎯 Target: 85% coverage

**Next Steps**:
1. Create Supabase database → Fix 7 failing tests
2. Add edge case tests → Improve coverage
3. Add integration tests → Full E2E validation
4. Set up CI/CD → Automated testing

---

**Last Updated**: December 27, 2025
**Test Suite Version**: 1.0.0
**Maintained by**: AI Gatekeeper Team
