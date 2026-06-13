from __future__ import annotations

import logging
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.schemas.alert import AlertCreate, AlertStatusLiteral

logger = logging.getLogger(__name__)


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


def update_alert_status(db: Session, alert_id: int, status: AlertStatusLiteral) -> Alert | None:
    """Update only the workflow status of an alert.

    Args:
        db: Active SQLAlchemy session.
        alert_id: Primary key of the alert to update.
        status: New workflow status. Must be one of the allowed lifecycle values.

    Returns:
        The updated ``Alert`` ORM instance when found, otherwise ``None``.
    """
    alert = db.get(Alert, alert_id)
    if alert is None:
        logger.info("Alert %s not found for status update", alert_id)
        return None

    alert.status = status
    db.commit()
    db.refresh(alert)
    logger.info("Updated alert %s status to %s", alert_id, status)
    return alert
