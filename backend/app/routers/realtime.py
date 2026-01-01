"""
Real-time Server-Sent Events (SSE) for live UI updates

Provides live updates to frontend when:
- Calls are created/updated
- Scams are blocked
- Webhooks are executed
- Analytics change
"""

import logging
import asyncio
import json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from typing import Dict, Any, List
from datetime import datetime
from collections import defaultdict

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================================================
# SSE Broadcaster
# ============================================================================

class EventBroadcaster:
    """
    Broadcasts events to all connected SSE clients

    Thread-safe event broadcasting for real-time UI updates
    """

    def __init__(self):
        self.listeners: Dict[str, List[asyncio.Queue]] = defaultdict(list)
        self._lock = asyncio.Lock()

    async def subscribe(self, user_id: str) -> asyncio.Queue:
        """Subscribe to events for a specific user"""
        queue = asyncio.Queue(maxsize=100)
        async with self._lock:
            self.listeners[user_id].append(queue)
        logger.info(f"📡 New SSE subscriber for user {user_id}. Total: {len(self.listeners[user_id])}")
        return queue

    async def unsubscribe(self, user_id: str, queue: asyncio.Queue):
        """Unsubscribe from events"""
        async with self._lock:
            if user_id in self.listeners and queue in self.listeners[user_id]:
                self.listeners[user_id].remove(queue)
                logger.info(f"📡 SSE unsubscribed for user {user_id}. Remaining: {len(self.listeners[user_id])}")

    async def broadcast(self, user_id: str, event_type: str, data: Dict[str, Any]):
        """
        Broadcast event to all subscribers for a user

        Args:
            user_id: User ID to broadcast to
            event_type: Type of event (call_created, scam_blocked, etc.)
            data: Event payload
        """
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }

        async with self._lock:
            if user_id not in self.listeners or not self.listeners[user_id]:
                logger.debug(f"📡 No SSE listeners for user {user_id}")
                return

            # Broadcast to all queues for this user
            for queue in self.listeners[user_id]:
                try:
                    await asyncio.wait_for(queue.put(event), timeout=1.0)
                except asyncio.TimeoutError:
                    logger.warning(f"⚠️ SSE queue full for user {user_id}, dropping event")
                except Exception as e:
                    logger.error(f"❌ Error broadcasting to queue: {e}")

        logger.info(f"📡 Broadcast {event_type} to {len(self.listeners[user_id])} listeners for user {user_id}")

    async def broadcast_to_all(self, event_type: str, data: Dict[str, Any]):
        """Broadcast event to ALL connected users"""
        async with self._lock:
            for user_id in list(self.listeners.keys()):
                await self.broadcast(user_id, event_type, data)


# Global broadcaster instance
broadcaster = EventBroadcaster()


# ============================================================================
# SSE Endpoint
# ============================================================================

async def event_stream(user_id: str, request: Request):
    """
    Server-Sent Events stream for real-time updates

    Clients connect to this endpoint and receive live updates
    """
    queue = await broadcaster.subscribe(user_id)

    try:
        # Send initial connection confirmation
        yield f"event: connected\ndata: {json.dumps({'user_id': user_id, 'status': 'connected'})}\n\n"

        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                logger.info(f"📡 SSE client disconnected: {user_id}")
                break

            try:
                # Wait for event with timeout
                event = await asyncio.wait_for(queue.get(), timeout=30.0)

                # Format SSE message
                event_type = event.get("type", "message")
                event_data = json.dumps(event)

                yield f"event: {event_type}\ndata: {event_data}\n\n"

            except asyncio.TimeoutError:
                # Send keepalive ping every 30 seconds
                yield f": keepalive\n\n"

    except Exception as e:
        logger.error(f"❌ SSE stream error for user {user_id}: {e}", exc_info=True)
    finally:
        await broadcaster.unsubscribe(user_id, queue)


@router.get("/api/realtime/events/{user_id}")
async def sse_endpoint(user_id: str, request: Request):
    """
    Server-Sent Events endpoint for real-time updates

    Connect to this endpoint to receive live updates:
    ```javascript
    const eventSource = new EventSource('/api/realtime/events/user_123');
    eventSource.addEventListener('call_created', (e) => {
        const data = JSON.parse(e.data);
        console.log('New call:', data);
    });
    ```

    Events emitted:
    - call_created: New call received
    - call_updated: Call status changed
    - scam_blocked: Scam detected and blocked
    - tool_executed: Webhook tool called
    - analytics_updated: Stats changed
    """
    return StreamingResponse(
        event_stream(user_id, request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
            "Connection": "keep-alive"
        }
    )


# ============================================================================
# Broadcast Helper Functions
# ============================================================================

async def broadcast_call_created(user_id: str, call: Dict[str, Any]):
    """Broadcast that a new call was created"""
    await broadcaster.broadcast(user_id, "call_created", {
        "call_id": call.get("id"),
        "caller_number": call.get("caller_number"),
        "status": call.get("status"),
        "timestamp": call.get("created_at")
    })


async def broadcast_call_updated(user_id: str, call_sid: str, updates: Dict[str, Any]):
    """Broadcast that a call was updated"""
    await broadcaster.broadcast(user_id, "call_updated", {
        "call_sid": call_sid,
        "updates": updates
    })


async def broadcast_scam_blocked(user_id: str, call_sid: str, scam_type: str, confidence: float):
    """Broadcast that a scam was blocked"""
    await broadcaster.broadcast(user_id, "scam_blocked", {
        "call_sid": call_sid,
        "scam_type": scam_type,
        "confidence": confidence,
        "action": "blocked"
    })


async def broadcast_tool_executed(user_id: str, tool_name: str, result: Dict[str, Any]):
    """Broadcast that a webhook tool was executed"""
    await broadcaster.broadcast(user_id, "tool_executed", {
        "tool": tool_name,
        "result": result
    })


async def broadcast_analytics_update(user_id: str, metrics: Dict[str, Any]):
    """Broadcast that analytics were updated"""
    await broadcaster.broadcast(user_id, "analytics_updated", metrics)


# ============================================================================
# Health Check
# ============================================================================

@router.get("/api/realtime/health")
async def realtime_health():
    """
    Health check for realtime service

    Returns:
        Active connections count and status
    """
    total_connections = sum(len(queues) for queues in broadcaster.listeners.values())
    total_users = len(broadcaster.listeners)

    return {
        "status": "healthy",
        "active_connections": total_connections,
        "active_users": total_users,
        "service": "SSE Broadcaster"
    }
