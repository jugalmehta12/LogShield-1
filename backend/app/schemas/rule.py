from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Allowed operator / severity literals ────────────────────────────────────
OperatorLiteral = Literal["equals", "contains", "startswith", "endswith"]
SeverityLiteral = Literal["low", "medium", "high", "critical"]


class RuleBase(BaseModel):
    """Fields shared by create and update schemas."""

    name: str = Field(..., min_length=1, max_length=255, examples=["Brute Force Rule"])
    description: str | None = Field(
        default="",
        max_length=1024,
        examples=["Triggers on repeated login failures"],
    )
    field_name: str = Field(
        ..., min_length=1, max_length=255, examples=["event_type"]
    )
    operator: OperatorLiteral = Field(..., examples=["equals"])
    value: str = Field(..., min_length=1, max_length=512, examples=["login_failed"])
    alert_type: str = Field(
        ..., min_length=1, max_length=255, examples=["Suspicious Login"]
    )
    severity: SeverityLiteral = Field(..., examples=["high"])
    enabled: bool = Field(default=True, examples=[True])

    @field_validator("field_name")
    @classmethod
    def validate_field_name(cls, v: str) -> str:
        """Ensure field_name is a known log attribute."""
        allowed = {"source", "event_type", "severity", "raw_log"}
        if v not in allowed:
            raise ValueError(
                f"field_name must be one of {sorted(allowed)}, got {v!r}"
            )
        return v


class RuleCreate(RuleBase):
    """Request body schema for creating a new detection rule."""


class RuleUpdate(RuleBase):
    """Request body schema for fully updating an existing detection rule."""


class RuleToggle(BaseModel):
    """Request body schema for toggling rule enabled state."""

    enabled: bool = Field(..., examples=[False])


class RuleRead(RuleBase):
    """Response schema for a detection rule."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class RulePage(BaseModel):
    """Paginated list of detection rules."""

    total: int
    page: int
    page_size: int
    items: list[RuleRead]
