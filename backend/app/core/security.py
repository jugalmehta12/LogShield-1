from __future__ import annotations

"""JWT token creation, verification, and password hashing utilities.

This module centralises all cryptographic operations so they can be imported
from a single, well-tested location:

- Password hashing / verification via ``passlib[bcrypt]``
- JWT creation / decoding via ``python-jose``

Typical usage::

    # Hash a password at registration time
    hashed = hash_password("MySecret!")

    # Verify a password at login time
    ok = verify_password("MySecret!", hashed)

    # Mint a new access token
    token = create_access_token({"sub": str(user.id)})

    # Decode and validate a token (raises on failure)
    payload = decode_access_token(token)
"""

from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

# ── Password hashing ─────────────────────────────────────────────────────────

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Return the bcrypt hash of *plain*.

    Args:
        plain: The raw, user-supplied password.

    Returns:
        A bcrypt hash string safe to store in the database.
    """
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify *plain* against a stored bcrypt *hashed* value.

    Args:
        plain:  The raw, user-supplied password attempt.
        hashed: The stored bcrypt hash from the database.

    Returns:
        ``True`` when the password matches, ``False`` otherwise.
    """
    return _pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT access token.

    Args:
        data:          Arbitrary claims to embed in the token payload.
                       Must include a ``"sub"`` (subject) claim.
        expires_delta: Override the default expiry.  Defaults to the value
                       configured in ``JWT_ACCESS_TOKEN_EXPIRE_MINUTES``.

    Returns:
        A compact, URL-safe JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(UTC) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.jwt_access_token_expire_minutes)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token.

    Args:
        token: The raw JWT string from the ``Authorization`` header.

    Returns:
        The decoded payload dictionary.

    Raises:
        :class:`jose.JWTError`: When the token is invalid, expired, or
            tampered with.
    """
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
]
