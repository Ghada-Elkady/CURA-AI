"""Pydantic schemas for user endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    """Full user details returned in responses."""

    id: uuid.UUID
    email: EmailStr
    full_name: str
    phone: str | None
    avatar_url: str | None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Fields a user may update on their own profile."""

    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=20)
    avatar_url: str | None = Field(default=None, max_length=500)


class UserProfile(BaseModel):
    """Public-facing profile (subset of UserResponse)."""

    id: uuid.UUID
    full_name: str
    avatar_url: str | None
    role: str

    model_config = {"from_attributes": True}
