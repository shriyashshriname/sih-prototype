# Aegis AI — Database API Contract

> **Audience:** Backend / API team
> **Purpose:** Canonical reference for column names, types, computed vs stored fields, and query patterns
> **Schema version:** `001_initial_schema.sql`

---

## 1. Column Reference by Entity

### 1.1 `habitations` — Key Fields

| Field              | DB Column                     | Type                  | Computed?                   | Source                                                                           |
| ------------------ | ----------------------------- | --------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| Habitation ID      | `id`                        | UUID                  | No                          | Primary key                                                                      |
| District           | `district_id`               | UUID FK               | No                          | Foreign key                                                                      |
| Location           | `geometry`                  | GEOGRAPHY(POINT,4326) | No                          | Stored                                                                           |
| Risk score         | `risk_score`                | FLOAT                 | **Denormalized**      | Written by ML service after each`risk_assessments` insert                      |
| Risk category      | `risk_category`             | VARCHAR               | **Denormalized**      | Same as above                                                                    |
| Red zone flag      | `red_zone_status`           | BOOLEAN               | No                          | Set by district officer                                                          |
| Priority score     | `relocation_priority_score` | FLOAT                 | No                          | Stored — set by relocation algorithm                                            |
| Available capacity | *(not a column)*            | —                    | **Computed in query** | `max_capacity - current_occupancy - reserved_capacity` on `relocation_sites` |

> [!IMPORTANT]
> When the ML service writes a new `risk_assessments` row, it **must also UPDATE** `habitations.risk_score`, `habitations.risk_category`, and `habitations.last_assessment_at` to keep the denormalized fields in sync.

---

### 1.2 `relocation_sites` — Capacity Fields

| Field      | Column                | Computed? | Notes                                                    |
| ---------- | --------------------- | --------- | -------------------------------------------------------- |
| Total beds | `max_capacity`      | No        | Hard limit — never exceeded                             |
| Occupied   | `current_occupancy` | No        | Updated when plan status →`completed`                 |
| Reserved   | `reserved_capacity` | No        | Updated when plan status →`active` (approved)         |
| Available  | *(query)*           | Yes       | `max_capacity - current_occupancy - reserved_capacity` |

**Query pattern:**

```sql
SELECT
    id, name, site_type,
    max_capacity,
    current_occupancy,
    reserved_capacity,
    (max_capacity - current_occupancy - reserved_capacity) AS available_capacity,
    suitability_score,
    accessibility_score,
    ST_AsGeoJSON(geometry::geometry) AS geojson
FROM relocation_sites
WHERE is_available = TRUE
  AND (max_capacity - current_occupancy - reserved_capacity) >= :required_capacity
ORDER BY suitability_score DESC;
```

---

### 1.3 `risk_assessments` — JSONB Field Schemas

#### `feature_values` (JSONB)

```json
{
  "elevation_asl": 680.0,
  "slope_degrees": 32.0,
  "soil_saturation_pct": 88.0,
  "rainfall_24h": 187.5,
  "river_level_above_normal": 3.5,
  "historical_flood_events": 11,
  "historical_landslide_events": 8,
  "distance_to_river_km": 0.2,
  "land_cover_type": "forest",
  "vulnerable_population_pct": 29.5
}
```

#### `shap_values` (JSONB)

```json
{
  "slope_degrees": 24.1,
  "soil_saturation_pct": 17.3,
  "rainfall_24h": 14.8,
  "historical_landslide_events": 12.4,
  "distance_to_river_km": -8.9,
  "elevation_asl": 5.2
}
```

#### `top_factors` (JSONB array)

```json
[
  {"factor": "slope_degrees", "shap_value": 24.1, "direction": "up"},
  {"factor": "historical_landslide_events", "shap_value": 12.4, "direction": "up"},
  {"factor": "distance_to_river_km", "shap_value": -8.9, "direction": "up"}
]
```

#### `recommendations` (JSONB array)

```json
[
  {"action": "Immediate mandatory evacuation", "priority": 1, "agency": "NDRF"},
  {"action": "Deploy flood barriers", "priority": 2, "agency": "SDRF"},
  {"action": "Medical teams on standby", "priority": 3, "agency": "health"}
]
```

---

### 1.4 `relocation_plans` — `priority_groups` JSONB

```json
[
  {"group": "elderly", "count": 195},
  {"group": "children_under_12", "count": 420},
  {"group": "pregnant_women", "count": 28},
  {"group": "disabled", "count": 65},
  {"group": "general", "count": 1392}
]
```

---

### 1.5 `evacuation_routes` — `waypoints` JSONB

```json
[
  {"seq": 1, "lat": 19.6948, "lng": 73.5585, "name": "Igatpuri Khurd", "notes": "Start"},
  {"seq": 2, "lat": 19.7050, "lng": 73.5680, "name": "NH3 Access Road", "notes": "Watch for debris"},
  {"seq": 3, "lat": 19.7200, "lng": 73.5890, "name": "High Ground Camp", "notes": "Destination"}
]
```

---

### 1.6 `relocation_sites` — `facilities` JSONB

