
import httpx
import json

API_KEY = "2e67e86b682285afd0b6bf58713f30c80d812b53ef3d01ddb6bb32b10b1aa44e"
AGENT_ID = "agent_6801kdt0jrjjf13bk24sywwy0kze"
BACKEND_URL = "https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app"

headers = {
    "xi-api-key": API_KEY,
    "Content-Type": "application/json"
}

def fix_tools():
    # 1. Define tools with correct "type": "webhook" and "webhook" nesting
    tool_defs = [
        {
            "type": "webhook",
            "name": "check_calendar",
            "description": "Check user's calendar availability for a specific date and time",
            "webhook": {
                "api_schema": {
                    "url": f"{BACKEND_URL}/api/tools/check_calendar",
                    "method": "POST",
                    "headers": {"Content-Type": "application/json"},
                    "request_body_schema": {
                        "type": "object",
                        "properties": {
                            "date": {"type": "string", "description": "YYYY-MM-DD"},
                            "time": {"type": "string", "description": "HH:MM"},
                            "duration_minutes": {"type": "integer"}
                        },
                        "required": ["date", "time"]
                    }
                }
            }
        },
        {
            "type": "webhook",
            "name": "book_calendar",
            "description": "Book an event on user's Google Calendar",
            "webhook": {
                "api_schema": {
                    "url": f"{BACKEND_URL}/api/tools/book_calendar",
                    "method": "POST",
                    "headers": {"Content-Type": "application/json"},
                    "request_body_schema": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "date": {"type": "string"},
                            "time": {"type": "string"},
                            "duration_minutes": {"type": "integer"}
                        },
                        "required": ["title", "date", "time"]
                    }
                }
            }
        },
        {
            "type": "webhook",
            "name": "check_contact",
            "description": "Check if caller is in user's contact list",
            "webhook": {
                "api_schema": {
                    "url": f"{BACKEND_URL}/api/tools/check_contact",
                    "method": "POST",
                    "headers": {"Content-Type": "application/json"},
                    "request_body_schema": {
                        "type": "object",
                        "properties": {
                            "phone_number": {"type": "string"},
                            "caller_name": {"type": "string"}
                        },
                        "required": ["phone_number"]
                    }
                }
            }
        },
        {
            "type": "webhook",
            "name": "transfer_call",
            "description": "Transfer call to user's actual phone",
            "webhook": {
                "api_schema": {
                    "url": f"{BACKEND_URL}/api/tools/transfer_call",
                    "method": "POST",
                    "headers": {"Content-Type": "application/json"},
                    "request_body_schema": {
                        "type": "object",
                        "properties": {
                            "reason": {"type": "string"}
                        }
                    }
                }
            }
        },
        {
            "type": "webhook",
            "name": "log_call",
            "description": "Log call summary at end of conversation",
            "webhook": {
                "api_schema": {
                    "url": f"{BACKEND_URL}/api/tools/log_call",
                    "method": "POST",
                    "headers": {"Content-Type": "application/json"},
                    "request_body_schema": {
                        "type": "object",
                        "properties": {
                            "intent": {"type": "string"},
                            "summary": {"type": "string"},
                            "action_taken": {"type": "string"}
                        }
                    }
                }
            }
        },
        {
            "type": "webhook",
            "name": "block_scam",
            "description": "Immediately terminate scam call and log report",
            "webhook": {
                "api_schema": {
                    "url": f"{BACKEND_URL}/api/tools/block_scam",
                    "method": "POST",
                    "headers": {"Content-Type": "application/json"},
                    "request_body_schema": {
                        "type": "object",
                        "properties": {
                            "scam_type": {"type": "string"},
                            "confidence": {"type": "number"},
                            "red_flags": {"type": "array", "items": {"type": "string"}}
                        }
                    }
                }
            }
        }
    ]

    # 2. Get current agent
    print(f"Fetching agent {AGENT_ID}...")
    response = httpx.get(f"https://api.elevenlabs.io/v1/convai/agents/{AGENT_ID}", headers=headers)
    if response.status_code != 200:
        print(f"Error fetching: {response.text}")
        return

    agent_data = response.json()
    
    # Update the tools in the agent object
    agent_data["conversation_config"]["agent"]["prompt"]["tools"] = tool_defs
    
    payload = {
        "conversation_config": agent_data["conversation_config"]
    }

    print("Patching tools...")
    patch_res = httpx.patch(f"https://api.elevenlabs.io/v1/convai/agents/{AGENT_ID}", headers=headers, json=payload)
    
    if patch_res.status_code == 200:
        print("✅ Tools patched successfully!")
    else:
        print(f"❌ Failed to patch: {patch_res.status_code} - {patch_res.text}")

if __name__ == "__main__":
    fix_tools()
