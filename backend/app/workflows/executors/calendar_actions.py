"""
Calendar action executors: Google Calendar integration
"""

import logging
from typing import Dict, Any
from datetime import datetime, timedelta

from app.workflows.executors.base import ActionExecutor

logger = logging.getLogger(__name__)


class CreateEventExecutor(ActionExecutor):
    """
    Create Google Calendar event

    Params:
        title: Event title
        start_time: ISO format or relative ("now", "+1 hour")
        duration_minutes: Event duration
        attendees: List of email addresses
        description: Event description
    """

    def __init__(self):
        super().__init__("create_calendar_event")
        self.calendar_service = None

    async def execute(self, context, params: Dict[str, Any]):
        try:
            # Initialize Google Calendar (lazy)
            if not self.calendar_service:
                self.calendar_service = self._init_calendar_service()

            # Parse title
            title = self._replace_placeholders(
                params.get("title", "Call with {{caller_name}}"),
                context
            )

            # Parse time
            start_time = self._parse_time(params.get("start_time", "now"))
            duration = params.get("duration_minutes", 30)
            end_time = start_time + timedelta(minutes=duration)

            # Create event
            event = {
                'summary': title,
                'description': self._replace_placeholders(
                    params.get("description", ""),
                    context
                ),
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': 'America/New_York',
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': 'America/New_York',
                },
                'attendees': [
                    {'email': email} for email in params.get("attendees", [])
                ],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'popup', 'minutes': 10},
                    ],
                },
            }

            created_event = self.calendar_service.events().insert(
                calendarId='primary',
                body=event,
                sendUpdates='all'  # Send email invites
            ).execute()

            logger.info(f"✅ Created calendar event: {title}")

            return {
                "success": True,
                "message": f"Event created: {title}",
                "data": {
                    "event_id": created_event["id"],
                    "title": title,
                    "start": start_time.isoformat(),
                    "link": created_event.get("htmlLink")
                }
            }

        except Exception as e:
            logger.error(f"❌ Failed to create calendar event: {e}")
            return {
                "success": False,
                "message": f"Calendar error: {str(e)}",
                "data": None
            }

    def _init_calendar_service(self):
        """Initialize Google Calendar API"""
        try:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
            from app.core.config import settings

            creds = service_account.Credentials.from_service_account_file(
                settings.GOOGLE_APPLICATION_CREDENTIALS,
                scopes=['https://www.googleapis.com/auth/calendar']
            )

            return build('calendar', 'v3', credentials=creds)

        except Exception as e:
            logger.error(f"Failed to initialize Google Calendar: {e}")
            return None

    def _parse_time(self, time_str: str) -> datetime:
        """Parse time string to datetime"""
        if time_str == "now":
            return datetime.now()
        elif time_str.startswith("+"):
            # Relative time (e.g., "+1 hour", "+30 minutes")
            # Simple parser
            return datetime.now() + timedelta(hours=1)
        else:
            # ISO format
            return datetime.fromisoformat(time_str)


class CheckCalendarExecutor(ActionExecutor):
    """
    Check calendar availability

    Params:
        date: Date to check (ISO format or "today", "tomorrow")
        time_range: "morning", "afternoon", "evening" or specific time
    """

    def __init__(self):
        super().__init__("check_calendar")
        self.calendar_service = None

    async def execute(self, context, params: Dict[str, Any]):
        try:
            if not self.calendar_service:
                from app.workflows.executors.calendar_actions import CreateEventExecutor
                self.calendar_service = CreateEventExecutor()._init_calendar_service()

            # Parse date range
            date = params.get("date", "today")
            start, end = self._parse_date_range(date)

            # Check free/busy
            body = {
                "timeMin": start.isoformat() + 'Z',
                "timeMax": end.isoformat() + 'Z',
                "items": [{"id": "primary"}]
            }

            result = self.calendar_service.freebusy().query(body=body).execute()
            busy_times = result['calendars']['primary']['busy']

            is_free = len(busy_times) == 0

            logger.info(f"📅 Calendar check: {date} - {'Free' if is_free else 'Busy'}")

            return {
                "success": True,
                "message": f"Calendar checked: {'Free' if is_free else 'Busy'}",
                "data": {
                    "date": date,
                    "is_free": is_free,
                    "busy_slots": busy_times
                }
            }

        except Exception as e:
            logger.error(f"❌ Failed to check calendar: {e}")
            return {
                "success": False,
                "message": f"Calendar check error: {str(e)}",
                "data": None
            }

    def _parse_date_range(self, date_str: str):
        """Parse date string to datetime range"""
        now = datetime.now()

        if date_str == "today":
            start = now.replace(hour=9, minute=0, second=0)
            end = now.replace(hour=17, minute=0, second=0)
        elif date_str == "tomorrow":
            tomorrow = now + timedelta(days=1)
            start = tomorrow.replace(hour=9, minute=0, second=0)
            end = tomorrow.replace(hour=17, minute=0, second=0)
        else:
            # Default: next hour
            start = now
            end = now + timedelta(hours=1)

        return start, end
