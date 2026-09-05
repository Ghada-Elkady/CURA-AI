"""CURA application configuration using Pydantic Settings."""

from __future__ import annotations

import json
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database: defaults to SQLite for immediate out-of-the-box local operation,
    # or PostgreSQL when DATABASE_URL is set in environment.
    DATABASE_URL: str = "sqlite+aiosqlite:///./cura.db"

    # JWT
    SECRET_KEY: str = "cura-health-secret-key-production-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> List[str]:
        """Accept a JSON string or a list of strings."""
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                # Comma-separated fallback
                return [origin.strip() for origin in v.split(",")]
        return v  # type: ignore[return-value]


settings = Settings()

