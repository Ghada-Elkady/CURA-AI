"""SQLAlchemy Specialty model."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Specialty(Base):
    """Medical specialty (e.g. Cardiology, Neurology)."""

    __tablename__ = "specialties"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    icon: Mapped[str | None] = mapped_column(String(10), nullable=True)
    color_hex: Mapped[str | None] = mapped_column(String(7), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    doctors: Mapped[list["Doctor"]] = relationship(  # noqa: F821
        "Doctor", back_populates="specialty"
    )

    def __repr__(self) -> str:
        return f"<Specialty id={self.id} name={self.name}>"
