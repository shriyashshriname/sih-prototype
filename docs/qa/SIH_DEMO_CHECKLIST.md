# SIH DEMO CHECKLIST — Aegis AI Platform
**Project:** SIH26191 — NDMA Disaster Risk & Relocation Decision Support  
**Event:** Smart India Hackathon 2026  
**Prepared By:** QA Engineering Team  
**Version:** 1.0

---

> **Instructions:** Complete this checklist in order before the SIH presentation begins.  
> Mark each item: ✅ Done | ❌ Failed | ⚠️ Workaround Applied  
> **Target:** 100% green before presenting to judges.

---

## 🖥️ SECTION 1 — System Startup

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.1 | Backend server starts without errors (`npm start` on port 5000) | ⬜ | |
| 1.2 | No `EADDRINUSE` port conflict on 5000 | ⬜ | |
| 1.3 | AI engine (Python Flask) starts without errors on port 8000 | ⬜ | |
| 1.4 | PostgreSQL database service is running | ⬜ | |
| 1.5 | Database connection confirmed (no connection refused errors in logs) | ⬜ | |
| 1.6 | Frontend dev server starts without errors (`npm start` on port 3000) | ⬜ | |
| 1.7 | No critical errors in Node.js or React console on startup | ⬜ | |
| 1.8 | `.env` files loaded correctly (check for missing env var warnings) | ⬜ | |

---

## 🌐 SECTION 2 — Frontend Loads in Browser

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.1 | `http://localhost:3000` loads in browser without blank screen | ⬜ | |
| 2.2 | Login page displays (not a white screen or 404) | ⬜ | |
| 2.3 | No console errors visible in browser DevTools (F12) | ⬜ | |
| 2.4 | Application logo and branding visible (Aegis AI / NDMA) | ⬜ | |
| 2.5 | Browser tab shows correct title ("Aegis AI" or similar) | ⬜ | |
| 2.6 | Page is responsive (no horizontal scrollbar on 1080p display) | ⬜ | |

---

## 🤖 SECTION 3 — AI Engine Health

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.1 | `GET http://localhost:8000/health` returns `200 OK` | ⬜ | |
| 3.2 | Health response shows `"model": "loaded"` | ⬜ | |
| 3.3 | `POST /api/ai/predict` returns a valid risk score (0–100) | ⬜ | |
| 3.4 | SHAP explainability returns 3 factors for a test prediction | ⬜ | |
| 3.5 | AI engine response time < 3 seconds | ⬜ | |

---

## 🗺️ SECTION 4 — Map Renders with Markers

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.1 | Map loads and displays CartoDB dark tile basemap | ⬜ | |
| 4.2 | Map centers correctly on India / target region | ⬜ | |
| 4.3 | Habitation markers visible on the map (colored by risk) | ⬜ | |
| 4.4 | Shelter markers visible in green color | ⬜ | |
| 4.5 | Red zone polygons render in red on the map | ⬜ | |
| 4.6 | Clicking a habitation marker opens a popup with correct data | ⬜ | |
| 4.7 | Clicking a shelter marker shows capacity info | ⬜ | |
| 4.8 | Clicking a red zone polygon shows zone details | ⬜ | |
| 4.9 | Layer toggle controls work (show/hide layers) | ⬜ | |
| 4.10 | Map zoom in/out functions correctly | ⬜ | |
| 4.11 | No map tiles show as grey/broken (tile load errors) | ⬜ | |

---

## 📊 SECTION 5 — Risk Scores Display Correctly

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 5.1 | Risk scores displayed on habitation cards/markers (0–100) | ⬜ | |
| 5.2 | Risk category labels visible: Low / Moderate / High / Critical | ⬜ | |
| 5.3 | Color coding correct: Green=Low, Yellow=Moderate, Orange=High, Red=Critical | ⬜ | |
| 5.4 | Risk score matches AI prediction for a specific test habitation | ⬜ | |
| 5.5 | Risk scores update when new prediction is triggered | ⬜ | |

---

