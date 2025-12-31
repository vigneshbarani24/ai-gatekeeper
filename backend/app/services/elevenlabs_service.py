"""
ElevenLabs Service: Manages Conversational AI and Voice Cloning
"""

import logging
import asyncio
import json
from typing import Optional, Callable, Dict, Any
import websockets
from websockets.client import WebSocketClientProtocol

from app.core.config import settings

logger = logging.getLogger(__name__)


class ElevenLabsService:
    """
    Manages ElevenLabs Conversational AI WebSocket connection
    Handles STT + LLM + TTS in a single integrated pipeline
    """

    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.agent_id = settings.ELEVENLABS_AGENT_ID
        self.voice_id = settings.ELEVENLABS_VOICE_ID
        self.websocket_url = settings.ELEVENLABS_WEBSOCKET_URL

        self.connection: Optional[WebSocketClientProtocol] = None
        self.is_connected = False

    async def connect(
        self,
        on_audio: Callable[[bytes], None],
        on_transcript: Callable[[str], None],
        on_interruption: Callable[[], None],
    ) -> None:
        """
        Establish WebSocket connection to ElevenLabs Conversational AI

        Args:
            on_audio: Callback for generated audio chunks
            on_transcript: Callback for transcript updates
            on_interruption: Callback when user interrupts AI
        """
        url = f"{self.websocket_url}?agent_id={self.agent_id}"

        try:
            logger.info(f"🔗 Connecting to ElevenLabs Agent: {self.agent_id}")

            self.connection = await websockets.connect(
                url,
                extra_headers={
                    "xi-api-key": self.api_key,
                },
                ping_interval=20,
                ping_timeout=10,
            )

            self.is_connected = True
            logger.info("✅ ElevenLabs WebSocket connected")

            # Start listening for messages
            asyncio.create_task(self._listen_loop(on_audio, on_transcript, on_interruption))

        except Exception as e:
            logger.error(f"❌ Failed to connect to ElevenLabs: {e}")
            self.is_connected = False
            raise

    async def _listen_loop(
        self,
        on_audio: Callable[[bytes], None],
        on_transcript: Callable[[str], None],
        on_interruption: Callable[[], None],
    ) -> None:
        """
        Listen for incoming messages from ElevenLabs

        Args:
            on_audio: Callback for audio chunks
            on_transcript: Callback for transcripts
            on_interruption: Callback for interruptions
        """
        try:
            async for message in self.connection:
                try:
                    data = json.loads(message)
                    event_type = data.get("type")

                    if event_type == "audio":
                        # Audio chunk from AI
                        audio_base64 = data.get("audio")
                        if audio_base64:
                            import base64
                            audio_bytes = base64.b64decode(audio_base64)
                            on_audio(audio_bytes)

                    elif event_type == "transcript":
                        # Transcript update
                        text = data.get("text", "")
                        on_transcript(text)

                    elif event_type == "interruption":
                        # User started speaking (barge-in)
                        logger.debug("🛑 Interruption detected")
                        on_interruption()

                    elif event_type == "error":
                        logger.error(f"❌ ElevenLabs error: {data.get('message')}")

                except json.JSONDecodeError:
                    # Binary audio message
                    on_audio(message)

        except websockets.exceptions.ConnectionClosed:
            logger.info("🔌 ElevenLabs WebSocket closed")
            self.is_connected = False
        except Exception as e:
            logger.error(f"❌ Error in ElevenLabs listen loop: {e}")
            self.is_connected = False

    async def send_audio(self, audio_bytes: bytes) -> None:
        """
        Send audio chunk to ElevenLabs for processing

        Args:
            audio_bytes: PCM audio bytes (16-bit, mono, 8kHz or 16kHz)
        """
        if not self.is_connected or not self.connection:
            logger.warning("⚠️ Cannot send audio: Not connected to ElevenLabs")
            return

        try:
            import base64
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

            message = {
                "type": "audio",
                "audio": audio_base64
            }

            await self.connection.send(json.dumps(message))

        except Exception as e:
            logger.error(f"❌ Failed to send audio to ElevenLabs: {e}")

    async def send_text(self, text: str) -> None:
        """
        Send text message to ElevenLabs (for system prompts or interruptions)

        Args:
            text: Text to send
        """
        if not self.is_connected or not self.connection:
            logger.warning("⚠️ Cannot send text: Not connected to ElevenLabs")
            return

        try:
            message = {
                "type": "text",
                "text": text
            }

            await self.connection.send(json.dumps(message))
            logger.debug(f"📤 Sent text to ElevenLabs: {text[:100]}...")

        except Exception as e:
            logger.error(f"❌ Failed to send text to ElevenLabs: {e}")

    async def trigger_response(self) -> None:
        """
        Manually trigger AI response (used when user stops speaking)
        """
        if not self.is_connected or not self.connection:
            return

        try:
            message = {"type": "trigger_response"}
            await self.connection.send(json.dumps(message))
            logger.debug("🎙️ Triggered AI response")

        except Exception as e:
            logger.error(f"❌ Failed to trigger response: {e}")

    async def disconnect(self) -> None:
        """Close ElevenLabs WebSocket connection"""
        if self.connection:
            await self.connection.close()
            self.is_connected = False
            logger.info("✅ ElevenLabs WebSocket disconnected")

    @staticmethod
    def create_agent_config(
        user_name: str,
        system_prompt: str,
        tools: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Create ElevenLabs agent configuration

        Args:
            user_name: User's name for personalization
            system_prompt: System prompt for agent behavior
            tools: List of server tools (webhooks)

        Returns:
            Agent configuration dict
        """
        config = {
            "agent": {
                "prompt": {
                    "prompt": system_prompt.format(user_name=user_name),
                    "llm": "gpt-4o",  # or "gemini-1.5-pro"
                    "temperature": 0.7,
                },
                "first_message": f"Hello, this is {user_name}'s AI assistant. How can I help you?",
                "language": "en",
            },
            "tts": {
                "voice_id": settings.ELEVENLABS_VOICE_ID,
                "model_id": "eleven_turbo_v2_5",
                "stability": 0.5,
                "similarity_boost": 0.75,
            },
            "conversation": {
                "max_duration_seconds": 300,  # 5 minutes max
                "client_events": ["audio", "transcript", "interruption"],
            }
        }

        if tools:
            config["agent"]["tools"] = tools

        return config


# Singleton instance factory
def create_elevenlabs_service() -> ElevenLabsService:
    """Create new ElevenLabs service instance for each call"""
    return ElevenLabsService()
