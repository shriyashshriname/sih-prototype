# Aegis SIH26191 - Master Team Task Guide

## Leadership & Coordination
**Team Leader:** Aegis-Master (Lead Orchestrator)
**Role:** Coordinates all subagents, ensures strict adherence to SIH prototype requirements, resolves bottlenecks, and makes final architectural decisions.

All teams operate in a continuous integration loop, feeding data to AI, which is then surfaced by the Frontend.

---

## 1. AI Engineering Team (Top Priority)
**Agent:** Aegis-AI (ML Engineer)
**Core Focus:** The brain of the application. Responsible for real-world risk calculation and intelligent relocation planning.
*   **Task 1: Data Ingestion Pipeline.** Feed the newly researched Maharashtra disaster data (river levels, historical landslides, CWC gauges) into the AI model.
*   **Task 2: XGBoost Risk Engine.** Train the model to evaluate the `risk_score` (0-100) of any given coordinate based on rainfall, soil saturation, and historical events.
*   **Task 3: Relocation Priority Algorithm.** Calculate the immediate necessity of relocation for vulnerable populations, determining *who* needs to move *first*.
*   **Task 4: A* Routing & Safe Site Matching.** Match at-risk habitations with the nearest optimal government relief camps (e.g., Balewadi, Dr. Ambedkar Ground) using real OpenStreetMap highway graphs, avoiding blocked mountain passes (Tamhini/Varandha Ghat).

---

## 2. Frontend Engineering Team (Top Priority)
**Agent:** Aegis-Frontend (Frontend Lead)
**Core Focus:** Delivering an industry-grade, highly intuitive, and easily navigable user interface. Complex data must be presented simply for government officials.
*   **Task 1: Professional Dark-Mode UI.** Implement a clean, modern Tailwind CSS dashboard with a strict focus on usability and minimal clicks.
*   **Task 2: GIS Map Integration.** Build the central Leaflet map using OpenStreetMap tiles. It must cleanly render hazard zones, relief camps, and AI-generated evacuation poly-lines without clutter.
*   **Task 3: AI Explanation Dashboards (SHAP).** Build intuitive visual components (gauges, progress bars) that explain *why* the AI made a decision, keeping it transparent for disaster management teams.
*   **Task 4: Relocation Planner View.** Create a seamless workflow for officials to view prioritized relocation lists and dispatch rescue units instantly.

---

## 3. Backend Engineering Team
**Agent:** Aegis-Backend (Backend Lead)
**Core Focus:** Connecting the AI microservice with the Frontend and managing real-time data flows.
*   **Task 1: API Gateway.** Maintain fast, reliable Express.js endpoints for the frontend to consume.
*   **Task 2: Real-World Routing.** Manage the `aStarRouter.js` to ensure the frontend receives accurate, terrain-aware distance calculations instead of straight-line metrics.

---

## 4. Database Engineering Team
**Agent:** Aegis-DB (Database Engineer)
**Core Focus:** Persistent, scalable data storage.
*   **Task 1: PostGIS Schema.** Design the PostgreSQL database to handle complex geographical shapes (polygons for red zones) and coordinates.
*   **Task 2: Real Data Seeding.** Ensure all authentic Maharashtra data (from the research phase) is cleanly structured and queryable for the AI team.

---

## 5. Product Management Team
**Agent:** Aegis-PM (Product Manager)
**Core Focus:** SIH judging criteria and MVP alignment.
*   **Task 1: Demo Scenarios.** Craft exact step-by-step presentation scripts for the SIH judges (e.g., simulating a Chiplun flood emergency).
*   **Task 2: Feature Prioritization.** Ensure engineers do not waste time on low-value features.

---

## 6. Architecture & DevOps Teams
**Agents:** Aegis-Architect, Aegis-DevOps
**Core Focus:** System stability and deployment.
*   **Task 1: Dockerization.** Ensure the AI python microservice, Node backend, and React frontend can be spun up seamlessly on any machine via `docker-compose`.
*   **Task 2: Technical Contracts.** Maintain strict JSON schema contracts between the frontend and backend.

---

## 7. QA Engineering Team
**Agent:** Aegis-QA
**Core Focus:** Flawless execution.
*   **Task 1: Demo Stability.** Write smoke tests to guarantee the routing and risk APIs never crash during the SIH presentation.
