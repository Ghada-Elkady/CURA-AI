"""SQLAlchemy Doctor model."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DoctorGender(str, enum.Enum):
    """Doctor's gender."""

    male = "male"
    female = "female"


class Doctor(Base):
    """Doctor profile linked to a User account."""

    __tablename__ = "doctors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    specialty_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("specialties.id", ondelete="SET NULL"), nullable=True, index=True
    )
    bio: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    experience_years: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    consultation_fee: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    clinic_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    clinic_address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    clinic_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    clinic_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    rating_avg: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    gender: Mapped[DoctorGender | None] = mapped_column(
        Enum(DoctorGender, name="doctorgender"), nullable=True
    )
    is_online_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_in_person_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="doctor_profile"
    )
    specialty: Mapped["Specialty | None"] = relationship(  # noqa: F821
        "Specialty", back_populates="doctors"
    )
    time_slots: Mapped[list["TimeSlot"]] = relationship(  # noqa: F821
        "TimeSlot", back_populates="doctor", cascade="all, delete-orphan"
    )
    appointments: Mapped[list["Appointment"]] = relationship(  # noqa: F821
        "Appointment", back_populates="doctor", foreign_keys="Appointment.doctor_id"
    )
    reviews: Mapped[list["Review"]] = relationship(  # noqa: F821
        "Review", back_populates="doctor", foreign_keys="Review.doctor_id"
    )

    def __repr__(self) -> str:
        return f"<Doctor id={self.id} user_id={self.user_id}>"
