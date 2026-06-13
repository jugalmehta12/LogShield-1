from __future__ import annotations

"""Rule-based detection utilities for LogShield.

This module contains a pure, unit-test-friendly detection engine that inspects a
single :class:`~app.models.log.Log` instance and returns zero or more alert
payloads. It does not persist data or depend on the database session layer.
"""

from typing import Final

from app.models.log import Log

AlertPayload = dict[str, str]

PRIVILEGE_ESCALATION_ALERT: Final[AlertPayload] = {
    "alert_type": "Privilege Escalation",
    "severity": "critical",
    "status": "open",
}

SUSPICIOUS_LOGIN_ALERT: Final[AlertPayload] = {
    "alert_type": "Suspicious Login",
    "severity": "high",
    "status": "open",
}

AUTHENTICATION_FAILURE_ALERT: Final[AlertPayload] = {
    "alert_type": "Authentication Failure",
    "severity": "medium",
    "status": "open",
}


def analyze_log(log: Log) -> list[AlertPayload]:
    """Analyze a log entry and return matching alert payloads.

    The function evaluates a small set of deterministic, rule-based detection
    patterns and returns a list of alert dictionaries. Each dictionary is ready
    for downstream persistence, but this function intentionally does not write
    to the database.

    Rules:
        1. ``event_type == "privilege_escalation"`` -> Privilege Escalation
        2. ``event_type == "login_failed"`` and ``severity == "medium"`` -> Suspicious Login
        3. ``raw_log`` contains ``"Failed password"`` or ``"authentication failure"`` -> Authentication Failure

    Args:
        log: SQLAlchemy ``Log`` ORM instance to inspect.

    Returns:
        A list of alert payload dictionaries. Returns an empty list when no rule
        matches.
    """
    alerts: list[AlertPayload] = []
    event_type = (log.event_type or "").strip().lower()
    severity = (log.severity or "").strip().lower()
    raw_log = (log.raw_log or "").strip().lower()

    if event_type == "privilege_escalation":
        alerts.append(dict(PRIVILEGE_ESCALATION_ALERT))

    if event_type == "login_failed" and severity == "medium":
        alerts.append(dict(SUSPICIOUS_LOGIN_ALERT))

    if "failed password" in raw_log or "authentication failure" in raw_log:
        alerts.append(dict(AUTHENTICATION_FAILURE_ALERT))

    return alerts
