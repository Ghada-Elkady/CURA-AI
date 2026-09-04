"""Import all models so Alembic and SQLAlchemy can discover them."""

from app.models.user import User, UserRole
from app.models.specialty import Specialty
from app.models.doctor import Doctor, DoctorGender
from app.models.time_slot import TimeSlot
from app.models.appointment import Appointment, AppointmentStatus, ConsultationType
from app.models.review import Review
from app.models.notification import Notification

__all__ = [
    "User", "UserRole",
    "Specialty",
    "Doctor", "DoctorGender",
    "TimeSlot",
    "Appointment", "AppointmentStatus", "ConsultationType",
    "Review",
    "Notification",
]
