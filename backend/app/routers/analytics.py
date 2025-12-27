"""
Analytics Router: Call statistics and insights
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats():
    """Get overview statistics"""
    # TODO: Implement
    return {
        "total_calls": 0,
        "scams_blocked": 0,
        "sales_blocked": 0,
        "contacts_passed": 0
    }
