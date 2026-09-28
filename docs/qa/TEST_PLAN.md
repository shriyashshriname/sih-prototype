# TEST PLAN — Aegis AI Disaster Decision Intelligence Platform
**Project:** SIH26191 — NDMA Disaster Risk & Relocation Decision Support System  
**Version:** 1.0  
**Prepared By:** QA Engineering Team  
**Date:** 2026-09-28  
**Status:** ACTIVE

---

## 1. Introduction

### 1.1 Purpose
This test plan defines the strategy, scope, resources, schedule, and deliverables for quality assurance of the Aegis AI platform. It ensures that all functional, non-functional, and security requirements are validated before NDMA deployment.

### 1.2 Project Overview
Aegis AI is a full-stack disaster decision intelligence platform that integrates:
- XGBoost/SHAP-powered AI risk engine (Python/Flask)
- Node.js/Express REST API backend
- React + Leaflet.js GIS frontend
- PostgreSQL/PostGIS spatial database
- Role-based access control (RBAC) with JWT authentication

### 1.3 References
- SIH 2026 Problem Statement: PS-SIH26191
- NDMA Relocation Guidelines 2024
- NDRF Evacuation SOPs

---

## 2. Test Objectives

| # | Objective |
|---|-----------|
| 1 | Verify all API endpoints return correct status codes and response schemas |
| 2 | Validate AI risk scoring accuracy against known test vectors |
| 3 | Confirm GIS map renders correct spatial data and interactivity |
| 4 | Ensure RBAC prevents unauthorized access across all roles |
| 5 | Validate evacuation route generation for correctness |
| 6 | Confirm shelter capacity calculations are accurate |
| 7 | Verify system meets performance SLAs under load |
| 8 | Ensure JWT tokens expire and refresh correctly |
| 9 | Validate AI explainability (SHAP) output integrity |
| 10 | Confirm end-to-end demo scenarios execute without error |

---

## 3. Scope

### 3.1 In Scope
- **Backend API** (Node.js/Express): All REST endpoints
- **AI Engine** (Python/Flask): Prediction, health, explainability
- **Frontend** (React): All pages and interactive components
- **Authentication**: JWT issue, verify, refresh, expiry
- **GIS**: Map rendering, layer toggles, polygon display, popups
- **Database**: Data integrity, query correctness
- **Integration**: Backend ↔ AI Engine ↔ Frontend ↔ Database

### 3.2 Out of Scope
- Third-party weather API provider internals
- Mobile native app (not implemented in SIH scope)
- Physical infrastructure/network setup
- Load balancer configuration

---

## 4. Test Types

### 4.1 Unit Testing
**Goal:** Verify individual functions and modules in isolation.

| Module | Tool | Coverage Target |
|--------|------|----------------|
| AI Engine — risk scoring | pytest | ≥ 85% |
| Risk category boundaries | pytest | 100% |
| Shelter capacity calculator | Jest | ≥ 80% |
| JWT utility functions | Jest | ≥ 90% |
| Distance/routing utilities | Jest | ≥ 80% |

### 4.2 Integration Testing
**Goal:** Verify component interactions.

| Integration Point | Test Focus |
|-------------------|-----------|
| Backend → AI Engine | `/api/ai/predict` calls Flask `/predict` correctly |
| Backend → Database | CRUD operations return consistent results |
| Frontend → Backend | Axios calls receive correct JSON |
| AI Engine → SHAP | SHAP values generated alongside predictions |
| GIS Layer → GeoJSON API | Map correctly consumes GeoJSON from `/api/gis/habitations-geojson` |

### 4.3 End-to-End (E2E) Testing
**Goal:** Simulate real user workflows from login to action completion.

| Scenario | Actor | Steps |
|----------|-------|-------|
| Demo Scenario 1 | District Officer | Login → View map → Click habitation → View risk score → Generate evacuation route |
| Demo Scenario 2 | State Admin | Login → View red zones → Open relocation plan → Approve relocation |
| Demo Scenario 3 | NDMA Super Admin | Login → View national dashboard → Export risk summary |

### 4.4 Performance Testing
**Goal:** Validate system meets SLAs under realistic concurrent load.

| Metric | Target SLA | Tool |
|--------|-----------|------|
| API response time (p95) | < 500ms | Artillery / k6 |
| AI prediction latency | < 2000ms | k6 |
| Map tile load time | < 3000ms | Lighthouse |
| Concurrent users supported | ≥ 50 | Artillery |
| Database query time (habitations list) | < 200ms | EXPLAIN ANALYZE |

### 4.5 Security Testing
**Goal:** Confirm no unauthorized access or data leakage.

| Test | Expected Outcome |
|------|-----------------|
| Access protected route without JWT | 401 Unauthorized |
| Access admin endpoint as District Officer | 403 Forbidden |
| Expired JWT used for request | 401 Token Expired |
| SQL injection in query params | 400 / sanitized safely |
| XSS payload in habitation name field | Sanitized in response |
| CORS: request from unauthorized origin | Blocked |

### 4.6 Smoke Testing
**Goal:** Fast pass/fail check after each deployment.

