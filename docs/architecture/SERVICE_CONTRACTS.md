# Aegis AI — Service Contracts
**SIH26191 | Version 1.0.0 | 2026-09-28**

> [!IMPORTANT]
> This is the **authoritative contract document**. All services MUST conform to these schemas. No breaking changes without updating this document and notifying all service owners.

> **PROTOTYPE NOTICE**: Synthetic data only. Not for operational use.

---

## Table of Contents

1. [Global Conventions](#1-global-conventions)
2. [Frontend ↔ Backend Contract](#2-frontend--backend-contract)
3. [Backend ↔ AI Engine Contract](#3-backend--ai-engine-contract)
4. [Backend ↔ Database Contract](#4-backend--database-contract)
5. [Error Code Registry](#5-error-code-registry)

---

## 1. Global Conventions

### 1.1 Base URLs

| Service | Development | Docker (internal) |
|---------|-------------|-------------------|
| Backend API | `http://localhost:5000/api` | `http://backend:5000/api` |
| AI Engine | `http://localhost:8000` | `http://ai-engine:8000` |
| Frontend Dev | `http://localhost:5173` | — |
| Frontend Prod | `http://localhost:80` | `http://frontend:80` |

### 1.2 Standard Response Envelope

**All** Backend API responses MUST use this envelope:

```json
{
  "success": true,
  "data": "<any>",
  "message": "Optional human-readable message",
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

**Error responses:**
```json
{
  "success": false,
  "message": "Human-readable error description",
  "code": "ERROR_CODE_CONSTANT",
  "details": {}
}
```

### 1.3 Authentication

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

JWT payload structure:
```json
{
  "sub": "uuid-v4-user-id",
  "email": "officer@collector.gov.in",
  "role": "officer",
  "district": "Pune",
  "iat": 1727532000,
  "exp": 1727618400
}
```

### 1.4 Data Type Standards

| Type | Format | Example |
|------|--------|---------|
| ID | UUID v4 string | `"a3f8c2d1-..."` |
| Timestamp | ISO 8601 UTC | `"2026-09-28T14:30:00Z"` |
| Risk Score | Float, 2 decimal places | `73.45` |
| Coordinates | `[longitude, latitude]` WGS84 | `[73.8567, 18.5204]` |
| Risk Category | Enum string | `"Low"` \| `"Moderate"` \| `"High"` \| `"Critical"` |

---

## 2. Frontend ↔ Backend Contract

### 2.1 Authentication Endpoints

#### `POST /api/auth/login`

**Request:**
```json
{
  "email": "officer@collector.gov.in",
  "password": "string (min 8 chars)"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "a3f8c2d1-4b5e-4c6d-8e9f-0a1b2c3d4e5f",
      "name": "Ramesh Patil",
      "email": "officer@collector.gov.in",
      "role": "officer",
      "district": "Pune",
      "createdAt": "2026-01-15T09:00:00Z"
    }
  }
}
```

**Errors:**

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_CREDENTIALS` | 401 | Email/password mismatch |
| `ACCOUNT_DISABLED` | 403 | Account suspended by admin |
| `VALIDATION_ERROR` | 422 | Missing/invalid fields |

---

#### `POST /api/auth/refresh`

**Request:**
```json
{ "refreshToken": "string" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "expiresIn": 86400
  }
}
```

---

#### `POST /api/auth/logout`

**Request:** Bearer token in header (no body)

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### 2.2 Habitation Endpoints

#### `GET /api/habitations`

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `district` | string | No | Filter by district name |
| `tehsil` | string | No | Filter by tehsil name |
| `risk_category` | string | No | `Low`\|`Moderate`\|`High`\|`Critical` |
| `page` | integer | No | Default: 1 |
| `limit` | integer | No | Default: 20, Max: 100 |
| `bbox` | string | No | `minLon,minLat,maxLon,maxLat` |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "name": "Vadgaon Habitation",
      "district": "Pune",
      "tehsil": "Haveli",
      "village": "Vadgaon Budruk",
      "population": 3450,
      "households": 720,
      "coordinates": [73.8567, 18.5204],
      "elevation_asl": 561.4,
      "slope_degrees": 12.3,
      "distance_to_river_km": 0.8,
      "land_cover_type": "agricultural",
      "latestRiskScore": 73.45,
      "latestRiskCategory": "High",
      "lastAssessedAt": "2026-09-28T10:00:00Z"
    }
  ],
  "meta": {
    "total": 847,
    "page": 1,
    "limit": 20,
    "pages": 43
  }
}
```

---

#### `GET /api/habitations/:id`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "name": "Vadgaon Habitation",
    "district": "Pune",
    "tehsil": "Haveli",
    "village": "Vadgaon Budruk",
    "population": 3450,
    "households": 720,
    "coordinates": [73.8567, 18.5204],
    "elevation_asl": 561.4,
    "slope_degrees": 12.3,
    "distance_to_river_km": 0.8,
    "land_cover_type": "agricultural",
    "sensorData": {
      "rainfall_24h": 87.3,
      "river_level_above_normal": 1.2,
      "soil_saturation_pct": 78.5,
      "recordedAt": "2026-09-28T08:00:00Z"
    },
    "latestRisk": {
      "risk_score": 73.45,
      "risk_category": "High",
      "confidence": 0.87,
      "assessedAt": "2026-09-28T10:00:00Z",
      "source": "xgboost_v1"
    },
    "nearestShelters": [
      {
        "id": "uuid-v4",
        "name": "Govt School Vadgaon",
        "capacity": 500,
        "currentOccupancy": 0,
        "distanceKm": 1.2,
        "coordinates": [73.8523, 18.5189]
      }
    ]
  }
}
```

