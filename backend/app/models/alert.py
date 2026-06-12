from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Alert(Base):
    """Represents a triggered security alert derived from log analysis."""

    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_type: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="open",
        server_default="open",
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        server_default=func.now(),
    )

    # ── Future extensibility ─────────────────────────────────────────────────
    # Uncomment when the Alert ↔ Log linkage is introduced:
    # logs: Mapped[list[Log]] = relationship("Log", back_populates="alert")

    def __repr__(self) -> str:
        return f"<Alert id={self.id} type={self.alert_type!r} status={self.status!r}>"
