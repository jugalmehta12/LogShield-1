from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.log import Log


# ---------------------------------------------------------------------------
# Sample data definitions
# ---------------------------------------------------------------------------

_now = datetime.now(UTC)

SAMPLE_LOGS: list[dict] = [
    {
        "timestamp": _now - timedelta(hours=3),
        "source": "sshd",
        "event_type": "login_failed",
        "severity": "medium",
        "raw_log": (
            "Failed password for invalid user root from 203.0.113.42 port 54321 ssh2"
        ),
    },
    {
        "timestamp": _now - timedelta(hours=2),
        "source": "windows-security",
        "event_type": "login_failed",
        "severity": "medium",
        "raw_log": (
            "An account failed to log on. "
            "Account Name: Administrator  Failure Reason: Unknown user name or bad password. "
            "Source Network Address: 10.10.0.55"
        ),
    },
    {
        "timestamp": _now - timedelta(hours=1),
        "source": "sudo",
        "event_type": "privilege_escalation",
        "severity": "high",
        "raw_log": (
            "pam_unix(sudo:auth): authentication failure; "
            "logname=lowpriv uid=1002 euid=0 tty=/dev/pts/1 "
            "ruser=lowpriv rhost= user=root"
        ),
    },
]

SAMPLE_ALERTS: list[dict] = [
    {
        "alert_type": "Brute Force Attack",
        "severity": "critical",
        "status": "open",
        "created_at": _now - timedelta(hours=2, minutes=30),
    },
    {
        "alert_type": "Suspicious Login",
        "severity": "high",
        "status": "investigating",
        "created_at": _now - timedelta(hours=1),
    },
]


# ---------------------------------------------------------------------------
# Public seeder
# ---------------------------------------------------------------------------

def seed_database(db: Session) -> None:
    """
    Insert sample logs and alerts only when the respective tables are empty.
    This is idempotent — safe to call on every startup.
    """
    if db.query(Log).count() == 0:
        db.bulk_insert_mappings(Log, SAMPLE_LOGS)  # type: ignore[arg-type]
        db.commit()

    if db.query(Alert).count() == 0:
        db.bulk_insert_mappings(Alert, SAMPLE_ALERTS)  # type: ignore[arg-type]
        db.commit()
