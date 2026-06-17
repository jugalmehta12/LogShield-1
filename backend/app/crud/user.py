from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserRegister

logger = logging.getLogger(__name__)


def get_user_by_username(db: Session, username: str) -> User | None:
    """Fetch a user by username (case-insensitive lower-cased lookup).

    Args:
        db:       Active SQLAlchemy session.
        username: The username to search for.

    Returns:
        The :class:`User` ORM instance or ``None`` when not found.
    """
    return db.scalar(select(User).where(User.username == username.lower()))


def get_user_by_email(db: Session, email: str) -> User | None:
    """Fetch a user by email address.

    Args:
        db:    Active SQLAlchemy session.
        email: The email address to search for.

    Returns:
        The :class:`User` ORM instance or ``None`` when not found.
    """
    return db.scalar(select(User).where(User.email == email.lower()))


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Fetch a user by primary key.

    Args:
        db:      Active SQLAlchemy session.
        user_id: Primary key.

    Returns:
        The :class:`User` ORM instance or ``None`` when not found.
    """
    return db.get(User, user_id)


def create_user(db: Session, payload: UserRegister) -> User:
    """Persist a new user with a hashed password.

    Args:
        db:      Active SQLAlchemy session.
        payload: Validated registration payload.

    Returns:
        The persisted :class:`User` ORM instance.

    Raises:
        ValueError: When the username or email is already taken.
    """
    if get_user_by_username(db, payload.username):
        raise ValueError(f"Username '{payload.username}' is already taken.")
    if get_user_by_email(db, payload.email):
        raise ValueError(f"Email '{payload.email}' is already registered.")

    user = User(
        username=payload.username.lower(),
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Registered new user %s (role=%s)", user.username, user.role)
    return user


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    """Verify credentials and return the user on success.

    Args:
        db:       Active SQLAlchemy session.
        username: Supplied username.
        password: Plain-text password attempt.

    Returns:
        The :class:`User` ORM instance when credentials are valid and the
        account is active.  Returns ``None`` otherwise.
    """
    user = get_user_by_username(db, username)
    if user is None:
        logger.info("Auth failure: unknown username '%s'", username)
        return None
    if not user.is_active:
        logger.info("Auth failure: inactive account '%s'", username)
        return None
    if not verify_password(password, user.hashed_password):
        logger.info("Auth failure: wrong password for '%s'", username)
        return None
    return user


def list_users(db: Session) -> list[User]:
    """Return all registered users ordered by creation date.

    Args:
        db: Active SQLAlchemy session.

    Returns:
        Ordered list of :class:`User` ORM instances.
    """
    return list(db.scalars(select(User).order_by(User.created_at)))
