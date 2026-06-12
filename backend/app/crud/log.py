from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.log import Log
from app.schemas.log import LogCreate


def create_log(db: Session, payload: LogCreate) -> Log:
    """Persist a new log entry and return the ORM instance."""
    log = Log(
        timestamp=payload.timestamp or datetime.now(UTC),
        source=payload.source,
        event_type=payload.event_type,
        severity=payload.severity,
        raw_log=payload.raw_log,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_logs(
    db: Session,
    *,
    severity: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[int, list[Log]]:
    """
    Return a (total_count, items) tuple with optional severity filtering
    and offset-based pagination.

    Args:
        db:        Active SQLAlchemy session.
        severity:  Optional severity filter (case-insensitive exact match).
        page:      1-indexed page number.
        page_size: Number of records per page (max enforced by caller).

    Returns:
        A tuple of (total_matching_rows, rows_for_current_page).
    """
    stmt = select(Log)

    if severity:
        stmt = stmt.where(Log.severity == severity.lower())

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total: int = db.scalar(count_stmt) or 0

    offset = (page - 1) * page_size
    items: list[Log] = list(
        db.scalars(stmt.order_by(Log.timestamp.desc()).offset(offset).limit(page_size))
    )

    return total, items
