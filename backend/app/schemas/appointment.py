"""Pydantic schemas for appointment endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from app.schemas.doctor import DoctorListItem
from app.schemas.time_slot import TimeSlotResponse
from app.schemas.user import UserProfile


class CreateAppointmentRequest(BaseModel):
    """Request body to book a new appointment."""

    doctor_id: uuid.UUID
    slot_id: uuid.UUID
    consultation_type: str = Field(..., pattern="^(in_person|online)$")
    notes: str | None = Field(default=None, max_length=1000)


class RescheduleRequest(BaseModel):
    """Request body to reschedule an existing appointment."""

    new_slot_id: uuid.UUID


class AppointmentSlotInfo(BaseModel):
    """Minimal slot info embedded in appointment responses."""

    id: uuid.UUID
    slot_datetime: datetime
    duration_minutes: int

    model_config = {"from_attributes": True}


class AppointmentDoctorInfo(BaseModel):
    """Doctor info embedded in appointment responses."""

    id: uuid.UUID
    full_name: str
    avatar_url: str | None
    specialty_name: str | None

    model_config = {"from_attributes": True}


class AppointmentResponse(BaseModel):
    """Full appointment details."""

    id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    slot_id: uuid.UUID
    consultation_type: str
    status: str
    notes: str | None
    created_at: datetime
    updated_at: datetime
    # Embedded nested info
    slot: AppointmentSlotInfo | None = None
    doctor_info: AppointmentDoctorInfo | None = None

    model_config = {"from_attributes": True}


class AppointmentsByStatus(BaseModel):
    """Patient appointments grouped by status category."""

    upcoming: List[AppointmentResponse] = []
    past: List[AppointmentResponse] = []
    cancelled: List[AppointmentResponse] = []
