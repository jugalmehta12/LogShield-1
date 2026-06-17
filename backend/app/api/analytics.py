from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import cast, func
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_db
from app.models.alert import Alert
from app.models.log import Log
from app.schemas.analytics import (
    AlertTimeline,
    AnalyticsSummary,
    SeverityStats,
    SourceStats,
)

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(
    _: CurrentUser,
    db: Session = Depends(get_db),
) -> AnalyticsSummary:
    """Return high-level counts for logs and alerts."""
    total_logs: int = db.query(func.count(Log.id)).scalar() or 0
    total_alerts: int = db.query(func.count(Alert.id)).scalar() or 0
    open_alerts: int = (
        db.query(func.count(Alert.id)).filter(Alert.status == "open").scalar() or 0
    )
    critical_logs: int = (
        db.query(func.count(Log.id)).filter(Log.severity == "critical").scalar() or 0
    )

    return AnalyticsSummary(
        total_logs=total_logs,
        total_alerts=total_alerts,
        open_alerts=open_alerts,
        critical_logs=critical_logs,
    )


@router.get("/severity", response_model=list[SeverityStats])
def get_severity_distribution(
    _: CurrentUser,
    db: Session = Depends(get_db),
) -> list[SeverityStats]:
    """Return log counts grouped by severity, ordered by count descending."""
    rows = (
        db.query(Log.severity, func.count(Log.id).label("count"))
        .group_by(Log.severity)
        .order_by(func.count(Log.id).desc())
        .all()
    )
    return [SeverityStats(severity=row.severity, count=row.count) for row in rows]


@router.get("/top-sources", response_model=list[SourceStats])
def get_top_sources(
    _: CurrentUser,
    db: Session = Depends(get_db),
) -> list[SourceStats]:
    """Return the top 5 log sources by count, ordered descending."""
    rows = (
        db.query(Log.source, func.count(Log.id).label("count"))
        .group_by(Log.source)
        .order_by(func.count(Log.id).desc())
        .limit(5)
        .all()
    )
    return [SourceStats(source=row.source, count=row.count) for row in rows]


@router.get("/alerts-over-time", response_model=list[AlertTimeline])
def get_alerts_over_time(
    _: CurrentUser,
    db: Session = Depends(get_db),
) -> list[AlertTimeline]:
    """Return alert counts grouped by creation date (PostgreSQL-compatible)."""
    date_col = func.date(Alert.created_at)
    rows = (
        db.query(date_col.label("date"), func.count(Alert.id).label("count"))
        .group_by(date_col)
        .order_by(date_col.asc())
        .all()
    )
    return [
        AlertTimeline(date=str(row.date), count=row.count)
        for row in rows
    ]
