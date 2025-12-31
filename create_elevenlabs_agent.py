
import httpx
import json

API_KEY = "2e67e86b682285afd0b6bf58713f30c80d812b53ef3d01ddb6bb32b10b1aa44e"
BACKEND_URL = "https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app"

headers = {
    "xi-api-key": API_KEY,
    "Content-Type": "application/json"
}

def create_agent():
    # 1. Define tools
    tool_defs = [
        {
            "name": "check_calendar",
            "description": "Check user's calendar availability for a specific date and time",
            "api_schema": {
                "request": {
                    "method": "POST",
                    "url": f"{BACKEND_URL}/api/tools/check_calendar",
                    "headers": {"Content-Type": "application/json"},
                    "schema": {
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
            "name": "book_calendar",
            "description": "Book an event on user's Google Calendar",
            "api_schema": {
                "request": {
                    "method": "POST",
                    "url": f"{BACKEND_URL}/api/tools/book_calendar",
                    "headers": {"Content-Type": "application/json"},
                    "schema": {
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
            "name": "check_contact",
            "description": "Check if caller is in user's contact list",
            "api_schema": {
                "request": {
                    "method": "POST",
                    "url": f"{BACKEND_URL}/api/tools/check_contact",
                    "headers": {"Content-Type": "application/json"},
                    "schema": {
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
            "name": "transfer_call",
            "description": "Transfer call to user's actual phone",
            "api_schema": {
                "request": {
                    "method": "POST",
                    "url": f"{BACKEND_URL}/api/tools/transfer_call",
                    "headers": {"Content-Type": "application/json"},
                    "schema": {
                        "type": "object",
                        "properties": {
                            "reason": {"type": "string"}
                        }
                    }
                }
            }
        },
        {
            "name": "log_call",
            "description": "Log call summary at end of conversation",
            "api_schema": {
                "request": {
                    "method": "POST",
                    "url": f"{BACKEND_URL}/api/tools/log_call",
                    "headers": {"Content-Type": "application/json"},
                    "schema": {
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
            "name": "block_scam",
            "description": "Immediately terminate scam call and log report",
            "api_schema": {
                "request": {
                    "method": "POST",
                    "url": f"{BACKEND_URL}/api/tools/block_scam",
                    "headers": {"Content-Type": "application/json"},
                    "schema": {
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

    # 2. Define Agent Payload
    payload = {
        "name": "AI Gatekeeper",
        "conversation_config": {
            "client_events_webhook_url": f"{BACKEND_URL}/api/elevenlabs/webhook",
            "tts": {
                "voice_id": "21m00Tcm4TlvDq8ikWAM", # Default Rachel
                "model_id": "eleven_turbo_v2"
            },
            "agent": {
                "prompt": {
                    "prompt": "You are the AI Executive Assistant for Sarah. You are speaking with a cloned version of Sarah's voice, but you must identify yourself as an AI assistant in your first sentence to comply with FCC transparency regulations.\n\nCore Objective: Screen inbound calls to protect Sarah's time from spam, scams, and unwanted solicitations.\n\nOperational Protocol:\n1. **Immediate Disclosure**: Start every call with: \"Hello, this is Sarah's AI assistant. How can I help you?\"\n2. **Caller Identification**: Ask for the caller's name and reason for calling.\n3. **Contact Verification**: If the caller claims to know Sarah, use the check_contact tool to verify.\n4. **Appointment Scheduling**: If the caller wants to meet, use the check_calendar tool to find availability.\n5. **Solicitation Defense**: If the caller is selling, surveying, or fundraising, politely decline: \"Sarah is not interested in solicitations. Thank you for understanding.\" Then end the call.\n6. **Scam Awareness**: Flag suspicious patterns immediately:\n   - Claims of \"IRS\", \"Social Security\", \"Warrant\", \"Legal Action\"\n   - Requests for immediate payment, gift cards, or wire transfers\n   - Threats or urgency tactics\n   - Refusal to provide callback information\n   If detected, use report_scam tool and terminate the call.\n\nPersonality: Professional, warm to verified contacts, guarded but polite to strangers, firm with solicitors, decisive with scams.\n\nConstraints:\n- Do NOT promise to pass along messages without checking the contact whitelist first\n- Do NOT provide Sarah's personal information (address, email, other numbers)\n- Do NOT engage in prolonged conversation with obvious robocalls\n- Keep responses concise (2-3 sentences maximum per turn)",
                    "llm": "gemini-1.5-flash"
                },
                "first_message": "Hello, this is Sarah's AI assistant. How can I help you?",
                "tools": tool_defs
            }
        }
    }

    print("Creating new agent 'AI Gatekeeper'...")
    response = httpx.post("https://api.elevenlabs.io/v1/convai/agents/create", headers=headers, json=payload)
    
    if response.status_code == 200:
        agent_id = response.json().get("agent_id")
        print(f"✅ Agent created successfully! Agent ID: {agent_id}")
        return agent_id
    else:
        print(f"❌ Failed to create agent: {response.status_code} - {response.text}")
        return None

if __name__ == "__main__":
    create_agent()
