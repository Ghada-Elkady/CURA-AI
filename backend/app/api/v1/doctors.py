"""Doctors API router — search, profile, specialties, time slots."""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.doctor import Doctor, DoctorGender
from app.models.review import Review
from app.models.specialty import Specialty
from app.models.time_slot import TimeSlot
from app.models.user import User
from app.schemas.doctor import DoctorListItem, DoctorResponse, SpecialtyResponse
from app.schemas.review import ReviewResponse

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _doctor_to_list_item(doctor: Doctor) -> DoctorListItem:
    return DoctorListItem(
        id=doctor.id,
        full_name=doctor.user.full_name,
        avatar_url=doctor.user.avatar_url,
        specialty_name=doctor.specialty.name if doctor.specialty else None,
        specialty_icon=doctor.specialty.icon if doctor.specialty else None,
        experience_years=doctor.experience_years,
        consultation_fee=float(doctor.consultation_fee),
        rating_avg=doctor.rating_avg,
        review_count=doctor.review_count,
        gender=doctor.gender.value if doctor.gender else None,
        is_online_available=doctor.is_online_available,
        is_in_person_available=doctor.is_in_person_available,
        clinic_name=doctor.clinic_name,
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/specialties", response_model=list[SpecialtyResponse])
async def get_specialties(db: AsyncSession = Depends(get_db)):
    """Return all medical specialties."""
    result = await db.execute(select(Specialty).order_by(Specialty.name))
    return result.scalars().all()


@router.get("", response_model=list[DoctorListItem])
async def search_doctors(
    db: AsyncSession = Depends(get_db),
    specialty_id: Optional[uuid.UUID] = Query(default=None),
    min_rating: Optional[float] = Query(default=None, ge=0, le=5),
    gender: Optional[str] = Query(default=None),
    min_experience: Optional[int] = Query(default=None, ge=0),
    max_fee: Optional[float] = Query(default=None, ge=0),
    is_available_online: Optional[bool] = Query(default=None),
    search: Optional[str] = Query(default=None, max_length=100),
    sort_by: str = Query(default="rating", pattern="^(rating|experience|fee)$"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    """Search and filter doctors with pagination."""
    stmt = (
        select(Doctor)
        .join(Doctor.user)
        .outerjoin(Doctor.specialty)
        .options(selectinload(Doctor.user), selectinload(Doctor.specialty))
        .where(User.is_active == True)
    )

    if specialty_id:
        stmt = stmt.where(Doctor.specialty_id == specialty_id)
    if min_rating is not None:
        stmt = stmt.where(Doctor.rating_avg >= min_rating)
    if gender:
        stmt = stmt.where(Doctor.gender == DoctorGender(gender))
    if min_experience is not None:
        stmt = stmt.where(Doctor.experience_years >= min_experience)
    if max_fee is not None:
        stmt = stmt.where(Doctor.consultation_fee <= max_fee)
    if is_available_online is not None:
        stmt = stmt.where(Doctor.is_online_available == is_available_online)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                User.full_name.ilike(pattern),
                Doctor.clinic_name.ilike(pattern),
                Specialty.name.ilike(pattern),
            )
        )

    # Sorting
    if sort_by == "rating":
        stmt = stmt.order_by(Doctor.rating_avg.desc())
    elif sort_by == "experience":
        stmt = stmt.order_by(Doctor.experience_years.desc())
    elif sort_by == "fee":
        stmt = stmt.order_by(Doctor.consultation_fee.asc())

    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    doctors = result.scalars().all()
    return [_doctor_to_list_item(d) for d in doctors]


@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(doctor_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get full doctor profile including specialty."""
    result = await db.execute(
        select(Doctor)
        .options(selectinload(Doctor.user), selectinload(Doctor.specialty))
        .where(Doctor.id == doctor_id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return doctor


@router.get("/{doctor_id}/slots")
async def get_doctor_slots(
    doctor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    date_filter: Optional[date] = Query(default=None, alias="date"),
):
    """Return available (not booked) time slots for a doctor."""
    result = await db.execute(select(Doctor).where(Doctor.id == doctor_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    now = datetime.now(timezone.utc)
    stmt = (
        select(TimeSlot)
        .where(TimeSlot.doctor_id == doctor_id)
        .where(TimeSlot.is_booked == False)
        .where(TimeSlot.slot_datetime > now)
        .order_by(TimeSlot.slot_datetime)
    )

    if date_filter:
        day_start = datetime(date_filter.year, date_filter.month, date_filter.day, tzinfo=timezone.utc)
        day_end = datetime(date_filter.year, date_filter.month, date_filter.day, 23, 59, 59, tzinfo=timezone.utc)
        stmt = stmt.where(and_(TimeSlot.slot_datetime >= day_start, TimeSlot.slot_datetime <= day_end))

    result = await db.execute(stmt)
    slots = result.scalars().all()

    return [
        {
            "id": str(s.id),
            "slot_datetime": s.slot_datetime.isoformat(),
            "duration_minutes": s.duration_minutes,
            "is_booked": s.is_booked,
        }
        for s in slots
    ]


@router.get("/{doctor_id}/reviews", response_model=list[ReviewResponse])
async def get_doctor_reviews(
    doctor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=50),
):
    """Paginated reviews for a specific doctor."""
    result = await db.execute(
        select(Review)
        .options(selectinload(Review.patient))
        .where(Review.doctor_id == doctor_id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
