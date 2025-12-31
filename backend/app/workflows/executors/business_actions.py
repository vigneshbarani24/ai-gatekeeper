"""
Business action executors: Google Sheets, CRM logging, etc.
"""

import logging
from typing import Dict, Any
from datetime import datetime

from app.workflows.executors.base import ActionExecutor

logger = logging.getLogger(__name__)


class GoogleSheetsExecutor(ActionExecutor):
    """
    Log call data to Google Sheets

    Params:
        spreadsheet_id: Google Sheets ID
        sheet_name: Sheet tab name (e.g., "Leads")
        data: Dict of column:value mappings
    """

    def __init__(self):
        super().__init__("google_sheets")
        self.sheets_service = None  # Lazy-loaded

    async def execute(self, context, params: Dict[str, Any]):
        try:
            # Initialize Google Sheets API (lazy)
            if not self.sheets_service:
                self.sheets_service = self._init_sheets_service()

            spreadsheet_id = params.get("spreadsheet_id")
            sheet_name = params.get("sheet_name", "Sheet1")
            data = params.get("data", {})

            # Replace placeholders in data values
            processed_data = {
                col: self._replace_placeholders(str(val), context)
                for col, val in data.items()
            }

            # Add timestamp
            processed_data["Timestamp"] = datetime.now().isoformat()

            # Append row to sheet
            range_name = f"{sheet_name}!A:Z"
            values = [list(processed_data.values())]

            body = {"values": values}

            result = self.sheets_service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption="USER_ENTERED",
                body=body
            ).execute()

            logger.info(f"✅ Logged to Google Sheets: {sheet_name} (row {result.get('updates', {}).get('updatedRows')})")

            return {
                "success": True,
                "message": f"Logged to Google Sheets: {sheet_name}",
                "data": {
                    "spreadsheet_id": spreadsheet_id,
                    "sheet_name": sheet_name,
                    "row_added": result.get('updates', {}).get('updatedRows'),
                    "data_logged": processed_data
                }
            }

        except Exception as e:
            logger.error(f"❌ Failed to log to Google Sheets: {e}")
            return {
                "success": False,
                "message": f"Google Sheets error: {str(e)}",
                "data": None
            }

    def _init_sheets_service(self):
        """Initialize Google Sheets API client"""
        try:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
            from app.core.config import settings

            creds = service_account.Credentials.from_service_account_file(
                settings.GOOGLE_APPLICATION_CREDENTIALS,
                scopes=['https://www.googleapis.com/auth/spreadsheets']
            )

            return build('sheets', 'v4', credentials=creds)

        except Exception as e:
            logger.error(f"Failed to initialize Google Sheets: {e}")
            return None


class SalesforceLeadExecutor(ActionExecutor):
    """Create lead in Salesforce CRM (placeholder)"""

    def __init__(self):
        super().__init__("salesforce_lead")

    async def execute(self, context, params):
        # TODO: Implement Salesforce API integration
        logger.info(f"[Salesforce] Would create lead for {context.caller_name}")

        return {
            "success": True,
            "message": "Salesforce lead creation (mock)",
            "data": {
                "lead_id": "00Q000000000000",
                "name": context.caller_name,
                "phone": context.caller_number
            }
        }
