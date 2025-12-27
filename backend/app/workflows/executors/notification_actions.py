"""
Notification action executors: SMS, Email, Voice Orb alerts
"""

import logging
from typing import Dict, Any

from app.workflows.executors.base import ActionExecutor

logger = logging.getLogger(__name__)


class SendSMSExecutor(ActionExecutor):
    """
    Send SMS notification to user

    Params:
        to: Phone number (default: user's phone)
        message: SMS body (supports {{placeholders}})
        template: Pre-defined template name
    """

    def __init__(self):
        super().__init__("send_sms")
        self.twilio_service = None  # Lazy-loaded

    async def execute(self, context, params: Dict[str, Any]):
        try:
            # Initialize Twilio (lazy)
            if not self.twilio_service:
                from app.services.twilio_service import twilio_service
                self.twilio_service = twilio_service

            # Get message
            if "template" in params:
                message = self._get_template(params["template"], context)
            else:
                message = params.get("message", "")

            # Replace placeholders
            message = self._replace_placeholders(message, context)

            # Get recipient (default: user's phone from database)
            to_number = params.get("to")
            if not to_number:
                # TODO: Get user's phone from database
                logger.warning("No recipient phone number specified")
                return {
                    "success": False,
                    "message": "No recipient specified",
                    "data": None
                }

            # Send SMS
            self.twilio_service.send_sms(to_number, message)

            logger.info(f"✅ SMS sent to {to_number}")

            return {
                "success": True,
                "message": "SMS sent successfully",
                "data": {
                    "to": to_number,
                    "message": message
                }
            }

        except Exception as e:
            logger.error(f"❌ Failed to send SMS: {e}")
            return {
                "success": False,
                "message": f"SMS error: {str(e)}",
                "data": None
            }

    def _get_template(self, template_name: str, context) -> str:
        """Get predefined message template"""
        templates = {
            "missed_call": "Missed call from {{caller_name}} at {{time}}",
            "emergency": "🚨 EMERGENCY CALL from {{caller_name}}",
            "appointment_confirmed": "✓ Appointment scheduled with {{caller_name}}",
            "scam_blocked": "🚫 Blocked scam call from {{caller_number}}"
        }

        return templates.get(template_name, "Call from {{caller_name}}")


class SendEmailExecutor(ActionExecutor):
    """
    Send email summary to user

    Params:
        to: Email address
        subject: Email subject (supports {{placeholders}})
        body: Email body (supports {{placeholders}})
        template: Pre-defined template name
    """

    def __init__(self):
        super().__init__("send_email")
        self.gmail_service = None  # Lazy-loaded

    async def execute(self, context, params: Dict[str, Any]):
        try:
            # Initialize Gmail API (lazy)
            if not self.gmail_service:
                self.gmail_service = self._init_gmail_service()

            # Get email content
            subject = self._replace_placeholders(
                params.get("subject", "Call from {{caller_name}}"),
                context
            )

            if "template" in params:
                body = self._get_email_template(params["template"], context)
            else:
                body = self._replace_placeholders(params.get("body", ""), context)

            to_email = params.get("to")
            if not to_email:
                logger.warning("No recipient email specified")
                return {"success": False, "message": "No recipient"}

            # Send email via Gmail API
            message = self._create_message(to_email, subject, body)
            self.gmail_service.users().messages().send(
                userId="me",
                body=message
            ).execute()

            logger.info(f"✅ Email sent to {to_email}: {subject}")

            return {
                "success": True,
                "message": "Email sent successfully",
                "data": {
                    "to": to_email,
                    "subject": subject
                }
            }

        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            return {
                "success": False,
                "message": f"Email error: {str(e)}",
                "data": None
            }

    def _init_gmail_service(self):
        """Initialize Gmail API client"""
        try:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
            from app.core.config import settings

            creds = service_account.Credentials.from_service_account_file(
                settings.GOOGLE_APPLICATION_CREDENTIALS,
                scopes=['https://www.googleapis.com/auth/gmail.send']
            )

            return build('gmail', 'v1', credentials=creds)

        except Exception as e:
            logger.error(f"Failed to initialize Gmail: {e}")
            return None

    def _create_message(self, to: str, subject: str, body: str) -> Dict:
        """Create email message for Gmail API"""
        import base64
        from email.mime.text import MIMEText

        message = MIMEText(body)
        message['to'] = to
        message['subject'] = subject

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        return {'raw': raw}

    def _get_email_template(self, template_name: str, context) -> str:
        """Get predefined email template"""
        templates = {
            "call_summary": f"""
Call Summary

From: {{{{caller_name}}}} ({{{{caller_number}}}})
Time: {{{{time}}}}
Intent: {{{{intent}}}}

Transcript:
{{{{transcript}}}}

---
AI Gatekeeper automatically screened this call.
            """,

            "business_lead": f"""
New Business Lead

Contact: {{{{caller_name}}}}
Phone: {{{{caller_number}}}}
Interest: {{{{intent}}}}

Summary:
{{{{transcript}}}}

Next Steps:
• Follow up within 24 hours
• Add to CRM if qualified

---
Automatically captured by AI Gatekeeper
            """
        }

        template = templates.get(template_name, "Call from {{caller_name}}\n\n{{transcript}}")
        return self._replace_placeholders(template, context)


class VoiceOrbAlertExecutor(ActionExecutor):
    """
    Send alert to Voice Orb frontend

    Params:
        color: Alert color (red, yellow, green)
        pulse: Pulse speed (slow, medium, fast)
        sound: Alert sound name
        message: Alert message
    """

    def __init__(self):
        super().__init__("voice_orb_alert")

    async def execute(self, context, params: Dict[str, Any]):
        try:
            # Broadcast to frontend via WebSocket
            alert_data = {
                "type": "orb_alert",
                "call_sid": context.call_sid,
                "color": params.get("color", "yellow"),
                "pulse": params.get("pulse", "medium"),
                "sound": params.get("sound"),
                "message": self._replace_placeholders(
                    params.get("message", "Call from {{caller_name}}"),
                    context
                ),
                "priority": params.get("priority", "normal")
            }

            # TODO: Broadcast to frontend WebSocket
            # For now, just log
            logger.info(f"🌀 Voice Orb Alert: {alert_data['message']}")

            return {
                "success": True,
                "message": "Voice Orb alert sent",
                "data": alert_data
            }

        except Exception as e:
            logger.error(f"❌ Failed to send Voice Orb alert: {e}")
            return {
                "success": False,
                "message": f"Voice Orb error: {str(e)}",
                "data": None
            }
