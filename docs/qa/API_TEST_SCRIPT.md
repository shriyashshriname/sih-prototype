# API TEST SCRIPT — Aegis AI Platform
**Project:** SIH26191  
**Type:** Manual API Testing Guide (cURL)  
**Base URL:** `http://localhost:5000`  
**AI Engine URL:** `http://localhost:8000`  
**Last Updated:** 2026-09-28

---

> **Setup:** Before running these commands, ensure:
> 1. Backend server: `npm start` (port 5000)
> 2. AI engine: `python app.py` (port 8000)
> 3. Database seeded with sample data
> 4. Replace `<TOKEN>` with a valid JWT obtained from the login endpoint

---

## 0. Obtain Auth Token (Run First)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@aegis.ndma.gov.in", "password": "AegisDemo@2026"}' \
  | python -m json.tool
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "NDMA Admin",
    "email": "admin@aegis.ndma.gov.in",
    "role": "admin"
  }
}
```

> **Save the token:** `export TOKEN="<paste token here>"`  
> Windows PowerShell: `$TOKEN = "<paste token here>"`

---

## 1. GET /api/health

**Purpose:** Verify backend server is alive and connected to DB

```bash
curl -X GET http://localhost:5000/api/health \
  -H "Content-Type: application/json" \
  | python -m json.tool
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "database": "connected",
    "ai_engine": "connected"
  },
  "timestamp": "2026-09-28T14:00:00.000Z"
}
```

**Assertions:**
- ✅ Status code: `200 OK`
- ✅ `success: true`
- ✅ `services.database: "connected"`

---

## 2. GET /api/habitations

**Purpose:** Retrieve all habitations (paginated)

```bash
curl -X GET http://localhost:5000/api/habitations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | python -m json.tool
```

**Expected Response:**
```json
{
  "success": true,
  "count": 125,
  "data": [
    {
      "id": "HAB001",
      "name": "Wagholi",
      "district": "Pune",
      "state": "Maharashtra",
      "population": 4500,
      "risk_score": 78.3,
      "risk_category": "Critical",
      "lat": 18.5777,
      "lng": 73.9748
    }
  ]
}
```

**Assertions:**
- ✅ Status code: `200 OK`
- ✅ `success: true`
- ✅ `data` is a non-empty array
- ✅ Each item has `id`, `name`, `district`, `risk_score`, `risk_category`

---

## 3. GET /api/habitations?district=Pune

**Purpose:** Filter habitations by district

```bash
curl -X GET "http://localhost:5000/api/habitations?district=Pune" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | python -m json.tool
```

**Expected Response:**
```json
{
  "success": true,
  "count": 18,
  "filter": { "district": "Pune" },
  "data": [
    { "district": "Pune", ... }
  ]
}
```

**Assertions:**
- ✅ Status code: `200 OK`
- ✅ All returned items have `district: "Pune"`
- ✅ `count` matches `data.length`

**Additional Filter Tests:**

```bash
# Filter by risk category
curl -X GET "http://localhost:5000/api/habitations?risk_category=Critical" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# Filter by state
curl -X GET "http://localhost:5000/api/habitations?state=Maharashtra" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# Combine filters
curl -X GET "http://localhost:5000/api/habitations?district=Pune&risk_category=High" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
```

---

## 4. GET /api/risk/summary

**Purpose:** Retrieve aggregated risk statistics for the dashboard

```bash
curl -X GET http://localhost:5000/api/risk/summary \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | python -m json.tool
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_habitations": 125,
    "critical_count": 23,
    "high_count": 41,
    "moderate_count": 38,
    "low_count": 23,
    "population_at_risk": 284500,
    "average_risk_score": 52.4,
    "districts_affected": 8
  }
}
```

**Assertions:**
- ✅ Status code: `200 OK`
- ✅ `data` object is present
- ✅ `critical_count + high_count + moderate_count + low_count === total_habitations`
- ✅ `population_at_risk > 0`

---

## 5. GET /api/gis/habitations-geojson

**Purpose:** Retrieve GeoJSON for map rendering

```bash
curl -X GET http://localhost:5000/api/gis/habitations-geojson \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | python -m json.tool
```

**Expected Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [73.9748, 18.5777]
      },
      "properties": {
        "id": "HAB001",
        "name": "Wagholi",
        "risk_score": 78.3,
        "risk_category": "Critical",
        "population": 4500
      }
    }
  ]
}
```

