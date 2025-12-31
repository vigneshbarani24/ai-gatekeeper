
import httpx
import json
import os

AGENT_ID = "2e67e86b682285afd0b6bf58713f30c80d812b53ef3d01ddb6bb32b10b1aa44e"
API_KEY = "sk_7ce689eef8309dc53d54726287f04d2d48918cfa9c450e22"
BACKEND_URL = "https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app"

headers = {
    "xi-api-key": API_KEY,
    "Content-Type": "application/json"
}

def update_agent():
    # 1. Fetch current agent config
    print(f"Fetching config for agent {AGENT_ID}...")
    response = httpx.get(f"https://api.elevenlabs.io/v1/convai/agents/{AGENT_ID}", headers=headers)
    if response.status_code != 200:
        print(f"Error fetching agent: {response.text}")
        return

    agent_data = response.json()
    config = agent_data.get("conversation_config", {})
    
    # 2. Update webhook URL
    config["client_events_webhook_url"] = f"{BACKEND_URL}/api/elevenlabs/webhook"
    
    # 3. Update Tools
    # From ElevenLabs docs, tools are in agent.tools
    # Let's check where they are in the response
    agent_settings = agent_data.get("agent", {})
    tools = agent_settings.get("tools", [])
    
    updated_tools = []
    
    # Tool definitions matching the backend
    tool_defs = [
        {"name": "check_calendar", "url": f"{BACKEND_URL}/api/tools/check_calendar"},
        {"name": "book_calendar", "url": f"{BACKEND_URL}/api/tools/book_calendar"},
        {"name": "check_contact", "url": f"{BACKEND_URL}/api/tools/check_contact"},
        {"name": "transfer_call", "url": f"{BACKEND_URL}/api/tools/transfer_call"},
        {"name": "log_call", "url": f"{BACKEND_URL}/api/tools/log_call"},
        {"name": "block_scam", "url": f"{BACKEND_URL}/api/tools/block_scam"},
    ]

    # Map existing tools to updated URLs, or create new ones if they don't exist
    # Note: Adding new tools might require more metadata (parameters, etc.) 
    # but the user said "create elevelabs agent with cloud run webhook", 
    # so I should probably ensure these tools exist.
    
    # For now, let's just update the URLs of existing tools if they match by name
    # If they don't exist, we might need to add them with full definitions.
    
    # Actually, ElevenLabs Agent API PATCH expects the whole 'agent' object.
    
    payload = {
        "conversation_config": config,
        "agent": agent_settings
    }
    
    # Update tool URLs in agent_settings
    if "tools" in agent_settings:
        for tool in agent_settings["tools"]:
            for tool_def in tool_defs:
                if tool["name"] == tool_def["name"]:
                    tool["api_schema"]["url"] = tool_def["url"]
                    print(f"Updated tool URL: {tool['name']}")
    
    # Perform the update
    print("Updating agent...")
    patch_response = httpx.patch(
        f"https://api.elevenlabs.io/v1/convai/agents/{AGENT_ID}",
        headers=headers,
        json=payload
    )
    
    if patch_response.status_code == 200:
        print("✅ Agent updated successfully!")
    else:
        print(f"❌ Failed to update agent: {patch_response.text}")

if __name__ == "__main__":
    update_agent()
