from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# ── Severity / event type literals for strict validation ────────────────────
SeverityLiteral = Literal["low", "medium", "high", "critical"]


class LogBase(BaseModel):
    """Fields shared by create and read schemas."""

    source: str = Field(..., max_length=255, examples=["auth-service"])
    event_type: str = Field(..., max_length=255, examples=["login_failed"])
    severity: SeverityLiteral = Field(..., examples=["medium"])
    raw_log: str = Field(..., examples=["Failed SSH login for root from 192.168.1.100"])


class LogCreate(LogBase):
    """Request body schema for creating a new log entry."""

    timestamp: datetime | None = Field(
        default=None,
        description="ISO-8601 timestamp; defaults to now() if omitted.",
    )


class LogRead(LogBase):
    """Response schema for a log entry."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime


class LogPage(BaseModel):
    """Paginated list of logs."""

    total: int
    page: int
    page_size: int
    items: list[LogRead]
