from __future__ import annotations

from functools import lru_cache
from pathlib import Path
import os

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


class Settings:
    """Application settings loaded from environment variables."""

    def __init__(self) -> None:
        self.app_name = os.getenv("APP_NAME", "LogShield")
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./logshield.db")
        self.backend_cors_origins = [
            origin.strip()
            for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:5173").split(",")
            if origin.strip()
        ]

        # ── JWT ──────────────────────────────────────────────────────────────
        self.jwt_secret_key: str = os.getenv(
            "JWT_SECRET_KEY",
            "change-me-in-production-use-a-long-random-string-at-least-32-chars",
        )
        self.jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_access_token_expire_minutes: int = int(
            os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
