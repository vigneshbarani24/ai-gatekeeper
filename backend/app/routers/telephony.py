"""
Telephony Router: Handles Twilio Media Streams WebSocket connections
This is the CORE routing logic that bridges Twilio ↔ ElevenLabs
"""

import logging
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, Response
from typing import Dict, Optional

from app.services.twilio_service import twilio_service
from app.services.elevenlabs_service import create_elevenlabs_service
from app.services.gemini_service import gemini_service
from app.services.database import db_service
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


class CallSession:
    """
    Manages state for a single call session
    Coordinates Twilio WebSocket ↔ ElevenLabs WebSocket
    """

    def __init__(self, call_sid: str, caller_number: str, user_id: str):
        self.call_sid = call_sid
        self.caller_number = caller_number
        self.user_id = user_id

        # WebSocket connections
        self.twilio_ws: Optional[WebSocket] = None
        self.elevenlabs_service = create_elevenlabs_service()

        # Call state
        self.stream_sid: Optional[str] = None
        self.status = "initializing"  # initializing, screening, passed_through, blocked, ended
        self.transcript = ""
        self.intent: Optional[str] = None
        self.scam_score: float = 0.0

        # Audio buffers
        self.audio_buffer = bytearray()

    async def handle_twilio_websocket(self, websocket: WebSocket) -> None:
        """
        Main handler for Twilio Media Streams WebSocket

        Args:
            websocket: FastAPI WebSocket connection from Twilio
        """
        self.twilio_ws = websocket
        await websocket.accept()

        logger.info(f"📞 Call {self.call_sid} - Twilio WebSocket connected")

        # Connect to ElevenLabs
        await self._connect_elevenlabs()

        try:
            # Listen for Twilio messages
            async for message in websocket.iter_text():
                await self._handle_twilio_message(message)

        except WebSocketDisconnect:
            logger.info(f"🔌 Call {self.call_sid} - Twilio WebSocket disconnected")
            await self._cleanup()

        except Exception as e:
            logger.error(f"❌ Call {self.call_sid} - Error: {e}", exc_info=True)
            await self._cleanup()

    async def _connect_elevenlabs(self) -> None:
        """Connect to ElevenLabs Conversational AI"""
        try:
            await self.elevenlabs_service.connect(
                on_audio=self._on_elevenlabs_audio,
                on_transcript=self._on_elevenlabs_transcript,
                on_interruption=self._on_elevenlabs_interruption,
            )

            # Send initial system prompt
            user = await db_service.get_user_by_id(self.user_id)
            system_prompt = settings.system_prompt  # Uses user's name from config

            await self.elevenlabs_service.send_text(
                f"System: {system_prompt}"
            )

            self.status = "screening"
            logger.info(f"✅ Call {self.call_sid} - ElevenLabs connected, screening started")

        except Exception as e:
            logger.error(f"❌ Failed to connect ElevenLabs: {e}")
            # Fallback: Hang up the call
            await self._hangup()

    async def _handle_twilio_message(self, message: str) -> None:
        """
        Process incoming message from Twilio

        Args:
            message: JSON string from Twilio Media Streams
        """
        try:
            data = json.loads(message)
            event = data.get("event")

            if event == "connected":
                logger.debug(f"Call {self.call_sid} - Twilio stream connected")

            elif event == "start":
                # Stream started, extract stream SID
                start_data = data.get("start", {})
                self.stream_sid = start_data.get("streamSid")
                logger.info(f"📡 Call {self.call_sid} - Stream SID: {self.stream_sid}")

                # Check if caller is whitelisted
                await self._check_whitelist()

            elif event == "media":
                # Audio data from caller
                media_data = data.get("media", {})
                audio_payload = media_data.get("payload")  # Base64 mu-law

                if audio_payload:
                    # Decode mu-law to PCM
                    pcm_audio = twilio_service.decode_mulaw_audio(audio_payload)

                    # Forward to ElevenLabs
                    await self.elevenlabs_service.send_audio(pcm_audio)

            elif event == "stop":
                # Stream stopped
                logger.info(f"🛑 Call {self.call_sid} - Stream stopped")
                await self._cleanup()

        except json.JSONDecodeError as e:
            logger.error(f"❌ Invalid JSON from Twilio: {e}")

    def _on_elevenlabs_audio(self, audio_bytes: bytes) -> None:
        """
        Callback: Received audio from ElevenLabs (AI response)
        Send it to Twilio (caller hears this)

        Args:
            audio_bytes: PCM audio from AI
        """
        try:
            # Encode PCM to mu-law for Twilio
            mulaw_audio = twilio_service.encode_pcm_to_mulaw(audio_bytes)

            # Send to Twilio WebSocket
            if self.twilio_ws and self.stream_sid:
                asyncio.create_task(self._send_audio_to_twilio(mulaw_audio))

        except Exception as e:
            logger.error(f"❌ Error sending audio to Twilio: {e}")

    async def _send_audio_to_twilio(self, mulaw_base64: str) -> None:
        """
        Send audio to Twilio Media Streams

        Args:
            mulaw_base64: Base64-encoded mu-law audio
        """
        if not self.twilio_ws or not self.stream_sid:
            return

        message = {
            "event": "media",
            "streamSid": self.stream_sid,
            "media": {
                "payload": mulaw_base64
            }
        }

        await self.twilio_ws.send_text(json.dumps(message))

    def _on_elevenlabs_transcript(self, text: str) -> None:
        """
        Callback: Transcript update from ElevenLabs

        Args:
            text: Latest transcript text
        """
        self.transcript += f"\n{text}"
        logger.debug(f"📝 Transcript: {text}")

        # Analyze intent every few turns
        if len(self.transcript) > 100:  # After ~100 characters
            asyncio.create_task(self._analyze_intent())

    def _on_elevenlabs_interruption(self) -> None:
        """
        Callback: User interrupted AI (barge-in detected)
        Need to clear Twilio's audio buffer
        """
        logger.debug(f"🛑 Call {self.call_sid} - Interruption detected")

        # Send clear command to Twilio
        if self.twilio_ws and self.stream_sid:
            asyncio.create_task(self._clear_twilio_buffer())

    async def _clear_twilio_buffer(self) -> None:
        """Clear Twilio's audio playback buffer (for interruptions)"""
        if not self.twilio_ws or not self.stream_sid:
            return

        message = {
            "event": "clear",
            "streamSid": self.stream_sid
        }

        await self.twilio_ws.send_text(json.dumps(message))
        logger.debug("✅ Cleared Twilio buffer")

    async def _check_whitelist(self) -> None:
        """Check if caller is in user's contact whitelist"""
        try:
            contact = await db_service.get_contact_by_phone(
                user_id=self.user_id,
                phone_number=self.caller_number
            )

            if contact and contact.get("auto_pass"):
                logger.info(f"✅ Call {self.call_sid} - Whitelisted contact: {contact.get('name')}")

                # Pass through immediately
                await self._pass_through_to_user()

        except Exception as e:
            logger.error(f"❌ Whitelist check failed: {e}")

    async def _analyze_intent(self) -> None:
        """Analyze caller intent using Gemini"""
        try:
            result = await gemini_service.classify_caller_intent(
                transcript=self.transcript,
                caller_name=None  # TODO: Extract from transcript
            )

            self.intent = result.get("intent")
            confidence = result.get("confidence", 0.0)

            logger.info(f"🎯 Call {self.call_sid} - Intent: {self.intent} ({confidence:.2f})")

            # Handle based on intent
            if self.intent == "scam":
                await self._block_scam()
            elif self.intent == "sales":
                await self._decline_sales()
            elif result.get("should_pass_through"):
                await self._pass_through_to_user()

        except Exception as e:
            logger.error(f"❌ Intent analysis failed: {e}")

    async def _pass_through_to_user(self) -> None:
        """Pass the call through to the user's phone"""
        logger.info(f"📲 Call {self.call_sid} - Passing through to user")

        self.status = "passed_through"

        # Update database
        await db_service.update_call(
            call_sid=self.call_sid,
            status="passed_through",
            intent=self.intent,
            passed_through=True
        )

        # Use Twilio to dial the user
        user = await db_service.get_user_by_id(self.user_id)
        user_phone = user.get("phone_number")

        twilio_service.dial_user(user_phone, self.call_sid)

    async def _block_scam(self) -> None:
        """Block a detected scam call"""
        logger.warning(f"🚨 Call {self.call_sid} - SCAM DETECTED, blocking")

        self.status = "blocked"

        # Send polite goodbye via ElevenLabs
        await self.elevenlabs_service.send_text(
            "I'm not interested. Goodbye."
        )

        # Wait a moment for AI to speak, then hang up
        await asyncio.sleep(2)
        await self._hangup()

        # Log scam report
        await db_service.create_scam_report(
            call_sid=self.call_sid,
            scam_type="detected_by_ai",
            confidence=0.9,
            pattern_matched=self.transcript[:500]
        )

    async def _decline_sales(self) -> None:
        """Politely decline a sales call"""
        logger.info(f"📵 Call {self.call_sid} - Sales call, declining")

        self.status = "blocked"

        # Polite decline
        await self.elevenlabs_service.send_text(
            "Thank you for calling, but we're not interested in any offers at this time. Have a great day!"
        )

        await asyncio.sleep(3)
        await self._hangup()

    async def _hangup(self) -> None:
        """Terminate the call"""
        try:
            twilio_service.hangup_call(self.call_sid)
            await self._cleanup()
        except Exception as e:
            logger.error(f"❌ Failed to hang up: {e}")

    async def _cleanup(self) -> None:
        """Clean up resources when call ends"""
        logger.info(f"🧹 Call {self.call_sid} - Cleaning up")

        self.status = "ended"

        # Disconnect ElevenLabs
        await self.elevenlabs_service.disconnect()

        # Save final call record
        await db_service.update_call(
            call_sid=self.call_sid,
            status="ended",
            transcript=self.transcript,
            intent=self.intent,
            scam_score=self.scam_score
        )

        # Remove from active sessions
        active_sessions.pop(self.call_sid, None)


