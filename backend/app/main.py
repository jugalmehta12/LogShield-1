from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.core.config import get_settings
from app.database.base import Base
from app.database.session import engine
from app.models import Alert, Log

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "LogShield Backend Running"}


@app.on_event("startup")
def create_database_schema() -> None:
    Base.metadata.create_all(bind=engine)


__all__ = ["app", "Alert", "Log"]
