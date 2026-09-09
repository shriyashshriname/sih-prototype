# Aegis — AI-Powered Disaster Risk Intelligence & Multi-Agency Early Warning Platform

**SIH Problem ID:** SIH26191  
**Status:** ✅ Working Prototype  
⚠️ **All data is SYNTHETIC/DEMO — Not live government data**

---

## Quick Start (2 commands)

### Prerequisites
- Node.js 18+ (https://nodejs.org)
- npm 9+

### 1. Start the API Server
```bash
cd server
npm install
npm start
# → API running at http://localhost:5000
# → 17 synthetic villages auto-loaded into memory
```

### 2. Start the Frontend
```bash
# In a new terminal
cd client
npm install
npm run dev
# → App running at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

> **No MongoDB required** — the backend uses an in-memory store. Data resets on server restart (prototype behaviour).

---

## What's Built

### Core Features
| Feature | Status |
|---|---|
| GIS Map with Leaflet + OpenStreetMap | ✅ |
| 17 synthetic village risk markers | ✅ |
| Transparent weighted flood risk engine | ✅ |
| Risk explainability ("Why is this area at risk?") | ✅ |
| Multi-agency alert simulation | ✅ |
| Alert acknowledge + resolve workflow | ✅ |
| Citizen portal with village search | ✅ |
| Emergency agency filtered view | ✅ |
| Decision support recommendations | ✅ |
| Loading + error states | ✅ |
| Prototype/demo data disclaimers | ✅ |

### Pages
| Route | Description | User Role |
|---|---|---|
| `/` | Authority dashboard — KPIs, map, risk list | Govt / Authority |
| `/map` | Full-screen GIS map | All |
| `/village/:id` | Village risk detail + explainability | Authority |
| `/alerts` | Multi-agency alert center | Authority |
| `/agency` | Agency-filtered alert view | Emergency Agency |
| `/citizen` | Public search portal | Citizen |

---

## Risk Engine (Transparent Formula)

```
Flood Risk Score (0–100) =
  (rainfall_normalised × 0.30)      ← 30%
+ (river_level_normalised × 0.25)   ← 25%
+ (elevation_inverse × 0.20)        ← 20% (lower = riskier)
+ (historical_incidents × 0.15)     ← 15%
+ (soil_saturation × 0.10)          ← 10%
```

**Categories:**
- 0–25 → 🟢 Low
- 26–50 → 🟡 Moderate
- 51–75 → 🟠 High
- 76–100 → 🔴 Very High

---

## Project Structure

```
sih prototype/
├── server/                    # Express.js API (Node.js)
│   ├── store/db.js            # In-memory data store + 17 village seeds
│   ├── utils/riskEngine.js    # Weighted risk calculation + explainability
│   ├── routes/
│   │   ├── villages.js        # GET /api/villages, GET /api/villages/:id
│   │   ├── risk.js            # GET /api/risk/summary
│   │   └── alerts.js          # Alert CRUD + simulation
│   └── index.js               # Express entry point
│
└── client/                    # React + Vite + Tailwind CSS
    └── src/
        ├── api/index.js        # Axios API client
        ├── context/AppContext.jsx  # Global state
        ├── components/
        │   ├── MapView.jsx      # Leaflet map
        │   ├── Sidebar.jsx
        │   ├── Topbar.jsx
        │   ├── VillageCard.jsx
        │   ├── RiskBadge.jsx
        │   ├── AlertCard.jsx
        │   ├── MetricCard.jsx
        │   └── FactorBar.jsx   # Risk factor explainability bars
        └── pages/
            ├── Dashboard.jsx
            ├── VillageDetail.jsx
            ├── AlertCenter.jsx
            ├── CitizenPortal.jsx
            ├── EmergencyAgency.jsx
            └── MapPage.jsx
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/villages` | All 17 villages with risk scores |
| GET | `/api/villages/search?q=name` | Village search |
| GET | `/api/villages/:id` | Village detail + risk factors + recommendations |
| GET | `/api/risk/summary` | Dashboard statistics |
| GET | `/api/alerts?status=active&agency=Police` | Filtered alerts |
| POST | `/api/alerts/simulate/:villageId` | Simulate alerts for a village |
| PUT | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| PUT | `/api/alerts/:id/resolve` | Resolve alert |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 19 (Vite) |
| Styling | Tailwind CSS v4 |
| Map | Leaflet.js + OpenStreetMap |
| Routing | React Router DOM v7 |
| Backend | Node.js + Express.js |
| Data | In-memory store (no DB required) |
| HTTP client | Axios |
| Notifications | react-hot-toast |

---

## Disclaimer

> This is a **prototype built for SIH26191** demonstration purposes. All village data, population figures, environmental readings, and risk scores are entirely **synthetic and fictional**. This system does **not** predict actual disasters, send real alerts, or use live government data. All recommendations shown are system-generated and **require human authorisation** before any real-world action.