Automated via `tests/api-smoke-test.js` — runs in < 60 seconds against localhost.

### 4.7 Regression Testing
**Goal:** Ensure new features do not break existing functionality.

Re-run full test suite (Unit + Smoke + E2E critical path) after every code merge to `main`.

---

## 5. Test Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| **Local Dev** | Unit & integration testing | `http://localhost:5000` (API), `http://localhost:3000` (UI) |
| **AI Engine** | Prediction & health tests | `http://localhost:8000` |
| **Staging** | E2E & performance testing | TBD — pre-deployment server |
| **SIH Demo** | Final acceptance testing | On-site demo laptop |

### 5.1 Environment Setup Checklist
- [ ] Node.js ≥ 18 installed
- [ ] Python ≥ 3.9 with venv activated
- [ ] PostgreSQL running with `aegis_db` database seeded
- [ ] `.env` files configured for all services
- [ ] All `npm install` / `pip install -r requirements.txt` completed
- [ ] Seed data loaded: habitations, shelters, red zones

---

## 6. Entry and Exit Criteria

### 6.1 Entry Criteria (Tests may begin when:)
- [ ] All services start without errors
- [ ] Database is seeded with at least 50 habitation records
- [ ] AI engine returns valid predictions for sample inputs
- [ ] Frontend loads in browser without console errors
- [ ] All environment variables are configured

### 6.2 Exit Criteria (Release is approved when:)
- [ ] 100% of Critical (P1) test cases pass
- [ ] ≥ 95% of High (P2) test cases pass
- [ ] Zero open P1 defects
- [ ] Zero open P2 defects with no workaround
- [ ] Performance SLAs met under 50-user load
- [ ] Security tests show no HIGH/CRITICAL vulnerabilities
- [ ] Demo checklist 100% green

---

## 7. Risk-Based Test Prioritization

| Priority | Risk Area | Rationale |
|----------|-----------|-----------|
| **P1 — Critical** | AI risk scoring accuracy | Wrong scores = wrong evacuation decisions → lives at risk |
| **P1 — Critical** | Evacuation route generation | Must route correctly; failures are life-safety issues |
| **P1 — Critical** | Authentication & JWT | Security gate for entire system |
| **P1 — Critical** | Red zone identification | Core feature for NDMA demo |
| **P2 — High** | Shelter capacity calculations | Incorrect capacity = overcrowding risk |
| **P2 — High** | GIS map rendering | Primary UI for decision makers |
| **P2 — High** | Relocation planning workflow | Key demo scenario |
| **P2 — High** | RBAC enforcement | Data privacy and access control |
| **P3 — Medium** | AI explainability (SHAP) | Adds trust; not life-safety critical |
| **P3 — Medium** | Performance under load | Important but demo is low-concurrency |
| **P4 — Low** | UI styling/cosmetic issues | Does not affect functionality |

---

## 8. Defect Management

### 8.1 Severity Classification
| Severity | Definition | Response Time |
|----------|-----------|--------------|
| **S1 — Blocker** | System unusable, no workaround | Fix within 4 hours |
| **S2 — Critical** | Core feature broken | Fix within 24 hours |
| **S3 — Major** | Feature partially broken | Fix within 48 hours |
| **S4 — Minor** | Cosmetic / UX issue | Fix before final demo |

### 8.2 Defect Lifecycle
```
New → Assigned → In Progress → Fixed → Retest → Closed
                                     ↓
                               (if fails) Reopened
```

---

## 9. Test Deliverables

| Deliverable | Location | Owner |
|-------------|---------|-------|
| Test Plan (this document) | `docs/qa/TEST_PLAN.md` | QA Lead |
| Test Cases | `docs/qa/TEST_CASES.md` | QA Engineer |
| API Test Script | `docs/qa/API_TEST_SCRIPT.md` | QA Engineer |
| Smoke Test Runner | `tests/api-smoke-test.js` | QA Engineer |
| Demo Checklist | `docs/qa/SIH_DEMO_CHECKLIST.md` | QA Lead |
| Bug Report Log | `docs/qa/BUG_LOG.md` | QA Team |
| Test Execution Report | `docs/qa/TEST_EXECUTION_REPORT.md` | QA Lead |

---

## 10. Test Schedule

| Phase | Activity | Duration |
|-------|---------|---------|
| Phase 1 | Environment setup & smoke test | Day 1 |
| Phase 2 | Unit & integration test execution | Days 1–2 |
| Phase 3 | E2E test execution | Day 2 |
| Phase 4 | Security & performance testing | Day 3 |
| Phase 5 | Defect fix & regression | Day 3–4 |
| Phase 6 | Final demo acceptance test | Day 4 |

---

## 11. Roles and Responsibilities

| Role | Responsibility |
|------|--------------|
| QA Lead | Test strategy, planning, sign-off |
| QA Engineer | Test case writing, execution, defect reporting |
| Dev Lead | Defect triage and fix ownership |
| AI Engineer | AI engine unit tests, SHAP validation |
| DevOps | Environment setup, CI pipeline |

---

*Document End — Aegis AI QA Test Plan v1.0*
