from __future__ import annotations

"""Reusable FastAPI dependencies for authentication and role-based access control.

Usage in a route::

    from app.api.deps import get_current_user, require_role

    @router.get("/admin-only")
    def admin_endpoint(
        current_user: Annotated[User, Depends(require_role("admin"))],
    ) -> dict:
        return {"hello": current_user.username}

``get_current_user`` validates the Bearer JWT and returns the User ORM
instance.  ``require_role`` wraps it and additionally enforces the allowed
role set.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.crud.user import get_user_by_id
from app.database.session import get_db
from app.models.user import User

_bearer_scheme = HTTPBearer(auto_error=True)

DbSession = Annotated[Session, Depends(get_db)]
BearerToken = Annotated[HTTPAuthorizationCredentials, Depends(_bearer_scheme)]

_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: BearerToken,
    db: DbSession,
) -> User:
    """Validate the JWT Bearer token and return the authenticated user.

    This dependency is designed to be composed with route handlers via
    ``Depends(get_current_user)``.

    Args:
        credentials: Extracted ``Authorization: Bearer <token>`` header.
        db:          Active database session.

    Returns:
        The authenticated :class:`~app.models.user.User` ORM instance.

    Raises:
        :class:`fastapi.HTTPException` 401: When the token is missing, invalid,
            expired, or the referenced user no longer exists / is inactive.
    """
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id_raw: str | None = payload.get("sub")
        if user_id_raw is None:
            raise _CREDENTIALS_EXCEPTION
        user_id = int(user_id_raw)
    except (JWTError, ValueError):
        raise _CREDENTIALS_EXCEPTION

    user = get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise _CREDENTIALS_EXCEPTION

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: str):
    """Return a FastAPI dependency that enforces one of the given *roles*.

    Usage::

        @router.delete("/rules/{rule_id}")
        def delete_rule(
            rule_id: int,
            db: DbSession,
            _: Annotated[User, Depends(require_role("admin"))],
        ) -> None: ...

    Args:
        *roles: Allowed role names (e.g. ``"admin"``, ``"analyst"``).

    Returns:
        A dependency callable that resolves to the current :class:`User`
        and raises 403 when the user's role is not in *roles*.
    """
    allowed = frozenset(roles)

    def _dependency(current_user: CurrentUser) -> User:
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Access denied. Required role(s): {', '.join(sorted(allowed))}. "
                    f"Your role: {current_user.role}."
                ),
            )
        return current_user

    return _dependency