**Assertions:**
- ✅ Status code: `200 OK`
- ✅ `type: "FeatureCollection"`
- ✅ `features` is a non-empty array
- ✅ Each feature has valid `geometry.coordinates` (lng, lat order)
- ✅ Each feature's `properties` contains `risk_score`

**Validate GeoJSON structure:**
```bash
curl -X GET http://localhost:5000/api/gis/habitations-geojson \
  -H "Authorization: Bearer $TOKEN" \
  | python -c "import json,sys; d=json.load(sys.stdin); print('Features:', len(d['features'])); print('Type:', d['type'])"
```

---

## 6. GET /api/shelters

**Purpose:** Retrieve all emergency shelters

```bash
curl -X GET http://localhost:5000/api/shelters \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | python -m json.tool
```

**Expected Response:**
```json
{
  "success": true,
  "count": 34,
  "data": [
    {
      "id": "SHE001",
      "name": "Pune Civil Shelter A",
      "district": "Pune",
      "capacity_max": 500,
      "current_occupancy": 120,
      "reserved": 50,
      "available_capacity": 330,
      "status": "Available",
      "lat": 18.5314,
      "lng": 73.8446,
      "amenities": ["water", "food", "medical"]
    }
  ]
}
```

**Assertions:**
- ✅ Status code: `200 OK`
- ✅ `data` is a non-empty array
- ✅ `available_capacity === capacity_max - current_occupancy - reserved`
- ✅ No shelter has `available_capacity < 0`

**Verify capacity math with Python:**
```bash
curl -X GET http://localhost:5000/api/shelters \
  -H "Authorization: Bearer $TOKEN" \
  | python -c "
import json, sys
d = json.load(sys.stdin)
errors = []
for s in d['data']:
    expected = s['capacity_max'] - s['current_occupancy'] - s['reserved']
    if s['available_capacity'] != expected:
        errors.append(s['id'])
print('Capacity errors:', errors if errors else 'None - All correct!')
"
```

---

## 7. GET /api/weather

**Purpose:** Retrieve current weather data for risk context

```bash
curl -X GET http://localhost:5000/api/weather \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | python -m json.tool
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "current_rainfall_mm": 45.2,
    "forecast_24h_mm": 120,
    "alert_level": "Orange",
    "districts": [
      {
        "district": "Pune",
        "rainfall_mm": 52.1,
        "alert": "Orange"
      }
    ],
    "last_updated": "2026-09-28T13:45:00Z"
  }
}
```

**Assertions:**
- ✅ Status code: `200 OK`
- ✅ `data.current_rainfall_mm` is a number ≥ 0
- ✅ `data.alert_level` is one of: `Green`, `Yellow`, `Orange`, `Red`
- ✅ `data.last_updated` is a valid ISO timestamp

---

## 8. POST /api/evacuation/route

**Purpose:** Generate evacuation route between habitation and shelter

```bash
curl -X POST http://localhost:5000/api/evacuation/route \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "lat": 18.5204,
      "lng": 73.8567,
      "habitation_id": "HAB001"
    },
    "destination": {
      "lat": 18.6298,
      "lng": 73.7997,
      "shelter_id": "SHE001"
    },
    "avoid_red_zones": true,
    "transport_mode": "road"
  }' \
  | python -m json.tool
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "route_id": "ROUTE-20260928-001",
    "distance_km": 14.7,
    "estimated_time_minutes": 28,
    "red_zone_avoided": true,
    "waypoints": 12,
    "route": {
      "type": "LineString",
      "coordinates": [
        [73.8567, 18.5204],
        [73.8412, 18.5390],
        "..."
      ]
    }
  }
}
```

**Assertions:**
- ✅ Status code: `200 OK`
- ✅ `data.distance_km > 0`
- ✅ `data.estimated_time_minutes > 0`
- ✅ `data.route.type === "LineString"`
- ✅ `data.route.coordinates.length >= 2`

**Test with invalid coordinates:**
```bash
curl -X POST http://localhost:5000/api/evacuation/route \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"origin": {"lat": 999, "lng": 999}, "destination": {"lat": 0, "lng": 0}}' \
  | python -m json.tool
# Expected: 400 Bad Request
```

---

## 9. POST /api/ai/predict

**Purpose:** Invoke AI engine risk prediction

