from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ── Role literal ─────────────────────────────────────────────────────────────
RoleLiteral = Literal["admin", "analyst", "viewer"]

ALLOWED_ROLES: frozenset[str] = frozenset({"admin", "analyst", "viewer"})


class UserRegister(BaseModel):
    """Request body schema for creating a new user account."""

    username: str = Field(
        ..., min_length=3, max_length=150, examples=["analyst01"]
    )
    email: EmailStr = Field(..., examples=["analyst@logshield.io"])
    password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        description="Password must be between 8 and 72 characters.",
        examples=["Admin123!"],
    )
    role: RoleLiteral = Field(default="viewer", examples=["analyst"])

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        """Ensure usernames contain only safe characters."""
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError(
                "Username may only contain letters, digits, hyphens, and underscores."
            )
        return v.lower()


class UserLogin(BaseModel):
    """Request body schema for authenticating a user."""

    username: str = Field(..., min_length=1, examples=["analyst01"])
    password: str = Field(..., min_length=8, max_length=72, examples=["Admin123!"])


class TokenResponse(BaseModel):
    """Response schema returned on successful login."""

    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    """Public-facing user schema (never exposes hashed_password)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    role: RoleLiteral
    is_active: bool
    created_at: datetime
