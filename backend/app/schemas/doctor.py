"""Pydantic schemas for doctor and specialty endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, Field


class SpecialtyResponse(BaseModel):
    """Specialty details returned in responses."""

    id: uuid.UUID
    name: str
    icon: str | None
    color_hex: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DoctorUserInfo(BaseModel):
    """Minimal user info embedded in doctor responses."""

    id: uuid.UUID
    full_name: str
    avatar_url: str | None
    email: str

    model_config = {"from_attributes": True}


class DoctorResponse(BaseModel):
    """Full doctor profile."""

    id: uuid.UUID
    user: DoctorUserInfo
    specialty: SpecialtyResponse | None
    bio: str | None
    experience_years: int
    consultation_fee: float
    clinic_name: str | None
    clinic_address: str | None
    clinic_lat: float | None
    clinic_lng: float | None
    rating_avg: float
    review_count: int
    gender: str | None
    is_online_available: bool
    is_in_person_available: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DoctorListItem(BaseModel):
    """Condensed doctor info for list/search responses."""

    id: uuid.UUID
    full_name: str
    avatar_url: str | None
    specialty_name: str | None
    specialty_icon: str | None
    experience_years: int
    consultation_fee: float
    rating_avg: float
    review_count: int
    gender: str | None
    is_online_available: bool
    is_in_person_available: bool
    clinic_name: str | None

    model_config = {"from_attributes": True}


class DoctorSearchParams(BaseModel):
    """Query parameters for the doctor search endpoint."""

    specialty_id: Optional[uuid.UUID] = None
    min_rating: Optional[float] = Field(default=None, ge=0.0, le=5.0)
    gender: Optional[str] = Field(default=None, pattern="^(male|female)$")
    min_experience: Optional[int] = Field(default=None, ge=0)
    max_fee: Optional[float] = Field(default=None, ge=0)
    is_available_online: Optional[bool] = None
    date: Optional[date] = None
    search: Optional[str] = Field(default=None, max_length=100)
    sort_by: Optional[str] = Field(default="rating", pattern="^(rating|experience|fee)$")
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=20, ge=1, le=100)
