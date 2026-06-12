from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Log(Base):
    """Represents a raw ingested security log entry."""

    __tablename__ = "logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        server_default=func.now(),
    )
    source: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    raw_log: Mapped[str] = mapped_column(Text, nullable=False)

    # ── Future extensibility ─────────────────────────────────────────────────
    # Uncomment when the Alert ↔ Log linkage is introduced:
    # alert_id: Mapped[int | None] = mapped_column(
    #     Integer, ForeignKey("alerts.id", ondelete="SET NULL"), nullable=True, index=True
    # )
    # alert: Mapped[Alert | None] = relationship("Alert", back_populates="logs")

    def __repr__(self) -> str:
        return f"<Log id={self.id} source={self.source!r} severity={self.severity!r}>"