```json
{
  "water": true,
  "electricity": true,
  "medical": true,
  "sanitation": true,
  "school": false,
  "kitchen": true,
  "helipad": false
}
```

---

### 1.7 `weather_snapshots` — `forecast_24h` JSONB

```json
[
  {"hour": 0,  "rainfall_mm": 25.0, "temp_celsius": 20.5, "humidity_pct": 98, "condition": "very_heavy_rain"},
  {"hour": 3,  "rainfall_mm": 30.0, "temp_celsius": 20.0, "humidity_pct": 99, "condition": "very_heavy_rain"},
  {"hour": 6,  "rainfall_mm": 28.5, "temp_celsius": 20.2, "humidity_pct": 98, "condition": "very_heavy_rain"},
  {"hour": 12, "rainfall_mm": 18.0, "temp_celsius": 21.0, "humidity_pct": 95, "condition": "heavy_rain"},
  {"hour": 18, "rainfall_mm": 22.0, "temp_celsius": 20.5, "humidity_pct": 97, "condition": "heavy_rain"}
]
```

**Weather `condition` vocabulary:**
`clear`, `drizzle`, `light_rain`, `moderate_rain`, `heavy_rain`, `very_heavy_rain`, `extremely_heavy_rain`, `thunderstorm`, `cyclone`

---

## 2. Query Patterns

### 2.1 All Critical/High habitations in a district (risk dashboard)

```sql
SELECT
    h.id, h.name, h.taluka,
    h.risk_score, h.risk_category,
    h.red_zone_status,
    h.population, h.vulnerable_population,
    ST_AsGeoJSON(h.geometry::geometry) AS geojson
FROM habitations h
WHERE h.district_id = :district_id
  AND h.risk_category IN ('Critical', 'High')
ORDER BY h.risk_score DESC;
```

### 2.2 Latest risk assessment for a habitation

```sql
SELECT *
FROM risk_assessments
WHERE habitation_id = :habitation_id
ORDER BY assessed_at DESC
LIMIT 1;
```

Or use the view:

```sql
SELECT * FROM v_habitation_latest_risk WHERE habitation_id = :habitation_id;
```

### 2.3 Habitations within a red zone polygon (spatial join)

```sql
SELECT h.id, h.name, h.risk_score, h.population
FROM habitations h
JOIN red_zones rz ON ST_DWithin(h.geometry, rz.geometry, 0)
WHERE rz.id = :red_zone_id;
```

### 2.4 Nearest available relocation sites to a habitation

```sql
SELECT
    rs.id, rs.name, rs.site_type,
    (rs.max_capacity - rs.current_occupancy - rs.reserved_capacity) AS available_capacity,
    rs.suitability_score,
    ST_Distance(h.geometry, rs.geometry) / 1000.0 AS distance_km
FROM relocation_sites rs
CROSS JOIN habitations h
WHERE h.id = :habitation_id
  AND rs.is_available = TRUE
  AND rs.district_id = h.district_id
  AND (rs.max_capacity - rs.current_occupancy - rs.reserved_capacity) > 0
ORDER BY distance_km ASC
LIMIT 5;
```

### 2.5 All active alerts (dashboard polling)

```sql
SELECT
    a.id, a.alert_type, a.severity, a.title, a.message,
    a.target_agencies, a.created_at,
    h.name AS habitation_name,
    d.name AS district_name
FROM alerts a
JOIN habitations h ON h.id = a.habitation_id
JOIN districts   d ON d.id = h.district_id
WHERE a.status = 'active'
ORDER BY
    CASE a.severity
        WHEN 'critical' THEN 1
        WHEN 'danger'   THEN 2
        WHEN 'warning'  THEN 3
        WHEN 'info'     THEN 4
    END,
    a.created_at DESC;
```

### 2.6 Relocation plan approval workflow

```sql
-- Approve a plan
UPDATE relocation_plans
SET
    approval_status = 'approved',
    approved_by     = :approver_user_id,
    approved_at     = NOW(),
    status          = 'active',
    updated_at      = NOW()
WHERE id = :plan_id
  AND approval_status = 'pending';

-- Also reserve capacity on the destination site
UPDATE relocation_sites
SET reserved_capacity = reserved_capacity + :population_to_relocate
WHERE id = :site_id;
```

### 2.7 Mark relocation plan complete (move reserved → occupied)

```sql
BEGIN;

UPDATE relocation_plans
SET status     = 'completed',
    updated_at = NOW()
WHERE id = :plan_id;

UPDATE relocation_sites
SET
    current_occupancy = current_occupancy + :population_to_relocate,
    reserved_capacity = reserved_capacity - :population_to_relocate
WHERE id = :site_id;

COMMIT;
```

### 2.8 PostGIS — Geometry to GeoJSON (API response)

```sql
-- Single point
SELECT ST_AsGeoJSON(geometry::geometry) AS geojson FROM habitations WHERE id = :id;

-- Polygon bounding box
SELECT ST_AsGeoJSON(ST_Envelope(geometry::geometry)) AS bbox FROM districts WHERE id = :id;

-- Area of red zone in hectares
SELECT ST_Area(geometry::geometry) / 10000.0 AS area_ha FROM red_zones WHERE id = :id;

-- Distance between habitation and site (metres)
SELECT ST_Distance(h.geometry, rs.geometry) AS dist_m
FROM habitations h, relocation_sites rs
WHERE h.id = :hab_id AND rs.id = :site_id;
```

