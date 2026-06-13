from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database.session import get_db
from app.schemas.alert import AlertCreate, AlertPage, AlertRead
from app.schemas.log import LogCreate, LogPage, LogRead

router = APIRouter()

# ── Type alias for dependency injection ─────────────────────────────────────
DbSession = Annotated[Session, Depends(get_db)]

# ── Constants ────────────────────────────────────────────────────────────────
MAX_PAGE_SIZE = 100


# ===========================================================================
# Logs
# ===========================================================================


@router.get(
    "/logs",
    response_model=LogPage,
    summary="List log entries",
    tags=["logs"],
)
def list_logs(
    db: DbSession,
    severity: Annotated[
        str | None,
        Query(description="Filter by severity: low | medium | high | critical"),
    ] = None,
    page: Annotated[int, Query(ge=1, description="Page number (1-indexed)")] = 1,
    page_size: Annotated[
        int, Query(ge=1, le=MAX_PAGE_SIZE, description="Records per page")
    ] = 20,
) -> LogPage:
    """Return a paginated list of log entries, optionally filtered by severity."""
    total, items = crud.get_logs(db, severity=severity, page=page, page_size=page_size)
    return LogPage(total=total, page=page, page_size=page_size, items=items)


@router.post(
    "/logs",
    response_model=LogRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a log entry",
    tags=["logs"],
)
def create_log(db: DbSession, payload: LogCreate) -> LogRead:
    """Ingest a new raw log entry."""
    return crud.create_log(db, payload)


# ===========================================================================
# Alerts
# ===========================================================================


@router.get(
    "/alerts",
    response_model=AlertPage,
    summary="List alerts",
    tags=["alerts"],
)
def list_alerts(
    db: DbSession,
    status_filter: Annotated[
        str | None,
        Query(
            alias="status",
            description="Filter by status: open | investigating | resolved | dismissed",
        ),
    ] = None,
    page: Annotated[int, Query(ge=1, description="Page number (1-indexed)")] = 1,
    page_size: Annotated[
        int, Query(ge=1, le=MAX_PAGE_SIZE, description="Records per page")
    ] = 20,
) -> AlertPage:
    """Return a paginated list of alerts, optionally filtered by status."""
    total, items = crud.get_alerts(
        db, status=status_filter, page=page, page_size=page_size
    )
    return AlertPage(total=total, page=page, page_size=page_size, items=items)


@router.post(
    "/alerts",
    response_model=AlertRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an alert",
    tags=["alerts"],
)
def create_alert(db: DbSession, payload: AlertCreate) -> AlertRead:
    """Create a new security alert."""
    return crud.create_alert(db, payload)


# ===========================================================================
# Health / liveness
# ===========================================================================


@router.get(
    "/health",
    summary="Health check",
    tags=["system"],
    response_model=dict,
)
def health_check(db: DbSession) -> dict:
    """Verify that the API and database connection are live."""
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    if not db_ok:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed",
        )

    return {"status": "ok", "database": "connected"}
