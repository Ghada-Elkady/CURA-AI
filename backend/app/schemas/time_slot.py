"""Pydantic schemas for time slot endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class TimeSlotResponse(BaseModel):
    """Available time slot details."""

    id: uuid.UUID
    doctor_id: uuid.UUID
    slot_datetime: datetime
    duration_minutes: int
    is_booked: bool

    model_config = {"from_attributes": True}
