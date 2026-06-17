from __future__ import annotations

"""Incident management API routes.

Role matrix:
    admin   – full access (CRUD + notes)
    analyst – create incidents, add notes, update incidents
    viewer  – read-only (GET endpoints only)
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import CurrentUser, get_current_user, require_role
from app.database.session import get_db
from app.schemas.incident import (
    IncidentCreate,
    IncidentPage,
    IncidentRead,
    IncidentUpdate,
    NoteCreate,
    NoteRead,
)
from app.services.websocket import (
    broadcast_from_sync,
    build_incident_created_event,
    build_incident_updated_event,
    build_note_added_event,
)

router = APIRouter(prefix="/incidents", tags=["incidents"])

DbSession = Annotated[Session, Depends(get_db)]
MAX_PAGE_SIZE = 100


# =============================================================================
# Incident CRUD
# =============================================================================


@router.get(
    "",
    response_model=IncidentPage,
    summary="List incidents",
)
def list_incidents(
    db: DbSession,
    current_user: CurrentUser,
    status_filter: Annotated[
        str | None,
        Query(
            alias="status",
            description="Filter by status: open | investigating | resolved | closed",
        ),
    ] = None,
    severity: Annotated[
        str | None,
        Query(description="Filter by severity: low | medium | high | critical"),
    ] = None,
    page: Annotated[int, Query(ge=1, description="Page number (1-indexed)")] = 1,
    page_size: Annotated[
        int, Query(ge=1, le=MAX_PAGE_SIZE, description="Records per page")
    ] = 20,
) -> IncidentPage:
    """Return a paginated list of incidents.

    All authenticated roles (viewer, analyst, admin) may access this endpoint.
    """
    total, items = crud.get_incidents(
        db,
        status=status_filter,
        severity=severity,
        page=page,
        page_size=page_size,
    )
    return IncidentPage(total=total, page=page, page_size=page_size, items=items)


@router.post(
    "",
    response_model=IncidentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an incident",
    dependencies=[Depends(require_role("admin", "analyst"))],
)
def create_incident(
    db: DbSession,
    payload: IncidentCreate,
    current_user: CurrentUser,
) -> IncidentRead:
    """Create a new security incident.

    Restricted to **admin** and **analyst** roles.
    """
    incident = crud.create_incident(db, payload, created_by=current_user.id)
    broadcast_from_sync(build_incident_created_event(incident))
    return incident


@router.get(
    "/{incident_id}",
    response_model=IncidentRead,
    summary="Get incident by ID",
)
def get_incident(
    incident_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> IncidentRead:
    """Fetch a single incident by its primary key.

    All authenticated roles may access this endpoint.
    """
    incident = crud.get_incident(db, incident_id)
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    return incident


@router.patch(
    "/{incident_id}",
    response_model=IncidentRead,
    summary="Update an incident",
    dependencies=[Depends(require_role("admin", "analyst"))],
)
def update_incident(
    incident_id: int,
    payload: IncidentUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> IncidentRead:
    """Partially update an incident (PATCH semantics).

    Restricted to **admin** and **analyst** roles.
    """
    incident = crud.update_incident(db, incident_id, payload)
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    broadcast_from_sync(build_incident_updated_event(incident))
    return incident


@router.delete(
    "/{incident_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an incident",
    dependencies=[Depends(require_role("admin"))],
)
def delete_incident(incident_id: int, db: DbSession) -> None:
    """Permanently delete an incident and all its notes.

    Restricted to **admin** role. Returns 404 when not found.
    """
    deleted = crud.delete_incident(db, incident_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )


# =============================================================================
# Investigation Notes
# =============================================================================


@router.get(
    "/{incident_id}/notes",
    response_model=list[NoteRead],
    summary="List investigation notes",
)
def list_notes(
    incident_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> list[NoteRead]:
    """Return all investigation notes for an incident in chronological order.

    All authenticated roles may read notes.  Returns 404 when the parent
    incident does not exist.
    """
    incident = crud.get_incident(db, incident_id)
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    return crud.get_notes(db, incident_id)


@router.post(
    "/{incident_id}/notes",
    response_model=NoteRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add an investigation note",
    dependencies=[Depends(require_role("admin", "analyst"))],
)
def create_note(
    incident_id: int,
    payload: NoteCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> NoteRead:
    """Append an investigation note to an incident.

    Restricted to **admin** and **analyst** roles.  Returns 404 when the
    parent incident does not exist.
    """
    incident = crud.get_incident(db, incident_id)
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    note = crud.create_note(db, incident_id, payload, author_id=current_user.id)
    broadcast_from_sync(build_note_added_event(note))
    return note
