from __future__ import annotations

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator

from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.incidents import router as incidents_router
from app.api.routes import router as api_router
from app.core.config import get_settings
from app.database.base import Base
from app.database.seed import seed_database
from app.database.session import SessionLocal, engine
from app.models.alert import Alert  # noqa: F401 – imported for DDL
from app.models.incident import Incident, InvestigationNote  # noqa: F401
from app.models.log import Log  # noqa: F401
from app.models.rule import DetectionRule  # noqa: F401
from app.models.user import User  # noqa: F401
from app.services import websocket_manager

logger = logging.getLogger(__name__)

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

app.include_router(auth_router)
app.include_router(api_router)
app.include_router(incidents_router)
app.include_router(analytics_router)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """Accept realtime client connections and keep them alive until disconnect.

    The endpoint supports multiple concurrent clients through the shared
    connection manager. Incoming client messages are ignored for now; the socket
    exists purely as a broadcast channel for server events.
    """
    await websocket_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected cleanly")
    finally:
        await websocket_manager.disconnect(websocket)


@app.get("/", tags=["system"])
def read_root() -> dict[str, str]:
    return {"message": "LogShield Backend Running"}


__all__ = ["app"]
