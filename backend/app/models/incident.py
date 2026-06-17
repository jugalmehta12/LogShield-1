from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Incident(Base):
    """Represents a security incident created from one or more alerts.

    Lifecycle statuses:
        ``open``          – Newly created, not yet triaged.
        ``investigating`` – Actively being worked on by an analyst.
        ``resolved``      – Root cause identified and mitigated.
        ``closed``        – Fully closed after resolution review.
    """

    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True, autoincrement=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="open",
        server_default="open",
        index=True,
    )
    severity: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="medium",
        server_default="medium",
        index=True,
    )
    # FK to the user who created this incident
    created_by: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    # Optional FK to a source alert
    alert_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("alerts.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ── Relationships ────────────────────────────────────────────────────────
    notes: Mapped[list[InvestigationNote]] = relationship(
        "InvestigationNote",
        back_populates="incident",
        cascade="all, delete-orphan",
        order_by="InvestigationNote.created_at",
    )

    def __repr__(self) -> str:
        return (
            f"<Incident id={self.id} title={self.title!r} status={self.status!r}>"
        )


class InvestigationNote(Base):
    """A timestamped analyst note attached to an incident.

    Notes are immutable once created — the full timeline is preserved.
    """

    __tablename__ = "investigation_notes"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True, autoincrement=True
    )
    incident_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    note: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        server_default=func.now(),
    )

    # ── Relationships ────────────────────────────────────────────────────────
    incident: Mapped[Incident] = relationship("Incident", back_populates="notes")

    def __repr__(self) -> str:
        return (
            f"<InvestigationNote id={self.id} incident_id={self.incident_id}>"
        )
