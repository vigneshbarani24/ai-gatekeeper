"""
Calls Router: Call history and analytics
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_calls():
    """List call history"""
    # TODO: Implement
    return {"calls": []}


@router.get("/{call_id}")
async def get_call(call_id: str):
    """Get call details + transcript"""
    # TODO: Implement
    return {"call_id": call_id}
