-- =============================================================================
-- AEGIS AI DISASTER DECISION INTELLIGENCE PLATFORM (SIH26191)
-- Migration: 001_initial_schema.sql
-- Description: Production schema — PostgreSQL + PostGIS
-- Author: Database Engineer (DB Agent)
-- Created: 2026-09-28
-- IMMUTABLE after publication. Coordinate all changes via migration files.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- provides gen_random_uuid()

-- ---------------------------------------------------------------------------
-- ENUM-LIKE DOMAINS  (kept as VARCHAR + CHECK for portability)
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- TABLE: users
-- Must be created before tables that reference it (FK created_by, approved_by)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255)    NOT NULL,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    password_hash       VARCHAR(255)    NOT NULL,
    role                VARCHAR(50)     NOT NULL
                            CHECK (role IN (
                                'super_admin',
                                'district_officer',
                                'disaster_officer',
                                'police_officer',
                                'health_officer',
                                'field_officer',
                                'citizen'
                            )),
    district_id         UUID,           -- FK added after districts table is created
    department          VARCHAR(255),
    badge_id            VARCHAR(100),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login          TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_format CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

CREATE INDEX idx_users_email       ON users (email);
CREATE INDEX idx_users_role        ON users (role);
CREATE INDEX idx_users_district_id ON users (district_id);
CREATE INDEX idx_users_is_active   ON users (is_active);

COMMENT ON TABLE  users                IS 'Platform users across all roles and departments.';
COMMENT ON COLUMN users.role           IS 'Determines permissions: super_admin > district_officer > disaster_officer > police_officer > health_officer > field_officer > citizen.';
COMMENT ON COLUMN users.badge_id       IS 'Official government badge / employee ID for verification.';
COMMENT ON COLUMN users.password_hash  IS 'bcrypt hash — never store plaintext.';

-- ---------------------------------------------------------------------------
-- TABLE: districts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS districts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255)    NOT NULL,
    state           VARCHAR(255)    NOT NULL DEFAULT 'Maharashtra',
    geometry        GEOGRAPHY(POLYGON, 4326)  NOT NULL,
    population      BIGINT,
    collector_name  VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT districts_population_positive CHECK (population IS NULL OR population > 0)
);

CREATE INDEX idx_districts_geometry ON districts USING GIST (geometry);
CREATE INDEX idx_districts_name     ON districts (name);
CREATE INDEX idx_districts_state    ON districts (state);

COMMENT ON TABLE  districts              IS 'Administrative district boundaries with demographic data.';
COMMENT ON COLUMN districts.geometry     IS 'GEOGRAPHY POLYGON in WGS-84 (EPSG:4326).';
COMMENT ON COLUMN districts.collector_name IS 'District Collector — primary administrative authority.';

-- ---------------------------------------------------------------------------
-- ADD FK: users.district_id → districts.id  (deferred — districts now exists)
-- ---------------------------------------------------------------------------
ALTER TABLE users
    ADD CONSTRAINT fk_users_district
        FOREIGN KEY (district_id) REFERENCES districts (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- TABLE: habitations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitations (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                        VARCHAR(255)    NOT NULL,
    district_id                 UUID            NOT NULL REFERENCES districts (id) ON DELETE CASCADE,
    taluka                      VARCHAR(255),
    geometry                    GEOGRAPHY(POINT, 4326) NOT NULL,

    -- Demographics
    population                  INT,
    vulnerable_population       INT,
    households_count            INT,

    -- Topographic & environmental features (ML inputs)
    elevation_asl               FLOAT,          -- metres above sea level
    slope_degrees               FLOAT,          -- terrain slope in degrees
    soil_saturation_pct         FLOAT,          -- 0–100
    rainfall_24h                FLOAT,          -- mm in last 24 h
    river_level_above_normal    FLOAT,          -- metres above normal level
    historical_flood_events     INT     DEFAULT 0,
    historical_landslide_events INT     DEFAULT 0,
    distance_to_river_km        FLOAT,
    land_cover_type             VARCHAR(100),   -- e.g. 'forest','agricultural','urban'

    -- Risk outputs (written by ML service / risk_assessments)
    risk_score                  FLOAT
                                    CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100)),
    risk_category               VARCHAR(20)
                                    CHECK (risk_category IS NULL OR risk_category IN ('Low','Moderate','High','Critical')),

    -- Relocation metadata
    red_zone_status             BOOLEAN         NOT NULL DEFAULT FALSE,
    relocation_timeline         VARCHAR(255),
    relocation_priority_score   FLOAT,
    last_assessment_at          TIMESTAMP WITH TIME ZONE,

    created_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT habitations_population_positive    CHECK (population IS NULL OR population >= 0),
    CONSTRAINT habitations_vulnerable_le_total    CHECK (
        vulnerable_population IS NULL OR population IS NULL OR vulnerable_population <= population
    ),
    CONSTRAINT habitations_soil_saturation_range  CHECK (
        soil_saturation_pct IS NULL OR (soil_saturation_pct >= 0 AND soil_saturation_pct <= 100)
    ),
    CONSTRAINT habitations_slope_range            CHECK (
        slope_degrees IS NULL OR (slope_degrees >= 0 AND slope_degrees <= 90)
    )
);

