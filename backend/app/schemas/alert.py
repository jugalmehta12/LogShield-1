from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# ── Status / severity literals for strict validation ────────────────────────
AlertStatusLiteral = Literal["open", "investigating", "resolved", "dismissed"]
SeverityLiteral = Literal["low", "medium", "high", "critical"]


class AlertBase(BaseModel):
    """Fields shared by create and read schemas."""

    alert_type: str = Field(..., max_length=255, examples=["Brute Force Attack"])
    severity: SeverityLiteral = Field(..., examples=["high"])
    status: AlertStatusLiteral = Field(default="open", examples=["open"])


class AlertCreate(AlertBase):
    """Request body schema for creating a new alert."""

    created_at: datetime | None = Field(
        default=None,
        description="ISO-8601 timestamp; defaults to now() if omitted.",
    )


class AlertRead(AlertBase):
    """Response schema for an alert."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class AlertPage(BaseModel):
    """Paginated list of alerts."""

    total: int
    page: int
    page_size: int
    items: list[AlertRead]