---

#### `GET /api/habitations/nearby`

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `lat` | float | Yes | Latitude (WGS84) |
| `lon` | float | Yes | Longitude (WGS84) |
| `radius_km` | float | No | Default: 10 |
| `limit` | integer | No | Default: 10 |

**Response `200`:** Same schema as `GET /api/habitations` with additional `distance_km` field per item.

---

### 2.3 Risk Assessment Endpoints

#### `GET /api/risk`

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `district` | string | No | Filter by district |
| `risk_category` | string | No | Filter by category |
| `from` | ISO8601 | No | Start date filter |
| `to` | ISO8601 | No | End date filter |
| `page` | integer | No | Default: 1 |
| `limit` | integer | No | Default: 20 |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "habitation_id": "uuid-v4",
      "habitation_name": "Vadgaon Habitation",
      "district": "Pune",
      "risk_score": 73.45,
      "risk_category": "High",
      "confidence": 0.87,
      "flood_risk_score": 68.20,
      "landslide_risk_score": 78.70,
      "source": "xgboost_v1",
      "shap_explanations": [
        {
          "feature": "rainfall_24h",
          "value": 87.3,
          "shap_value": 18.4,
          "impact_direction": "increases_risk",
          "human_label": "24-hour Rainfall"
        }
      ],
      "top_risk_factors": [
        "Extreme rainfall (87.3mm in 24h)",
        "River level 1.2m above normal",
        "High soil saturation (78.5%)"
      ],
      "recommendations": [
        "Issue precautionary evacuation advisory",
        "Pre-position relief teams at Govt School Vadgaon",
        "Monitor river gauge at 2-hour intervals"
      ],
      "assessedAt": "2026-09-28T10:00:00Z"
    }
  ],
  "meta": { "total": 847, "page": 1, "limit": 20, "pages": 43 }
}
```

---

#### `POST /api/risk/predict`

**Required Role:** `officer` or `admin`

**Request:**
```json
{
  "habitation_id": "uuid-v4"
}
```

**Response `200`:** Same as single item in `GET /api/risk` response array.

**Errors:**

| Code | HTTP | Meaning |
|------|------|---------|
| `HABITATION_NOT_FOUND` | 404 | Invalid habitation_id |
| `INSUFFICIENT_SENSOR_DATA` | 422 | Missing required sensor readings |
| `AI_ENGINE_UNAVAILABLE` | 503 | Both AI engine and fallback failed |

---

#### `GET /api/risk/summary`

**Query Parameters:** `district` (optional)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "district": "Pune",
    "totalHabitations": 847,
    "byCategory": {
      "Critical": 23,
      "High": 87,
      "Moderate": 312,
      "Low": 425
    },
    "averageRiskScore": 41.23,
    "lastUpdated": "2026-09-28T10:00:00Z",
    "activeAlerts": 23,
    "totalPopulationAtRisk": 156430
  }
}
```

---

### 2.4 Resource Endpoints

#### `GET /api/resources`

