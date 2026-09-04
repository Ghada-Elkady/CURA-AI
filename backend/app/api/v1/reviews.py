"""Reviews API router — submit and read doctor reviews."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.review import Review
from app.models.user import User
from app.schemas.review import CreateReviewRequest, ReviewResponse

router = APIRouter()


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    body: CreateReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a review after a completed appointment."""
    # Verify appointment exists, belongs to patient, and is completed
    appt_result = await db.execute(
        select(Appointment)
        .where(Appointment.id == body.appointment_id)
        .where(Appointment.patient_id == current_user.id)
        .where(Appointment.status == AppointmentStatus.completed)
    )
    appt = appt_result.scalar_one_or_none()
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Completed appointment not found or you are not the patient",
        )

    # Prevent duplicate reviews
    existing = await db.execute(select(Review).where(Review.appointment_id == body.appointment_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Review already submitted")

    review = Review(
        appointment_id=body.appointment_id,
        patient_id=current_user.id,
        doctor_id=appt.doctor_id,
        rating=body.rating,
        comment=body.comment,
    )
    db.add(review)
    await db.flush()

    # Update doctor rating_avg and review_count atomically
    dr_result = await db.execute(select(Doctor).where(Doctor.id == appt.doctor_id))
    doctor = dr_result.scalar_one_or_none()
    if doctor:
        total = doctor.rating_avg * doctor.review_count + body.rating
        doctor.review_count += 1
        doctor.rating_avg = round(total / doctor.review_count, 2)

    # Load patient for response
    result = await db.execute(
        select(Review)
        .options(selectinload(Review.patient))
        .where(Review.id == review.id)
    )
    return result.scalar_one()


@router.get("/doctor/{doctor_id}", response_model=list[ReviewResponse])
async def get_doctor_reviews(
    doctor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=50),
):
    """Return paginated reviews for a doctor."""
    result = await db.execute(
        select(Review)
        .options(selectinload(Review.patient))
        .where(Review.doctor_id == doctor_id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