CREATE INDEX idx_habitations_geometry    ON habitations USING GIST (geometry);
CREATE INDEX idx_habitations_district_id ON habitations (district_id);
CREATE INDEX idx_habitations_risk_score  ON habitations (risk_score DESC);
CREATE INDEX idx_habitations_risk_cat    ON habitations (risk_category);
CREATE INDEX idx_habitations_red_zone    ON habitations (red_zone_status) WHERE red_zone_status = TRUE;
CREATE INDEX idx_habitations_taluka      ON habitations (taluka);

COMMENT ON TABLE  habitations                         IS 'Villages / habitations — primary unit of disaster risk assessment.';
COMMENT ON COLUMN habitations.geometry                IS 'Centroid GEOGRAPHY POINT in WGS-84 (EPSG:4326).';
COMMENT ON COLUMN habitations.risk_score              IS 'Composite ML risk score 0–100. Written by risk_assessments service.';
COMMENT ON COLUMN habitations.red_zone_status         IS 'TRUE when district authority officially designates habitation as a red zone.';
COMMENT ON COLUMN habitations.relocation_priority_score IS 'Weighted score for ordering relocation queue; higher = more urgent.';
COMMENT ON COLUMN habitations.soil_saturation_pct     IS 'Current soil moisture saturation 0–100 percent.';
COMMENT ON COLUMN habitations.elevation_asl            IS 'Elevation in metres above sea level (ASL).';

-- ---------------------------------------------------------------------------
-- TABLE: red_zones
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS red_zones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255)    NOT NULL,
    district_id     UUID            NOT NULL REFERENCES districts (id) ON DELETE CASCADE,
    geometry        GEOGRAPHY(POLYGON, 4326) NOT NULL,
    hazard_types    TEXT[]          NOT NULL DEFAULT '{}',   -- e.g. ARRAY['flood','landslide']
    risk_level      VARCHAR(20)     NOT NULL
                        CHECK (risk_level IN ('Low','Moderate','High','Critical')),
    confidence_pct  FLOAT
                        CHECK (confidence_pct IS NULL OR (confidence_pct >= 0 AND confidence_pct <= 100)),
    area_ha         FLOAT,          -- computed or provided in hectares
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_red_zones_geometry    ON red_zones USING GIST (geometry);
CREATE INDEX idx_red_zones_district_id ON red_zones (district_id);
CREATE INDEX idx_red_zones_risk_level  ON red_zones (risk_level);

COMMENT ON TABLE  red_zones               IS 'Official red-zone polygons declared by district authorities or ML pipeline.';
COMMENT ON COLUMN red_zones.hazard_types  IS 'Array of hazard strings: flood, landslide, cyclone, drought, etc.';
COMMENT ON COLUMN red_zones.confidence_pct IS 'ML model confidence that this polygon is a genuine hazard zone.';
COMMENT ON COLUMN red_zones.area_ha       IS 'Area of the zone in hectares. Can be computed via ST_Area(geometry::geometry)/10000.';

