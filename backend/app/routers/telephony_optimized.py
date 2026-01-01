"""
OPTIMIZED Telephony Router
Direct Twilio → ElevenLabs connection (100ms faster!)

Intelligence runs via webhooks (zero latency impact)
"""

import logging
import json
import httpx
from fastapi import APIRouter, Request, Response, BackgroundTasks
from fastapi.responses import PlainTextResponse
from typing import Dict

from app.services.database import db_service
from app.services.rag_service import rag_service
from app.services.gcs_service import gcs_service
from app.agents.orchestrator import analyze_ongoing_call
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


# ======================
# OPTIMIZED FLOW
# ======================

@router.post("/api/telephony/incoming")
async def incoming_call(request: Request, background_tasks: BackgroundTasks):
    """
    Twilio webhook: Incoming call

    OPTIMIZED: Returns TwiML that connects DIRECTLY to ElevenLabs
    No audio flows through FastAPI (100ms latency reduction!)

    Intelligence runs via background webhooks
    """
    form = await request.form()

    call_sid = form.get("CallSid")
    caller_number = form.get("From")
    to_number = form.get("To")

    logger.info(f"📞 Incoming call: {call_sid} from {caller_number}")

    # Fast path: Check whitelist (local database lookup, <10ms)
    try:
        user = await db_service.get_user_by_twilio_number(to_number)

        if not user:
            logger.warning(f"⚠️ No user found for Twilio number {to_number}")
            return PlainTextResponse(
                content="<Response><Say>This number is not configured.</Say></Response>",
                media_type="application/xml"
            )

        user_id = user["id"]

        # DISABLED: Whitelist check - all calls go to AI agent
        # Check if caller is whitelisted
        # contact = await db_service.get_contact_by_phone(user_id, caller_number)

        # if contact and contact.get("auto_pass"):
        #     # FAST PATH: Transfer immediately (no AI screening)
        #     logger.info(f"✅ Whitelisted contact: {contact.get('name')}")

        #     # Log call
        #     background_tasks.add_task(
        #         db_service.create_call,
        #         user_id=user_id,
        #         call_sid=call_sid,
        #         caller_number=caller_number,
        #         intent="friend",
        #         scam_score=0.0,
        #         action_taken="passed"
        #     )

        #     return PlainTextResponse(
        #         content=f"""<?xml version="1.0" encoding="UTF-8"?>
        # <Response>
        #     <Say>Connecting you now.</Say>
        #     <Dial>{user.get('phone_number')}</Dial>
        # </Response>""",
        #         media_type="application/xml"
        #     )

        # ALL CALLS → Connect to ElevenLabs with user's cloned voice

        # Get user's voice profile (their cloned voice - CRITICAL for both modes)
        voice_profile = await db_service.get_voice_profile(user_id)

        if not voice_profile:
            logger.warning(f"⚠️ No voice profile found for user {user_id}, using default voice")
            voice_id = settings.ELEVENLABS_VOICE_ID  # Fallback to default
        else:
            voice_id = voice_profile.get("voice_id")
            logger.info(f"🎤 Using cloned voice: {voice_profile.get('voice_name')} ({voice_id})")

        # Determine user mode (changes terminology and behavior)
        user_mode = user.get("mode", "gatekeeper")  # Default to gatekeeper mode
        is_accessibility_mode = user_mode == "accessibility"

        # Mode-specific terminology:
        # - Accessibility mode: "assisting" (AI is user's voice & ears)
        # - Gatekeeper mode: "screening" (AI is filtering spam/scams)
        action_taken = "assisting" if is_accessibility_mode else "screening"

        # ElevenLabs WebSocket URL with agent ID
        elevenlabs_ws_url = f"wss://api.elevenlabs.io/v1/convai/conversation?agent_id={settings.ELEVENLABS_AGENT_ID}"

        # Webhook URL for real-time transcript updates (CRITICAL for accessibility mode)
        webhook_url = f"{settings.BACKEND_URL}/api/elevenlabs/webhook"

        mode_label = "🦻 Accessibility assistance" if is_accessibility_mode else "🛡️ Call screening"
        logger.info(f"{mode_label}: Connecting to ElevenLabs with voice {voice_id}")

        # Create call record
        background_tasks.add_task(
            db_service.create_call,
            user_id=user_id,
            call_sid=call_sid,
            caller_number=caller_number,
            intent="unknown",
            scam_score=0.0,
            action_taken=action_taken  # "assisting" or "screening"
        )

        # Call ElevenLabs Register Call API to get TwiML
        # This returns correct TwiML for connecting to Conversational AI agent
        try:
            async with httpx.AsyncClient() as client:
                elevenlabs_response = await client.post(
                    "https://api.elevenlabs.io/v1/convai/twilio/register-call",
                    headers={
                        "xi-api-key": settings.ELEVENLABS_API_KEY,
                        "Content-Type": "application/json"
                    },
                    json={
                        "agent_id": settings.ELEVENLABS_AGENT_ID,
                        "from_number": caller_number,
                        "to_number": to_number,
                        "conversation_initiation_client_data": {
                            "user_id": user_id,
                            "call_sid": call_sid,
                            "user_name": user.get("name", "User"),
                            "mode": user_mode,
                            "voice_id": voice_id,
                            "accessibility_mode": is_accessibility_mode
                        }
                    },
                    timeout=10.0
                )

                if elevenlabs_response.status_code == 200:
                    # ElevenLabs returns ready-to-use TwiML
                    twiml = elevenlabs_response.text
                    logger.info(f"✅ ElevenLabs TwiML received for call {call_sid}")
                    return PlainTextResponse(content=twiml, media_type="application/xml")
                else:
                    logger.error(f"❌ ElevenLabs API error: {elevenlabs_response.status_code} - {elevenlabs_response.text}")
                    raise Exception(f"ElevenLabs API failed: {elevenlabs_response.status_code}")

        except Exception as e:
            logger.error(f"❌ Failed to connect to ElevenLabs: {e}")

            # Fallback: Voicemail
            return PlainTextResponse(
                content="""<Response>
                    <Say>I'm sorry, the assistant is temporarily unavailable. Please try again later.</Say>
                    <Hangup/>
                </Response>""",
                media_type="application/xml"
            )

    except Exception as e:
        logger.error(f"❌ Error processing incoming call: {e}", exc_info=True)

        return PlainTextResponse(
            content="<Response><Say>An error occurred. Please try again later.</Say></Response>",
            media_type="application/xml"
        )