## 🔢 SECTION 6 — All 6 Dashboard KPIs Show Data

| # | KPI Card | Expected Value Type | Status | Notes |
|---|----------|---------------------|--------|-------|
| 6.1 | **Total Habitations** | Non-zero integer | ⬜ | |
| 6.2 | **Population at Risk** | Large integer (thousands) | ⬜ | |
| 6.3 | **Critical Risk Zones** | Integer ≥ 1 | ⬜ | |
| 6.4 | **Available Shelters** | Non-zero integer | ⬜ | |
| 6.5 | **Active Relocations** | Integer ≥ 0 | ⬜ | |
| 6.6 | **Weather Alert Level** | Green/Yellow/Orange/Red | ⬜ | |

> **Verify:** No KPI card shows "N/A", "undefined", "NaN", or "0" (unless genuinely 0).

---

## 🔴 SECTION 7 — Red Zones Visible on Map

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 7.1 | At least one red zone polygon visible on the map | ⬜ | |
| 7.2 | Red zones have distinct red/translucent styling | ⬜ | |
| 7.3 | `GET /api/gis/habitations-geojson` returns Critical-category features | ⬜ | |
| 7.4 | Red zone list/panel shows correct habitation names | ⬜ | |
| 7.5 | Red zone count matches Critical habitation count in dashboard | ⬜ | |

---

## 🏠 SECTION 8 — Shelter Capacity Shows Available Spaces

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 8.1 | `GET /api/shelters` returns shelter list with capacity data | ⬜ | |
| 8.2 | `available_capacity` field is correctly calculated | ⬜ | |
| 8.3 | Shelter management page loads and shows shelter cards | ⬜ | |
| 8.4 | Each shelter card shows: Name, Total Capacity, Available, Status | ⬜ | |
| 8.5 | Full shelters shown with "Full" badge in red | ⬜ | |
| 8.6 | Available shelters shown with green available count | ⬜ | |

---

## 🚗 SECTION 9 — Evacuation Route Generates

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 9.1 | `POST /api/evacuation/route` returns `200 OK` | ⬜ | |
| 9.2 | Route appears drawn on the map as a colored line | ⬜ | |
| 9.3 | Route shows distance in km | ⬜ | |
| 9.4 | Route shows estimated travel time in minutes | ⬜ | |
| 9.5 | Route avoids red zone areas (flag visible in response) | ⬜ | |
| 9.6 | Multiple routes can be generated (no crash on repeat) | ⬜ | |

---

## 🧠 SECTION 10 — AI Assessment Shows SHAP Factors

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 10.1 | AI assessment panel/modal opens for a habitation | ⬜ | |
| 10.2 | Exactly 3 SHAP factors shown in the UI | ⬜ | |
| 10.3 | Each factor shows: name, contribution value, direction (↑ / ↓) | ⬜ | |
| 10.4 | Top factor matches highest `|contribution|` in API response | ⬜ | |
| 10.5 | AI confidence score displayed (%) | ⬜ | |
| 10.6 | "Recommended Action" text is shown below the factors | ⬜ | |

---

## 🔐 SECTION 11 — Login Works with Demo Credentials

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 11.1 | Login page at `localhost:3000` is accessible | ⬜ | |
| 11.2 | Login with `admin@aegis.ndma.gov.in` / `AegisDemo@2026` succeeds | ⬜ | |
| 11.3 | Redirects to dashboard after login | ⬜ | |
| 11.4 | User name/role visible in navbar/header after login | ⬜ | |
| 11.5 | Logout button works and clears session | ⬜ | |
| 11.6 | Login with wrong password shows error message (not a crash) | ⬜ | |
| 11.7 | District Officer login (`officer@pune.gov.in`) restricts admin views | ⬜ | |

---

## 🎬 SECTION 12 — Demo Scenario 1 Walkthrough Complete

**Scenario:** "Flood Emergency — Wagholi Habitation, Pune"  
**Actor:** District Officer  
**Duration:** ~5 minutes

