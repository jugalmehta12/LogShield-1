from __future__ import annotations

import logging

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.rule import DetectionRule
from app.schemas.rule import RuleCreate, RuleUpdate
from app.services import broadcast_from_sync, build_rule_event

logger = logging.getLogger(__name__)


def create_rule(db: Session, payload: RuleCreate) -> DetectionRule:
    """Persist a new detection rule and broadcast the creation event.

    Args:
        db: Active SQLAlchemy session.
        payload: Validated create payload.

    Returns:
        The persisted :class:`DetectionRule` ORM instance.
    """
    rule = DetectionRule(
        name=payload.name,
        description=payload.description or "",
        field_name=payload.field_name,
        operator=payload.operator,
        value=payload.value,
        alert_type=payload.alert_type,
        severity=payload.severity,
        enabled=payload.enabled,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    logger.info("Created detection rule %s (%s)", rule.id, rule.name)
    broadcast_from_sync(build_rule_event("rule_created", rule))
    return rule


def get_rules(
    db: Session,
    *,
    enabled: bool | None = None,
    page: int = 1,
    page_size: int = 100,
) -> tuple[int, list[DetectionRule]]:
    """Return a paginated list of detection rules with optional enabled filter.

    Args:
        db:        Active SQLAlchemy session.
        enabled:   When provided, filters by enabled state.
        page:      1-indexed page number.
        page_size: Records per page.

    Returns:
        A tuple of (total_matching_rows, rows_for_current_page).
    """
    stmt = select(DetectionRule)

    if enabled is not None:
        stmt = stmt.where(DetectionRule.enabled == enabled)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total: int = db.scalar(count_stmt) or 0

    offset = (page - 1) * page_size
    items: list[DetectionRule] = list(
        db.scalars(
            stmt.order_by(DetectionRule.created_at.desc()).offset(offset).limit(page_size)
        )
    )

    return total, items


def get_rule(db: Session, rule_id: int) -> DetectionRule | None:
    """Fetch a single detection rule by primary key.

    Args:
        db:      Active SQLAlchemy session.
        rule_id: Primary key of the rule.

    Returns:
        The :class:`DetectionRule` instance, or ``None`` if not found.
    """
    return db.get(DetectionRule, rule_id)


def update_rule(db: Session, rule_id: int, payload: RuleUpdate) -> DetectionRule | None:
    """Fully update an existing detection rule.

    Args:
        db:      Active SQLAlchemy session.
        rule_id: Primary key of the rule to update.
        payload: Validated update payload.

    Returns:
        The updated :class:`DetectionRule` instance, or ``None`` if not found.
    """
    rule = db.get(DetectionRule, rule_id)
    if rule is None:
        logger.info("Rule %s not found for update", rule_id)
        return None

    rule.name = payload.name
    rule.description = payload.description or ""
    rule.field_name = payload.field_name
    rule.operator = payload.operator
    rule.value = payload.value
    rule.alert_type = payload.alert_type
    rule.severity = payload.severity
    rule.enabled = payload.enabled

    db.commit()
    db.refresh(rule)
    logger.info("Updated detection rule %s", rule.id)
    broadcast_from_sync(build_rule_event("rule_updated", rule))
    return rule


def toggle_rule(db: Session, rule_id: int, enabled: bool) -> DetectionRule | None:
    """Toggle the enabled state of a detection rule.

    Args:
        db:      Active SQLAlchemy session.
        rule_id: Primary key of the rule.
        enabled: New enabled state.

    Returns:
        The updated :class:`DetectionRule` instance, or ``None`` if not found.
    """
    rule = db.get(DetectionRule, rule_id)
    if rule is None:
        logger.info("Rule %s not found for toggle", rule_id)
        return None

    rule.enabled = enabled
    db.commit()
    db.refresh(rule)
    logger.info("Toggled detection rule %s -> enabled=%s", rule.id, enabled)
    broadcast_from_sync(build_rule_event("rule_updated", rule))
    return rule


def delete_rule(db: Session, rule_id: int) -> bool:
    """Delete a detection rule by primary key.

    Args:
        db:      Active SQLAlchemy session.
        rule_id: Primary key of the rule to delete.

    Returns:
        ``True`` if the rule was found and deleted, ``False`` otherwise.
    """
    rule = db.get(DetectionRule, rule_id)
    if rule is None:
        logger.info("Rule %s not found for deletion", rule_id)
        return False

    broadcast_from_sync(build_rule_event("rule_deleted", rule))
    db.delete(rule)
    db.commit()
    logger.info("Deleted detection rule %s", rule_id)
    return True


def get_enabled_rules(db: Session) -> list[DetectionRule]:
    """Fetch all enabled detection rules for use by the detection engine.

    Args:
        db: Active SQLAlchemy session.

    Returns:
        List of enabled :class:`DetectionRule` instances.
    """
    return list(
        db.scalars(
            select(DetectionRule).where(DetectionRule.enabled == True)  # noqa: E712
        )
    )
