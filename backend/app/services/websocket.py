from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any

import anyio
from fastapi import WebSocket

from app.models.alert import Alert
from app.models.log import Log

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manage active WebSocket clients and broadcast server events.

    The manager keeps a set of connected clients and safely removes sockets that
    disconnect while a broadcast is in progress.
    """

    def __init__(self) -> None:
        self.active_connections: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        """Accept and register a new WebSocket client."""
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)
        logger.info("WebSocket client connected; active=%s", len(self.active_connections))

    async def disconnect(self, websocket: WebSocket) -> None:
        """Remove a WebSocket client from the active connection set."""
        async with self._lock:
            self.active_connections.discard(websocket)
        logger.info("WebSocket client disconnected; active=%s", len(self.active_connections))

    async def broadcast(self, message: dict[str, Any]) -> None:
        """Broadcast a JSON-serializable payload to all connected clients."""
        async with self._lock:
            connections = list(self.active_connections)

        if not connections:
            logger.debug("Skipping WebSocket broadcast for %s; no clients connected.", message.get("type"))
            return

        disconnected: list[WebSocket] = []
        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(websocket)
                logger.exception("Failed to send WebSocket event %s", message.get("type"))

        if disconnected:
            async with self._lock:
                for websocket in disconnected:
                    self.active_connections.discard(websocket)
            logger.info("Removed %s disconnected WebSocket client(s)", len(disconnected))


websocket_manager = ConnectionManager()


def _build_event(event_type: str, data: dict[str, Any]) -> dict[str, Any]:
    return {"type": event_type, "data": data}


def _serialize_datetime(value: datetime) -> str:
    return value.isoformat()


def serialize_log(log: Log) -> dict[str, Any]:
    """Convert a Log ORM instance into a JSON-serializable payload."""
    return {
        "id": log.id,
        "timestamp": _serialize_datetime(log.timestamp),
        "source": log.source,
        "event_type": log.event_type,
        "severity": log.severity,
        "raw_log": log.raw_log,
    }


def serialize_alert(alert: Alert) -> dict[str, Any]:
    """Convert an Alert ORM instance into a JSON-serializable payload."""
    return {
        "id": alert.id,
        "alert_type": alert.alert_type,
        "severity": alert.severity,
        "status": alert.status,
        "created_at": _serialize_datetime(alert.created_at),
    }


def build_log_created_event(log: Log) -> dict[str, Any]:
    """Build the payload broadcast when a log is created."""
    return _build_event("log_created", serialize_log(log))


def build_alert_created_event(alert: Alert) -> dict[str, Any]:
    """Build the payload broadcast when an alert is created."""
    return _build_event("alert_created", serialize_alert(alert))


def build_alert_updated_event(alert: Alert) -> dict[str, Any]:
    """Build the payload broadcast when an alert status is updated."""
    return _build_event("alert_updated", serialize_alert(alert))


def serialize_rule(rule: Any) -> dict[str, Any]:
    """Convert a DetectionRule ORM instance into a JSON-serializable payload."""
    return {
        "id": rule.id,
        "name": rule.name,
        "description": rule.description,
        "field_name": rule.field_name,
        "operator": rule.operator,
        "value": rule.value,
        "alert_type": rule.alert_type,
        "severity": rule.severity,
        "enabled": rule.enabled,
        "created_at": _serialize_datetime(rule.created_at),
    }


def build_rule_event(event_type: str, rule: Any) -> dict[str, Any]:
    """Build a broadcast payload for rule lifecycle events.

    Args:
        event_type: One of ``rule_created``, ``rule_updated``, ``rule_deleted``.
        rule: DetectionRule ORM instance.

    Returns:
        JSON-serializable event dictionary.
    """
    return _build_event(event_type, serialize_rule(rule))


def broadcast_from_sync(message: dict[str, Any]) -> None:
    """Broadcast a websocket event from synchronous code.

    FastAPI sync routes run inside an AnyIO worker thread, which allows the
    manager's async broadcast coroutine to be scheduled safely. If the caller is
    not inside an AnyIO worker thread, the broadcast is skipped without raising.
    """
    try:
        anyio.from_thread.run(websocket_manager.broadcast, message)
    except RuntimeError:
        logger.debug("Skipped WebSocket broadcast outside AnyIO worker thread: %s", message.get("type"))