| # | Step | Status | Notes |
|---|------|--------|-------|
| 12.1 | Login as District Officer | ⬜ | |
| 12.2 | Dashboard shows Pune district data | ⬜ | |
| 12.3 | Navigate to GIS Map view | ⬜ | |
| 12.4 | Locate Wagholi habitation marker (red/critical) | ⬜ | |
| 12.5 | Click marker — popup shows risk score 75+ | ⬜ | |
| 12.6 | Open AI Assessment — view SHAP top 3 factors | ⬜ | |
| 12.7 | Click "Generate Evacuation Route" | ⬜ | |
| 12.8 | Route appears on map to nearest shelter | ⬜ | |
| 12.9 | Route details show distance and ETA | ⬜ | |
| 12.10 | Navigate to Shelter page — confirm shelter has capacity | ⬜ | |
| 12.11 | Create relocation plan (confirm button works) | ⬜ | |
| 12.12 | Plan shows in relocation list | ⬜ | |

---

## 🎬 SECTION 13 — Demo Scenario 2 Walkthrough Complete

**Scenario:** "Multi-District Risk Overview — State Admin"  
**Actor:** State Admin / NDMA Official  
**Duration:** ~5 minutes

| # | Step | Status | Notes |
|---|------|--------|-------|
| 13.1 | Login as State Admin | ⬜ | |
| 13.2 | Dashboard shows state-wide KPIs | ⬜ | |
| 13.3 | Risk Summary chart visible (distribution by category) | ⬜ | |
| 13.4 | Red Zones panel lists all Critical habitations | ⬜ | |
| 13.5 | Sort red zones by risk score (highest first) | ⬜ | |
| 13.6 | Click into top-risk habitation — full AI report visible | ⬜ | |
| 13.7 | View relocation priority queue | ⬜ | |
| 13.8 | Select top habitation → recommended shelter sites appear | ⬜ | |
| 13.9 | Confirm shelters sorted by distance ascending | ⬜ | |
| 13.10 | Approve a relocation plan | ⬜ | |
| 13.11 | Dashboard KPIs update (Active Relocations +1) | ⬜ | |
| 13.12 | Weather alert section shows current alert level | ⬜ | |

---

## 🔧 SECTION 14 — Final Stability Check

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 14.1 | No server crashes during 30-minute demo rehearsal | ⬜ | |
| 14.2 | Browser memory usage stays stable (no leak after 30 mins) | ⬜ | |
| 14.3 | All API calls complete within 3 seconds | ⬜ | |
| 14.4 | Smoke test (`node tests/api-smoke-test.js`) — all PASS | ⬜ | |
| 14.5 | Demo laptop is charged / power adapter plugged in | ⬜ | |
| 14.6 | Internet connection not required (all services run locally) | ⬜ | |
| 14.7 | Screen resolution set to 1920×1080 for projection | ⬜ | |
| 14.8 | Browser zoom level at 100% (not zoomed in/out) | ⬜ | |
| 14.9 | Browser bookmarks bar hidden for clean presentation | ⬜ | |

---

## 📋 Sign-Off

| Role | Name | Status | Timestamp |
|------|------|--------|-----------|
| QA Lead | | ⬜ Approved | |
| Dev Lead | | ⬜ Approved | |
| Team Lead | | ⬜ Approved | |

---

## 🚨 Emergency Fallback Plan

If any critical check fails during the demo:

| Issue | Fallback |
|-------|---------|
| Backend crashes | Restart: `npm start` — pre-opened in terminal |
| AI engine unresponsive | Restart: `python app.py` — pre-opened in terminal 2 |
| Map not loading | Use cached screenshots in `docs/screenshots/` |
| Database connection lost | Restart PostgreSQL service: `net start postgresql` |
| Frontend crash | Hard refresh: `Ctrl + Shift + R` |
| Port conflict | Kill process: `netstat -ano \| findstr :5000` → `taskkill /PID <pid> /F` |

---

**Total Checks: 94 | Target: 94/94 ✅ before demo**

---

*Document End — Aegis AI SIH Demo Checklist v1.0*
