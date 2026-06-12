# API Design

## Base URLs

- Backend: `http://localhost:8000`
- Frontend dev server: `http://localhost:5173`

## Endpoints

### `GET /`

Health check for the backend service.

Response:

```json
{
  "message": "LogShield Backend Running"
}
```

### `GET /logs`

Returns dummy log records for the Phase 1 dashboard and log list.

Response shape:

```json
[
  {
    "id": 1,
    "timestamp": "2026-06-12T12:00:00Z",
    "source": "auth-service",
    "event_type": "login_failed",
    "severity": "medium",
    "raw_log": "Failed login attempt from 10.0.0.12 for user admin"
  }
]
```

### `GET /alerts`

Returns dummy alert records for the Phase 1 dashboard and alert list.

Response shape:

```json
[
  {
    "id": 1,
    "alert_type": "Suspicious Authentication Activity",
    "severity": "high",
    "status": "open",
    "created_at": "2026-06-12T12:00:00Z"
  }
]
```

## Data Model Intent

### Log

- `id`
- `timestamp`
- `source`
- `event_type`
- `severity`
- `raw_log`

### Alert

- `id`
- `alert_type`
- `severity`
- `status`
- `created_at`

## Implementation Notes

- Responses are currently in-memory placeholders.
- Pydantic schemas define the public contract.
- SQLAlchemy models are ready for persistence once CRUD endpoints are introduced.