```bash
curl -X POST http://localhost:5000/api/ai/predict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "habitation_id": "HAB001",
    "features": {
      "rainfall_mm": 280,
      "flood_history_count": 8,
      "soil_type": "alluvial",
      "distance_to_river_km": 0.3,
      "elevation_m": 45,
      "population": 1200,
      "infrastructure_score": 2,
      "slope_degrees": 3.5,
      "drainage_quality": "poor"
    }
  }' \
  | python -m json.tool
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "habitation_id": "HAB001",
    "risk_score": 87.4,
    "risk_category": "Critical",
    "confidence": 0.92,
    "shap_factors": [
      {
        "factor": "rainfall_mm",
        "contribution": 24.1,
        "direction": "increases"
      },
      {
        "factor": "flood_history_count",
        "contribution": 18.7,
        "direction": "increases"
      },
      {
        "factor": "distance_to_river_km",
        "contribution": 15.2,
        "direction": "increases"
      }
    ],
    "recommended_action": "Immediate evacuation required",
    "model_version": "xgboost-v2.1"
  }
}
```

**Assertions:**
- ✅ Status code: `200 OK`
- ✅ `data.risk_score` between 0 and 100
- ✅ `data.risk_category` is one of: `Low`, `Moderate`, `High`, `Critical`
- ✅ `data.shap_factors.length === 3`
- ✅ Each SHAP factor has `factor`, `contribution`, `direction`

**Direct AI Engine Test (bypass backend):**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "rainfall_mm": 280,
    "flood_history_count": 8,
    "soil_type": "alluvial",
    "distance_to_river_km": 0.3,
    "elevation_m": 45,
    "population": 1200,
    "infrastructure_score": 2
  }' \
  | python -m json.tool
```

---

## 10. GET /health (AI Engine Direct)

```bash
curl -X GET http://localhost:8000/health \
  | python -m json.tool
```

**Expected Response:**
```json
{
  "status": "healthy",
  "model": "loaded",
  "model_version": "xgboost-v2.1",
  "uptime_seconds": 3600
}
```

**Assertions:**
- ✅ Status code: `200 OK`
- ✅ `status: "healthy"`
- ✅ `model: "loaded"`

---

## 11. Negative / Error Case Tests

### 11.1 Missing Auth Header
```bash
curl -X GET http://localhost:5000/api/habitations \
  | python -m json.tool
# Expected: 401 Unauthorized
```

### 11.2 Invalid JSON Body
```bash
curl -X POST http://localhost:5000/api/ai/predict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d 'INVALID JSON HERE' \
  | python -m json.tool
# Expected: 400 Bad Request
```

### 11.3 Non-existent Resource
```bash
curl -X GET http://localhost:5000/api/habitations/NONEXISTENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  | python -m json.tool
# Expected: 404 Not Found
```

### 11.4 SQL Injection Attempt
```bash
curl -X GET "http://localhost:5000/api/habitations?district=Pune' OR '1'='1" \
  -H "Authorization: Bearer $TOKEN" \
  | python -m json.tool
# Expected: 400 Bad Request OR sanitized query (not a SQL error)
```

---

## Quick Test — All Endpoints in One Script (Bash)

```bash
#!/bin/bash
BASE="http://localhost:5000"
TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aegis.ndma.gov.in","password":"AegisDemo@2026"}' \
  | python -c "import json,sys; print(json.load(sys.stdin)['token'])")

echo "Token obtained: ${TOKEN:0:20}..."

declare -A endpoints=(
  ["GET /api/health"]="$BASE/api/health"
  ["GET /api/habitations"]="$BASE/api/habitations"
  ["GET /api/habitations?district=Pune"]="$BASE/api/habitations?district=Pune"
  ["GET /api/risk/summary"]="$BASE/api/risk/summary"
  ["GET /api/gis/habitations-geojson"]="$BASE/api/gis/habitations-geojson"
  ["GET /api/shelters"]="$BASE/api/shelters"
  ["GET /api/weather"]="$BASE/api/weather"
)

for name in "${!endpoints[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${endpoints[$name]}" \
    -H "Authorization: Bearer $TOKEN")
  if [ "$STATUS" == "200" ]; then
    echo "✅ PASS [$STATUS] $name"
  else
    echo "❌ FAIL [$STATUS] $name"
  fi
done
```

---

*Document End — Aegis AI API Test Script v1.0*
