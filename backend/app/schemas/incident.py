from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# ── Status / severity literals ───────────────────────────────────────────────
IncidentStatusLiteral = Literal["open", "investigating", "resolved", "closed"]
SeverityLiteral = Literal["low", "medium", "high", "critical"]


# =============================================================================
# Incident schemas
# =============================================================================


class IncidentBase(BaseModel):
    """Fields shared by create and update schemas."""

    title: str = Field(..., max_length=255, examples=["Brute-force login detected"])
    description: str | None = Field(
        default=None,
        examples=["Multiple failed SSH logins from 192.168.1.42"],
    )
    severity: SeverityLiteral = Field(default="medium", examples=["high"])
    status: IncidentStatusLiteral = Field(default="open", examples=["open"])


class IncidentCreate(IncidentBase):
    """Request body for creating a new incident."""

    alert_id: int | None = Field(
        default=None,
        description="Optional ID of the source alert that triggered this incident.",
    )


class IncidentUpdate(BaseModel):
    """Partial update schema — all fields optional (PATCH semantics)."""

    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    severity: SeverityLiteral | None = None
    status: IncidentStatusLiteral | None = None


class IncidentRead(IncidentBase):
    """Response schema for an incident."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by: int | None
    alert_id: int | None
    created_at: datetime
    updated_at: datetime


class IncidentPage(BaseModel):
    """Paginated list of incidents."""

    total: int
    page: int
    page_size: int
    items: list[IncidentRead]


# =============================================================================
# InvestigationNote schemas
# =============================================================================


class NoteCreate(BaseModel):
    """Request body for adding an investigation note."""

    note: str = Field(..., min_length=1, examples=["Confirmed lateral movement from host A to B."])


class NoteRead(BaseModel):
    """Response schema for an investigation note."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    incident_id: int
    author_id: int | None
    note: str
    created_at: datetime
