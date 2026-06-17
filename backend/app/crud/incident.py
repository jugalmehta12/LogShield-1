from __future__ import annotations

"""CRUD operations for Incident and InvestigationNote models.

All functions use SQLAlchemy 2.0-style queries (``select`` / ``Session.execute``).
"""

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.incident import Incident, InvestigationNote
from app.schemas.incident import IncidentCreate, IncidentUpdate, NoteCreate


# =============================================================================
# Incidents
# =============================================================================


def get_incidents(
    db: Session,
    *,
    status: str | None = None,
    severity: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[int, list[Incident]]:
    """Return a paginated list of incidents with optional filters.

    Args:
        db:        Active database session.
        status:    Filter by lifecycle status (``open`` / ``investigating`` / etc.).
        severity:  Filter by severity level.
        page:      1-indexed page number.
        page_size: Number of records per page.

    Returns:
        Tuple of ``(total_count, items)``.
    """
    stmt = select(Incident)
    count_stmt = select(func.count()).select_from(Incident)

    if status:
        stmt = stmt.where(Incident.status == status)
        count_stmt = count_stmt.where(Incident.status == status)
    if severity:
        stmt = stmt.where(Incident.severity == severity)
        count_stmt = count_stmt.where(Incident.severity == severity)

    total: int = db.execute(count_stmt).scalar_one()

    stmt = (
        stmt.order_by(Incident.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items: list[Incident] = list(db.execute(stmt).scalars().all())
    return total, items


def get_incident(db: Session, incident_id: int) -> Incident | None:
    """Fetch a single incident by primary key, or ``None`` if not found."""
    return db.get(Incident, incident_id)


def create_incident(
    db: Session,
    payload: IncidentCreate,
    *,
    created_by: int | None = None,
) -> Incident:
    """Persist a new incident and return the ORM instance.

    Args:
        db:         Active database session.
        payload:    Validated create schema.
        created_by: ID of the authenticated user performing the action.

    Returns:
        The newly created :class:`~app.models.incident.Incident` instance.
    """
    incident = Incident(
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        status=payload.status,
        alert_id=payload.alert_id,
        created_by=created_by,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


def update_incident(
    db: Session,
    incident_id: int,
    payload: IncidentUpdate,
) -> Incident | None:
    """Apply a partial update to an incident.

    Args:
        db:          Active database session.
        incident_id: Primary key of the incident to update.
        payload:     Partial update schema; ``None`` fields are skipped.

    Returns:
        The updated :class:`~app.models.incident.Incident` instance, or
        ``None`` if not found.
    """
    incident = db.get(Incident, incident_id)
    if incident is None:
        return None

    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(incident, field, value)

    # Explicitly touch updated_at for databases without trigger support
    incident.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(incident)
    return incident


def delete_incident(db: Session, incident_id: int) -> bool:
    """Delete an incident by primary key.

    Args:
        db:          Active database session.
        incident_id: Primary key of the incident to delete.

    Returns:
        ``True`` when deleted, ``False`` when not found.
    """
    incident = db.get(Incident, incident_id)
    if incident is None:
        return False
    db.delete(incident)
    db.commit()
    return True


# =============================================================================
# Investigation Notes
# =============================================================================


def get_notes(db: Session, incident_id: int) -> list[InvestigationNote]:
    """Return all notes for an incident ordered by creation time ascending.

    Args:
        db:          Active database session.
        incident_id: Parent incident primary key.

    Returns:
        Ordered list of :class:`~app.models.incident.InvestigationNote` objects.
    """
    stmt = (
        select(InvestigationNote)
        .where(InvestigationNote.incident_id == incident_id)
        .order_by(InvestigationNote.created_at.asc())
    )
    return list(db.execute(stmt).scalars().all())


def create_note(
    db: Session,
    incident_id: int,
    payload: NoteCreate,
    *,
    author_id: int | None = None,
) -> InvestigationNote:
    """Add an investigation note to an incident.

    Args:
        db:          Active database session.
        incident_id: Parent incident primary key.
        payload:     Validated note create schema.
        author_id:   ID of the authenticated user posting the note.

    Returns:
        The newly created :class:`~app.models.incident.InvestigationNote` instance.
    """
    note = InvestigationNote(
        incident_id=incident_id,
        author_id=author_id,
        note=payload.note,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