-- ---------------------------------------------------------------------------
-- TABLE: relocation_sites
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS relocation_sites (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255)    NOT NULL,
    district_id         UUID            NOT NULL REFERENCES districts (id) ON DELETE CASCADE,
    geometry            GEOGRAPHY(POINT, 4326) NOT NULL,
    site_type           VARCHAR(100),   -- e.g. 'relief_camp','school','community_hall','permanent_colony'
    max_capacity        INT             NOT NULL CHECK (max_capacity > 0),
    current_occupancy   INT             NOT NULL DEFAULT 0
                            CHECK (current_occupancy >= 0),
    reserved_capacity   INT             NOT NULL DEFAULT 0
                            CHECK (reserved_capacity >= 0),
    facilities          JSONB,          -- {"water":true,"electricity":true,"medical":false,...}
    suitability_score   FLOAT
                            CHECK (suitability_score IS NULL OR (suitability_score >= 0 AND suitability_score <= 100)),
    accessibility_score FLOAT
                            CHECK (accessibility_score IS NULL OR (accessibility_score >= 0 AND accessibility_score <= 100)),
    is_available        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT relocation_sites_occupancy_le_capacity CHECK (
        current_occupancy <= max_capacity
    ),
    CONSTRAINT relocation_sites_reserved_le_available CHECK (
        reserved_capacity <= (max_capacity - current_occupancy)
    )
);

CREATE INDEX idx_relocation_sites_geometry    ON relocation_sites USING GIST (geometry);
CREATE INDEX idx_relocation_sites_district_id ON relocation_sites (district_id);
CREATE INDEX idx_relocation_sites_available   ON relocation_sites (is_available) WHERE is_available = TRUE;
CREATE INDEX idx_relocation_sites_type        ON relocation_sites (site_type);

COMMENT ON TABLE  relocation_sites                   IS 'Candidate and active sites for housing relocated populations.';
COMMENT ON COLUMN relocation_sites.facilities        IS 'JSONB map of facility booleans: water, electricity, medical, sanitation, school, kitchen.';
COMMENT ON COLUMN relocation_sites.suitability_score IS 'Composite site suitability 0–100 (terrain, flood-safety, services).';
COMMENT ON COLUMN relocation_sites.reserved_capacity IS 'Slots reserved by pending relocation plans — not yet occupied.';

-- ---------------------------------------------------------------------------
-- TABLE: evacuation_routes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evacuation_routes (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_habitation_id      UUID            NOT NULL REFERENCES habitations (id) ON DELETE CASCADE,
    to_site_id              UUID            NOT NULL REFERENCES relocation_sites (id) ON DELETE CASCADE,
    geometry                GEOGRAPHY(LINESTRING, 4326) NOT NULL,
    distance_km             FLOAT           NOT NULL CHECK (distance_km > 0),
    estimated_time_minutes  INT             NOT NULL CHECK (estimated_time_minutes > 0),
    road_condition          VARCHAR(50),    -- 'good','fair','poor','blocked'
    algorithm               VARCHAR(50)     NOT NULL DEFAULT 'A*',
    waypoints               JSONB,          -- ordered array of {lat,lng,name} objects
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT evacuation_routes_road_condition CHECK (
        road_condition IS NULL OR road_condition IN ('good','fair','poor','blocked')
    )
);

CREATE INDEX idx_evacuation_routes_geometry         ON evacuation_routes USING GIST (geometry);
CREATE INDEX idx_evacuation_routes_from_habitation  ON evacuation_routes (from_habitation_id);
CREATE INDEX idx_evacuation_routes_to_site          ON evacuation_routes (to_site_id);

COMMENT ON TABLE  evacuation_routes              IS 'Pre-computed or AI-generated evacuation routes from habitations to relocation sites.';
COMMENT ON COLUMN evacuation_routes.algorithm    IS 'Routing algorithm used: A*, Dijkstra, OSM, manual.';
COMMENT ON COLUMN evacuation_routes.waypoints    IS 'Ordered JSON array: [{seq,lat,lng,name,notes}].';
COMMENT ON COLUMN evacuation_routes.geometry     IS 'GEOGRAPHY LINESTRING in WGS-84 (EPSG:4326) — the full road path.';

