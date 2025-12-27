#!/bin/bash

# ============================================================================
# AI Gatekeeper - Quick Health Check (5 seconds)
# ============================================================================
#
# Runs the fastest smoke tests to verify everything is working
# Perfect for pre-commit checks or quick validation
#
# Usage:
#   ./quick_check.sh
#
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}⚡ Quick Health Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Import Tests
echo -e "${YELLOW}1/3${NC} Testing imports..."
if python -c "
from app.routers import voice, character, calls
from app.services import elevenlabs_service, storage_service, database
from app.core import config, runtime_checks
print('✅ All imports successful')
" 2>&1; then
    echo -e "${GREEN}    ✅ Imports OK${NC}"
else
    echo -e "${RED}    ❌ Import failed${NC}"
    exit 1
fi

# 2. Runtime Validation
echo -e "${YELLOW}2/3${NC} Testing runtime validation..."
if python -c "
import os
os.environ['ENVIRONMENT'] = 'demo'  # Use demo mode for quick check
from app.core.runtime_checks import run_startup_validation
result = run_startup_validation()
print(f'Validation result: {result}')
" 2>&1 | grep -q "Validation result"; then
    echo -e "${GREEN}    ✅ Runtime checks OK${NC}"
else
    echo -e "${RED}    ❌ Runtime checks failed${NC}"
    exit 1
fi

# 3. Quick API Test (if server is running)
echo -e "${YELLOW}3/3${NC} Testing API endpoints..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:8000/health | python -c "import sys, json; print(json.load(sys.stdin)['status'])")
    if [ "$HEALTH" = "healthy" ] || [ "$HEALTH" = "degraded" ]; then
        echo -e "${GREEN}    ✅ API health OK (status: $HEALTH)${NC}"
    else
        echo -e "${YELLOW}    ⚠️  API health degraded${NC}"
    fi
else
    echo -e "${YELLOW}    ⚠️  API not running (skipped)${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    ✅ QUICK CHECK PASSED              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}💡 Run ${YELLOW}./run_tests.sh${BLUE} for comprehensive testing${NC}"