**Query Parameters:** `district`, `type` (`shelter`|`relief_camp`|`vehicle`|`medical`), `page`, `limit`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "name": "Govt School Vadgaon",
      "type": "shelter",
      "district": "Pune",
      "tehsil": "Haveli",
      "coordinates": [73.8523, 18.5189],
      "capacity": 500,
      "currentOccupancy": 120,
      "availableCapacity": 380,
      "status": "active",
      "contactName": "Sarpanch Ganesh Thorat",
      "contactPhone": "+91-9876543210",
      "lastUpdatedAt": "2026-09-28T08:00:00Z"
    }
  ],
  "meta": { "total": 245, "page": 1, "limit": 20, "pages": 13 }
}
```

---

#### `PUT /api/resources/:id/allocate`

**Required Role:** `officer` or `admin`

**Request:**
```json
{
  "habitation_id": "uuid-v4",
  "allocated_capacity": 200,
  "notes": "Pre-positioned for High risk zone"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "resource_id": "uuid-v4",
    "habitation_id": "uuid-v4",
    "allocated_capacity": 200,
    "allocation_id": "uuid-v4",
    "allocatedAt": "2026-09-28T11:00:00Z"
  }
}
```

---

### 2.5 Events Endpoints

#### `GET /api/events`

**Query Parameters:** `district`, `type` (`flood`|`landslide`|`both`), `from`, `to`, `page`, `limit`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "habitation_id": "uuid-v4",
      "habitation_name": "Vadgaon Habitation",
      "district": "Pune",
      "event_type": "flood",
      "severity": "High",
      "description": "Flash flood following 3-day continuous rainfall",
      "casualties": 0,
      "displaced": 340,
      "propertyDamageINR": 2500000,
      "startedAt": "2024-07-15T03:00:00Z",
      "resolvedAt": "2024-07-17T18:00:00Z",
      "reportedBy": "District Collector Office",
      "coordinates": [73.8567, 18.5204]
    }
  ],
  "meta": { "total": 1203, "page": 1, "limit": 20, "pages": 61 }
}
```

---

#### `POST /api/events`

**Required Role:** `officer` or `admin`

**Request:**
```json
{
  "habitation_id": "uuid-v4",
  "event_type": "flood",
  "severity": "High",
  "description": "string",
  "casualties": 0,
  "displaced": 340,
  "propertyDamageINR": 2500000,
  "startedAt": "2026-09-28T03:00:00Z"
}
```

**Response `201`:** Created event object.

---

### 2.6 Admin Endpoints

#### `GET /api/admin/users`

**Required Role:** `admin` only

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-v4",
      "name": "Ramesh Patil",
      "email": "officer@collector.gov.in",
      "role": "officer",
      "district": "Pune",
      "isActive": true,
      "lastLoginAt": "2026-09-28T09:00:00Z",
      "createdAt": "2026-01-15T09:00:00Z"
    }
  ]
}
```

---

#### `POST /api/admin/users`

**Required Role:** `admin` only

**Request:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 8 chars)",
  "role": "viewer | officer | admin",
  "district": "string"
}
```

**Response `201`:** Created user object (without password hash).

---

## 3. Backend ↔ AI Engine Contract

Base URL: `http://localhost:8000` (dev) | `http://ai-engine:8000` (Docker)

No authentication required (internal network only — never exposed to internet).

### 3.1 `POST /predict`

**Request:**
```json
{
  "habitation_id": "uuid-v4",
  "rainfall_24h": 87.3,
  "river_level_above_normal": 1.2,
  "elevation_asl": 561.4,
  "slope_degrees": 12.3,
  "soil_saturation_pct": 78.5,
  "historical_flood_events": 3,
  "historical_landslide_events": 1,
  "population_density": 850.5,
  "distance_to_river_km": 0.8,
  "land_cover_type": "agricultural"
}
```

**Field Constraints:**

| Field | Type | Min | Max | Unit |
|-------|------|-----|-----|------|
| `rainfall_24h` | float | 0 | 500 | mm |
| `river_level_above_normal` | float | -5 | 20 | meters |
| `elevation_asl` | float | 0 | 5000 | meters |
| `slope_degrees` | float | 0 | 90 | degrees |
| `soil_saturation_pct` | float | 0 | 100 | % |
| `historical_flood_events` | integer | 0 | 100 | count |
| `historical_landslide_events` | integer | 0 | 100 | count |
| `population_density` | float | 0 | 50000 | persons/km² |
| `distance_to_river_km` | float | 0 | 50 | km |
| `land_cover_type` | string | — | — | enum |

**`land_cover_type` enum values:** `agricultural`, `forest`, `urban`, `scrubland`, `wetland`, `barren`

