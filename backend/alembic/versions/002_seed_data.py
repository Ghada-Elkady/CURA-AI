"""Seed data — specialties, users, doctors, and time slots.

Revision ID: 002
Revises: 001
Create Date: 2024-01-01
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from alembic import op
from passlib.context import CryptContext

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_PASS = _pwd.hash("Test1234!")
_UTC = timezone.utc


def _uid() -> str:
    return str(uuid.uuid4())


def upgrade() -> None:
    conn = op.get_bind()

    # ── Specialties ──────────────────────────────────────────────────────
    specialties = [
        {"id": _uid(), "name": "Cardiology",    "icon": "❤️",  "color_hex": "#FF6B6B"},
        {"id": _uid(), "name": "Neurology",     "icon": "🧠",  "color_hex": "#A29BFE"},
        {"id": _uid(), "name": "Pediatrics",    "icon": "👶",  "color_hex": "#FDB7B7"},
        {"id": _uid(), "name": "Orthopedics",   "icon": "🦴",  "color_hex": "#FFEAA7"},
        {"id": _uid(), "name": "Dermatology",   "icon": "🌟",  "color_hex": "#55EFC4"},
        {"id": _uid(), "name": "Ophthalmology", "icon": "👁️",  "color_hex": "#74B9FF"},
        {"id": _uid(), "name": "Psychiatry",    "icon": "🧘",  "color_hex": "#FD79A8"},
        {"id": _uid(), "name": "General",       "icon": "🩺",  "color_hex": "#0ABDE3"},
    ]
    conn.execute(
        op.get_context().dialect.statement_compiler(
            op.get_context().dialect, None
        ).__class__,
    )
    for s in specialties:
        conn.execute(
            op.get_context().connection.execute.__func__,
        )

    # Use raw SQL for simplicity in seed
    for s in specialties:
        conn.execute(
            __import__("sqlalchemy").text(
                "INSERT INTO specialties (id, name, icon, color_hex) VALUES (:id, :name, :icon, :color_hex)"
            ),
            s,
        )

    spec_ids = {s["name"]: s["id"] for s in specialties}

    # ── Admin user ───────────────────────────────────────────────────────
    admin_id = _uid()
    conn.execute(
        __import__("sqlalchemy").text(
            "INSERT INTO users (id, email, password_hash, full_name, role) "
            "VALUES (:id, :email, :pw, :name, 'admin'::userrole)"
        ),
        {"id": admin_id, "email": "admin@cura.com", "pw": _PASS, "name": "CURA Admin"},
    )

    # ── Patient users ────────────────────────────────────────────────────
    patients = [
        {"id": _uid(), "email": "patient@cura.com",  "name": "Alex Johnson",  "phone": "+1-555-0101"},
        {"id": _uid(), "email": "jane@cura.com",     "name": "Jane Smith",    "phone": "+1-555-0102"},
        {"id": _uid(), "email": "bob@cura.com",      "name": "Bob Williams",  "phone": "+1-555-0103"},
    ]
    sa = __import__("sqlalchemy")
    for p in patients:
        conn.execute(
            sa.text(
                "INSERT INTO users (id, email, password_hash, full_name, phone, role) "
                "VALUES (:id, :email, :pw, :name, :phone, 'patient'::userrole)"
            ),
            {"id": p["id"], "email": p["email"], "pw": _PASS, "name": p["name"], "phone": p["phone"]},
        )

    # ── Doctor users + profiles ───────────────────────────────────────────
    doctor_data = [
        {
            "name": "Dr. Sarah Mitchell", "email": "sarah.mitchell@cura.com",
            "specialty": "Cardiology", "exp": 12, "fee": 150.00,
            "gender": "female", "online": True, "in_person": True,
            "bio": "Board-certified cardiologist with 12 years of experience in interventional cardiology and heart disease prevention.",
            "clinic": "Heart Care Center", "addr": "123 Medical Dr, New York, NY",
            "lat": 40.7580, "lng": -73.9855, "rating": 4.9, "reviews": 124,
        },
        {
            "name": "Dr. James Patel", "email": "james.patel@cura.com",
            "specialty": "Cardiology", "exp": 8, "fee": 120.00,
            "gender": "male", "online": True, "in_person": True,
            "bio": "Cardiologist specializing in cardiac rehabilitation and preventive cardiology.",
            "clinic": "Patel Heart Clinic", "addr": "456 Health Ave, Brooklyn, NY",
            "lat": 40.6782, "lng": -73.9442, "rating": 4.7, "reviews": 89,
        },
        {
            "name": "Dr. Elena Rodriguez", "email": "elena.rodriguez@cura.com",
            "specialty": "Neurology", "exp": 15, "fee": 180.00,
            "gender": "female", "online": False, "in_person": True,
            "bio": "Expert neurologist specializing in epilepsy, stroke management, and neurodegenerative diseases.",
            "clinic": "NeuroHealth Institute", "addr": "789 Brain Blvd, Manhattan, NY",
            "lat": 40.7831, "lng": -73.9712, "rating": 4.8, "reviews": 201,
        },
        {
            "name": "Dr. Michael Chen", "email": "michael.chen@cura.com",
            "specialty": "Neurology", "exp": 10, "fee": 160.00,
            "gender": "male", "online": True, "in_person": True,
            "bio": "Neurologist with expertise in headache disorders, multiple sclerosis, and neuroimmunology.",
            "clinic": "Chen Neurology", "addr": "321 Mind St, Queens, NY",
            "lat": 40.7282, "lng": -73.7949, "rating": 4.6, "reviews": 67,
        },
        {
            "name": "Dr. Amy Thompson", "email": "amy.thompson@cura.com",
            "specialty": "Pediatrics", "exp": 9, "fee": 100.00,
            "gender": "female", "online": True, "in_person": True,
            "bio": "Dedicated pediatrician providing comprehensive care for children from newborns to adolescents.",
            "clinic": "KidsFirst Pediatrics", "addr": "555 Child Lane, Bronx, NY",
            "lat": 40.8448, "lng": -73.8648, "rating": 4.9, "reviews": 310,
        },
        {
            "name": "Dr. David Kim", "email": "david.kim@cura.com",
            "specialty": "Pediatrics", "exp": 6, "fee": 90.00,
            "gender": "male", "online": True, "in_person": False,
            "bio": "Pediatrician passionate about child development and preventive healthcare.",
            "clinic": "Happy Kids Clinic", "addr": "777 Youth Rd, Staten Island, NY",
            "lat": 40.5795, "lng": -74.1502, "rating": 4.5, "reviews": 45,
        },
        {
            "name": "Dr. Lisa Wang", "email": "lisa.wang@cura.com",
            "specialty": "Dermatology", "exp": 11, "fee": 140.00,
            "gender": "female", "online": True, "in_person": True,
            "bio": "Dermatologist specializing in acne, eczema, psoriasis, and cosmetic dermatology.",
            "clinic": "Clear Skin Dermatology", "addr": "888 Glow Ave, New York, NY",
            "lat": 40.7614, "lng": -73.9776, "rating": 4.8, "reviews": 178,
        },
        {
            "name": "Dr. Robert Martinez", "email": "robert.martinez@cura.com",
            "specialty": "Orthopedics", "exp": 14, "fee": 200.00,
            "gender": "male", "online": False, "in_person": True,
            "bio": "Orthopedic surgeon specializing in joint replacement, sports injuries, and spine surgery.",
            "clinic": "Bone & Joint Center", "addr": "999 Spine St, New York, NY",
            "lat": 40.7505, "lng": -73.9934, "rating": 4.7, "reviews": 156,
        },
        {
            "name": "Dr. Priya Sharma", "email": "priya.sharma@cura.com",
            "specialty": "Psychiatry", "exp": 7, "fee": 130.00,
            "gender": "female", "online": True, "in_person": True,
            "bio": "Psychiatrist providing compassionate mental health care for anxiety, depression, and PTSD.",
            "clinic": "Mind Wellness Clinic", "addr": "111 Peace Blvd, New York, NY",
            "lat": 40.7589, "lng": -73.9851, "rating": 4.9, "reviews": 92,
        },
        {
            "name": "Dr. Thomas Anderson", "email": "thomas.anderson@cura.com",
            "specialty": "General", "exp": 20, "fee": 80.00,
            "gender": "male", "online": True, "in_person": True,
            "bio": "Experienced general practitioner offering comprehensive primary care for patients of all ages.",
            "clinic": "Anderson Family Practice", "addr": "222 Main St, New York, NY",
            "lat": 40.7484, "lng": -73.9967, "rating": 4.6, "reviews": 289,
        },
    ]

    sa = __import__("sqlalchemy")
    doctor_ids = []
    for d in doctor_data:
        user_id = _uid()
        conn.execute(
            sa.text(
                "INSERT INTO users (id, email, password_hash, full_name, role, avatar_url) "
                "VALUES (:id, :email, :pw, :name, 'doctor'::userrole, :avatar)"
            ),
            {
                "id": user_id,
                "email": d["email"],
                "pw": _PASS,
                "name": d["name"],
                "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={d['email']}",
            },
        )
        doc_id = _uid()
        doctor_ids.append(doc_id)
        conn.execute(
            sa.text(
                "INSERT INTO doctors (id, user_id, specialty_id, bio, experience_years, consultation_fee, "
                "clinic_name, clinic_address, clinic_lat, clinic_lng, rating_avg, review_count, "
                "gender, is_online_available, is_in_person_available) "
                "VALUES (:id, :uid, :spec, :bio, :exp, :fee, :clinic, :addr, :lat, :lng, "
                ":rating, :reviews, :gender::doctorgender, :online, :inperson)"
            ),
            {
                "id": doc_id,
                "uid": user_id,
                "spec": spec_ids[d["specialty"]],
                "bio": d["bio"],
                "exp": d["exp"],
                "fee": d["fee"],
                "clinic": d["clinic"],
                "addr": d["addr"],
                "lat": d["lat"],
                "lng": d["lng"],
                "rating": d["rating"],
                "reviews": d["reviews"],
                "gender": d["gender"],
                "online": d["online"],
                "inperson": d["in_person"],
            },
        )

    # ── Time slots (next 30 weekdays, 9am-5pm, every 30 min) ─────────────
    slots_to_insert = []
    now = datetime.now(_UTC)
    for doc_id in doctor_ids:
        day_count = 0
        current_day = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        while day_count < 20:  # 20 working days
            if current_day.weekday() < 5:  # Mon–Fri
                for hour in range(9, 17):
                    for minute in (0, 30):
                        slot_dt = current_day.replace(hour=hour, minute=minute)
                        slots_to_insert.append({
                            "id": _uid(),
                            "doctor_id": doc_id,
                            "slot_datetime": slot_dt.isoformat(),
                            "duration_minutes": 30,
                            "is_booked": False,
                        })
                day_count += 1
            current_day += timedelta(days=1)

    # Batch insert slots
    for chunk_start in range(0, len(slots_to_insert), 500):
        chunk = slots_to_insert[chunk_start:chunk_start + 500]
        conn.execute(
            sa.text(
                "INSERT INTO time_slots (id, doctor_id, slot_datetime, duration_minutes, is_booked) "
                "VALUES (:id, :doctor_id, :slot_datetime, :duration_minutes, :is_booked)"
            ),
            chunk,
        )


def downgrade() -> None:
    sa = __import__("sqlalchemy")
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM time_slots"))
    conn.execute(sa.text("DELETE FROM doctors"))
    conn.execute(sa.text("DELETE FROM users WHERE role != 'admin'::userrole"))
    conn.execute(sa.text("DELETE FROM specialties"))
    conn.execute(sa.text("DELETE FROM users WHERE role = 'admin'::userrole"))
