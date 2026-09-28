# Aegis AI — Disaster Decision Intelligence Platform
## System Architecture Document
**SIH26191 | Version 1.0.0 | 2026-09-28**

> **PROTOTYPE NOTICE**: Synthetic data only. Not for operational use.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Principles](#architecture-principles)
3. [System Context Diagram](#system-context-diagram)
4. [Container Diagram](#container-diagram)
5. [Component Diagrams](#component-diagrams)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Technology Decision Records](#technology-decision-records)

---

## 1. Executive Summary

Aegis AI is a multi-tier web application that provides district-level disaster risk intelligence for flood and landslide events in Maharashtra, India. The platform ingests geospatial, meteorological, and demographic data, runs it through a trained XGBoost ensemble model with SHAP explainability, and surfaces actionable risk scores and evacuation recommendations to civil defense officers via a React dashboard.

**Key Capabilities:**
- Real-time risk scoring (flood + landslide) per habitation using XGBoost + SHAP
- Interactive geospatial map with district/tehsil/habitation drill-down (Leaflet + PostGIS)
- Resource allocation engine (shelters, relief camps, vehicles)
- Historical event timeline and trend analytics
- Full offline fallback via a JavaScript rule-based scoring engine
- Role-Based Access Control (Viewer / Officer / Admin)

**Deployment Target:** Single-host Docker Compose (prototype); horizontally scalable to Kubernetes for production.

---

## 2. Architecture Principles

| Principle | Rationale | Implementation |
|-----------|-----------|----------------|
| **Scalability** | Risk data grows with habitations and events | Stateless API + connection-pooled DB; horizontal scaling via Docker replicas |
| **Security** | Sensitive population/location data | JWT authentication, RBAC, parameterized queries, CORS allowlist |
| **Explainability** | Government accountability for AI decisions | SHAP values surfaced per prediction; every score has a human-readable reason |
| **Offline-capable** | Field conditions may lack AI engine connectivity | JavaScript fallback scorer embedded in backend; caches last predictions in DB |
| **Separation of Concerns** | Three clearly-bounded services | Frontend (React), Backend API (Node/Express), AI Engine (Python/FastAPI) |
| **Observability** | Diagnosability in production | Structured JSON logs, `/health` endpoints on all services, error propagation chain |
| **Data Integrity** | Geospatial accuracy | All coordinates in WGS84 (EPSG:4326); PostGIS spatial indexes on all geo columns |

---

## 3. System Context Diagram (C4 Level 1)

```mermaid
flowchart TD
    subgraph users["External Users"]
        Admin["🧑‍💼 Admin\n(System Administrator)"]
        Officer["👮 District Officer\n(Decision Maker)"]
        Viewer["👁️ Viewer\n(Read-only access)"]
    end

    subgraph external["External Data Sources (Prototype: Mocked)"]
        IMD["☁️ IMD Weather API\n(Rainfall / alerts)"]
        CWC["🌊 CWC River Level API\n(River gauge data)"]
        ISRO["🛰️ ISRO Bhuvan\n(Satellite terrain data)"]
    end

    AEGIS["🛡️ Aegis AI Platform\n(Web Application)\n\nDisaster risk scoring,\nMap visualization,\nResource allocation"]

    Admin -->|"HTTPS / Browser"| AEGIS
    Officer -->|"HTTPS / Browser"| AEGIS
    Viewer -->|"HTTPS / Browser"| AEGIS

    AEGIS -->|"REST (mocked in prototype)"| IMD
    AEGIS -->|"REST (mocked in prototype)"| CWC
    AEGIS -->|"REST (mocked in prototype)"| ISRO
```

---

## 4. Container Diagram (C4 Level 2)

```mermaid
flowchart TD
    subgraph browser["User Browser"]
        FE["⚛️ Frontend\nReact 18 + Vite\n:5173 (dev) / :80 (prod)\n\n- Dashboard\n- Map (Leaflet)\n- Risk Tables\n- Auth UI"]
    end

    subgraph backend_host["Backend Host (Docker)"]
        API["🟢 Backend API\nNode.js 20 + Express 5\n:5000\n\n- REST endpoints\n- Auth / JWT\n- RBAC middleware\n- JS Fallback scorer\n- Data aggregation"]

        AI["🐍 AI Engine\nPython 3.11 + FastAPI\n:8000\n\n- XGBoost inference\n- SHAP explanations\n- /predict /explain\n- /model-info /health"]

        DB["🐘 PostgreSQL 15\n+ PostGIS 3.3\n:5432\n\n- Habitations\n- Risk predictions\n- Events\n- Users\n- Spatial indexes"]
    end

    FE -->|"HTTP REST\nBearer JWT\nJSON"| API
    API -->|"HTTP REST\nJSON\n(internal network)"| AI
    API -->|"pg pool\nSQL + PostGIS"| DB
    AI -.->|"Read model file\n(XGBoost .pkl)"| ModelFile["📦 Model Store\n/models/xgboost_flood_v1.pkl\n/models/xgboost_landslide_v1.pkl"]
```

---

## 5. Component Diagrams

### 5.1 Frontend Components

```mermaid
flowchart TD
    subgraph App["App.jsx (Root)"]
        AuthCtx["AuthContext\n(JWT, user role)"]
        AppRouter["React Router v6\n(Protected routes)"]
    end

    subgraph Pages["Pages"]
        Login["LoginPage"]
        Dashboard["DashboardPage"]
        MapPage["MapPage"]
        RiskTable["RiskTablePage"]
        ResourcePage["ResourcePage"]
        HistoryPage["HistoryPage"]
        AdminPage["AdminPage"]
    end

    subgraph Components["Shared Components"]
        MapComp["MapComponent\n(Leaflet + react-leaflet)\n- Choropleth layer\n- Habitation markers\n- Popup risk cards"]
        RiskCard["RiskScoreCard\n- Score gauge\n- SHAP bar chart\n- Recommendations"]
        FilterBar["FilterBar\n(?district=&risk_category=)"]
        NavBar["NavBar + Sidebar"]
        AlertBanner["AlertBanner\n(Critical risk zones)"]
    end

    subgraph API_Layer["API Abstraction Layer (src/api/)"]
        AuthAPI["auth.js"]
        RiskAPI["risk.js"]
        HabitationAPI["habitations.js"]
        ResourceAPI["resources.js"]
    end

    AppRouter --> Pages
    Pages --> Components
    Pages --> API_Layer
    AuthCtx --> AppRouter
```

### 5.2 Backend API Components

```mermaid
flowchart TD
    subgraph Express["Express App (server.js)"]
        MW_Logger["Morgan Logger"]
        MW_CORS["CORS Middleware\n(allowlist)"]
        MW_JSON["JSON Body Parser"]
        MW_Auth["JWT Auth Middleware\n(verifyToken)"]
        MW_RBAC["RBAC Middleware\n(requireRole)"]
        MW_Validate["Joi Validation\nMiddleware"]
    end

    subgraph Routes["Route Handlers (src/routes/)"]
        AuthRoute["POST /api/auth/login\nPOST /api/auth/refresh\nPOST /api/auth/logout"]
        HabitationRoute["GET /api/habitations\nGET /api/habitations/:id\nGET /api/habitations/nearby"]
        RiskRoute["GET /api/risk\nGET /api/risk/:id\nPOST /api/risk/predict\nGET /api/risk/summary"]
        ResourceRoute["GET /api/resources\nPUT /api/resources/:id/allocate"]
        EventRoute["GET /api/events\nPOST /api/events"]
        AdminRoute["GET /api/admin/users\nPOST /api/admin/users"]
    end

    subgraph Services["Services (src/services/)"]
        AIClient["aiEngineClient.js\n(axios to :8000)\n+ fallback trigger"]
        FallbackScorer["fallbackScorer.js\n(JS rule engine)"]
        GeoService["geoService.js\n(PostGIS queries)"]
        AuthService["authService.js\n(bcrypt + JWT)"]
    end

    subgraph DB_Layer["Database Layer (src/db/)"]
        Pool["pg Pool\n(DATABASE_URL)"]
        Queries["queries/\n*.sql (parameterized)"]
    end

    MW_Auth --> Routes
    MW_RBAC --> Routes
    Routes --> Services
    Services --> AIClient
    Services --> FallbackScorer
    Services --> GeoService
    Services --> AuthService
    Services --> DB_Layer
    AIClient -.->|"fallback on error"| FallbackScorer
```

### 5.3 AI Engine Components

```mermaid
flowchart TD
    subgraph FastAPI["FastAPI App (main.py)"]
        HealthEP["GET /health"]
        ModelInfoEP["GET /model-info"]
        PredictEP["POST /predict"]
        ExplainEP["POST /explain"]
    end

    subgraph ML["ML Layer (src/ml/)"]
        ModelLoader["model_loader.py\n(loads .pkl on startup)"]
        Predictor["predictor.py\n(XGBoost inference\nfeature engineering)"]
        Explainer["explainer.py\n(SHAP TreeExplainer\nwaterfall values)"]
        LabelMap["label_map.py\n(score → category\n0-25 Low / 26-50 Moderate\n51-75 High / 76-100 Critical)"]
    end

    subgraph Schema["Pydantic Schemas (src/schemas/)"]
        PredictReq["PredictRequest"]
        PredictResp["PredictResponse\n(risk_score, shap_explanations,\nrecommendations)"]
    end

    PredictEP --> Predictor
    ExplainEP --> Explainer
    Predictor --> ModelLoader
    Explainer --> ModelLoader
    Explainer --> Explainer
    Predictor --> LabelMap
    Explainer --> LabelMap
    PredictEP --> Schema
    ExplainEP --> Schema
```

---

## 6. Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as Browser (Officer)
    participant FE as React Frontend
    participant API as Express Backend :5000
    participant AI as FastAPI AI Engine :8000
    participant DB as PostgreSQL + PostGIS

    U->>FE: Login with credentials
    FE->>API: POST /api/auth/login
    API->>DB: SELECT user WHERE email=? (parameterized)
    DB-->>API: user row (bcrypt hash)
    API-->>FE: { success: true, data: { token, user } }
    FE->>FE: Store JWT in memory (AuthContext)

    U->>FE: Open Map → select district "Pune"
    FE->>API: GET /api/habitations?district=Pune (Bearer JWT)
    API->>DB: SELECT ... ST_AsGeoJSON(geom) WHERE district=$1
    DB-->>API: GeoJSON FeatureCollection
    API-->>FE: { success: true, data: [habitations], meta: { total } }
    FE->>FE: Render Leaflet choropleth

    U->>FE: Click habitation → "Run Risk Assessment"
    FE->>API: POST /api/risk/predict { habitation_id }
    API->>DB: SELECT latest sensor readings WHERE habitation_id=$1
    DB-->>API: sensor data row
    API->>AI: POST /predict { rainfall_24h, river_level... }
    alt AI Engine available
        AI->>AI: XGBoost inference + SHAP
        AI-->>API: { risk_score: 73.4, shap_explanations: [...] }
    else AI Engine unavailable
        API->>API: fallbackScorer.js (rule engine)
        API-->>API: { risk_score: 68.0, source: "fallback" }
    end
    API->>DB: INSERT INTO risk_predictions (upsert)
    API-->>FE: { success: true, data: { risk_score, risk_category, shap_explanations, recommendations } }
    FE->>FE: Render RiskScoreCard + SHAP chart
```

---

## 7. Technology Decision Records

### TDR-001: XGBoost over Random Forest

| Factor | XGBoost | Random Forest |
|--------|---------|---------------|
| Accuracy on tabular data | Higher (gradient boosting) | Good |
| Inference speed | ~2ms per sample | ~5ms per sample |
| SHAP compatibility | Native TreeExplainer support | Supported but slower |
| Handling class imbalance | `scale_pos_weight` param | Requires manual resampling |
| Feature importance granularity | Per-sample SHAP values | Mean decrease impurity only |
| **Decision** | ✅ **Selected** | ❌ Rejected |

**Rationale:** XGBoost's per-sample SHAP explanations are critical for government accountability. The `scale_pos_weight` parameter handles the inherent imbalance in rare disaster event training data without resampling artifacts. Gradient boosting outperforms Random Forest on the structured/tabular meteorological + geospatial feature set used here.

---

### TDR-002: PostGIS over MongoDB

| Factor | PostGIS (PostgreSQL 15) | MongoDB |
|--------|------------------------|---------|
| Spatial query support | Native ST_Distance, ST_Within, ST_Buffer, ST_AsGeoJSON | Limited geospatial (2dsphere) |
| ACID transactions | Full ACID | Multi-document ACID (4.0+) |
| JOIN performance | Optimized with B-tree + GIST indexes | No native joins |
| Schema enforcement | Strong (prevents dirty data) | Schema-less (requires app-level validation) |
| Disaster data structure | Highly relational (habitations ↔ events ↔ predictions) | Document model forces denormalization |
| Team familiarity | SQL is universal | Requires MongoDB expertise |
| **Decision** | ✅ **Selected** | ❌ Rejected |

**Rationale:** Disaster data is inherently relational. Habitations have districts, tehsils, events, predictions, resources — all with foreign-key integrity requirements. PostGIS spatial functions (ST_Within for district-boundary queries, ST_Distance for nearest-shelter calculations) provide far richer geospatial capability than MongoDB's 2dsphere index.

---

### TDR-003: React + Vite over Next.js

| Factor | React + Vite | Next.js |
|--------|-------------|---------|
| Build speed (HMR) | <50ms HMR | 200-500ms HMR |
| Bundle complexity | Simple SPA | SSR/SSG adds ops complexity |
| SEO requirement | None (auth-gated dashboard) | SSR needed for SEO |
| Deployment | Static files → Nginx or CDN | Requires Node.js server |
| Offline capability | PWA via Vite plugin | More complex PWA setup |
| Learning curve | Lower for team | Higher (file-based routing, RSC) |
| **Decision** | ✅ **Selected** | ❌ Rejected |

**Rationale:** Aegis is an auth-gated operational dashboard — SEO is irrelevant. Vite's near-instant HMR significantly accelerates prototype iteration. Static output simplifies deployment (Nginx container). Next.js server-side complexity adds operational burden with no benefit for this use case.

---

### TDR-004: Node.js + Express over FastAPI for Main API

| Factor | Node.js + Express | FastAPI (Python) |
|--------|------------------|------------------|
| I/O concurrency | Event loop; excellent for DB + HTTP I/O | Async but GIL-limited for CPU tasks |
| Shared language with frontend | JavaScript (JSON serialization is native) | Python (requires JSON marshaling) |
| Ecosystem for auth/JWT | jsonwebtoken, bcrypt, passport — mature | python-jose — less battle-tested |
| Geospatial client libs | pg + postgis queries via node-postgres | asyncpg — comparable |
| AI engine separation | Clean HTTP boundary → FastAPI for ML | Would merge concerns |
| **Decision** | ✅ **Selected** | ❌ (used only for AI Engine) |

**Rationale:** The main API's bottleneck is I/O (DB queries, AI engine calls), not CPU — Node.js's event loop excels here. Keeping the ML workload in FastAPI/Python preserves access to the full Python ML ecosystem (XGBoost, SHAP, scikit-learn) without polluting the API service. The two-service split creates a clean, independently-scalable boundary.

---

### TDR-005: Leaflet over MapboxGL

| Factor | Leaflet + react-leaflet | MapboxGL JS |
|--------|------------------------|-------------|
| License | BSD-2 (fully open source) | Proprietary (requires API key + billing) |
| Tile sources | Any XYZ source (OpenStreetMap, ISRO Bhuvan) | Mapbox tiles (paid) or custom |
| Bundle size | ~145KB | ~920KB |
| Offline tile support | Yes (tile caching plugins) | Complex offline setup |
| Custom overlays | GeoJSON + custom panes | GL layers (more powerful but complex) |
| Prototype speed | Rapid with react-leaflet components | Longer setup time |
| **Decision** | ✅ **Selected** | ❌ Rejected |

**Rationale:** Government prototype cannot depend on Mapbox billing. Leaflet's open-source model with OpenStreetMap tiles (or ISRO Bhuvan WMS for India-specific layers) is zero-cost and production-viable. The smaller bundle size improves load times in low-bandwidth field conditions. GeoJSON overlay support is fully sufficient for district/tehsil choropleth rendering.

---

*Document Owner: Solution Architect | Last Updated: 2026-09-28 | Version: 1.0.0*