**Response `200`:**
```json
{
  "habitation_id": "uuid-v4",
  "risk_score": 73.45,
  "risk_category": "High",
  "confidence": 0.87,
  "flood_risk_score": 68.20,
  "landslide_risk_score": 78.70,
  "shap_explanations": [
    {
      "feature": "rainfall_24h",
      "value": 87.3,
      "shap_value": 18.4,
      "impact_direction": "increases_risk",
      "human_label": "24-hour Rainfall",
      "rank": 1
    },
    {
      "feature": "river_level_above_normal",
      "value": 1.2,
      "shap_value": 14.7,
      "impact_direction": "increases_risk",
      "human_label": "River Level Above Normal",
      "rank": 2
    },
    {
      "feature": "distance_to_river_km",
      "value": 0.8,
      "shap_value": -8.3,
      "impact_direction": "decreases_risk",
      "human_label": "Distance to River",
      "rank": 3
    }
  ],
  "top_risk_factors": [
    "Extreme rainfall (87.3mm in 24h)",
    "River level 1.2m above normal",
    "High soil saturation (78.5%)"
  ],
  "recommendations": [
    "Issue precautionary evacuation advisory for low-lying areas",
    "Pre-position relief teams at nearest shelter (1.2km)",
    "Monitor river gauge at 2-hour intervals",
    "Alert NDRF/SDRF for possible deployment"
  ],
  "model_version": "xgboost_flood_v1.3.0",
  "timestamp": "2026-09-28T14:30:00Z"
}
```

**Risk Category Thresholds:**

| Score Range | Category |
|-------------|----------|
| 0 – 25.00 | `Low` |
| 25.01 – 50.00 | `Moderate` |
| 50.01 – 75.00 | `High` |
| 75.01 – 100.00 | `Critical` |

**Error `422`:**
```json
{
  "detail": [
    {
      "loc": ["body", "rainfall_24h"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

### 3.2 `POST /explain`

Identical to `POST /predict` — returns the same response schema. Use when only SHAP explanations are needed without saving to database.

---

### 3.3 `GET /model-info`

**Response `200`:**
```json
{
  "flood_model": {
    "model_version": "xgboost_flood_v1.3.0",
    "algorithm": "XGBoostClassifier",
    "features": [
      "rainfall_24h",
      "river_level_above_normal",
      "elevation_asl",
      "slope_degrees",
      "soil_saturation_pct",
      "historical_flood_events",
      "historical_landslide_events",
      "population_density",
      "distance_to_river_km",
      "land_cover_type_encoded"
    ],
    "training_samples": 15420,
    "test_accuracy": 0.913,
    "roc_auc": 0.948,
    "f1_score": 0.891,
    "last_trained": "2026-08-01T00:00:00Z"
  },
  "landslide_model": {
    "model_version": "xgboost_landslide_v1.2.0",
    "algorithm": "XGBoostClassifier",
    "training_samples": 8930,
    "test_accuracy": 0.887,
    "roc_auc": 0.921,
    "f1_score": 0.864,
    "last_trained": "2026-08-01T00:00:00Z"
  }
}
```

---

### 3.4 `GET /health`

**Response `200`:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "flood_model_loaded": true,
  "landslide_model_loaded": true,
  "uptime_seconds": 3600
}
```

**Response `503` (model not loaded):**
```json
{
  "status": "degraded",
  "model_loaded": false,
  "error": "Model file not found: /models/xgboost_flood_v1.pkl"
}
```

---

## 4. Backend ↔ Database Contract

### 4.1 Connection

```javascript
// Environment variable
DATABASE_URL=postgresql://aegis_user:password@localhost:5432/aegis_db

// Connection pool settings
{
  max: 20,               // max pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
}
```

### 4.2 Core Table Schemas

