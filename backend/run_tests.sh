#!/bin/bash

# ============================================================================
# AI Gatekeeper - One-Click Test Runner
# ============================================================================
#
# Usage:
#   ./run_tests.sh              # Run all tests
#   ./run_tests.sh --watch      # Watch mode (re-run on changes)
#   ./run_tests.sh --coverage   # Generate coverage report
#   ./run_tests.sh --verbose    # Verbose output
#   ./run_tests.sh --quick      # Quick smoke tests only
#
# ============================================================================

set -e  # Exit on error

# Colors for pretty output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         AI Gatekeeper - Test Suite Runner                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if pytest is installed
if ! python -c "import pytest" 2>/dev/null; then
    echo -e "${RED}❌ pytest not found. Installing dependencies...${NC}"
    pip install -r requirements-fixed.txt
fi

# Parse arguments
WATCH_MODE=false
COVERAGE_MODE=false
VERBOSE_MODE=false
QUICK_MODE=false

for arg in "$@"; do
    case $arg in
        --watch)
            WATCH_MODE=true
            shift
            ;;
        --coverage)
            COVERAGE_MODE=true
            shift
            ;;
        --verbose)
            VERBOSE_MODE=true
            shift
            ;;
        --quick)
            QUICK_MODE=true
            shift
            ;;
        *)
            # Unknown option
            ;;
    esac
done

# Build pytest command
PYTEST_CMD="pytest"

if [ "$VERBOSE_MODE" = true ]; then
    PYTEST_CMD="$PYTEST_CMD -v"
else
    PYTEST_CMD="$PYTEST_CMD -q"
fi

if [ "$COVERAGE_MODE" = true ]; then
    echo -e "${YELLOW}📊 Running with coverage analysis...${NC}"
    PYTEST_CMD="$PYTEST_CMD --cov=app --cov-report=html --cov-report=term"
fi

if [ "$QUICK_MODE" = true ]; then
    echo -e "${YELLOW}⚡ Running quick smoke tests only...${NC}"
    PYTEST_CMD="$PYTEST_CMD -m smoke"
fi

# Add test directory
PYTEST_CMD="$PYTEST_CMD tests/"

# Run tests
echo -e "${GREEN}🚀 Running tests...${NC}"
echo ""

if [ "$WATCH_MODE" = true ]; then
    echo -e "${YELLOW}👀 Watch mode enabled - tests will re-run on file changes${NC}"
    echo -e "${YELLOW}   Press Ctrl+C to stop${NC}"
    echo ""

    # Install pytest-watch if not present
    if ! python -c "import pytest_watch" 2>/dev/null; then
        pip install pytest-watch
    fi

    ptw -- $PYTEST_CMD
else
    # Run once
    if $PYTEST_CMD; then
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              ✅ ALL TESTS PASSED                          ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

        if [ "$COVERAGE_MODE" = true ]; then
            echo ""
            echo -e "${BLUE}📊 Coverage report generated:${NC}"
            echo -e "   HTML: ${YELLOW}htmlcov/index.html${NC}"
            echo -e "   Open with: ${YELLOW}open htmlcov/index.html${NC}"
        fi

        exit 0
    else
        echo ""
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║              ❌ SOME TESTS FAILED                         ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}💡 Tip: Run with --verbose for more details${NC}"
        exit 1
    fi
fi
