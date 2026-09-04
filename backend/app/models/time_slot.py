"""SQLAlchemy TimeSlot model."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TimeSlot(Base):
    """A bookable time slot belonging to a doctor."""

    __tablename__ = "time_slots"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("doctors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    slot_datetime: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    is_booked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    doctor: Mapped["Doctor"] = relationship(  # noqa: F821
        "Doctor", back_populates="time_slots"
    )
    appointment: Mapped["Appointment | None"] = relationship(  # noqa: F821
        "Appointment", back_populates="slot", uselist=False
    )

    def __repr__(self) -> str:
        return f"<TimeSlot id={self.id} doctor_id={self.doctor_id} at={self.slot_datetime}>"