```sql
-- Habitations (with PostGIS geometry)
CREATE TABLE habitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  district      VARCHAR(100) NOT NULL,
  tehsil        VARCHAR(100) NOT NULL,
  village       VARCHAR(255),
  population    INTEGER,
  households    INTEGER,
  geom          GEOMETRY(POINT, 4326) NOT NULL,  -- WGS84
  elevation_asl DECIMAL(8,2),
  slope_degrees DECIMAL(5,2),
  distance_to_river_km DECIMAL(6,3),
  land_cover_type VARCHAR(50),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_habitations_geom ON habitations USING GIST(geom);
CREATE INDEX idx_habitations_district ON habitations(district);

-- Risk Predictions
CREATE TABLE risk_predictions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitation_id UUID NOT NULL REFERENCES habitations(id),
  risk_score    DECIMAL(5,2) NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_category VARCHAR(20) NOT NULL CHECK (risk_category IN ('Low','Moderate','High','Critical')),
  flood_risk_score     DECIMAL(5,2),
  landslide_risk_score DECIMAL(5,2),
  confidence    DECIMAL(4,3),
  shap_explanations JSONB,
  top_risk_factors  TEXT[],
  recommendations   TEXT[],
  source        VARCHAR(50) DEFAULT 'xgboost_v1',
  input_features JSONB,
  assessed_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_risk_habitation ON risk_predictions(habitation_id);
CREATE INDEX idx_risk_category ON risk_predictions(risk_category);
CREATE INDEX idx_risk_assessed_at ON risk_predictions(assessed_at DESC);

-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(60) NOT NULL,  -- bcrypt
  role        VARCHAR(20) NOT NULL CHECK (role IN ('viewer','officer','admin')),
  district    VARCHAR(100),
  is_active   BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Resources
CREATE TABLE resources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  type        VARCHAR(50) NOT NULL CHECK (type IN ('shelter','relief_camp','vehicle','medical')),
  district    VARCHAR(100) NOT NULL,
  tehsil      VARCHAR(100),
  geom        GEOMETRY(POINT, 4326),
  capacity    INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  status      VARCHAR(20) DEFAULT 'active',
  contact_name  VARCHAR(255),
  contact_phone VARCHAR(20),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_resources_geom ON resources USING GIST(geom);

-- Historical Events
CREATE TABLE disaster_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitation_id UUID REFERENCES habitations(id),
  event_type    VARCHAR(20) NOT NULL CHECK (event_type IN ('flood','landslide','both')),
  severity      VARCHAR(20) CHECK (severity IN ('Low','Moderate','High','Critical')),
  description   TEXT,
  casualties    INTEGER DEFAULT 0,
  displaced     INTEGER DEFAULT 0,
  property_damage_inr BIGINT,
  started_at    TIMESTAMPTZ NOT NULL,
  resolved_at   TIMESTAMPTZ,
  reported_by   VARCHAR(255),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 Spatial Query Patterns

```sql
-- Get habitations within district boundary (ST_Within)
SELECT h.*, ST_AsGeoJSON(h.geom) as geojson
FROM habitations h
WHERE h.district = $1
ORDER BY h.name;

-- Find nearest shelters (ST_Distance, ordered)
SELECT r.*, ST_Distance(r.geom::geography, ST_SetSRID(ST_Point($1,$2),4326)::geography)/1000 AS distance_km
FROM resources r
WHERE r.type = 'shelter' AND r.status = 'active'
ORDER BY r.geom <-> ST_SetSRID(ST_Point($1,$2),4326)
LIMIT $3;

-- Get habitations within bounding box (ST_MakeEnvelope)
SELECT h.*, ST_AsGeoJSON(h.geom) as geojson
FROM habitations h
WHERE h.geom && ST_MakeEnvelope($1,$2,$3,$4, 4326);

-- Latest risk per habitation (window function)
SELECT DISTINCT ON (habitation_id) *
FROM risk_predictions
ORDER BY habitation_id, assessed_at DESC;
```

### 4.4 Database Rules

> [!CAUTION]
> **NEVER** expose raw SQL errors in API responses. Always catch `pg` errors and return standardized error codes.

1. All user-supplied values MUST use `$1, $2...` parameterized placeholders — no string interpolation.
2. All spatial data stored in `GEOMETRY(POINT, 4326)` — convert at API boundary.
3. Passwords stored as bcrypt hashes (rounds: 12) — never logged or returned in responses.
4. JSONB columns (`shap_explanations`, `input_features`) — validate schema before insert.
5. All timestamps stored in UTC with timezone (`TIMESTAMPTZ`).

---

## 5. Error Code Registry

| Code | HTTP Status | Service | Description |
|------|-------------|---------|-------------|
| `INVALID_CREDENTIALS` | 401 | Backend | Wrong email/password |
| `TOKEN_EXPIRED` | 401 | Backend | JWT has expired |
| `TOKEN_INVALID` | 401 | Backend | Malformed or tampered JWT |
| `FORBIDDEN` | 403 | Backend | Insufficient role for this action |
| `ACCOUNT_DISABLED` | 403 | Backend | User account deactivated |
| `NOT_FOUND` | 404 | Backend | Resource does not exist |
| `HABITATION_NOT_FOUND` | 404 | Backend | Invalid habitation_id in request |
| `VALIDATION_ERROR` | 422 | Backend | Request body failed Joi validation |
| `INSUFFICIENT_SENSOR_DATA` | 422 | Backend | Missing required sensor readings for prediction |
| `AI_ENGINE_UNAVAILABLE` | 503 | Backend | AI engine down and fallback also failed |
| `DATABASE_ERROR` | 500 | Backend | Unhandled PostgreSQL error |
| `INTERNAL_ERROR` | 500 | Backend | Unexpected server-side error |
| `MODEL_NOT_LOADED` | 503 | AI Engine | XGBoost model file not found |

---

*Document Owner: Solution Architect | Last Updated: 2026-09-28 | Version: 1.0.0*
