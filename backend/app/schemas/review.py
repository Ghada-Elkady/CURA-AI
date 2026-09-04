"""Pydantic schemas for review endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CreateReviewRequest(BaseModel):
    """Request body to submit a review for a completed appointment."""

    appointment_id: uuid.UUID
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class ReviewResponse(BaseModel):
    """Review details returned in responses."""

    id: uuid.UUID
    appointment_id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    rating: int
    comment: str | None
    created_at: datetime
    patient_name: str | None = None

    model_config = {"from_attributes": True}
