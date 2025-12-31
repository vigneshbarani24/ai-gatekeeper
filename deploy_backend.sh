#!/bin/bash

# ============================================================================
# AI Gatekeeper - Backend Deployment Script (Source Deploy + Env Vars)
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          AI Gatekeeper - Backend Deployment               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
SERVICE_NAME="ai-gatekeeper-backend"
REGION="us-central1"

# Determine Script Directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check for global gcloud first, then user's home dir SDK, then local
GCLOUD_BIN="" # Initialize GCLOUD_BIN
if command -v gcloud &> /dev/null; then
    GCLOUD_BIN="gcloud"
elif [ -f "$HOME/google-cloud-sdk/bin/gcloud" ]; then
    GCLOUD_BIN="$HOME/google-cloud-sdk/bin/gcloud"
    echo -e "${YELLOW}⚠️  Global 'gcloud' not found in PATH. Using: $GCLOUD_BIN${NC}"
elif [ -f "./google-cloud-sdk/bin/gcloud" ]; then
    GCLOUD_BIN="./google-cloud-sdk/bin/gcloud"
    echo -e "${YELLOW}⚠️  Global 'gcloud' not found. Using local: $GCLOUD_BIN${NC}"
else
    echo -e "${RED}❌ 'gcloud' command not found in PATH, ~/google-cloud-sdk, or ./google-cloud-sdk!${NC}"
    exit 1
fi

# Determine Project ID
echo -e "${BLUE}🔹 Verifying Google Cloud Project...${NC}"
PROJECT_ID=$($GCLOUD_BIN config get-value project)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "(unset)" ]; then
     echo -e "${RED}❌ No Google Cloud project set.${NC}"
     echo -e "Run: $GCLOUD_BIN config set project [YOUR_PROJECT_ID]"
     exit 1
fi

echo -e "Target Project: ${GREEN}${PROJECT_ID}${NC}"
echo -e "Target Region:  ${GREEN}${REGION}${NC}"

echo -e "\n${BLUE}🔹 Preparing Environment Variables...${NC}"
cd backend
if [ -f .env ]; then
    # Read .env file, ignore comments and empty lines, replace newlines with commas
    # We use python to safely parse it to avoid issues with special logic
    ENV_VARS=$(python3 -c '
import os
def parse_env():
    items = []
    with open(".env") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("=", 1)
            if len(parts) == 2:
                items.append(f"{parts[0]}={parts[1].strip()}")
    return ",".join(items)
print(parse_env())
')
    echo -e "${GREEN}✅ Loaded environment variables from backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env file not found! Deployment might fail execution if keys are missing.${NC}"
    ENV_VARS=""
fi

echo -e "\n${BLUE}🔹 Deploying from Source to Cloud Run...${NC}"

# Deploy using the resolved binary
$GCLOUD_BIN run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --platform managed \
  --set-env-vars "$ENV_VARS"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Deployment Successful!${NC}"
else
    echo -e "\n${RED}❌ Deployment Failed.${NC}"
    exit 1
fi
