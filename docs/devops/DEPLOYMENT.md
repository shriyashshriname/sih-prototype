# Aegis AI Platform — Deployment Guide

> **Platform:** Aegis AI Disaster Decision Intelligence (SIH26191)  
> **Maintainer:** DevOps Team  
> **Last Updated:** 2026-09-28

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Development Setup](#2-development-setup)
3. [Production Setup](#3-production-setup)
4. [Environment Variables Guide](#4-environment-variables-guide)
5. [Service Architecture](#5-service-architecture)
6. [Troubleshooting Common Issues](#6-troubleshooting-common-issues)
7. [How to Run Without Docker (Manual Setup)](#7-how-to-run-without-docker-manual-setup)

---

## 1. Prerequisites

### Required Software

| Tool | Minimum Version | Install Link |
|------|----------------|--------------|
| Docker Desktop | 24.x+ | https://docs.docker.com/get-docker/ |
| Docker Compose | v2.x+ (bundled) | Bundled with Docker Desktop |
| Git | 2.x+ | https://git-scm.com/ |
| Make (optional) | any | https://gnuwin32.sourceforge.net/packages/make.htm |

### System Requirements

- **RAM:** 8 GB minimum (16 GB recommended for ML training / SHAP inference)
- **Disk:** 10 GB free space
- **OS:** Windows 10/11 (WSL2 recommended), macOS 12+, or Ubuntu 20.04+

### Verification

```powershell
docker --version          # e.g., Docker version 24.0.7
docker compose version    # e.g., Docker Compose version v2.23.3
git --version             # e.g., git version 2.43.0
```

---

## 2. Development Setup

The development setup mounts host source directories into containers for instantaneous hot reload (Vite HMR on frontend, Node 20 `--watch` on backend, and Uvicorn `--reload` on AI engine).

### Step 1 — Clone and Prepare Directory

```powershell
git clone https://github.com/your-org/aegis-platform.git
cd "aegis-platform"
```

### Step 2 — Configure Environment

```powershell
# Copy example environment configuration
copy .env.example .env

# Verify or adjust configuration
notepad .env
```

### Step 3 — Launch the Development Stack

```powershell
# Option A: Using Make
make dev

# Option B: Using Docker Compose directly
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

To run in detached mode in the background:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
# or: make dev-detach
```

### Step 4 — Active Development Endpoints

| Service | Dev URL | Internal Port | Purpose |
|---------|---------|---------------|---------|
| Client (React / Vite) | http://localhost:5173 | 5173 | SPA with Vite Hot Module Replacement (HMR) |
| Server (Express) | http://localhost:5000 | 5000 | REST API with Node 20 `--watch` hot reload |
| Server Debugger | localhost:9229 | 9229 | Node V8 Inspector for Chrome DevTools / VS Code |
| AI Engine (FastAPI) | http://localhost:8000 | 8000 | XGBoost + SHAP inference with Uvicorn reload |
| AI API Docs | http://localhost:8000/docs | 8000 | Swagger UI interactive documentation |
| Database (PostGIS) | localhost:5432 | 5432 | PostgreSQL 16 + PostGIS 3.4 spatial database |
| Redis Cache | localhost:6379 | 6379 | In-memory key-value cache and pub/sub |

### Step 5 — Monitoring & Logs

```powershell
# Stream all logs
docker compose logs -f

# Stream server logs only
docker compose logs -f server

# Stream AI engine logs only
docker compose logs -f ai-engine
```

---

## 3. Production Setup

In production mode:
- Frontend is compiled into an optimized static build (`dist/`) and served via high-performance **Nginx** on **Port 80**.
- Express backend runs in production mode (`NODE_ENV=production`) on **Port 5000**.
- All services communicate securely over the internal Docker network `aegis-network`.
- Health check dependency chains ensure clean boot order (`client` waits for `server`, which waits for `db`, `redis`, and `ai-engine`).

### Step 1 — Prepare Production Environment

```powershell
copy .env.example .env
```

Ensure production values are set in `.env`:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://aegis:CHANGE_ME_STRONG_PASSWORD@db:5432/aegis_db
POSTGRES_DB=aegis_db
POSTGRES_USER=aegis
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
JWT_SECRET=GENERATE_A_RANDOM_64_CHAR_HEX_SECRET
AI_ENGINE_URL=http://ai-engine:8000
REDIS_URL=redis://redis:6379
CLIENT_URL=http://localhost
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_KEY
```

> **Security Warning:** Never check `.env` into git. Keep database passwords and JWT secrets confidential.

### Step 2 — Build & Start the Production Stack

```powershell
# Option A: Using Make
make prod

# Option B: Using Docker Compose directly
docker compose -f docker-compose.yml up --build -d
```

### Step 3 — Verify Health Status

```powershell
docker compose ps
```

All 5 containers should transition to `healthy`:

```
NAME              IMAGE                          COMMAND                  STATUS
aegis_db          postgis/postgis:16-3.4-alpine   "docker-entrypoint.s…"   Up (healthy)
aegis_redis       redis:7-alpine                 "docker-entrypoint.s…"   Up (healthy)
aegis_ai_engine   sih-prototype-ai-engine        "python main.py"         Up (healthy)
aegis_server      sih-prototype-server           "node index.js"          Up (healthy)
aegis_client      sih-prototype-client           "nginx -g 'daemon of…"   Up (healthy)
```

### Step 4 — Access the Platform

- **Application Web UI:** `http://localhost/` (Port 80)
- **API Proxy Endpoint:** `http://localhost/api/` (Forwarded directly to Express backend)
- **Direct Backend Health Check:** `http://localhost:5000/health` or `http://localhost:5000/api/health`
- **Direct AI Health Check:** `http://localhost:8000/health`

### Step 5 — Stop or Restart Stack

```powershell
# Stop all containers
make stop
# or: docker compose down

# Rebuild images cleanly
make rebuild

# Clean down with volume removal (CAUTION: wipes database)
make clean
```

---

## 4. Environment Variables Guide

| Variable | Default Value | Required | Purpose |
|----------|---------------|----------|---------|
| `NODE_ENV` | `development` | Yes | Node / runtime mode (`development` or `production`) |
| `PORT` | `5000` | No | Port on which the Express server listens |
| `POSTGRES_DB` | `aegis_db` | Yes | Name of the PostgreSQL database |
| `POSTGRES_USER` | `aegis` | Yes | PostgreSQL username |
| `POSTGRES_PASSWORD` | `aegis_password` | Yes | PostgreSQL password (change in production!) |
| `DATABASE_URL` | `postgresql://aegis:aegis_password@db:5432/aegis_db` | Yes | Connection string for database |
| `JWT_SECRET` | `aegis-super-secret-key-change-in-production` | Yes | Secret key for signing and verifying JWT tokens |
| `AI_ENGINE_URL` | `http://ai-engine:8000` | Yes | URL of Python FastAPI AI engine (internal container hostname) |
| `REDIS_URL` | `redis://redis:6379` | Yes | Connection URI for Redis instance |
| `CLIENT_URL` | `http://localhost:5173` | Yes | Client origin for CORS authorization |
| `OPENWEATHER_API_KEY` | `your_key_here` | Optional | API key for live meteorological syncing |

---

## 5. Service Architecture

```
                          ┌──────────────────────────────────────┐
    Browser (HTTP 80) ──▶ │ client (Nginx Reverse Proxy & SPA)   │
                          └───────────────────┬──────────────────┘
                                              │ Proxy /api/*
                                              ▼
                          ┌──────────────────────────────────────┐
                          │ server (Node.js 20 / Express 4)      │
                          │ Port: 5000                           │
                          │ Health: /health, /api/health         │
                          └───────┬──────────────┬───────────────┘
                                  │              │
                   HTTP POST /predict            │ SQL / GeoJSON
                                  │              │
         ┌────────────────────────▼───┐   ┌──────▼─────────────────────┐
         │ ai-engine (Python FastAPI) │   │ db (PostgreSQL 16 + PostGIS)│
         │ Port: 8000                 │   │ Port: 5432                 │
         │ Health: /health            │   └────────────────────────────┘
         └─────────────┬──────────────┘
                       │ Cache / Key-Value
                       ▼
         ┌────────────────────────────┐
         │ redis (Redis 7 Alpine)     │
         │ Port: 6379                 │
         └────────────────────────────┘

    [All services connected via bridge network: aegis-network]
```

---

## 6. Troubleshooting Common Issues

### Issue 1: Port conflict (e.g. 5432 or 5000 already in use)

**Symptoms:** `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution:**
Identify and terminate the process holding the port:
```powershell
# Find PID
netstat -ano | findstr :5432

# Kill the process
taskkill /PID <PID> /F
```
Or change the host port mapping in `docker-compose.yml` (e.g. `"5433:5432"`).

---

### Issue 2: Service stays "unhealthy" and dependent containers do not start

**Symptoms:** `container aegis_client is waiting on aegis_server to become healthy`

**Solution:**
Inspect health check logs:
```powershell
docker inspect --format "{{json .State.Health}}" aegis_server
```
Check container logs:
```powershell
docker compose logs server
docker compose logs ai-engine
```
Verify that health endpoints return HTTP 200:
- `http://localhost:5000/health` (or `/api/health`)
- `http://localhost:8000/health`

---

### Issue 3: Nginx returns 404 for API endpoints in production

**Symptoms:** Frontend loads, but API calls fail with 404 Route not found.

**Solution:**
Ensure `client/nginx.conf` has `proxy_pass http://server:5000;` **without** a trailing slash, so that `/api/habitations` remains `/api/habitations` when passed to Express.

---

### Issue 4: Client hot reload not updating on Windows

**Symptoms:** Code changes in `client/src/` don't trigger Vite HMR in browser.

**Solution:**
1. Ensure Docker Desktop is configured to use the **WSL 2 backend**.
2. If using Windows bind mounts across filesystems, ensure Vite file polling is active in `vite.config.js` if necessary:
   ```javascript
   server: {
     watch: {
       usePolling: true,
     },
   }
   ```

---

### Issue 5: Database disk persistence reset

**Symptoms:** Added data disappears when containers are restarted.

**Solution:**
Do NOT run `docker compose down -v`. The `-v` flag deletes named volumes.
Use `make stop` or `docker compose down` to keep volumes intact.

---

## 7. How to Run Without Docker (Manual Setup)

Follow these steps to run each service individually on a local workstation.

### 7.1 PostgreSQL + PostGIS

1. Install PostgreSQL 16: https://www.postgresql.org/download/
2. Install PostGIS 3.4 using Stack Builder.
3. Open `psql` and execute:
   ```sql
   CREATE DATABASE aegis_db;
   CREATE USER aegis WITH PASSWORD 'aegis_password';
   GRANT ALL PRIVILEGES ON DATABASE aegis_db TO aegis;
   \c aegis_db
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

### 7.2 Redis

1. Download Redis for Windows: https://github.com/tporadowski/redis/releases
2. Run:
   ```powershell
   redis-server.exe
   ```

### 7.3 AI Engine (Python FastAPI)

1. Navigate to directory:
   ```powershell
   cd "E:\sih prototype\ai-engine"
   ```
2. Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Run the API:
   ```powershell
   python main.py
   # Or with hot reload:
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
5. Verify health: `http://localhost:8000/health`

### 7.4 Backend Server (Node.js Express)

1. Navigate to directory:
   ```powershell
   cd "E:\sih prototype\server"
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Set environment variables (PowerShell):
   ```powershell
   $env:PORT = "5000"
   $env:NODE_ENV = "development"
   $env:DATABASE_URL = "postgresql://aegis:aegis_password@localhost:5432/aegis_db"
   $env:AI_ENGINE_URL = "http://localhost:8000"
   $env:REDIS_URL = "redis://localhost:6379"
   $env:CLIENT_URL = "http://localhost:5173"
   ```
4. Start the server:
   ```powershell
   npm run dev
   # Runs on http://localhost:5000
   ```
5. Verify health: `http://localhost:5000/health`

### 7.5 Frontend Client (React Vite)

1. Navigate to directory:
   ```powershell
   cd "E:\sih prototype\client"
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the dev server:
   ```powershell
   npm run dev
   # Accessible at http://localhost:5173
   ```
4. Build for production:
   ```powershell
   npm run build
   # Outputs static assets to client/dist/
   ```
