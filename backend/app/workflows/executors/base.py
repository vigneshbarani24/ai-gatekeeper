"""
Base executor class for workflow actions
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class ActionExecutor(ABC):
    """Base class for all action executors"""

    def __init__(self, action_name: str):
        self.action_name = action_name

    @abstractmethod
    async def execute(self, context: Any, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the action

        Args:
            context: CallContext object
            params: Action parameters from workflow config

        Returns:
            {
                "success": bool,
                "message": str,
                "data": Any
            }
        """
        pass

    def _replace_placeholders(self, template: str, context: Any, params: Dict = None) -> str:
        """
        Replace {{placeholder}} in templates with context values

        Example:
            "Call from {{caller_name}}" → "Call from John Smith"
        """
        replacements = {
            "caller_name": context.caller_name or "Unknown",
            "caller_number": context.caller_number,
            "intent": context.intent,
            "transcript": context.transcript,
            "time": self._get_current_time(),
            "user_id": context.user_id
        }

        # Add custom params
        if params:
            replacements.update(params)

        result = template
        for key, value in replacements.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))

        return result

    def _get_current_time(self) -> str:
        """Get current time formatted"""
        from datetime import datetime
        return datetime.now().strftime("%I:%M %p")


class NoOpExecutor(ActionExecutor):
    """Placeholder executor for actions not yet implemented"""

    async def execute(self, context, params):
        logger.warning(f"⚠️ NoOp executor for {self.action_name} (not implemented)")
        return {
            "success": True,
            "message": f"{self.action_name} (not implemented)",
            "data": params
        }
