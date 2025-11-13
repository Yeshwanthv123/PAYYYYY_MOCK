# Setup Guide for Collaborators

## Prerequisites
- **Docker** and **Docker Compose** installed
- Port 5173 (frontend) and 8000 (backend) available on your machine

## Quick Start

### 1. Clone the Repository
```bash
git clone <repo-url>
cd PAYYYYY_MOCK
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (a `.env` file is already provided in the repo):
```bash
cp .env.example .env
```

**Important:** The `.env` file should contain:
```
VITE_API_URL=http://localhost:8000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=paymock
```

### 3. Start the Stack
```bash
docker compose up -d --build
```

This will:
- Build and start the **Postgres** database (port: internal)
- Build and start the **FastAPI** backend (port: 8000)
- Build and start the **React/Nginx** frontend (port: 5173)

### 4. Verify Everything is Running
```bash
docker compose ps
```

You should see all 3 services (postgres, backend, frontend) with status "Up".

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:5173
```

### 6. Test Login
- Use the email/password form to sign up or sign in
- The frontend will call the backend API at `http://localhost:8000/auth/signup` or `/auth/signin`

## Troubleshooting

### Error: "Unexpected token '<', '<html> ..."
This happens when `VITE_API_URL` is not set correctly. **Solution:**
1. Ensure `.env` file exists in the project root with `VITE_API_URL=http://localhost:8000`
2. Rebuild: `docker compose down` then `docker compose up -d --build`

### Error: Cannot connect to Postgres
1. Check that port 5432 is available (or not in use by another Postgres instance)
2. Verify `.env` has correct `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`
3. Restart: `docker compose restart postgres`

### Backend returns "Invalid credentials"
This is expected if the user doesn't exist yet. **Solution:**
1. Sign up with a new email/password
2. Then sign in with those credentials

### Ports Already in Use
If port 5173 or 8000 is already in use:
1. Kill the process using that port, or
2. Edit `docker-compose.yml` to use different host ports (e.g., `8080:80` for frontend, `8001:8000` for backend)

## Development Workflow

### View Backend Logs
```bash
docker compose logs -f backend
```

### View Frontend Logs
```bash
docker compose logs -f frontend
```

### Stop the Stack
```bash
docker compose down
```

### Rebuild and Restart
```bash
docker compose down
docker compose up -d --build
```

## Architecture Overview

- **Frontend**: React + TypeScript + Vite + Tailwind CSS, served by nginx
  - Calls backend endpoints at `http://localhost:8000`
  - Stores user session in browser localStorage

- **Backend**: FastAPI + SQLAlchemy + Postgres
  - Provides REST API for authentication and palm data
  - Password hashing: pbkdf2_sha256
  - Endpoints:
    - POST `/auth/signup` — Create a new user
    - POST `/auth/signin` — Authenticate user
    - POST `/palm/register` — Register palm landmarks
    - POST `/palm/verify` — Verify palm data
    - GET `/palm/status` — Get palm verification status

- **Database**: Postgres 15-alpine
  - Stores users and palm data
  - Initialized automatically on first run

## Next Steps
- Add JWT token-based authentication (currently using localStorage session)
- Deploy to cloud (AWS, GCP, Azure, Heroku, etc.)
- Add more endpoints and features as needed
