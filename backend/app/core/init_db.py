"""Database initialization and seeding helper."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base, AsyncSessionLocal, engine
from app.core.security import get_password_hash
from app.models.doctor import Doctor, DoctorGender
from app.models.specialty import Specialty
from app.models.time_slot import TimeSlot
from app.models.user import User, UserRole


async def init_db_and_seed() -> None:
    """Create all database tables and seed sample specialties, doctors, users, and slots if empty."""
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed data if empty
    async with AsyncSessionLocal() as db:
        # Check if specialties exist
        result = await db.execute(select(Specialty))
        if result.scalars().first() is not None:
            return  # Already seeded

        # ── 1. Specialties ──────────────────────────────────────────────────
        specs_data = [
            {"id": uuid.uuid4(), "name": "Cardiology", "icon": "Heart", "color_hex": "#EF4444"},
            {"id": uuid.uuid4(), "name": "Neurology", "icon": "Brain", "color_hex": "#8B5CF6"},
            {"id": uuid.uuid4(), "name": "Pediatrics", "icon": "Baby", "color_hex": "#F59E0B"},
            {"id": uuid.uuid4(), "name": "Dermatology", "icon": "Sparkles", "color_hex": "#10B981"},
            {"id": uuid.uuid4(), "name": "Orthopedics", "icon": "Bone", "color_hex": "#3B82F6"},
            {"id": uuid.uuid4(), "name": "Ophthalmology", "icon": "Eye", "color_hex": "#0ABDE3"},
            {"id": uuid.uuid4(), "name": "General Medicine", "icon": "Stethoscope", "color_hex": "#6366F1"},
        ]
        specs_map = {}
        for s in specs_data:
            sp = Specialty(id=s["id"], name=s["name"], icon=s["icon"], color_hex=s["color_hex"])
            db.add(sp)
            specs_map[s["name"]] = sp

        # ── 2. Demo Users ────────────────────────────────────────────────────
        hashed_pw = get_password_hash("Test1234!")

        # Admin user
        admin = User(
            id=uuid.uuid4(),
            email="admin@cura.health",
            password_hash=hashed_pw,
            full_name="CURA Administrator",
            role=UserRole.admin,
        )
        db.add(admin)

        # Patient user
        patient = User(
            id=uuid.uuid4(),
            email="alex.morgan@example.com",
            password_hash=hashed_pw,
            full_name="Alex Morgan",
            phone="+1 (555) 234-5678",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            role=UserRole.patient,
        )
        db.add(patient)

        # ── 3. Doctor Users & Profiles ───────────────────────────────────────
        doctors_info = [
            {
                "email": "sarah.jenkins@cura.health",
                "name": "Dr. Sarah Jenkins",
                "specialty": "Cardiology",
                "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
                "bio": "Board-certified Cardiologist with over 12 years of experience in preventative heart care, non-invasive imaging, and cardiovascular wellness.",
                "exp": 12,
                "fee": 120.0,
                "clinic": "St. Jude Heart Center",
                "address": "742 Evergreen Terrace, Medical Suite 300",
                "rating": 4.9,
                "reviews": 128,
                "gender": DoctorGender.female,
            },
            {
                "email": "marcus.vance@cura.health",
                "name": "Dr. Marcus Vance",
                "specialty": "Neurology",
                "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
                "bio": "Specialist in neurological disorders, migraine treatments, and cognitive health management.",
                "exp": 15,
                "fee": 150.0,
                "clinic": "Metropolitan Neurology Institute",
                "address": "100 Broadway, 14th Floor",
                "rating": 4.8,
                "reviews": 94,
                "gender": DoctorGender.male,
            },
            {
                "email": "elena.rostova@cura.health",
                "name": "Dr. Elena Rostova",
                "specialty": "Pediatrics",
                "avatar": "https://images.unsplash.com/photo-1594824813566-88855ce78961?auto=format&fit=crop&w=400&q=80",
                "bio": "Compassionate pediatric specialist committed to infant nutrition, child development, and preventive care.",
                "exp": 9,
                "fee": 95.0,
                "clinic": "Sunshine Children Clinic",
                "address": "45 Park Avenue, Suite 102",
                "rating": 4.95,
                "reviews": 210,
                "gender": DoctorGender.female,
            },
            {
                "email": "david.chen@cura.health",
                "name": "Dr. David Chen",
                "specialty": "Dermatology",
                "avatar": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
                "bio": "Expert dermatologist specializing in medical skin disorders, acne solutions, and aesthetic laser treatments.",
                "exp": 11,
                "fee": 130.0,
                "clinic": "ClearSkin Aesthetics & Dermatology",
                "address": "880 5th Avenue, Suite 500",
                "rating": 4.75,
                "reviews": 87,
                "gender": DoctorGender.male,
            },
        ]

        doc_objs = []
        for d in doctors_info:
            doc_user = User(
                id=uuid.uuid4(),
                email=d["email"],
                password_hash=hashed_pw,
                full_name=d["name"],
                avatar_url=d["avatar"],
                role=UserRole.doctor,
            )
            db.add(doc_user)
            await db.flush()

            doc_profile = Doctor(
                id=uuid.uuid4(),
                user_id=doc_user.id,
                specialty_id=specs_map[d["specialty"]].id,
                bio=d["bio"],
                experience_years=d["exp"],
                consultation_fee=d["fee"],
                clinic_name=d["clinic"],
                clinic_address=d["address"],
                rating_avg=d["rating"],
                review_count=d["reviews"],
                gender=d["gender"],
                is_online_available=True,
                is_in_person_available=True,
            )
            db.add(doc_profile)
            doc_objs.append(doc_profile)

        await db.flush()

        # ── 4. Time Slots ─────────────────────────────────────────────────────
        now = datetime.now(timezone.utc)
        for doc in doc_objs:
            for day_offset in range(1, 14):
                slot_date = now + timedelta(days=day_offset)
                if slot_date.weekday() < 5:  # Monday to Friday
                    for hour in (9, 10, 11, 14, 15, 16):
                        slot_dt = slot_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                        ts = TimeSlot(
                            id=uuid.uuid4(),
                            doctor_id=doc.id,
                            slot_datetime=slot_dt,
                            duration_minutes=30,
                            is_booked=False,
                        )
                        db.add(ts)

        await db.commit()
