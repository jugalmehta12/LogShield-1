from __future__ import annotations

"""Rule-based detection utilities for LogShield.

This module provides a hybrid detection engine:

1. **Database rules** – Enabled :class:`~app.models.rule.DetectionRule` rows
   loaded from the database at call-time.  Each rule is evaluated against the
   log using the rule's ``field_name``, ``operator``, and ``value`` fields.

2. **Hardcoded fallback rules** – A small set of built-in patterns that fire
   regardless of database state, preserving backward-compatible behaviour.

The public entry-point is :func:`analyze_log`.  It does *not* perform any
database writes; all persistence is handled by callers in the CRUD layer.
"""

from typing import TYPE_CHECKING, Final

from sqlalchemy.orm import Session

from app.models.log import Log

if TYPE_CHECKING:
    from app.models.rule import DetectionRule

AlertPayload = dict[str, str]

# ── Built-in / hardcoded fallback rules ─────────────────────────────────────

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


def _apply_operator(log_value: str, operator: str, rule_value: str) -> bool:
    """Evaluate a single rule condition against a normalised log field value.

    Args:
        log_value:  The normalised (lower-cased, stripped) value extracted from
                    the log entry.
        operator:   One of ``equals``, ``contains``, ``startswith``,
                    ``endswith``.
        rule_value: The rule's comparison value (already lower-cased).

    Returns:
        ``True`` when the condition matches, ``False`` otherwise.
    """
    if operator == "equals":
        return log_value == rule_value
    if operator == "contains":
        return rule_value in log_value
    if operator == "startswith":
        return log_value.startswith(rule_value)
    if operator == "endswith":
        return log_value.endswith(rule_value)
    return False


def _evaluate_db_rules(
    log: Log, rules: list[DetectionRule]
) -> list[AlertPayload]:
    """Evaluate database-backed detection rules against a log entry.

    Args:
        log:   SQLAlchemy ``Log`` ORM instance to inspect.
        rules: Enabled :class:`~app.models.rule.DetectionRule` instances.

    Returns:
        A list of alert payload dictionaries for rules that matched.
    """
    alerts: list[AlertPayload] = []

    log_fields: dict[str, str] = {
        "source": (log.source or "").strip().lower(),
        "event_type": (log.event_type or "").strip().lower(),
        "severity": (log.severity or "").strip().lower(),
        "raw_log": (log.raw_log or "").strip().lower(),
    }

    for rule in rules:
        field_value = log_fields.get(rule.field_name, "")
        rule_value = (rule.value or "").strip().lower()

        if _apply_operator(field_value, rule.operator, rule_value):
            alerts.append(
                {
                    "alert_type": rule.alert_type,
                    "severity": rule.severity,
                    "status": "open",
                }
            )

    return alerts


def _evaluate_hardcoded_rules(log: Log) -> list[AlertPayload]:
    """Evaluate the built-in fallback detection rules.

    These rules always execute to guarantee baseline detection coverage even
    when no user-defined rules exist in the database.

    Rules:
        1. ``event_type == "privilege_escalation"`` → Privilege Escalation
        2. ``event_type == "login_failed"`` and ``severity == "medium"`` → Suspicious Login
        3. ``raw_log`` contains ``"Failed password"`` or ``"authentication failure"`` → Authentication Failure

    Args:
        log: SQLAlchemy ``Log`` ORM instance to inspect.

    Returns:
        A list of alert payload dictionaries for matching hardcoded rules.
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


def analyze_log(log: Log, db: Session | None = None) -> list[AlertPayload]:
    """Analyze a log entry against all active detection rules.

    Combines database-driven rules (when ``db`` is supplied) with the built-in
    hardcoded fallback rules.  Duplicate alert types within a single evaluation
    pass are suppressed to avoid flooding.

    Args:
        log: SQLAlchemy ``Log`` ORM instance to inspect.
        db:  Optional active SQLAlchemy session.  When provided, enabled
             :class:`~app.models.rule.DetectionRule` rows are loaded and
             evaluated first.  When ``None``, only hardcoded rules fire.

    Returns:
        A deduplicated list of alert payload dictionaries.  Returns an empty
        list when no rule matches.
    """
    alerts: list[AlertPayload] = []
    seen_types: set[str] = set()

    if db is not None:
        from app.crud.rule import get_enabled_rules  # local import avoids circularity

        try:
            db_rules = get_enabled_rules(db)
            for payload in _evaluate_db_rules(log, db_rules):
                if payload["alert_type"] not in seen_types:
                    seen_types.add(payload["alert_type"])
                    alerts.append(payload)
        except Exception:  # pylint: disable=broad-except
            import logging
            logging.getLogger(__name__).exception(
                "Failed to evaluate database rules for log %s", log.id
            )

    for payload in _evaluate_hardcoded_rules(log):
        if payload["alert_type"] not in seen_types:
            seen_types.add(payload["alert_type"])
            alerts.append(payload)

    return alerts
