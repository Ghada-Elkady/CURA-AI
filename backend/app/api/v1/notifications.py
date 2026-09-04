"""Notifications API router — list, mark-read, and WebSocket push."""

from __future__ import annotations

import json
import uuid
from typing import Dict

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token, get_current_user
from app.models.notification import Notification
from app.models.user import User

router = APIRouter()

# Simple in-memory connection registry: user_id -> WebSocket
_connections: Dict[str, WebSocket] = {}


async def notify_user(user_id: str, title: str, body: str) -> None:
    """Push a notification to a connected user (best-effort)."""
    ws = _connections.get(user_id)
    if ws:
        try:
            await ws.send_text(json.dumps({"title": title, "body": body}))
        except Exception:
            _connections.pop(user_id, None)


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    """Real-time notification channel authenticated via JWT query param."""
    try:
        payload = decode_token(token)
        user_id = payload.get("sub", "")
    except Exception:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    _connections[user_id] = websocket
    try:
        while True:
            # Keep connection alive; client sends pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        _connections.pop(user_id, None)


@router.get("")
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    """Return the current user's notifications, newest first."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    notifications = result.scalars().all()
    return [
        {
            "id": str(n.id),
            "title": n.title,
            "body": n.body,
            "notification_type": n.notification_type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
        }
        for n in notifications
    ]


@router.put("/{notification_id}/read")
async def mark_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a single notification as read."""
    result = await db.execute(
        select(Notification)
        .where(Notification.id == notification_id)
        .where(Notification.user_id == current_user.id)
    )
    notif = result.scalar_one_or_none()
    if notif:
        notif.is_read = True
        await db.flush()
    return {"message": "Marked as read"}