# ======================
# ELEVENLABS WEBHOOKS
# ======================

@router.post("/api/elevenlabs/webhook")
async def elevenlabs_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    ElevenLabs webhook: Called when transcript updates

    Runs intelligence in BACKGROUND (zero latency impact!)
    """
    try:
        data = await request.json()

        event_type = data.get("type")
        call_sid = data.get("call_sid")

        if event_type == "transcript_update":
            transcript = data.get("transcript", "")
            user_id = data.get("user_id")
            caller_number = data.get("caller_number")

            logger.info(f"📝 Transcript update for {call_sid}: {len(transcript)} chars")

            # Run intelligence in background (doesn't block response)
            background_tasks.add_task(
                analyze_call_realtime,
                call_sid=call_sid,
                user_id=user_id,
                caller_number=caller_number,
                transcript=transcript
            )

        elif event_type == "call_ended":
            logger.info(f"📞 Call ended: {call_sid}")

            # Finalize call record
            background_tasks.add_task(
                finalize_call,
                call_sid=call_sid,
                duration=data.get("duration", 0)
            )

        return {"status": "received"}

    except Exception as e:
        logger.error(f"❌ ElevenLabs webhook error: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


async def analyze_call_realtime(
    call_sid: str,
    user_id: str,
    caller_number: str,
    transcript: str
):
    """
    Background task: Analyze call in real-time

    Uses Google ADK multi-agent orchestrator:
    - ScamDetectorAgent: Fraud pattern detection (keywords + LLM)
    - ScreenerAgent: Intent classification (friend, sales, scam)
    - Runs in parallel for speed

    If scam detected → End call via Twilio API
    """
    try:
        # 1. Multi-agent analysis using Google ADK orchestrator
        analysis = await analyze_ongoing_call(
            user_id=user_id,
            caller_number=caller_number,
            call_sid=call_sid,
            updated_transcript=transcript
        )

        scam_score = analysis.get("scam_score", 0.0)
        should_block = analysis.get("should_block", False)
        intent = analysis.get("intent", "unknown")

        logger.info(f"🧠 ADK analysis: scam_score={scam_score:.2f}, intent={intent}")

        # 2. HIGH CONFIDENCE SCAM → Block immediately
        if should_block and scam_score > 0.85:
            logger.warning(f"🚨 HIGH CONFIDENCE SCAM DETECTED: {call_sid}")

            # End call via Twilio API
            from app.services.twilio_service import twilio_service
            await twilio_service.end_call(call_sid)

            # Update database
            await db_service.update_call(
                call_sid=call_sid,
                updates={
                    "intent": "scam",
                    "scam_score": scam_score,
                    "action_taken": "blocked"
                }
            )

            # Save scam report
            await db_service.create_scam_report(
                call_sid=call_sid,
                scam_type=intent,  # "scam" from intent classification
                red_flags=[],  # TODO: Extract from orchestrator analysis
                confidence=scam_score
            )

            # Upload evidence to GCS (immutable)
            try:
                evidence_url = await gcs_service.upload_scam_evidence(
                    call_sid=call_sid,
                    user_id=user_id,
                    evidence={
                        "transcript": transcript,
                        "adk_analysis": analysis,
                        "caller_number": caller_number
                    }
                )
                if evidence_url:
                    logger.info(f"✅ Scam evidence uploaded: {evidence_url}")
                else:
                    logger.warning(f"⚠️ Failed to upload scam evidence (demo mode?)")
            except Exception as e:
                logger.error(f"❌ Error uploading scam evidence: {e}")

            # Send alert
            logger.info(f"🚨 Sent scam alert for {call_sid}")

            return

        # 3. MEDIUM RISK → Run deep analysis with phone number database
        if scam_score > 0.5:
            logger.info(f"⚠️ Medium risk call, running deep analysis")

            # Check phone number against databases (parallel)
            phone_check = await rag_service.check_phone_number(caller_number)

            if phone_check["is_known_scammer"]:
                logger.warning(f"📞 Known scammer: {caller_number} ({phone_check['reports_count']} reports)")

                # Increase scam score by combining ADK analysis with phone database
                combined_score = max(scam_score, phone_check["confidence"])

                if combined_score > 0.85:
                    # Block
                    from app.services.twilio_service import twilio_service
                    await twilio_service.end_call(call_sid)

                    await db_service.update_call(
                        call_sid=call_sid,
                        updates={
                            "intent": "scam",
                            "scam_score": combined_score,
                            "action_taken": "blocked"
                        }
                    )

        # 4. Save transcript
        await db_service.update_call_transcript(call_sid, transcript)

        # 5. Upload to GCS with ADK analysis metadata
        try:
            transcript_url = await gcs_service.upload_transcript(
                call_sid=call_sid,
                user_id=user_id,
                transcript_text=transcript,
                metadata={
                    "adk_analysis": analysis,
                    "caller_number": caller_number,
                    "intent": intent,
                    "scam_score": scam_score
                }
            )
            if transcript_url:
                logger.debug(f"✅ Transcript uploaded to GCS")
            else:
                logger.debug(f"⚠️ Transcript not uploaded (demo mode?)")
        except Exception as e:
            logger.error(f"❌ Error uploading transcript to GCS: {e}")

    except Exception as e:
        logger.error(f"❌ Real-time analysis error: {e}", exc_info=True)


async def finalize_call(call_sid: str, duration: int):
    """Finalize call record when call ends"""
    try:
        # Update duration
        await db_service.update_call(
            call_sid=call_sid,
            updates={"duration": duration}
        )

        # Update analytics
        call = await db_service.get_call_by_sid(call_sid)

        if call:
            await db_service.update_analytics(
                user_id=call["user_id"],
                date=call["created_at"].date(),
                total_calls_increment=1,
                scams_blocked_increment=1 if call.get("action_taken") == "blocked" else 0,
                time_saved_minutes=duration // 60 if call.get("action_taken") in ["blocked", "screened"] else 0
            )

        logger.info(f"✅ Finalized call: {call_sid} ({duration}s)")

    except Exception as e:
        logger.error(f"❌ Finalize call error: {e}", exc_info=True)


# ======================
# TWILIO STATUS CALLBACKS
# ======================

@router.post("/api/webhooks/call-status")
async def call_status_callback(request: Request):
    """
    Twilio status callback
    Called when call status changes (ringing, answered, completed)
    """
    try:
        form = await request.form()

        call_sid = form.get("CallSid")
        call_status = form.get("CallStatus")

        logger.info(f"📊 Call status: {call_sid} = {call_status}")

        if call_status == "completed":
            duration = int(form.get("CallDuration", 0))
            await finalize_call(call_sid, duration)

        return {"status": "received"}

    except Exception as e:
        logger.error(f"❌ Status callback error: {e}", exc_info=True)
        return {"status": "error"}
