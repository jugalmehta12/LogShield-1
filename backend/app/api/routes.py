from __future__ import annotations

"""Main API router with RBAC-protected endpoints.

Role matrix:
    admin   – full access (read + write + delete everywhere)
    analyst – view logs, update alerts, view rules; cannot manage rules
    viewer  – read-only (GET endpoints only)
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import CurrentUser, get_current_user, require_role
from app.database.session import get_db
from app.schemas.alert import AlertCreate, AlertPage, AlertRead, AlertStatusUpdate
from app.schemas.log import LogCreate, LogPage, LogRead
from app.schemas.rule import RuleCreate, RulePage, RuleRead, RuleToggle, RuleUpdate

router = APIRouter()

# ── Type aliases ──────────────────────────────────────────────────────────────
DbSession = Annotated[Session, Depends(get_db)]

# ── Constants ──────────────────────────────────────────────────────────────────
MAX_PAGE_SIZE = 100


# =============================================================================
# Logs
# =============================================================================


@router.get(
    "/logs",
    response_model=LogPage,
    summary="List log entries",
    tags=["logs"],
)
def list_logs(
    db: DbSession,
    current_user: CurrentUser,
    severity: Annotated[
        str | None,
        Query(description="Filter by severity: low | medium | high | critical"),
    ] = None,
    source: Annotated[
        str | None,
        Query(description="Filter by source using an exact match"),
    ] = None,
    event_type: Annotated[
        str | None,
        Query(description="Filter by event type using an exact match"),
    ] = None,
    search: Annotated[
        str | None,
        Query(description="Case-insensitive search within raw log text"),
    ] = None,
    page: Annotated[int, Query(ge=1, description="Page number (1-indexed)")] = 1,
    page_size: Annotated[
        int, Query(ge=1, le=MAX_PAGE_SIZE, description="Records per page")
    ] = 20,
) -> LogPage:
    """Return a paginated list of log entries.

    All authenticated roles (viewer, analyst, admin) may access this endpoint.
    """
    total, items = crud.get_logs(
        db,
        severity=severity,
        source=source,
        event_type=event_type,
        search=search,
        page=page,
        page_size=page_size,
    )
    return LogPage(total=total, page=page, page_size=page_size, items=items)


@router.post(
    "/logs",
    response_model=LogRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a log entry",
    tags=["logs"],
    dependencies=[Depends(require_role("admin", "analyst"))],
)
def create_log(db: DbSession, payload: LogCreate) -> LogRead:
    """Ingest a new raw log entry.

    Restricted to **admin** and **analyst** roles.
    """
    return crud.create_log(db, payload)


# =============================================================================
# Alerts
# =============================================================================


@router.get(
    "/alerts",
    response_model=AlertPage,
    summary="List alerts",
    tags=["alerts"],
)
def list_alerts(
    db: DbSession,
    current_user: CurrentUser,
    status_filter: Annotated[
        str | None,
        Query(
            alias="status",
            description="Filter by status: open | investigating | resolved",
        ),
    ] = None,
    page: Annotated[int, Query(ge=1, description="Page number (1-indexed)")] = 1,
    page_size: Annotated[
        int, Query(ge=1, le=MAX_PAGE_SIZE, description="Records per page")
    ] = 20,
) -> AlertPage:
    """Return a paginated list of alerts.

    All authenticated roles may read alerts.
    """
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
    dependencies=[Depends(require_role("admin"))],
)
def create_alert(db: DbSession, payload: AlertCreate) -> AlertRead:
    """Create a new security alert.

    Restricted to **admin** role.
    """
    return crud.create_alert(db, payload)


@router.patch(
    "/alerts/{alert_id}",
    response_model=AlertRead,
    summary="Update alert workflow status",
    tags=["alerts"],
    dependencies=[Depends(require_role("admin", "analyst"))],
)
def update_alert_status(
    alert_id: int,
    payload: AlertStatusUpdate,
    db: DbSession,
) -> AlertRead:
    """Update the workflow status of an alert.

    Restricted to **admin** and **analyst** roles.

    Returns 400 when the supplied status is not in the allowed lifecycle values.
    """
    status_value = payload.status.strip().lower()
    if status_value not in ("open", "investigating", "resolved"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid alert status",
        )

    alert = crud.update_alert_status(db, alert_id=alert_id, status=status_value)
    if alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )

    return alert


@router.delete(
    "/alerts/{alert_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an alert",
    tags=["alerts"],
    dependencies=[Depends(require_role("admin"))],
)
def delete_alert(alert_id: int, db: DbSession) -> None:
    """Permanently delete an alert.

    Restricted to **admin** role.  Returns 404 when not found.
    """
    from sqlalchemy import select as _select
    from app.models.alert import Alert as _Alert

    alert = db.get(_Alert, alert_id)
    if alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )
    db.delete(alert)
    db.commit()


# =============================================================================
# Detection Rules
# =============================================================================


@router.get(
    "/rules",
    response_model=RulePage,
    summary="List detection rules",
    tags=["rules"],
)
def list_rules(
    db: DbSession,
    current_user: CurrentUser,
    enabled: Annotated[
        bool | None,
        Query(description="Filter by enabled state"),
    ] = None,
    page: Annotated[int, Query(ge=1, description="Page number (1-indexed)")] = 1,
    page_size: Annotated[
        int, Query(ge=1, le=MAX_PAGE_SIZE, description="Records per page")
    ] = 100,
) -> RulePage:
    """Return a paginated list of detection rules.

    All authenticated roles may read rules.
    """
    total, items = crud.get_rules(db, enabled=enabled, page=page, page_size=page_size)
    return RulePage(total=total, page=page, page_size=page_size, items=items)


@router.post(
    "/rules",
    response_model=RuleRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a detection rule",
    tags=["rules"],
    dependencies=[Depends(require_role("admin"))],
)
def create_rule(db: DbSession, payload: RuleCreate) -> RuleRead:
    """Create a new detection rule.

    Restricted to **admin** role.
    """
    return crud.create_rule(db, payload)


@router.put(
    "/rules/{rule_id}",
    response_model=RuleRead,
    summary="Update a detection rule",
    tags=["rules"],
    dependencies=[Depends(require_role("admin"))],
)
def update_rule(rule_id: int, payload: RuleUpdate, db: DbSession) -> RuleRead:
    """Fully replace a detection rule.

    Restricted to **admin** role.  Returns 404 when not found.
    """
    rule = crud.update_rule(db, rule_id=rule_id, payload=payload)
    if rule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rule not found",
        )
    return rule


@router.delete(
    "/rules/{rule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a detection rule",
    tags=["rules"],
    dependencies=[Depends(require_role("admin"))],
)
def delete_rule(rule_id: int, db: DbSession) -> None:
    """Permanently remove a detection rule.

    Restricted to **admin** role.  Returns 404 when not found.
    """
    deleted = crud.delete_rule(db, rule_id=rule_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rule not found",
        )


@router.patch(
    "/rules/{rule_id}/toggle",
    response_model=RuleRead,
    summary="Toggle rule enabled state",
    tags=["rules"],
    dependencies=[Depends(require_role("admin"))],
)
def toggle_rule(rule_id: int, payload: RuleToggle, db: DbSession) -> RuleRead:
    """Enable or disable a detection rule.

    Restricted to **admin** role.  Returns 404 when not found.
    """
    rule = crud.toggle_rule(db, rule_id=rule_id, enabled=payload.enabled)
    if rule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rule not found",
        )
    return rule


# =============================================================================
# Health / liveness
# =============================================================================


@router.get(
    "/health",
    summary="Health check",
    tags=["system"],
    response_model=dict,
)
def health_check(db: DbSession) -> dict:
    """Verify that the API and database connection are live.

    Public endpoint — does not require authentication.
    """
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