# Active call sessions (in-memory)
active_sessions: Dict[str, CallSession] = {}


@router.post("/webhooks/twilio/voice")
async def twilio_voice_webhook(request: Request):
    """
    TwiML endpoint for incoming calls
    Returns TwiML to connect call to WebSocket

    This is the FIRST endpoint Twilio hits when a call comes in
    """
    form_data = await request.form()

    caller_number = form_data.get("From")
    called_number = form_data.get("To")
    call_sid = form_data.get("CallSid")

    logger.info(f"📞 Incoming call: {caller_number} → {called_number} (SID: {call_sid})")

    # Find user by Twilio number
    user = await db_service.get_user_by_twilio_number(called_number)

    if not user:
        logger.error(f"❌ No user found for number {called_number}")
        # Return error TwiML
        return Response(
            content="<Response><Say>This number is not configured.</Say></Response>",
            media_type="application/xml"
        )

    # Create call record in database
    await db_service.create_call(
        user_id=user["id"],
        caller_number=caller_number,
        call_sid=call_sid,
        status="ringing"
    )

    # Generate WebSocket URL
    websocket_url = f"{settings.TWILIO_STREAM_URL}?call_sid={call_sid}&user_id={user['id']}"

    # Generate TwiML to connect to WebSocket
    twiml = twilio_service.generate_twiml_for_incoming_call(
        websocket_url=websocket_url,
        caller_number=caller_number,
        call_sid=call_sid
    )

    return Response(content=twiml, media_type="application/xml")


@router.websocket("/streams/audio")
async def twilio_media_stream(websocket: WebSocket, call_sid: str, user_id: str):
    """
    WebSocket endpoint for Twilio Media Streams

    This receives bidirectional audio from the call
    """
    logger.info(f"🔌 WebSocket connection request: call_sid={call_sid}, user_id={user_id}")

    # Get caller number from database
    call_record = await db_service.get_call_by_sid(call_sid)
    if not call_record:
        logger.error(f"❌ No call record found for {call_sid}")
        await websocket.close()
        return

    caller_number = call_record.get("caller_number")

    # Create call session
    session = CallSession(
        call_sid=call_sid,
        caller_number=caller_number,
        user_id=user_id
    )

    active_sessions[call_sid] = session

    # Handle the WebSocket connection
    await session.handle_twilio_websocket(websocket)
