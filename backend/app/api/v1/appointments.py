"""Appointments API router — book, list, reschedule, cancel."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.appointment import Appointment, AppointmentStatus, ConsultationType
from app.models.doctor import Doctor
from app.models.time_slot import TimeSlot
from app.models.user import User
from app.schemas.appointment import (
    AppointmentResponse,
    CreateAppointmentRequest,
    RescheduleRequest,
)

router = APIRouter()


def _load_options():
    return [
        selectinload(Appointment.patient),
        selectinload(Appointment.doctor).selectinload(Doctor.user),
        selectinload(Appointment.doctor).selectinload(Doctor.specialty),
        selectinload(Appointment.slot),
    ]


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    body: CreateAppointmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Book an appointment atomically — prevents double booking."""
    # Verify doctor exists
    dr_result = await db.execute(select(Doctor).where(Doctor.id == body.doctor_id))
    if not dr_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    # Lock the slot row and check availability
    slot_result = await db.execute(
        select(TimeSlot).where(TimeSlot.id == body.slot_id).with_for_update()
    )
    slot = slot_result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time slot not found")
    if slot.is_booked:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Time slot is already booked")

    # Mark slot as booked
    slot.is_booked = True

    # Create appointment
    appointment = Appointment(
        patient_id=current_user.id,
        doctor_id=body.doctor_id,
        slot_id=body.slot_id,
        consultation_type=ConsultationType(body.consultation_type),
        notes=body.notes,
        status=AppointmentStatus.scheduled,
    )
    db.add(appointment)
    await db.flush()

    # Reload with relationships
    result = await db.execute(
        select(Appointment).options(*_load_options()).where(Appointment.id == appointment.id)
    )
    return result.scalar_one()


@router.get("/me", response_model=list[AppointmentResponse])
async def get_my_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    appt_status: str = Query(default="", alias="status"),
):
    """Return the current patient's appointments, optionally filtered by status."""
    stmt = (
        select(Appointment)
        .options(*_load_options())
        .where(Appointment.patient_id == current_user.id)
        .where(Appointment.deleted_at == None)
        .order_by(Appointment.created_at.desc())
    )
    if appt_status:
        try:
            stmt = stmt.where(Appointment.status == AppointmentStatus(appt_status))
        except ValueError:
            pass  # ignore unknown status filters

    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single appointment detail (accessible by patient or doctor involved)."""
    result = await db.execute(
        select(Appointment)
        .options(*_load_options())
        .where(Appointment.id == appointment_id)
        .where(Appointment.deleted_at == None)
    )
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    # Access control
    if str(appt.patient_id) != str(current_user.id):
        # Check if current user is the doctor for this appointment
        dr_result = await db.execute(
            select(Doctor).where(Doctor.id == appt.doctor_id, Doctor.user_id == current_user.id)
        )
        if not dr_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return appt


@router.put("/{appointment_id}/reschedule", response_model=AppointmentResponse)
async def reschedule_appointment(
    appointment_id: uuid.UUID,
    body: RescheduleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reschedule to a new slot atomically."""
    # Get appointment
    result = await db.execute(
        select(Appointment)
        .options(*_load_options())
        .where(Appointment.id == appointment_id)
        .where(Appointment.patient_id == current_user.id)
        .where(Appointment.deleted_at == None)
    )
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    if appt.status not in (AppointmentStatus.scheduled, AppointmentStatus.rescheduled):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot reschedule this appointment")

    # Release old slot
    old_slot_result = await db.execute(
        select(TimeSlot).where(TimeSlot.id == appt.slot_id).with_for_update()
    )
    old_slot = old_slot_result.scalar_one_or_none()
    if old_slot:
        old_slot.is_booked = False

    # Lock new slot
    new_slot_result = await db.execute(
        select(TimeSlot).where(TimeSlot.id == body.new_slot_id).with_for_update()
    )
    new_slot = new_slot_result.scalar_one_or_none()
    if not new_slot or new_slot.is_booked:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="New slot unavailable")

    new_slot.is_booked = True
    appt.slot_id = body.new_slot_id
    appt.status = AppointmentStatus.scheduled
    appt.updated_at = datetime.now(UTC)
    await db.flush()

    result = await db.execute(
        select(Appointment).options(*_load_options()).where(Appointment.id == appt.id)
    )
    return result.scalar_one()


@router.delete("/{appointment_id}", status_code=status.HTTP_200_OK)
async def cancel_appointment(
    appointment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft-cancel an appointment and free its time slot."""
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == appointment_id)
        .where(Appointment.patient_id == current_user.id)
        .where(Appointment.deleted_at == None)
    )
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if appt.status == AppointmentStatus.completed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot cancel a completed appointment")

    # Free the slot
    slot_result = await db.execute(select(TimeSlot).where(TimeSlot.id == appt.slot_id))
    slot = slot_result.scalar_one_or_none()
    if slot:
        slot.is_booked = False

    # Soft delete
    appt.status = AppointmentStatus.cancelled
    appt.deleted_at = datetime.now(UTC)
    appt.updated_at = datetime.now(UTC)

    return {"message": "Appointment cancelled successfully", "id": str(appointment_id)}
