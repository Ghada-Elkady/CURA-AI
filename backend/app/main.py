"""CURA FastAPI application entry point."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, doctors, appointments, reviews, users, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown tasks."""
    # Startup – tables are managed by Alembic; nothing to do here
    yield
    # Shutdown – dispose engine connection pool
    await engine.dispose()


app = FastAPI(
    title="CURA Healthcare API",
    description="Backend API for the CURA healthcare appointment booking platform.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,          prefix="/api/v1/auth",          tags=["Authentication"])
app.include_router(doctors.router,       prefix="/api/v1/doctors",        tags=["Doctors"])
app.include_router(appointments.router,  prefix="/api/v1/appointments",   tags=["Appointments"])
app.include_router(reviews.router,       prefix="/api/v1/reviews",        tags=["Reviews"])
app.include_router(users.router,         prefix="/api/v1/users",          tags=["Users"])
app.include_router(notifications.router, prefix="/api/v1/notifications",  tags=["Notifications"])


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {"status": "CURA API is running 🏥", "version": "1.0.0"}


@app.get("/health", tags=["Root"])
async def health():
    return {"status": "healthy"}
