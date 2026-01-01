"""
Twilio Service: Handles telephony operations and Media Streams
"""

import logging
import asyncio
from typing import Optional
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream
import base64
import audioop

from app.core.config import settings

logger = logging.getLogger(__name__)


class TwilioService:
    """
    Manages Twilio operations: calls, Media Streams, recordings
    """

    def __init__(self):
        self.client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )
        self.phone_number = settings.TWILIO_PHONE_NUMBER

    def generate_twiml_for_incoming_call(
        self,
        websocket_url: str,
        caller_number: str,
        call_sid: str
    ) -> str:
        """
        Generate TwiML to connect incoming call to WebSocket

        Args:
            websocket_url: Backend WebSocket URL (wss://...)
            caller_number: Caller's phone number
            call_sid: Twilio Call SID

        Returns:
            TwiML XML string
        """
        response = VoiceResponse()

        # Optional: Play greeting while WebSocket connects
        # response.say(
        #     "Connecting to assistant...",
        #     voice="alice"
        # )

        # Connect to WebSocket for bidirectional audio streaming
        connect = Connect()
        stream = Stream(url=websocket_url)

        # Pass call metadata as parameters
        stream.parameter(name="caller_number", value=caller_number)
        stream.parameter(name="call_sid", value=call_sid)

        connect.append(stream)
        response.append(connect)

        # Fallback if WebSocket connection fails
        response.say(
            "I'm sorry, the assistant is currently offline. Please try again later.",
            voice="alice"
        )

        return str(response)

    async def dial_user(self, user_phone_number: str, call_sid: str) -> None:
        """
        Dial the user to pass through a legitimate call

        Args:
            user_phone_number: User's phone number to ring
            call_sid: Original call SID to bridge
        """
        try:
            # Run sync Twilio call in thread pool to avoid blocking
            await asyncio.to_thread(
                lambda: self.client.calls(call_sid).update(
                    twiml=f'<Response><Dial>{user_phone_number}</Dial></Response>'
                )
            )
            logger.info(f"✅ Dialing user {user_phone_number} for call {call_sid}")
        except Exception as e:
            logger.error(f"❌ Failed to dial user: {e}")
            raise

    async def end_call(self, call_sid: str) -> None:
        """
        Terminate a call (used when scam detected)
        Alias for hangup_call to match optimized router
        """
        await self.hangup_call(call_sid)

    async def hangup_call(self, call_sid: str) -> None:
        """
        Terminate a call (used when scam detected)

        Args:
            call_sid: Twilio Call SID
        """
        try:
            # Run sync Twilio call in thread pool to avoid blocking
            await asyncio.to_thread(
                lambda: self.client.calls(call_sid).update(status="completed")
            )
            logger.info(f"✅ Hung up call {call_sid}")
        except Exception as e:
            logger.error(f"❌ Failed to hang up call: {e}")
            raise

    @staticmethod
    def decode_mulaw_audio(base64_payload: str) -> bytes:
        """
        Decode Twilio's mu-law audio to PCM

        Args:
            base64_payload: Base64-encoded mu-law audio

        Returns:
            PCM audio bytes (16-bit, mono, 8kHz)
        """
        mulaw_bytes = base64.b64decode(base64_payload)
        # Convert mu-law to linear PCM (16-bit)
        pcm_bytes = audioop.ulaw2lin(mulaw_bytes, 2)  # 2 = 16-bit
        return pcm_bytes

    @staticmethod
    def encode_pcm_to_mulaw(pcm_bytes: bytes) -> str:
        """
        Encode PCM audio to mu-law for Twilio

        Args:
            pcm_bytes: PCM audio bytes (16-bit, mono, 8kHz)

        Returns:
            Base64-encoded mu-law audio string
        """
        mulaw_bytes = audioop.lin2ulaw(pcm_bytes, 2)  # 2 = 16-bit
        return base64.b64encode(mulaw_bytes).decode('utf-8')

    @staticmethod
    def calculate_audio_energy(pcm_bytes: bytes) -> float:
        """
        Calculate RMS energy of audio for visualization

        Args:
            pcm_bytes: PCM audio bytes

        Returns:
            Energy level (0.0 - 1.0)
        """
        try:
            rms = audioop.rms(pcm_bytes, 2)  # 2 = 16-bit
            # Normalize to 0-1 range (assuming max RMS ~5000 for speech)
            normalized = min(rms / 5000.0, 1.0)
            return normalized
        except Exception as e:
            logger.debug(f"Error calculating audio energy: {e}")
            return 0.0

    def get_call_details(self, call_sid: str) -> dict:
        """
        Retrieve call details from Twilio

        Args:
            call_sid: Twilio Call SID

        Returns:
            Dict with call metadata
        """
        try:
            call = self.client.calls(call_sid).fetch()
            return {
                "sid": call.sid,
                "from": call.from_,
                "to": call.to,
                "status": call.status,
                "duration": call.duration,
                "start_time": call.start_time,
                "end_time": call.end_time,
            }
        except Exception as e:
            logger.error(f"❌ Failed to fetch call details: {e}")
            return {}

    def send_sms(self, to_number: str, message: str) -> None:
        """
        Send SMS notification (e.g., scam alert to user)

        Args:
            to_number: Recipient phone number
            message: SMS body
        """
        try:
            self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_number
            )
            logger.info(f"✅ Sent SMS to {to_number}")
        except Exception as e:
            logger.error(f"❌ Failed to send SMS: {e}")


# Singleton instance
twilio_service = TwilioService()