-- ---------------------------------------------------------------------------
-- TABLE: relocation_plans
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS relocation_plans (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habitation_id           UUID            NOT NULL REFERENCES habitations (id) ON DELETE CASCADE,
    site_id                 UUID            NOT NULL REFERENCES relocation_sites (id) ON DELETE RESTRICT,
    created_by              UUID            NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    status                  VARCHAR(50)     NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft','active','completed','cancelled')),
    approval_status         VARCHAR(50)     NOT NULL DEFAULT 'pending'
                                CHECK (approval_status IN ('pending','approved','rejected')),
    population_to_relocate  INT             NOT NULL CHECK (population_to_relocate > 0),
    priority_groups         JSONB,          -- [{group:"elderly",count:42},{group:"children",count:130}]
    estimated_duration_days INT,
    notes                   TEXT,
    approved_by             UUID            REFERENCES users (id) ON DELETE SET NULL,
    approved_at             TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT relocation_plans_approval_requires_approver CHECK (
        (approval_status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL)
        OR approval_status <> 'approved'
    )
);

CREATE INDEX idx_relocation_plans_habitation_id   ON relocation_plans (habitation_id);
CREATE INDEX idx_relocation_plans_site_id         ON relocation_plans (site_id);
CREATE INDEX idx_relocation_plans_status          ON relocation_plans (status);
CREATE INDEX idx_relocation_plans_approval_status ON relocation_plans (approval_status);
CREATE INDEX idx_relocation_plans_created_by      ON relocation_plans (created_by);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_relocation_plans_updated_at
    BEFORE UPDATE ON relocation_plans
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  relocation_plans                      IS 'Relocation plans linking a habitation to a destination site, with approval workflow.';
COMMENT ON COLUMN relocation_plans.priority_groups      IS 'JSON array of priority demographic groups with counts.';
COMMENT ON COLUMN relocation_plans.approval_status      IS 'pending → approved/rejected by district_officer or above.';

-- ---------------------------------------------------------------------------
-- TABLE: alerts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habitation_id       UUID            NOT NULL REFERENCES habitations (id) ON DELETE CASCADE,
    alert_type          VARCHAR(100)    NOT NULL,   -- 'flood_warning','evacuation_order','landslide_watch'
    severity            VARCHAR(20)     NOT NULL
                            CHECK (severity IN ('info','warning','danger','critical')),
    title               VARCHAR(255)    NOT NULL,
    message             TEXT            NOT NULL,
    target_agencies     TEXT[]          NOT NULL DEFAULT '{}',
    status              VARCHAR(50)     NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','acknowledged','resolved','expired')),
    acknowledged_by     UUID            REFERENCES users (id) ON DELETE SET NULL,
    acknowledged_at     TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT alerts_ack_requires_user CHECK (
        (status = 'acknowledged' AND acknowledged_by IS NOT NULL AND acknowledged_at IS NOT NULL)
        OR status <> 'acknowledged'
    )
);

CREATE INDEX idx_alerts_habitation_id ON alerts (habitation_id);
CREATE INDEX idx_alerts_severity      ON alerts (severity);
CREATE INDEX idx_alerts_status        ON alerts (status) WHERE status = 'active';
CREATE INDEX idx_alerts_created_at    ON alerts (created_at DESC);

CREATE TRIGGER trg_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  alerts                  IS 'Disaster alerts issued for habitations, routed to target agencies.';
COMMENT ON COLUMN alerts.target_agencies  IS 'Array of agency identifiers: NDRF, SDRF, police, health, collector.';
COMMENT ON COLUMN alerts.alert_type       IS 'Controlled vocabulary: flood_warning, landslide_watch, cyclone_alert, evacuation_order, all_clear.';

-- ---------------------------------------------------------------------------
-- TABLE: risk_assessments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS risk_assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habitation_id   UUID            NOT NULL REFERENCES habitations (id) ON DELETE CASCADE,
    model_version   VARCHAR(50)     NOT NULL,   -- e.g. 'v1.2.0'
    risk_score      FLOAT           NOT NULL
                        CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_category   VARCHAR(20)     NOT NULL
                        CHECK (risk_category IN ('Low','Moderate','High','Critical')),
    feature_values  JSONB,          -- snapshot of all input features used
    shap_values     JSONB,          -- SHAP explainability values per feature
    top_factors     JSONB,          -- [{factor,shap_value,direction}] top-N sorted
    recommendations JSONB,          -- [{action,priority,agency}]
    assessed_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_assessments_habitation_id ON risk_assessments (habitation_id);
CREATE INDEX idx_risk_assessments_assessed_at   ON risk_assessments (assessed_at DESC);
CREATE INDEX idx_risk_assessments_risk_score    ON risk_assessments (risk_score DESC);
CREATE INDEX idx_risk_assessments_model_version ON risk_assessments (model_version);

