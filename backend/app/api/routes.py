from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter

from app.schemas.alert import AlertRead
from app.schemas.log import LogRead

router = APIRouter()


@router.get("/logs", response_model=list[LogRead])
def list_logs() -> list[LogRead]:
    now = datetime.now(UTC)
    return [
        LogRead(
            id=1,
            timestamp=now - timedelta(minutes=5),
            source="auth-service",
            event_type="login_failed",
            severity="medium",
            raw_log="Failed login attempt from 10.0.0.12 for user admin",
        ),
        LogRead(
            id=2,
            timestamp=now - timedelta(minutes=2),
            source="web-gateway",
            event_type="request_rate_high",
            severity="low",
            raw_log="Request rate exceeded baseline for /api/login",
        ),
    ]


@router.get("/alerts", response_model=list[AlertRead])
def list_alerts() -> list[AlertRead]:
    now = datetime.now(UTC)
    return [
        AlertRead(
            id=1,
            alert_type="Suspicious Authentication Activity",
            severity="high",
            status="open",
            created_at=now - timedelta(hours=1),
        ),
        AlertRead(
            id=2,
            alert_type="Potential Brute Force Pattern",
            severity="critical",
            status="investigating",
            created_at=now - timedelta(minutes=35),
        ),
    ]
