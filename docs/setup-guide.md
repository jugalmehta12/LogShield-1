# Setup Guide

## Prerequisites

- Python 3.12
- Node.js 20 or later
- npm
- Docker Desktop

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Dockerized Backend and PostgreSQL

```bash
docker compose up --build
```

## Environment Files

- `backend/.env` contains `DATABASE_URL`.
- `frontend/.env.example` documents `VITE_API_URL`.

## Development Workflow

1. Start PostgreSQL and FastAPI.
2. Start the React/Vite renderer.
3. Launch Electron through the frontend dev script.
4. Use the dashboard, logs, alerts, and settings pages as the initial shell.

## Phase 1 Scope Reminder

This setup only includes the project foundation and UI scaffolding. No detection rules, ML models, or automated threat classification are implemented yet.
