# Problem & Solution Summary

## The Issue
When your collaborator cloned the project and ran `docker compose up`, they received a JSON parse error during login:
```
"Unexpected token '<', '<html> ..."
```

This error occurs when the browser receives HTML (a 404 or error page) instead of the expected JSON response from the backend API.

## Root Cause
The `.env` file was **missing**. Without it:
1. The `VITE_API_URL` environment variable was **undefined** during the frontend Docker build
2. The built frontend bundle had an empty/undefined API URL
3. The frontend's fetch calls made **relative requests** (e.g., `/auth/signin` instead of `http://localhost:8000/auth/signin`)
4. The relative path resolved to nginx's static file directory, which returned a 404 HTML response
5. The browser tried to parse the HTML as JSON, causing the error

## The Fix

### 1. Created `.env` file
A new `.env` file has been created in the project root with correct configuration:
```env
VITE_API_URL=http://localhost:8000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=paymock
```

### 2. Updated `.env.example`
Updated the example file to match the correct configuration and added documentation about which env vars are active.

### 3. Created `SETUP_GUIDE.md`
A comprehensive setup guide for collaborators that explains:
- Prerequisites (Docker, ports)
- Quick start steps
- Verification procedures
- Troubleshooting tips
- Architecture overview

## Verification
✅ All services running and healthy:
- **Postgres**: Running on internal port 5432
- **Backend**: Running and responding with valid JSON on http://localhost:8000
- **Frontend**: Running on http://localhost:5173

✅ Backend API test:
```
POST /auth/signin
Response: {"detail":"Invalid credentials"}  ← Valid JSON ✓ (not HTML)
```

## What Your Collaborator Should Do

1. **Clone the repo** (as usual)
2. **Copy `.env.example` to `.env`** (or use the `.env` file already provided):
   ```bash
   cp .env.example .env
   ```
3. **Start Docker Compose**:
   ```bash
   docker compose up -d --build
   ```
4. **Access the frontend**:
   ```
   http://localhost:5173
   ```
5. **Test signup/signin** with any email/password

## Why This Happened
- The original setup didn't include a `.env` file in version control
- Docker Compose passes build args to the frontend Dockerfile
- Without the `.env` file, the `VITE_API_URL` build arg is empty
- Vite embeds this value at **build time**, not runtime
- An empty VITE_API_URL causes fetch() to make relative requests

## Prevention
- Always include a `.env.example` file (✓ done)
- Include a setup guide for new contributors (✓ done)
- Consider using a default VITE_API_URL fallback in the code (recommended future improvement)

---

**Status**: ✅ **FIXED** — The project is now ready for collaborators to clone and run!
