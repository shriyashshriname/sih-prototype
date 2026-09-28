# SIH Grand Finale Judge Audit: Merciless System Inspection

**Date of Audit:** 2026-09-28
**Auditor:** Aegis-Master (Lead Architect / Virtual Judge)
**Focus:** Distance Accuracy, Real-World Entity Verification, UI/UX Polish, System Architecture

## 🚨 CRITICAL FAILURES & INACCURACIES (The "No Mercy" Review)

### 1. Distance & Routing Engine (The "Toy Graph" Problem)
*   **The Flaw:** We built a custom A* Router (`aStarRouter.js`) in JavaScript with ~50 highway nodes. While the fallback mathematical fix works for approximations, **this is unacceptable for a production real-world product.** It lacks real turn-by-turn road curves, one-way streets, and granular village roads.
*   **The Verdict:** If a judge asks to route from a random sub-village in Ratnagiri to a shelter, the 50-node graph will fallback to the "Ghat-penalized Haversine" math. It's a smart hack, but not real OpenStreetMap routing.
*   **The Fix:** We must rip out the custom JS routing and integrate a live **OSRM (Open Source Routing Machine)** or **Mapbox/GraphHopper API** call to get 100% authentic, real-time OpenStreetMap driving routes and poly-lines.

### 2. Live Data vs. Static "Real" Data
*   **The Flaw:** We successfully replaced demo data with authentic historical data (Taliye, Malin, CWC danger levels) in `server/store/db.js`. However, it is **static**.
*   **The Verdict:** A disaster system is useless if it doesn't ingest *live* weather. 
*   **The Fix:** We need a cron job or live API fetcher pulling real-time rainfall data (Open-Meteo or IMD) and dynamically adjusting the `liveWeather` payload fed into the AI.

### 3. AI Architecture Bottleneck (Mocking vs Execution)
*   **The Flaw:** The Node.js backend (`server/routes/risk.js`) is currently calculating mock SHAP values and a pseudo-risk score using a hardcoded formula, while the actual Python XGBoost microservice sits in `ai-engine/`.
*   **The Verdict:** Disconnected architecture. The Node API is faking the AI's work.
*   **The Fix:** Node.js MUST proxy the `POST /api/risk/ai-evaluate` request directly to the Python FastAPI microservice (Port 8000). The Python model must be the single source of truth.

### 4. Frontend UI/UX: Tablet & Mobile Breakage
*   **The Flaw:** The `Sidebar.jsx` was hardcoded to `w-64` (fixed width). Map tile rendering is heavy.
*   **The Verdict:** In a real disaster, field officials use tablets/mobile devices. A fixed 64px sidebar will break the viewport on an iPad. Furthermore, plotting hundreds of raw Leaflet markers will cause UI lag.
*   **The Fix:** 
    *   Make the sidebar responsive (hamburger menu on mobile).
    *   Implement **React-Leaflet Marker Clustering** so the map doesn't freeze when plotting all 35,000 Maharashtra villages.
    *   Add loading skeletons (UI spinners) while the AI computes risk.

---

## 📋 IMMEDIATE ACTION PLAN & ASSIGNMENTS

**1. Backend Engineer (Aegis-Backend)**
*   [ ] **Task:** Integrate OSRM (Open Source Routing Machine) API for routing instead of `aStarRouter.js`.
*   [ ] **Task:** Rewire `POST /api/risk/ai-evaluate` to call the Python microservice on `localhost:8000`.

**2. ML Engineer (Aegis-AI)**
*   [ ] **Task:** Ensure the FastAPI server in `ai-engine/` is fully operational and returning authentic XGBoost SHAP values based on the newly injected Maharashtra dataset.

**3. Database Engineer (Aegis-DB)**
*   [ ] **Task:** Write a script to fetch LIVE weather (Open-Meteo API) and update the in-memory/PostgreSQL store so the risk scores fluctuate realistically based on today's actual weather.

**4. Frontend Lead (Aegis-Frontend)**
*   [ ] **Task:** Implement UI loading states (skeletons) to handle the network latency when Node calls the Python microservice.
*   [ ] **Task:** Convert the Sidebar to a responsive component.
*   [ ] **Task:** Add Marker Clustering to the GIS Map to prevent DOM overload.
