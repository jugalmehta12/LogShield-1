from __future__ import annotations

"""Authentication endpoints: register, login, and current-user profile."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.core.security import create_access_token
from app.crud.user import authenticate_user, create_user, list_users
from app.database.session import get_db
from app.schemas.user import TokenResponse, UserRead, UserRegister, UserLogin

router = APIRouter(prefix="/auth", tags=["auth"])

DbSession = Annotated[Session, Depends(get_db)]


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(db: DbSession, payload: UserRegister) -> UserRead:
    """Create a new LogShield user.

    Fails with 409 when the username or email is already taken.

    Request body::

        {
            "username": "analyst01",
            "email": "analyst@logshield.io",
            "password": "StrongPassword123!",
            "role": "analyst"
        }
    """
    try:
        user = create_user(db, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and obtain a JWT access token",
)
def login(db: DbSession, payload: UserLogin) -> TokenResponse:
    """Validate credentials and return a signed JWT.

    Login Request::

        {
            "username": "analyst01",
            "password": "StrongPassword123!"
        }

    Login Response::

        {
            "access_token": "<JWT>",
            "token_type": "bearer"
        }

    Returns 401 on invalid credentials.
    """
    user = authenticate_user(db, payload.username, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        {"sub": str(user.id), "role": user.role, "username": user.username}
    )
    return TokenResponse(access_token=token)


@router.get(
    "/me",
    response_model=UserRead,
    summary="Return the currently authenticated user",
)
def me(current_user: CurrentUser) -> UserRead:
    """Return the profile of the authenticated user.

    Requires a valid ``Authorization: Bearer <token>`` header.
    """
    return current_user


@router.get(
    "/users",
    response_model=list[UserRead],
    summary="List all registered users (admin only)",
)
def get_users(
    db: DbSession,
    current_user: CurrentUser,
) -> list[UserRead]:
    """Return all registered users.

    Restricted to administrators.  Returns 403 for other roles.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return list_users(db)
