"""
Webhooks Router: Handles callbacks from external services
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/elevenlabs/tools")
async def elevenlabs_tool_webhook():
    """
    ElevenLabs Server Tools webhook
    Called when AI needs to execute a tool (e.g., check calendar)
    """
    # TODO: Implement tool execution
    return {"status": "ok"}
