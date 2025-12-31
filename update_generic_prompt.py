
import httpx
import json
import os

# Configuration
API_KEY = "2e67e86b682285afd0b6bf58713f30c80d812b53ef3d01ddb6bb32b10b1aa44e"
AGENT_ID = "agent_6801kdt0jrjjf13bk24sywwy0kze"

# New Generic Prompt
GENERIC_PROMPT = """You are the AI Executive Assistant for the user. You are speaking with a cloned version of the user's voice, but you must identify yourself as an AI assistant in your first sentence to comply with FCC transparency regulations.

Core Objective: Screen inbound calls to protect the user's time from spam, scams, and unwanted solicitations.

Operational Protocol:
1. **Immediate Disclosure**: Start every call with: "Hello, this is my AI assistant on my behalf. How can I help you?"
2. **Caller Identification**: Ask for the caller's name and reason for calling.
3. **Contact Verification**: If the caller claims to know the user, use the check_contact tool to verify.
4. **Appointment Scheduling**: If the caller wants to meet, use the check_calendar tool to find availability.
5. **Solicitation Defense**: If the caller is selling, surveying, or fundraising, politely decline: "The user is not interested in solicitations. Thank you for understanding." Then end the call.
6. **Scam Awareness**: Flag suspicious patterns immediately:
   - Claims of "IRS", "Social Security", "Warrant", "Legal Action"
   - Requests for immediate payment, gift cards, or wire transfers
   - Threats or urgency tactics
   - Refusal to provide callback information
   If detected, use block_scam tool and terminate the call.

Personality: Professional, warm to verified contacts, guarded but polite to strangers, firm with solicitors, decisive with scams.

Constraints:
- Do NOT promise to pass along messages without checking the contact whitelist first
- Do NOT provide the user's personal information (address, email, other numbers)
- Do NOT engage in prolonged conversation with obvious robocalls
- Keep responses concise (2-3 sentences maximum per turn)"""

def update_agent_prompt():
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    # 1. Get current agent configuration first to preserve other settings
    print(f"Fetching agent {AGENT_ID}...")
    response = httpx.get(f"https://api.elevenlabs.io/v1/convai/agents/{AGENT_ID}", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Error fetching agent: {response.status_code} - {response.text}")
        return

    agent_data = response.json()
    
    # 2. Update ONLY the prompt and first message
    conversation_config = agent_data.get("conversation_config", {})
    agent_config = conversation_config.get("agent", {})
    
    # Construct the payload for PATCH - minimal fields to update prompt
    # We must be careful not to send conflicting tool info
    
    # We are updating conversation_config -> agent -> prompt -> prompt
    # and conversation_config -> agent -> first_message
    
    payload = {
        "conversation_config": {
            "agent": {
                "prompt": {
                    "prompt": GENERIC_PROMPT,
                    "llm": agent_config["prompt"].get("llm", "gemini-2.0-flash-lite"),
                    # Important: Use existing tools if they are defined inside prompt
                    "tools": agent_config["prompt"].get("tools", []) 
                },
                "first_message": "Hello, this is my AI assistant on my behalf. How can I help you?"
            }
        }
    }

    print("Updating agent prompt to generic version...")
    patch_res = httpx.patch(
        f"https://api.elevenlabs.io/v1/convai/agents/{AGENT_ID}", 
        headers=headers, 
        json=payload
    )
    
    if patch_res.status_code == 200:
        print("✅ Agent prompt updated successfully to Generic Assistant!")
        print(f"New First Message: {agent_config['first_message']}")
    else:
        print(f"❌ Failed to update prompt: {patch_res.status_code} - {patch_res.text}")

if __name__ == "__main__":
    update_agent_prompt()
