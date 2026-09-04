"""SQLAlchemy Appointment model."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ConsultationType(str, enum.Enum):
    """How the appointment is conducted."""

    in_person = "in_person"
    online = "online"


class AppointmentStatus(str, enum.Enum):
    """Lifecycle states of an appointment."""

    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"
    rescheduled = "rescheduled"


class Appointment(Base):
    """An appointment between a patient and a doctor for a specific time slot."""

    __tablename__ = "appointments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("doctors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    slot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("time_slots.id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
        index=True,
    )
    consultation_type: Mapped[ConsultationType] = mapped_column(
        Enum(ConsultationType, name="consultationtype"), nullable=False
    )
    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus, name="appointmentstatus"),
        nullable=False,
        default=AppointmentStatus.scheduled,
        index=True,
    )
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    patient: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="appointments_as_patient", foreign_keys=[patient_id]
    )
    doctor: Mapped["Doctor"] = relationship(  # noqa: F821
        "Doctor", back_populates="appointments", foreign_keys=[doctor_id]
    )
    slot: Mapped["TimeSlot"] = relationship(  # noqa: F821
        "TimeSlot", back_populates="appointment"
    )
    review: Mapped["Review | None"] = relationship(  # noqa: F821
        "Review", back_populates="appointment", uselist=False
    )

    def __repr__(self) -> str:
        return f"<Appointment id={self.id} status={self.status}>"