### 2.9 Weather — Latest snapshot per district

```sql
SELECT DISTINCT ON (district_id) *
FROM weather_snapshots
WHERE district_id = :district_id
ORDER BY district_id, recorded_at DESC;
```

### 2.10 Habitations in red zones (bulk spatial check)

```sql
SELECT DISTINCT h.id, h.name, h.district_id, rz.name AS red_zone_name
FROM habitations h
JOIN red_zones rz
  ON ST_DWithin(h.geometry::geography, rz.geometry::geography, 0)
WHERE h.district_id = :district_id;
```

---

## 3. Status Enums Reference

### `relocation_plans.status`

| Value         | Meaning                                 |
| ------------- | --------------------------------------- |
| `draft`     | Created, not yet submitted for approval |
| `active`    | Approved and in execution               |
| `completed` | Population successfully relocated       |
| `cancelled` | Cancelled by officer                    |

### `relocation_plans.approval_status`

| Value        | Meaning                                                    |
| ------------ | ---------------------------------------------------------- |
| `pending`  | Awaiting district officer review                           |
| `approved` | Approved —`approved_by` and `approved_at` must be set |
| `rejected` | Rejected — plan must be revised                           |

### `alerts.status`

| Value            | Meaning                                                           |
| ---------------- | ----------------------------------------------------------------- |
| `active`       | Live alert — visible on dashboards                               |
| `acknowledged` | Seen by officer —`acknowledged_by` and `acknowledged_at` set |
| `resolved`     | Situation resolved                                                |
| `expired`      | Auto-expired by TTL job                                           |

### `alerts.severity`

| Value        | UI Color | Use Case                    |
| ------------ | -------- | --------------------------- |
| `info`     | Blue     | Advisories, watches         |
| `warning`  | Yellow   | Elevated risk               |
| `danger`   | Orange   | High risk, pre-evacuation   |
| `critical` | Red      | Immediate evacuation orders |

### `users.role` Permissions Hierarchy

```
super_admin
  └─ district_officer
       └─ disaster_officer
            ├─ police_officer
            ├─ health_officer
            └─ field_officer
                 └─ citizen
```

---

## 4. PostGIS Function Quick Reference

| Operation          | Function                                               |
| ------------------ | ------------------------------------------------------ |
| Point from lat/lng | `ST_GeographyFromText('SRID=4326;POINT(lng lat)')`   |
| Polygon from WKT   | `ST_GeographyFromText('SRID=4326;POLYGON(...)')`     |
| To GeoJSON         | `ST_AsGeoJSON(geometry::geometry)`                   |
| Distance (metres)  | `ST_Distance(geog1, geog2)`                          |
| Within polygon     | `ST_DWithin(point_geog, polygon_geog, 0)`            |
| Radius search      | `ST_DWithin(point_geog, target_geog, radius_metres)` |
| Area (m²)         | `ST_Area(geometry::geometry)`                        |
| Area (hectares)    | `ST_Area(geometry::geometry) / 10000.0`              |
| Bounding box       | `ST_Envelope(geometry::geometry)`                    |
| Centroid           | `ST_Centroid(geometry::geometry)`                    |
| Buffer (metres)    | `ST_Buffer(geometry::geography, metres)::geometry`   |
| Contains           | `ST_Contains(polygon::geometry, point::geometry)`    |

---

## 5. Important Implementation Notes

> [!CAUTION]
> **Schema is immutable after publication.** All structural changes require a new numbered migration file. Never use `ALTER TABLE` in application code.

> [!WARNING]
> **Risk score sync:** After every ML assessment, the backend MUST update `habitations.risk_score`, `habitations.risk_category`, and `habitations.last_assessment_at` alongside inserting into `risk_assessments`. These are intentionally denormalized for query performance.

> [!IMPORTANT]
> **Capacity consistency:** Relocation site capacity changes (`reserved_capacity`, `current_occupancy`) must be performed inside transactions alongside the corresponding `relocation_plans` status update to prevent race conditions.

> [!NOTE]
> **Geometry type casting:** PostGIS `GEOGRAPHY` vs `GEOMETRY` — always cast with `::geometry` when calling functions that expect geometry (e.g., `ST_AsGeoJSON`, `ST_Contains`). `ST_Distance` and `ST_DWithin` work directly on geography types with metre-based units.

> [!TIP]
> **GeoJSON API responses:** Use `ST_AsGeoJSON(geometry::geometry)::jsonb` to return parsed JSON directly rather than a string, allowing PostgreSQL JSON operators on the result.

---

## 6. Migration Execution Order

```bash
# Run in sequence:
psql -U aegis_user -d aegis_db -f 001_initial_schema.sql
psql -U aegis_user -d aegis_db -f 002_seed_data.sql
```

**Required PostgreSQL version:** 12+
**Required PostGIS version:** 3.0+
