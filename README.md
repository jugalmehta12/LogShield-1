# LogShield

LogShield is a cross-platform SIEM-style desktop application foundation for collecting logs, storing them, visualizing operational activity, and preparing for future threat detection.

This repository contains the Phase 1 architecture scaffold only. Detection logic, alerting automation, AI-driven security features, and automated response are intentionally out of scope for this phase.

## Phase 1 Scope

- FastAPI backend with a health endpoint and dummy API data.
- SQLAlchemy and PostgreSQL foundation with environment-based configuration.
- Electron + React + Vite + Tailwind desktop shell.
- Axios-based frontend integration with backend endpoints.
- Project documentation and Docker orchestration.

## Repository Layout

- `backend/` FastAPI service, SQLAlchemy models, PostgreSQL session wiring, API routes, and tests.
- `frontend/` Electron + React + Vite + Tailwind desktop UI.
- `docs/` Architecture, API design, and setup documentation.
- `scripts/` Helper scripts for local backend startup.
- `docker-compose.yml` Local PostgreSQL and backend orchestration.

## File Map

### Root

- `.gitignore` ignores local environments, build outputs, and OS-specific noise.
- `README.md` project overview and Phase 1 usage guide.
- `docker-compose.yml` local service composition for PostgreSQL and the backend.

### Backend Files

- `backend/.env` environment configuration for the API and database.
- `backend/requirements.txt` Python dependencies.
- `backend/Dockerfile` backend container image.
- `backend/app/main.py` FastAPI application entry point.
- `backend/app/core/config.py` environment settings loader.
- `backend/app/database/base.py` SQLAlchemy declarative base.
- `backend/app/database/session.py` database engine and session manager.
- `backend/app/models/log.py` log ORM model.
- `backend/app/models/alert.py` alert ORM model.
- `backend/app/schemas/log.py` log response schema.
- `backend/app/schemas/alert.py` alert response schema.
- `backend/app/api/routes.py` API routes for `GET /logs` and `GET /alerts`.
- `backend/tests/test_health.py` backend health test.

### Frontend Files

- `frontend/package.json` renderer and Electron scripts.
- `frontend/index.html` Vite entry HTML.
- `frontend/vite.config.js` Vite configuration.
- `frontend/tailwind.config.js` Tailwind theme extension.
- `frontend/postcss.config.js` PostCSS pipeline.
- `frontend/.env.example` frontend API URL example.
- `frontend/electron/main.js` Electron main process.
- `frontend/electron/preload.js` Electron preload bridge.
- `frontend/src/main.jsx` React bootstrapping.
- `frontend/src/App.jsx` top-level application routing.
- `frontend/src/layouts/AppShell.jsx` desktop layout shell.
- `frontend/src/components/*` reusable UI components.
- `frontend/src/pages/*` Dashboard, Logs, Alerts, and Settings views.
- `frontend/src/services/api.js` Axios client and backend calls.
- `frontend/src/hooks/useDashboardMetrics.js` dashboard data hook.
- `frontend/src/charts/ThreatTrendChart.jsx` placeholder chart visualization.
- `frontend/src/styles/index.css` global styles and theme foundation.

### Docs

- `docs/architecture.md` architectural overview and system boundaries.
- `docs/api-design.md` API contract and model intent.
- `docs/setup-guide.md` installation and run instructions.

## Installation Commands

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
Copy-Item .env.example .env
npm install
```

### Docker

```bash
docker compose up --build
```

## Run Commands

### Run the backend locally

```bash
cd backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Run the desktop frontend

```bash
cd frontend
npm run dev
```

### Run the full local stack

```bash
docker compose up
```

## Phase 1 Endpoints

- `GET /` backend health check.
- `GET /logs` dummy log feed.
- `GET /alerts` dummy alert feed.

## Environment Variables

- `backend/.env` loads `DATABASE_URL` for PostgreSQL connection configuration.
- `frontend/.env` can define `VITE_API_URL`; if omitted, the frontend defaults to `http://localhost:8000`.

## Git Commit Messages

- `feat: scaffold LogShield Phase 1 foundation`
- `docs: add architecture, API, and setup guides`
- `chore: add backend and frontend bootstrap files`

## Phase 1 Completion Checklist

- [x] FastAPI backend created with health endpoint.
- [x] SQLAlchemy base, engine, and session manager configured.
- [x] PostgreSQL integration wired through `DATABASE_URL`.
- [x] Log and Alert ORM models created.
- [x] `GET /logs` dummy API implemented.
- [x] `GET /alerts` dummy API implemented.
- [x] Electron + React + Vite frontend scaffolded.
- [x] TailwindCSS integrated with a custom dark dashboard theme.
- [x] Sidebar, top navbar, and main content layout added.
- [x] Dashboard page with placeholder summary cards created.
- [x] Axios API integration added for backend reads.
- [x] Docker compose added for backend and PostgreSQL.
- [x] Architecture, API design, and setup docs generated.
- [x] Workspace validation completed cleanly.

## Notes

- The codebase is structured for later expansion into collectors, parsers, websocket streaming, detection, and alerting modules.
- Detection logic is intentionally not implemented in Phase 1.