COMMENT ON TABLE  risk_assessments               IS 'Immutable audit log of every ML risk assessment run per habitation.';
COMMENT ON COLUMN risk_assessments.feature_values IS 'Snapshot of all feature inputs to the model at assessment time.';
COMMENT ON COLUMN risk_assessments.shap_values    IS 'SHAP (SHapley Additive exPlanations) values for each feature.';
COMMENT ON COLUMN risk_assessments.top_factors    IS 'Top contributing factors: [{factor, shap_value, direction: up/down}].';
COMMENT ON COLUMN risk_assessments.recommendations IS 'Recommended actions: [{action, priority: 1-5, agency}].';

-- ---------------------------------------------------------------------------
-- TABLE: weather_snapshots
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weather_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id         UUID            NOT NULL REFERENCES districts (id) ON DELETE CASCADE,
    source              VARCHAR(100)    NOT NULL DEFAULT 'synthetic',  -- 'IMD','MERRA-2','synthetic'
    rainfall_mm         FLOAT,
    temperature_celsius FLOAT,
    humidity_pct        FLOAT
                            CHECK (humidity_pct IS NULL OR (humidity_pct >= 0 AND humidity_pct <= 100)),
    wind_speed_kmh      FLOAT           CHECK (wind_speed_kmh IS NULL OR wind_speed_kmh >= 0),
    wind_direction      VARCHAR(10),    -- N, NE, E, SE, S, SW, W, NW
    forecast_24h        JSONB,          -- [{hour, rainfall_mm, temp_celsius, humidity_pct}]
    recorded_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weather_snapshots_district_id  ON weather_snapshots (district_id);
CREATE INDEX idx_weather_snapshots_recorded_at  ON weather_snapshots (recorded_at DESC);
CREATE INDEX idx_weather_snapshots_source       ON weather_snapshots (source);

COMMENT ON TABLE  weather_snapshots              IS 'Time-series weather data snapshots per district.';
COMMENT ON COLUMN weather_snapshots.forecast_24h IS 'Hourly forecast array for next 24 h: [{hour:0-23, rainfall_mm, temp_celsius, humidity_pct, condition}].';
COMMENT ON COLUMN weather_snapshots.source       IS 'Data source: synthetic (dev/test), IMD (India Meteorological Dept), MERRA-2 (NASA reanalysis).';

-- ---------------------------------------------------------------------------
-- VIEWS
-- ---------------------------------------------------------------------------

-- Convenience view: latest risk assessment per habitation
CREATE OR REPLACE VIEW v_habitation_latest_risk AS
SELECT DISTINCT ON (ra.habitation_id)
    h.id                AS habitation_id,
    h.name              AS habitation_name,
    h.district_id,
    d.name              AS district_name,
    ra.risk_score,
    ra.risk_category,
    ra.model_version,
    ra.top_factors,
    ra.recommendations,
    ra.assessed_at
FROM risk_assessments ra
JOIN habitations h  ON h.id = ra.habitation_id
JOIN districts   d  ON d.id = h.district_id
ORDER BY ra.habitation_id, ra.assessed_at DESC;

COMMENT ON VIEW v_habitation_latest_risk IS 'Latest risk assessment result per habitation (read-only).';

-- Active relocation plan summary
CREATE OR REPLACE VIEW v_active_relocation_plans AS
SELECT
    rp.id                       AS plan_id,
    h.name                      AS habitation_name,
    h.district_id,
    d.name                      AS district_name,
    rs.name                     AS site_name,
    rp.status,
    rp.approval_status,
    rp.population_to_relocate,
    rp.estimated_duration_days,
    u.name                      AS created_by_name,
    rp.created_at,
    rp.updated_at
FROM relocation_plans rp
JOIN habitations      h  ON h.id  = rp.habitation_id
JOIN districts        d  ON d.id  = h.district_id
JOIN relocation_sites rs ON rs.id = rp.site_id
JOIN users            u  ON u.id  = rp.created_by
WHERE rp.status IN ('draft','active');

COMMENT ON VIEW v_active_relocation_plans IS 'All non-terminal relocation plans with related entity names.';

-- ---------------------------------------------------------------------------
-- END OF MIGRATION 001
-- ---------------------------------------------------------------------------
