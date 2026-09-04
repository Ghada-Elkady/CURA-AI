"""Initial schema — create all CURA tables.

Revision ID: 001
Revises:
Create Date: 2024-01-01
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Enums ────────────────────────────────────────────────────────────
    op.execute("CREATE TYPE userrole AS ENUM ('patient', 'doctor', 'admin')")
    op.execute("CREATE TYPE doctorgender AS ENUM ('male', 'female')")
    op.execute("CREATE TYPE consultationtype AS ENUM ('in_person', 'online')")
    op.execute("CREATE TYPE appointmentstatus AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled')")

    # ── users ────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("role", sa.Enum("patient", "doctor", "admin", name="userrole"), nullable=False, server_default="patient"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # ── specialties ──────────────────────────────────────────────────────
    op.create_table(
        "specialties",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("icon", sa.String(50), nullable=True),
        sa.Column("color_hex", sa.String(7), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── doctors ──────────────────────────────────────────────────────────
    op.create_table(
        "doctors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("specialty_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("specialties.id", ondelete="SET NULL"), nullable=True),
        sa.Column("bio", sa.String(2000), nullable=True),
        sa.Column("experience_years", sa.Integer, nullable=False, server_default="0"),
        sa.Column("consultation_fee", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("clinic_name", sa.String(255), nullable=True),
        sa.Column("clinic_address", sa.String(500), nullable=True),
        sa.Column("clinic_lat", sa.Float, nullable=True),
        sa.Column("clinic_lng", sa.Float, nullable=True),
        sa.Column("rating_avg", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("review_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("gender", sa.Enum("male", "female", name="doctorgender"), nullable=True),
        sa.Column("is_online_available", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("is_in_person_available", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_doctors_user_id", "doctors", ["user_id"])
    op.create_index("ix_doctors_specialty_id", "doctors", ["specialty_id"])

    # ── time_slots ───────────────────────────────────────────────────────
    op.create_table(
        "time_slots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False),
        sa.Column("slot_datetime", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer, nullable=False, server_default="30"),
        sa.Column("is_booked", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_time_slots_doctor_id", "time_slots", ["doctor_id"])
    op.create_index("ix_time_slots_slot_datetime", "time_slots", ["slot_datetime"])

    # ── appointments ─────────────────────────────────────────────────────
    op.create_table(
        "appointments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False),
        sa.Column("slot_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("time_slots.id", ondelete="RESTRICT"), nullable=False, unique=True),
        sa.Column("consultation_type", sa.Enum("in_person", "online", name="consultationtype"), nullable=False),
        sa.Column("status", sa.Enum("scheduled", "completed", "cancelled", "rescheduled", name="appointmentstatus"), nullable=False, server_default="scheduled"),
        sa.Column("notes", sa.String(1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_appointments_patient_id", "appointments", ["patient_id"])
    op.create_index("ix_appointments_doctor_id", "appointments", ["doctor_id"])
    op.create_index("ix_appointments_status", "appointments", ["status"])

    # ── reviews ──────────────────────────────────────────────────────────
    op.create_table(
        "reviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("appointment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rating", sa.Integer, nullable=False),
        sa.Column("comment", sa.String(1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── notifications ────────────────────────────────────────────────────
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.String(1000), nullable=False),
        sa.Column("notification_type", sa.String(50), nullable=True),
        sa.Column("is_read", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("reviews")
    op.drop_table("appointments")
    op.drop_table("time_slots")
    op.drop_table("doctors")
    op.drop_table("specialties")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS appointmentstatus")
    op.execute("DROP TYPE IF EXISTS consultationtype")
    op.execute("DROP TYPE IF EXISTS doctorgender")
    op.execute("DROP TYPE IF EXISTS userrole")
