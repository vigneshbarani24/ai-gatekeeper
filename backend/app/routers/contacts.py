"""
Contacts Router: Manage whitelisted contacts
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_contacts():
    """List user's whitelisted contacts"""
    # TODO: Implement
    return {"contacts": []}


@router.post("/")
async def add_contact():
    """Add new contact to whitelist"""
    # TODO: Implement
    return {"status": "created"}
