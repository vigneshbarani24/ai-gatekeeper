"""
Workflow Engine: Intelligent call routing and action execution
Routes calls to different workflows based on category (personal, business, emergency)
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class WorkflowCategory(str, Enum):
    """Call categories for workflow routing"""
    PERSONAL_FRIEND = "personal_friend"
    PERSONAL_FAMILY = "personal_family"
    PERSONAL_DOCTOR = "personal_doctor"
    BUSINESS_SALES = "business_sales"
    BUSINESS_SUPPORT = "business_support"
    BUSINESS_PARTNERSHIP = "business_partnership"
    APPOINTMENT = "appointment"
    EMERGENCY = "emergency"
    SCAM = "scam"
    UNKNOWN = "unknown"


class ActionType(str, Enum):
    """Available workflow actions"""
    # Call routing
    RING_USER = "ring_user"
    RING_USER_IMMEDIATELY = "ring_user_immediately"
    TRANSFER_TO_VOICEMAIL = "transfer_to_voicemail"
    HANGUP = "hangup"

    # Notifications
    SEND_SMS = "send_sms"
    SEND_SMS_ALERT = "send_sms_alert"
    SEND_EMAIL = "send_email"
    VOICE_ORB_ALERT = "voice_orb_alert"

    # Calendar
    CHECK_CALENDAR = "check_calendar"
    CREATE_CALENDAR_EVENT = "create_calendar_event"
    RESCHEDULE_EVENT = "reschedule_event"

    # Business automation
    GOOGLE_SHEETS_LOG = "google_sheets"
    MCP_TASK = "mcp_task"
    SALESFORCE_LEAD = "salesforce_lead"

    # AI actions
    AI_NEGOTIATE_TIME = "ai_negotiate_time"
    AI_QUALIFY_LEAD = "ai_qualify_lead"
    AI_SUMMARIZE = "ai_summarize"


@dataclass
class WorkflowTrigger:
    """Conditions that trigger a workflow"""
    intent: Optional[str] = None
    confidence_threshold: float = 0.0
    keywords: List[str] = None
    contacts: List[str] = None  # Contact names that trigger this
    time_of_day: Optional[str] = None  # "morning", "afternoon", "evening"
    custom_condition: Optional[str] = None  # Python expression


@dataclass
class WorkflowAction:
    """Single action in a workflow"""
    type: ActionType
    params: Dict[str, Any]
    condition: Optional[str] = None  # Execute only if condition met
    on_success: Optional[str] = None  # Next action if successful
    on_failure: Optional[str] = None  # Next action if failed


@dataclass
class Workflow:
    """Complete workflow configuration"""
    id: str
    name: str
    category: WorkflowCategory
    triggers: WorkflowTrigger
    actions: List[WorkflowAction]
    priority: int = 5  # 1-10 (10 = highest priority)
    enabled: bool = True


@dataclass
class CallContext:
    """Context for workflow execution"""
    call_sid: str
    user_id: str
    caller_number: str
    caller_name: Optional[str]
    intent: str
    intent_confidence: float
    transcript: str
    scam_score: float
    is_emergency: bool
    metadata: Dict[str, Any]


class WorkflowEngine:
    """
    Executes workflows based on call category

    Flow:
    1. Call comes in → ADK agents classify intent
    2. Match intent to workflow (based on triggers)
    3. Execute actions sequentially or in parallel
    4. Log results, update Voice Orb
    """

    def __init__(self):
        self.workflows: Dict[str, Workflow] = {}
        self.action_executors = {}  # Lazy-loaded

    def register_workflow(self, workflow: Workflow) -> None:
        """Register a new workflow"""
        self.workflows[workflow.id] = workflow
        logger.info(f"✅ Registered workflow: {workflow.name} ({workflow.category})")

    def load_workflows_from_config(self, config: Dict) -> None:
        """Load workflows from JSON configuration"""
        for wf_id, wf_data in config.get("workflows", {}).items():
            workflow = self._parse_workflow_config(wf_id, wf_data)
            self.register_workflow(workflow)

    def _parse_workflow_config(self, wf_id: str, config: Dict) -> Workflow:
        """Parse JSON config into Workflow object"""
        # Parse triggers
        triggers = WorkflowTrigger(
            intent=config["triggers"].get("intent"),
            confidence_threshold=float(config["triggers"].get("confidence", "0").strip(">")),
            keywords=config["triggers"].get("keywords"),
            contacts=config["triggers"].get("contacts"),
            time_of_day=config["triggers"].get("time_of_day")
        )

        # Parse actions
        actions = [
            WorkflowAction(
                type=ActionType(action["type"]),
                params=action.get("params", action.get("data", {})),
                condition=action.get("condition")
            )
            for action in config.get("actions", [])
        ]

        return Workflow(
            id=wf_id,
            name=config.get("name", wf_id),
            category=WorkflowCategory(config.get("category", "unknown")),
            triggers=triggers,
            actions=actions,
            priority=config.get("priority", 5),
            enabled=config.get("enabled", True)
        )

    async def execute_for_call(self, context: CallContext) -> Dict[str, Any]:
        """
        Execute appropriate workflow for a call

        Args:
            context: Call context with intent, caller info, etc.

        Returns:
            Execution results:
            {
                "workflow_executed": "personal_friend",
                "actions_completed": ["ring_user", "send_sms"],
                "final_action": "passed_through",
                "execution_time_ms": 234
            }
        """
        import time
        start_time = time.time()

        logger.info(f"[WorkflowEngine] Executing workflow for call {context.call_sid}")
        logger.info(f"  Intent: {context.intent} ({context.intent_confidence:.2f})")
        logger.info(f"  Caller: {context.caller_name or context.caller_number}")

        # Find matching workflow
        workflow = self._match_workflow(context)

        if not workflow:
            logger.warning(f"⚠️ No workflow matched for intent: {context.intent}")
            # Default: screen and ask user
            return {
                "workflow_executed": None,
                "actions_completed": [],
                "final_action": "screen_continue"
            }

        logger.info(f"✅ Matched workflow: {workflow.name}")

        # Execute actions
        results = []
        for action in workflow.actions:
            # Check condition (if any)
            if action.condition and not self._evaluate_condition(action.condition, context):
                logger.debug(f"Skipping action {action.type} (condition not met)")
                continue

            # Execute action
            try:
                result = await self._execute_action(action, context)
                results.append({
                    "action": action.type.value,
                    "success": result.get("success", False),
                    "data": result
                })
                logger.info(f"  ✓ {action.type.value}: {result.get('message', 'OK')}")

            except Exception as e:
                logger.error(f"  ✗ {action.type.value} failed: {e}")
                results.append({
                    "action": action.type.value,
                    "success": False,
                    "error": str(e)
                })

        execution_time = int((time.time() - start_time) * 1000)

        return {
            "workflow_executed": workflow.id,
            "workflow_name": workflow.name,
            "category": workflow.category.value,
            "actions_completed": [r["action"] for r in results if r["success"]],
            "actions_failed": [r["action"] for r in results if not r["success"]],
            "final_action": self._determine_final_action(results),
            "execution_time_ms": execution_time,
            "results": results
        }

    def _match_workflow(self, context: CallContext) -> Optional[Workflow]:
        """Find best matching workflow for call context"""
        matches = []

        for workflow in self.workflows.values():
            if not workflow.enabled:
                continue

            score = self._calculate_match_score(workflow, context)
            if score > 0:
                matches.append((score, workflow))

        if not matches:
            return None

        # Return highest priority match
        matches.sort(key=lambda x: (x[0], x[1].priority), reverse=True)
        return matches[0][1]

    def _calculate_match_score(self, workflow: Workflow, context: CallContext) -> float:
        """Calculate how well a workflow matches the context"""
        score = 0.0
        triggers = workflow.triggers

        # Intent match
        if triggers.intent and triggers.intent == context.intent:
            if context.intent_confidence >= triggers.confidence_threshold:
                score += 10.0

        # Keyword match
        if triggers.keywords:
            transcript_lower = context.transcript.lower()
            matched_keywords = sum(1 for kw in triggers.keywords if kw.lower() in transcript_lower)
            score += matched_keywords * 2.0

        # Contact match
        if triggers.contacts and context.caller_name:
            if context.caller_name in triggers.contacts:
                score += 15.0  # High priority for known contacts

        # Emergency override
        if context.is_emergency and workflow.category == WorkflowCategory.EMERGENCY:
            score += 100.0  # Always prioritize emergency

        return score

    def _evaluate_condition(self, condition: str, context: CallContext) -> bool:
        """Evaluate a condition string (simple Python expression)"""
        try:
            # Safe evaluation with limited context
            safe_vars = {
                "intent": context.intent,
                "confidence": context.intent_confidence,
                "scam_score": context.scam_score,
                "is_emergency": context.is_emergency,
                "caller_name": context.caller_name
            }
            return eval(condition, {"__builtins__": {}}, safe_vars)
        except Exception as e:
            logger.error(f"Failed to evaluate condition '{condition}': {e}")
            return False

    async def _execute_action(self, action: WorkflowAction, context: CallContext) -> Dict:
        """Execute a single action"""
        executor_name = action.type.value

        # Lazy-load executor
        if executor_name not in self.action_executors:
            executor = self._get_action_executor(action.type)
            self.action_executors[executor_name] = executor

        executor = self.action_executors[executor_name]

        # Execute with context + params
        return await executor.execute(context, action.params)

    def _get_action_executor(self, action_type: ActionType):
        """Get executor for action type (lazy loading)"""
        # Import executors only when needed
        if action_type in [ActionType.RING_USER, ActionType.RING_USER_IMMEDIATELY]:
            from app.workflows.executors.call_actions import RingUserExecutor
            return RingUserExecutor()

        elif action_type in [ActionType.SEND_SMS, ActionType.SEND_SMS_ALERT]:
            from app.workflows.executors.notification_actions import SendSMSExecutor
            return SendSMSExecutor()

        elif action_type == ActionType.GOOGLE_SHEETS_LOG:
            from app.workflows.executors.business_actions import GoogleSheetsExecutor
            return GoogleSheetsExecutor()

        elif action_type == ActionType.CREATE_CALENDAR_EVENT:
            from app.workflows.executors.calendar_actions import CreateEventExecutor
            return CreateEventExecutor()

        elif action_type == ActionType.SEND_EMAIL:
            from app.workflows.executors.notification_actions import SendEmailExecutor
            return SendEmailExecutor()

        elif action_type == ActionType.MCP_TASK:
            from app.workflows.executors.mcp_actions import MCPTaskExecutor
            return MCPTaskExecutor()

        else:
            # Placeholder for unimplemented actions
            from app.workflows.executors.base import NoOpExecutor
            return NoOpExecutor(action_type.value)

    def _determine_final_action(self, results: List[Dict]) -> str:
        """Determine final call routing based on action results"""
        for result in results:
            action = result["action"]
            if action in ["ring_user", "ring_user_immediately"] and result["success"]:
                return "passed_through"
            elif action == "hangup" and result["success"]:
                return "blocked"

        return "screen_continue"


# Singleton instance
workflow_engine = WorkflowEngine()


# Helper function for easy access
async def execute_workflow_for_call(
    call_sid: str,
    user_id: str,
    caller_number: str,
    caller_name: Optional[str],
    intent: str,
    intent_confidence: float,
    transcript: str,
    scam_score: float = 0.0,
    is_emergency: bool = False,
    metadata: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Simple API for executing workflows

    Usage:
        result = await execute_workflow_for_call(
            call_sid="CA123",
            user_id="user_123",
            caller_number="+15551234567",
            caller_name="John Smith",
            intent="friend",
            intent_confidence=0.95,
            transcript="Hey, it's John...",
        )
    """
    context = CallContext(
        call_sid=call_sid,
        user_id=user_id,
        caller_number=caller_number,
        caller_name=caller_name,
        intent=intent,
        intent_confidence=intent_confidence,
        transcript=transcript,
        scam_score=scam_score,
        is_emergency=is_emergency,
        metadata=metadata or {}
    )

    return await workflow_engine.execute_for_call(context)
