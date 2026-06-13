from __future__ import annotations

import logging
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.crud.alert import create_alert
from app.models.log import Log
from app.schemas.alert import AlertCreate
from app.schemas.log import LogCreate
from app.services.detection import analyze_log

logger = logging.getLogger(__name__)


def create_log(db: Session, payload: LogCreate) -> Log:
    """Persist a new log entry and generate matching alerts as a best effort.

    The log insert always succeeds independently of detection or alert
    persistence failures. After the log is committed, the detection engine is
    executed against the persisted ``Log`` instance and any returned alert
    payloads are inserted using the same SQLAlchemy session.

    Args:
        db: Active SQLAlchemy session.
        payload: Request payload for the new log entry.

    Returns:
        The persisted ``Log`` ORM instance.
    """
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

    try:
        alerts = analyze_log(log)
    except Exception:
        logger.exception("Detection engine failed for log %s", log.id)
        return log

    logger.info("Generated %s alerts for log %s", len(alerts), log.id)

    for alert_payload in alerts:
        try:
            create_alert(db, AlertCreate(**alert_payload))
        except Exception:
            db.rollback()
            logger.exception(
                "Failed to persist alert for log %s with payload %s",
                log.id,
                alert_payload,
            )

    return log


def get_logs(
    db: Session,
    *,
    severity: str | None = None,
    source: str | None = None,
    event_type: str | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[int, list[Log]]:
    """
    Return a (total_count, items) tuple with optional severity filtering
    and offset-based pagination.

    Args:
        db:        Active SQLAlchemy session.
        severity:  Optional exact severity filter.
        source: Optional exact source filter.
        event_type: Optional exact event type filter.
        search: Optional case-insensitive substring search within ``raw_log``.
        page:      1-indexed page number.
        page_size: Number of records per page (max enforced by caller).

    Returns:
        A tuple of (total_matching_rows, rows_for_current_page).
    """
    stmt = select(Log)

    if severity:
        stmt = stmt.where(Log.severity == severity)

    if source:
        stmt = stmt.where(Log.source == source)

    if event_type:
        stmt = stmt.where(Log.event_type == event_type)

    if search:
        stmt = stmt.where(Log.raw_log.ilike(f"%{search}%"))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total: int = db.scalar(count_stmt) or 0

    offset = (page - 1) * page_size
    items: list[Log] = list(
        db.scalars(stmt.order_by(Log.timestamp.desc()).offset(offset).limit(page_size))
    )

    return total, items
