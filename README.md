# PAYYYYY_MOCK

Palm-based Payment Authentication System

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Ports 5173 (frontend) and 8000 (backend) available

### Setup
1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd PAYYYYY_MOCK
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start the stack**
   ```bash
   docker compose up -d --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** — Complete setup and troubleshooting guide
- **[FIX_SUMMARY.md](FIX_SUMMARY.md)** — Details about the login error fix

## 🏗️ Architecture

| Service | Technology | Port |
|---------|-----------|------|
| Frontend | React + Vite + Tailwind | 5173 |
| Backend | FastAPI + SQLAlchemy | 8000 |
| Database | Postgres 15 | 5432 |

## 🔐 Authentication

- **Signup**: `POST /auth/signup` — Create new account
- **Signin**: `POST /auth/signin` — Authenticate user
- Sessions stored in browser localStorage

## 🌴 Palm Verification

- **Register**: `POST /palm/register` — Register palm landmarks
- **Verify**: `POST /palm/verify` — Verify palm data
- **Status**: `GET /palm/status` — Check verification status

## 📁 Project Structure

```
PAYYYYY_MOCK/
├── frontend/              # React UI
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── backend/               # FastAPI server
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml     # Orchestration
├── .env                   # Environment config (copy from .env.example)
└── README.md             # This file
```

## 🐛 Troubleshooting

### Login Error: "Unexpected token '<', '<html> ..."
**Solution**: Ensure `.env` file exists with `VITE_API_URL=http://localhost:8000`

### Cannot connect to backend
**Solution**: Check that port 8000 is not in use: `netstat -an | grep 8000`

### Database connection failed
**Solution**: Ensure Postgres container is running: `docker compose logs postgres`

See **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for more troubleshooting tips.

## 📝 License

[Your license here]
