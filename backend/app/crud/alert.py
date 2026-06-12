from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.schemas.alert import AlertCreate


def create_alert(db: Session, payload: AlertCreate) -> Alert:
    """Persist a new alert and return the ORM instance."""
    alert = Alert(
        alert_type=payload.alert_type,
        severity=payload.severity,
        status=payload.status,
        created_at=payload.created_at or datetime.now(UTC),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def get_alerts(
    db: Session,
    *,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[int, list[Alert]]:
    """
    Return a (total_count, items) tuple with optional status filtering
    and offset-based pagination.

    Args:
        db:        Active SQLAlchemy session.
        status:    Optional status filter (case-insensitive exact match).
        page:      1-indexed page number.
        page_size: Number of records per page.

    Returns:
        A tuple of (total_matching_rows, rows_for_current_page).
    """
    stmt = select(Alert)

    if status:
        stmt = stmt.where(Alert.status == status.lower())

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total: int = db.scalar(count_stmt) or 0

    offset = (page - 1) * page_size
    items: list[Alert] = list(
        db.scalars(stmt.order_by(Alert.created_at.desc()).offset(offset).limit(page_size))
    )

    return total, items
