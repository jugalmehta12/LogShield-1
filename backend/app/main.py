from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.core.config import get_settings
from app.database.base import Base
from app.database.seed import seed_database
from app.database.session import SessionLocal, engine
from app.models.alert import Alert
from app.models.log import Log
settings = get_settings()


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan handler (replaces deprecated @app.on_event).

    On startup:
      1. Create all tables (DDL) if they don't exist.
      2. Seed sample data if tables are empty.
    """
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        seed_database(db)

    yield  # application runs here

    # ── On shutdown (cleanup if needed) ─────────────────────────────────────
    engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description=(
        "LogShield SIEM backend — log ingestion, alerting, and security analytics."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/", tags=["system"])
def read_root() -> dict[str, str]:
    return {"message": "LogShield Backend Running"}


__all__ = ["app"]
