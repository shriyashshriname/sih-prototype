-- =============================================================================
-- AEGIS AI DISASTER DECISION INTELLIGENCE PLATFORM (SIH26191)
-- Migration: 002_seed_data.sql
-- Description: Seed data — 5 Maharashtra districts, 2 admin users,
--              10 relocation sites, 6 red zones, sample habitations,
--              weather snapshots, risk assessments, alerts
-- DEPENDS ON: 001_initial_schema.sql
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- DISTRICTS (5 Maharashtra)
-- Geometries are simplified bounding-box polygons for seed purposes.
-- Production: replace with actual Census of India district shapefiles.
-- ---------------------------------------------------------------------------
INSERT INTO districts (id, name, state, geometry, population, collector_name)
VALUES
    (
        'a1000000-0000-0000-0000-000000000001',
        'Pune',
        'Maharashtra',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((73.70 18.25, 74.55 18.25, 74.55 19.00, 73.70 19.00, 73.70 18.25))'
        ),
        9429408,
        'Rajesh Kumar IAS'
    ),
    (
        'a1000000-0000-0000-0000-000000000002',
        'Nashik',
        'Maharashtra',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((73.40 19.75, 74.55 19.75, 74.55 20.70, 73.40 20.70, 73.40 19.75))'
        ),
        6107187,
        'Anita Sharma IAS'
    ),
    (
        'a1000000-0000-0000-0000-000000000003',
        'Kolhapur',
        'Maharashtra',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((73.60 16.40, 74.35 16.40, 74.35 17.10, 73.60 17.10, 73.60 16.40))'
        ),
        3876001,
        'Priya Desai IAS'
    ),
    (
        'a1000000-0000-0000-0000-000000000004',
        'Satara',
        'Maharashtra',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((73.75 17.40, 74.60 17.40, 74.60 18.05, 73.75 18.05, 73.75 17.40))'
        ),
        3003741,
        'Vikram Patil IAS'
    ),
    (
        'a1000000-0000-0000-0000-000000000005',
        'Raigad',
        'Maharashtra',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((72.85 17.90, 73.55 17.90, 73.55 18.85, 72.85 18.85, 72.85 17.90))'
        ),
        2634200,
        'Suresh Naik IAS'
    );

-- ---------------------------------------------------------------------------
-- USERS (2 admin users)
-- Passwords: both set to 'AegisAdmin@2026' — bcrypt hash below
-- Hash generated with: bcrypt('AegisAdmin@2026', 12)
-- ---------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, district_id, department, badge_id, is_active)
VALUES
    (
        'b1000000-0000-0000-0000-000000000001',
        'Arjun Mehta',
        'arjun.mehta@aegis.gov.in',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUMMfvubO72MQ.BXZHMr6V5K6',  -- AegisAdmin@2026
        'super_admin',
        NULL,
        'National Disaster Management Authority',
        'NDMA-SA-001',
        TRUE
    ),
    (
        'b1000000-0000-0000-0000-000000000002',
        'Sunita Rao',
        'sunita.rao@pune.gov.in',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUMMfvubO72MQ.BXZHMr6V5K6',  -- AegisAdmin@2026
        'district_officer',
        'a1000000-0000-0000-0000-000000000001',
        'Pune District Collectorate',
        'PUNE-DO-042',
        TRUE
    ),
    (
        'b1000000-0000-0000-0000-000000000003',
        'Ravi Kulkarni',
        'ravi.kulkarni@nashik.gov.in',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUMMfvubO72MQ.BXZHMr6V5K6',
        'disaster_officer',
        'a1000000-0000-0000-0000-000000000002',
        'Nashik District DDMA',
        'NSHK-DDO-007',
        TRUE
    ),
    (
        'b1000000-0000-0000-0000-000000000004',
        'Meera Patil',
        'meera.patil@kolhapur.gov.in',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUMMfvubO72MQ.BXZHMr6V5K6',
        'field_officer',
        'a1000000-0000-0000-0000-000000000003',
        'Kolhapur Revenue Department',
        'KLP-FO-019',
        TRUE
    );

-- ---------------------------------------------------------------------------
-- HABITATIONS (15 sample habitations across all 5 districts)
-- ---------------------------------------------------------------------------
INSERT INTO habitations (
    id, name, district_id, taluka, geometry,
    population, vulnerable_population, households_count,
    elevation_asl, slope_degrees, soil_saturation_pct,
    rainfall_24h, river_level_above_normal, historical_flood_events,
    historical_landslide_events, distance_to_river_km, land_cover_type,
    risk_score, risk_category, red_zone_status,
    relocation_timeline, relocation_priority_score, last_assessment_at
)
VALUES
    -- Pune District
    (
        'c1000000-0000-0000-0000-000000000001',
        'Ambegaon Tanda',
        'a1000000-0000-0000-0000-000000000001',
        'Ambegaon',
        ST_GeographyFromText('SRID=4326;POINT(73.7542 18.7301)'),
        1240, 380, 290,
        720.5, 28.3, 82.0,
        145.2, 2.8, 7, 3, 0.4, 'forest',
        87.4, 'Critical', TRUE,
        'Immediate (0-30 days)', 94.2,
        NOW() - INTERVAL '2 hours'
    ),
    (
        'c1000000-0000-0000-0000-000000000002',
        'Bhor Wadi',
        'a1000000-0000-0000-0000-000000000001',
        'Bhor',
        ST_GeographyFromText('SRID=4326;POINT(73.8452 18.1520)'),
        870, 210, 198,
        550.0, 18.5, 65.0,
        98.0, 1.2, 4, 1, 1.2, 'agricultural',
        62.1, 'High', TRUE,
        'Short-term (1-3 months)', 71.5,
        NOW() - INTERVAL '4 hours'
    ),
    (
        'c1000000-0000-0000-0000-000000000003',
        'Velhe Pada',
        'a1000000-0000-0000-0000-000000000001',
        'Velhe',
        ST_GeographyFromText('SRID=4326;POINT(73.6830 18.2760)'),
        430, 95, 102,
        620.0, 12.0, 45.0,
        55.0, 0.3, 2, 0, 3.5, 'agricultural',
        35.0, 'Moderate', FALSE,
        NULL, 38.0,
        NOW() - INTERVAL '6 hours'
    ),
    -- Nashik District
    (
        'c1000000-0000-0000-0000-000000000004',
        'Igatpuri Khurd',
        'a1000000-0000-0000-0000-000000000002',
        'Igatpuri',
        ST_GeographyFromText('SRID=4326;POINT(73.5585 19.6948)'),
        2100, 620, 487,
        680.0, 32.0, 88.0,
        187.5, 3.5, 11, 8, 0.2, 'forest',
        92.3, 'Critical', TRUE,
        'Immediate (0-30 days)', 96.8,
        NOW() - INTERVAL '1 hour'
    ),
    (
        'c1000000-0000-0000-0000-000000000005',
        'Trimbak Wadi',
        'a1000000-0000-0000-0000-000000000002',
        'Trimbakeshwar',
        ST_GeographyFromText('SRID=4326;POINT(73.5301 20.0089)'),
        980, 310, 225,
        750.0, 25.0, 75.0,
        122.0, 2.1, 6, 5, 0.8, 'forest',
        78.5, 'High', TRUE,
        'Short-term (1-3 months)', 83.2,
        NOW() - INTERVAL '3 hours'
    ),
    (
        'c1000000-0000-0000-0000-000000000006',
        'Surgana Tanda',
        'a1000000-0000-0000-0000-000000000002',
        'Surgana',
        ST_GeographyFromText('SRID=4326;POINT(73.6120 20.5560)'),
        560, 145, 130,
        480.0, 8.0, 40.0,
        42.0, 0.1, 1, 0, 5.2, 'agricultural',
        22.0, 'Low', FALSE,
        NULL, 18.5,
        NOW() - INTERVAL '12 hours'
    ),
    -- Kolhapur District
    (
        'c1000000-0000-0000-0000-000000000007',
        'Kagal Riverbank',
        'a1000000-0000-0000-0000-000000000003',
        'Kagal',
        ST_GeographyFromText('SRID=4326;POINT(74.3155 16.5734)'),
        1650, 490, 378,
        540.0, 5.2, 90.0,
        210.0, 4.2, 14, 0, 0.1, 'agricultural',
        91.0, 'Critical', TRUE,
        'Immediate (0-30 days)', 93.5,
        NOW() - INTERVAL '30 minutes'
    ),
    (
        'c1000000-0000-0000-0000-000000000008',
        'Radhanagari Pada',
        'a1000000-0000-0000-0000-000000000003',
        'Radhanagari',
        ST_GeographyFromText('SRID=4326;POINT(73.9620 16.4200)'),
        720, 200, 162,
        610.0, 22.0, 70.0,
        165.0, 2.0, 8, 4, 1.5, 'forest',
        74.5, 'High', FALSE,
        'Medium-term (3-6 months)', 66.0,
        NOW() - INTERVAL '5 hours'
    ),
    -- Satara District
    (
        'c1000000-0000-0000-0000-000000000009',
        'Koyna Budruk',
        'a1000000-0000-0000-0000-000000000004',
        'Patan',
        ST_GeographyFromText('SRID=4326;POINT(73.7556 17.3992)'),
        890, 260, 208,
        800.0, 35.0, 85.0,
        175.0, 3.0, 9, 7, 0.5, 'forest',
        88.9, 'Critical', TRUE,
        'Immediate (0-30 days)', 91.4,
        NOW() - INTERVAL '2 hours'
    ),
    (
        'c1000000-0000-0000-0000-000000000010',
        'Wai Ghati Tanda',
        'a1000000-0000-0000-0000-000000000004',
        'Wai',
        ST_GeographyFromText('SRID=4326;POINT(73.8949 17.9648)'),
        530, 130, 121,
        560.0, 14.0, 55.0,
        80.0, 0.8, 3, 1, 2.8, 'agricultural',
        44.0, 'Moderate', FALSE,
        NULL, 42.0,
        NOW() - INTERVAL '8 hours'
    ),
    -- Raigad District
    (
        'c1000000-0000-0000-0000-000000000011',
        'Mahad Naka Colony',
        'a1000000-0000-0000-0000-000000000005',
        'Mahad',
        ST_GeographyFromText('SRID=4326;POINT(73.4133 18.0727)'),
        3200, 980, 730,
        20.0, 3.0, 95.0,
        320.0, 5.8, 18, 2, 0.05, 'urban',
        96.5, 'Critical', TRUE,
        'Immediate (0-30 days)', 98.2,
        NOW() - INTERVAL '15 minutes'
    ),
    (
        'c1000000-0000-0000-0000-000000000012',
        'Poladpur Wadgaon',
        'a1000000-0000-0000-0000-000000000005',
        'Poladpur',
        ST_GeographyFromText('SRID=4326;POINT(73.2948 17.9840)'),
        780, 220, 178,
        350.0, 20.0, 72.0,
        140.0, 2.5, 7, 3, 1.0, 'forest',
        71.0, 'High', TRUE,
        'Short-term (1-3 months)', 75.0,
        NOW() - INTERVAL '3 hours'
    ),
    (
        'c1000000-0000-0000-0000-000000000013',
        'Alibag Coastal Pada',
        'a1000000-0000-0000-0000-000000000005',
        'Alibag',
        ST_GeographyFromText('SRID=4326;POINT(72.8820 18.6484)'),
        1100, 340, 255,
        5.0, 1.5, 80.0,
        95.0, 1.8, 10, 0, 0.3, 'coastal',
        68.0, 'High', FALSE,
        'Medium-term (3-6 months)', 60.5,
        NOW() - INTERVAL '6 hours'
    ),
    (
        'c1000000-0000-0000-0000-000000000014',
        'Pen Riverside Wadi',
        'a1000000-0000-0000-0000-000000000005',
        'Pen',
        ST_GeographyFromText('SRID=4326;POINT(73.0994 18.7374)'),
        640, 170, 148,
        30.0, 2.0, 60.0,
        75.0, 0.9, 4, 0, 0.8, 'agricultural',
        38.5, 'Moderate', FALSE,
        NULL, 35.0,
        NOW() - INTERVAL '10 hours'
    ),
    (
        'c1000000-0000-0000-0000-000000000015',
        'Sudhagad Jungle Pada',
        'a1000000-0000-0000-0000-000000000005',
        'Sudhagad',
        ST_GeographyFromText('SRID=4326;POINT(73.1200 18.5500)'),
        280, 85, 65,
        680.0, 30.0, 58.0,
        110.0, 0.5, 3, 2, 4.0, 'forest',
        51.0, 'Moderate', FALSE,
        NULL, 48.0,
        NOW() - INTERVAL '9 hours'
    );

-- ---------------------------------------------------------------------------
-- RELOCATION SITES (10 sites across all 5 districts)
-- ---------------------------------------------------------------------------
INSERT INTO relocation_sites (
    id, name, district_id, geometry, site_type,
    max_capacity, current_occupancy, reserved_capacity,
    facilities, suitability_score, accessibility_score, is_available
)
VALUES
    -- Pune (3 sites)
    (
        'd1000000-0000-0000-0000-000000000001',
        'Ambegaon Relief Camp Alpha',
        'a1000000-0000-0000-0000-000000000001',
        ST_GeographyFromText('SRID=4326;POINT(73.8920 18.4850)'),
        'relief_camp',
        1500, 0, 0,
        '{"water":true,"electricity":true,"medical":true,"sanitation":true,"school":false,"kitchen":true,"helipad":false}',
        82.5, 90.0, TRUE
    ),
    (
        'd1000000-0000-0000-0000-000000000002',
        'Bhor Community Hall Complex',
        'a1000000-0000-0000-0000-000000000001',
        ST_GeographyFromText('SRID=4326;POINT(73.8550 18.1580)'),
        'community_hall',
        600, 120, 200,
        '{"water":true,"electricity":true,"medical":false,"sanitation":true,"school":false,"kitchen":false,"helipad":false}',
        68.0, 75.0, TRUE
    ),
    (
        'd1000000-0000-0000-0000-000000000003',
        'Hadapsar Permanent Colony Block-A',
        'a1000000-0000-0000-0000-000000000001',
        ST_GeographyFromText('SRID=4326;POINT(73.9588 18.5018)'),
        'permanent_colony',
        3000, 850, 400,
        '{"water":true,"electricity":true,"medical":true,"sanitation":true,"school":true,"kitchen":false,"helipad":true}',
        95.0, 95.0, TRUE
    ),
    -- Nashik (2 sites)
    (
        'd1000000-0000-0000-0000-000000000004',
        'Igatpuri High Ground Camp',
        'a1000000-0000-0000-0000-000000000002',
        ST_GeographyFromText('SRID=4326;POINT(73.5890 19.7200)'),
        'relief_camp',
        2000, 420, 800,
        '{"water":true,"electricity":true,"medical":true,"sanitation":true,"school":true,"kitchen":true,"helipad":true}',
        88.0, 78.0, TRUE
    ),
    (
        'd1000000-0000-0000-0000-000000000005',
        'Nashik Deolali Transit Camp',
        'a1000000-0000-0000-0000-000000000002',
        ST_GeographyFromText('SRID=4326;POINT(73.8312 19.9400)'),
        'relief_camp',
        1200, 0, 0,
        '{"water":true,"electricity":false,"medical":false,"sanitation":true,"school":false,"kitchen":true,"helipad":false}',
        62.0, 70.0, TRUE
    ),
    -- Kolhapur (2 sites)
    (
        'd1000000-0000-0000-0000-000000000006',
        'Kagal Safe Zone Campus',
        'a1000000-0000-0000-0000-000000000003',
        ST_GeographyFromText('SRID=4326;POINT(74.3600 16.5950)'),
        'school',
        800, 350, 200,
        '{"water":true,"electricity":true,"medical":false,"sanitation":true,"school":true,"kitchen":false,"helipad":false}',
        72.0, 85.0, TRUE
    ),
    (
        'd1000000-0000-0000-0000-000000000007',
        'Kolhapur Urban Resettlement Site',
        'a1000000-0000-0000-0000-000000000003',
        ST_GeographyFromText('SRID=4326;POINT(74.2450 16.7050)'),
        'permanent_colony',
        5000, 1200, 600,
        '{"water":true,"electricity":true,"medical":true,"sanitation":true,"school":true,"kitchen":false,"helipad":true}',
        91.0, 92.0, TRUE
    ),
    -- Satara (1 site)
    (
        'd1000000-0000-0000-0000-000000000008',
        'Satara Plateau Relief Village',
        'a1000000-0000-0000-0000-000000000004',
        ST_GeographyFromText('SRID=4326;POINT(74.0000 17.7000)'),
        'relief_camp',
        900, 0, 890,
        '{"water":true,"electricity":true,"medical":true,"sanitation":true,"school":false,"kitchen":true,"helipad":false}',
        79.0, 65.0, TRUE
    ),
    -- Raigad (2 sites)
    (
        'd1000000-0000-0000-0000-000000000009',
        'Mahad Emergency Shelter Hub',
        'a1000000-0000-0000-0000-000000000005',
        ST_GeographyFromText('SRID=4326;POINT(73.4700 18.1100)'),
        'relief_camp',
        4000, 1850, 1200,
        '{"water":true,"electricity":true,"medical":true,"sanitation":true,"school":false,"kitchen":true,"helipad":true}',
        85.5, 88.0, TRUE
    ),
    (
        'd1000000-0000-0000-0000-000000000010',
        'Alibag Coast Guard Colony Annex',
        'a1000000-0000-0000-0000-000000000005',
        ST_GeographyFromText('SRID=4326;POINT(72.8950 18.6800)'),
        'permanent_colony',
        1800, 300, 0,
        '{"water":true,"electricity":true,"medical":false,"sanitation":true,"school":true,"kitchen":false,"helipad":false}',
        76.0, 80.0, TRUE
    );

-- ---------------------------------------------------------------------------
-- RED ZONES (6 polygons)
-- ---------------------------------------------------------------------------
INSERT INTO red_zones (id, name, district_id, geometry, hazard_types, risk_level, confidence_pct, area_ha)
VALUES
    (
        'e1000000-0000-0000-0000-000000000001',
        'Ambegaon Landslide Corridor',
        'a1000000-0000-0000-0000-000000000001',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((73.740 18.720, 73.775 18.720, 73.775 18.745, 73.740 18.745, 73.740 18.720))'
        ),
        ARRAY['landslide','flash_flood'],
        'Critical',
        94.2,
        820.5
    ),
    (
        'e1000000-0000-0000-0000-000000000002',
        'Igatpuri Western Slopes',
        'a1000000-0000-0000-0000-000000000002',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((73.540 19.680, 73.580 19.680, 73.580 19.715, 73.540 19.715, 73.540 19.680))'
        ),
        ARRAY['landslide','debris_flow'],
        'Critical',
        96.8,
        1240.0
    ),
    (
        'e1000000-0000-0000-0000-000000000003',
        'Panchganga River Floodplain — Kagal',
        'a1000000-0000-0000-0000-000000000003',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((74.290 16.555, 74.340 16.555, 74.340 16.595, 74.290 16.595, 74.290 16.555))'
        ),
        ARRAY['flood','riverine_flood'],
        'Critical',
        92.5,
        1850.2
    ),
    (
        'e1000000-0000-0000-0000-000000000004',
        'Koyna Dam Buffer Zone',
        'a1000000-0000-0000-0000-000000000004',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((73.740 17.380, 73.780 17.380, 73.780 17.430, 73.740 17.430, 73.740 17.380))'
        ),
        ARRAY['flood','dam_breach_risk','landslide'],
        'Critical',
        98.1,
        3200.0
    ),
    (
        'e1000000-0000-0000-0000-000000000005',
        'Mahad Savitri River Flood Zone',
        'a1000000-0000-0000-0000-000000000005',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((73.390 18.055, 73.440 18.055, 73.440 18.100, 73.390 18.100, 73.390 18.055))'
        ),
        ARRAY['flood','flash_flood'],
        'Critical',
        97.3,
        2650.8
    ),
    (
        'e1000000-0000-0000-0000-000000000006',
        'Trimbakeshwar Godavari Headwaters',
        'a1000000-0000-0000-0000-000000000002',
        ST_GeographyFromText(
            'SRID=4326;POLYGON((73.510 19.990, 73.555 19.990, 73.555 20.025, 73.510 20.025, 73.510 19.990))'
        ),
        ARRAY['landslide','flood'],
        'High',
        87.6,
        965.3
    );

-- ---------------------------------------------------------------------------
-- EVACUATION ROUTES (sample — 3 routes for highest-risk habitations)
-- ---------------------------------------------------------------------------
INSERT INTO evacuation_routes (
    id, from_habitation_id, to_site_id, geometry,
    distance_km, estimated_time_minutes, road_condition, algorithm, waypoints
)
VALUES
    (
        'f1000000-0000-0000-0000-000000000001',
        'c1000000-0000-0000-0000-000000000001',  -- Ambegaon Tanda
        'd1000000-0000-0000-0000-000000000003',  -- Hadapsar Permanent Colony
        ST_GeographyFromText(
            'SRID=4326;LINESTRING(73.7542 18.7301, 73.8100 18.6500, 73.8800 18.5500, 73.9588 18.5018)'
        ),
        38.5, 75, 'fair', 'A*',
        '[{"seq":1,"lat":18.7301,"lng":73.7542,"name":"Ambegaon Tanda","notes":"Start"},{"seq":2,"lat":18.6500,"lng":73.8100,"name":"NH48 Junction","notes":"Main highway join"},{"seq":3,"lat":18.5018,"lng":73.9588,"name":"Hadapsar Colony","notes":"Destination"}]'
    ),
    (
        'f1000000-0000-0000-0000-000000000002',
        'c1000000-0000-0000-0000-000000000011', -- Mahad Naka Colony
        'd1000000-0000-0000-0000-000000000009', -- Mahad Emergency Shelter Hub
        ST_GeographyFromText(
            'SRID=4326;LINESTRING(73.4133 18.0727, 73.4350 18.0850, 73.4700 18.1100)'
        ),
        6.8, 18, 'good', 'A*',
        '[{"seq":1,"lat":18.0727,"lng":73.4133,"name":"Mahad Naka Colony","notes":"Start — low-lying area"},{"seq":2,"lat":18.0850,"lng":73.4350,"name":"Mahad Bridge North","notes":"Critical bottleneck — monitor"},{"seq":3,"lat":18.1100,"lng":73.4700,"name":"Emergency Shelter Hub","notes":"Destination"}]'
    ),
    (
        'f1000000-0000-0000-0000-000000000003',
        'c1000000-0000-0000-0000-000000000004', -- Igatpuri Khurd
        'd1000000-0000-0000-0000-000000000004', -- Igatpuri High Ground Camp
        ST_GeographyFromText(
            'SRID=4326;LINESTRING(73.5585 19.6948, 73.5680 19.7050, 73.5890 19.7200)'
        ),
        5.2, 14, 'good', 'Dijkstra',
        '[{"seq":1,"lat":19.6948,"lng":73.5585,"name":"Igatpuri Khurd","notes":"Start"},{"seq":2,"lat":19.7050,"lng":73.5680,"name":"NH3 Access Road","notes":"Watch for debris"},{"seq":3,"lat":19.7200,"lng":73.5890,"name":"High Ground Camp","notes":"Destination"}]'
    );

-- ---------------------------------------------------------------------------
-- RELOCATION PLANS (3 plans)
-- ---------------------------------------------------------------------------
INSERT INTO relocation_plans (
    id, habitation_id, site_id, created_by,
    status, approval_status,
    population_to_relocate, priority_groups,
    estimated_duration_days, notes,
    approved_by, approved_at
)
VALUES
    (
        'g1000000-0000-0000-0000-000000000001',
        'c1000000-0000-0000-0000-000000000011', -- Mahad Naka Colony
        'd1000000-0000-0000-0000-000000000009', -- Mahad Emergency Shelter Hub
        'b1000000-0000-0000-0000-000000000002', -- Sunita Rao (district_officer)
        'active',
        'approved',
        3200,
        '[{"group":"elderly","count":280},{"group":"children_under_12","count":640},{"group":"pregnant_women","count":42},{"group":"disabled","count":88},{"group":"general","count":2150}]',
        7,
        'Priority relocation due to Savitri river level 5.8m above normal. NDRF deployed.',
        'b1000000-0000-0000-0000-000000000001', -- Arjun Mehta (super_admin)
        NOW() - INTERVAL '1 hour'
    ),
    (
        'g1000000-0000-0000-0000-000000000002',
        'c1000000-0000-0000-0000-000000000004', -- Igatpuri Khurd
        'd1000000-0000-0000-0000-000000000004', -- Igatpuri High Ground Camp
        'b1000000-0000-0000-0000-000000000003', -- Ravi Kulkarni
        'active',
        'approved',
        2100,
        '[{"group":"elderly","count":195},{"group":"children_under_12","count":420},{"group":"pregnant_women","count":28},{"group":"disabled","count":65},{"group":"general","count":1392}]',
        5,
        'Landslide risk critical. Western slopes showing active movement. Evacuate before 72h.',
        'b1000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '3 hours'
    ),
    (
        'g1000000-0000-0000-0000-000000000003',
        'c1000000-0000-0000-0000-000000000001', -- Ambegaon Tanda
        'd1000000-0000-0000-0000-000000000001', -- Ambegaon Relief Camp Alpha
        'b1000000-0000-0000-0000-000000000002',
        'draft',
        'pending',
        1240,
        '[{"group":"elderly","count":112},{"group":"children_under_12","count":248},{"group":"general","count":880}]',
        10,
        'Awaiting final approval from district collector. Route survey complete.',
        NULL, NULL
    );

-- ---------------------------------------------------------------------------
-- ALERTS (sample active alerts)
-- ---------------------------------------------------------------------------
INSERT INTO alerts (
    id, habitation_id, alert_type, severity,
    title, message, target_agencies, status
)
VALUES
    (
        'h1000000-0000-0000-0000-000000000001',
        'c1000000-0000-0000-0000-000000000011',
        'evacuation_order',
        'critical',
        'EVACUATION ORDER — Mahad Naka Colony',
        'Savitri river level is 5.8m above normal. Immediate evacuation mandatory for all 3200 residents of Mahad Naka Colony. NDRF teams en route. Proceed to Mahad Emergency Shelter Hub via NH66.',
        ARRAY['NDRF','SDRF','police','health','collector','revenue'],
        'active'
    ),
    (
        'h1000000-0000-0000-0000-000000000002',
        'c1000000-0000-0000-0000-000000000004',
        'evacuation_order',
        'critical',
        'EVACUATION ORDER — Igatpuri Khurd',
        'Active landslide detected on western slopes. Soil saturation at 88%. Rainfall forecast: 187mm/24h. Mandatory evacuation for 2100 residents. Route NH3 to Igatpuri High Ground Camp.',
        ARRAY['NDRF','SDRF','police','revenue'],
        'active'
    ),
    (
        'h1000000-0000-0000-0000-000000000003',
        'c1000000-0000-0000-0000-000000000007',
        'flood_warning',
        'danger',
        'FLOOD WARNING — Kagal Riverbank',
        'Panchganga river level rising rapidly. 4.2m above normal. Pre-emptive evacuation advisory for 1650 residents. Monitor hourly.',
        ARRAY['SDRF','police','health','revenue'],
        'active'
    ),
    (
        'h1000000-0000-0000-0000-000000000004',
        'c1000000-0000-0000-0000-000000000009',
        'evacuation_order',
        'critical',
        'EVACUATION ORDER — Koyna Budruk',
        'Koyna reservoir water level critical. Spillway discharge imminent. Dam buffer zone must be evacuated. 890 residents to Satara Plateau Relief Village.',
        ARRAY['NDRF','SDRF','police','health','collector','dam_authority'],
        'active'
    ),
    (
        'h1000000-0000-0000-0000-000000000005',
        'c1000000-0000-0000-0000-000000000002',
        'flood_warning',
        'warning',
        'FLOOD WATCH — Bhor Wadi',
        'River level 1.2m above normal. Moderate flood risk. Residents in low-lying areas should prepare to evacuate. Keep emergency kits ready.',
        ARRAY['revenue','health'],
        'active'
    );

-- ---------------------------------------------------------------------------
-- RISK ASSESSMENTS (latest run for critical habitations)
-- ---------------------------------------------------------------------------
INSERT INTO risk_assessments (
    id, habitation_id, model_version,
    risk_score, risk_category,
    feature_values, shap_values, top_factors, recommendations,
    assessed_at
)
VALUES
    (
        'i1000000-0000-0000-0000-000000000001',
        'c1000000-0000-0000-0000-000000000011', -- Mahad Naka Colony
        'v1.2.0',
        96.5, 'Critical',
        '{"elevation_asl":20.0,"slope_degrees":3.0,"soil_saturation_pct":95.0,"rainfall_24h":320.0,"river_level_above_normal":5.8,"historical_flood_events":18,"distance_to_river_km":0.05,"land_cover_type":"urban","vulnerable_population_pct":30.6}',
        '{"elevation_asl":-22.4,"soil_saturation_pct":18.7,"rainfall_24h":15.3,"river_level_above_normal":21.8,"historical_flood_events":8.2,"distance_to_river_km":-19.6}',
        '[{"factor":"river_level_above_normal","shap_value":21.8,"direction":"up"},{"factor":"distance_to_river_km","shap_value":-19.6,"direction":"up"},{"factor":"elevation_asl","shap_value":-22.4,"direction":"up"},{"factor":"soil_saturation_pct","shap_value":18.7,"direction":"up"},{"factor":"historical_flood_events","shap_value":8.2,"direction":"up"}]',
        '[{"action":"Immediate mandatory evacuation","priority":1,"agency":"NDRF"},{"action":"Deploy flood barriers at Savitri river banks","priority":2,"agency":"SDRF"},{"action":"Medical teams on standby at shelter","priority":3,"agency":"health"}]',
        NOW() - INTERVAL '15 minutes'
    ),
    (
        'i1000000-0000-0000-0000-000000000002',
        'c1000000-0000-0000-0000-000000000004', -- Igatpuri Khurd
        'v1.2.0',
        92.3, 'Critical',
        '{"elevation_asl":680.0,"slope_degrees":32.0,"soil_saturation_pct":88.0,"rainfall_24h":187.5,"river_level_above_normal":3.5,"historical_flood_events":11,"historical_landslide_events":8,"distance_to_river_km":0.2,"land_cover_type":"forest"}',
        '{"slope_degrees":24.1,"soil_saturation_pct":17.3,"rainfall_24h":14.8,"historical_landslide_events":12.4,"distance_to_river_km":-8.9,"elevation_asl":5.2}',
        '[{"factor":"historical_landslide_events","shap_value":12.4,"direction":"up"},{"factor":"slope_degrees","shap_value":24.1,"direction":"up"},{"factor":"soil_saturation_pct","shap_value":17.3,"direction":"up"},{"factor":"rainfall_24h","shap_value":14.8,"direction":"up"},{"factor":"distance_to_river_km","shap_value":-8.9,"direction":"up"}]',
        '[{"action":"Evacuate immediately — active slope movement detected","priority":1,"agency":"NDRF"},{"action":"Block NH3 access to unstable zones","priority":2,"agency":"police"},{"action":"Geological survey of western slopes","priority":3,"agency":"disaster_officer"}]',
        NOW() - INTERVAL '1 hour'
    );

-- ---------------------------------------------------------------------------
-- WEATHER SNAPSHOTS (current conditions per district)
-- ---------------------------------------------------------------------------
INSERT INTO weather_snapshots (
    id, district_id, source,
    rainfall_mm, temperature_celsius, humidity_pct,
    wind_speed_kmh, wind_direction, forecast_24h, recorded_at
)
VALUES
    (
        'j1000000-0000-0000-0000-000000000001',
        'a1000000-0000-0000-0000-000000000001', -- Pune
        'IMD',
        145.2, 22.5, 94.0,
        28.0, 'SW',
        '[{"hour":0,"rainfall_mm":18.5,"temp_celsius":22.1,"humidity_pct":95,"condition":"heavy_rain"},{"hour":3,"rainfall_mm":22.0,"temp_celsius":21.8,"humidity_pct":96,"condition":"heavy_rain"},{"hour":6,"rainfall_mm":15.5,"temp_celsius":22.5,"humidity_pct":92,"condition":"moderate_rain"},{"hour":9,"rainfall_mm":8.0,"temp_celsius":23.0,"humidity_pct":88,"condition":"light_rain"},{"hour":12,"rainfall_mm":5.0,"temp_celsius":24.2,"humidity_pct":85,"condition":"drizzle"},{"hour":18,"rainfall_mm":12.0,"temp_celsius":22.8,"humidity_pct":91,"condition":"moderate_rain"},{"hour":21,"rainfall_mm":20.0,"temp_celsius":21.5,"humidity_pct":95,"condition":"heavy_rain"}]',
        NOW() - INTERVAL '30 minutes'
    ),
    (
        'j1000000-0000-0000-0000-000000000002',
        'a1000000-0000-0000-0000-000000000002', -- Nashik
        'IMD',
        187.5, 20.8, 97.0,
        35.0, 'W',
        '[{"hour":0,"rainfall_mm":25.0,"temp_celsius":20.5,"humidity_pct":98,"condition":"very_heavy_rain"},{"hour":3,"rainfall_mm":30.0,"temp_celsius":20.0,"humidity_pct":99,"condition":"very_heavy_rain"},{"hour":6,"rainfall_mm":28.5,"temp_celsius":20.2,"humidity_pct":98,"condition":"very_heavy_rain"},{"hour":12,"rainfall_mm":18.0,"temp_celsius":21.0,"humidity_pct":95,"condition":"heavy_rain"},{"hour":18,"rainfall_mm":22.0,"temp_celsius":20.5,"humidity_pct":97,"condition":"heavy_rain"}]',
        NOW() - INTERVAL '20 minutes'
    ),
    (
        'j1000000-0000-0000-0000-000000000003',
        'a1000000-0000-0000-0000-000000000003', -- Kolhapur
        'IMD',
        210.0, 21.2, 98.0,
        42.0, 'SW',
        '[{"hour":0,"rainfall_mm":32.0,"temp_celsius":21.0,"humidity_pct":99,"condition":"very_heavy_rain"},{"hour":6,"rainfall_mm":28.0,"temp_celsius":21.2,"humidity_pct":98,"condition":"very_heavy_rain"},{"hour":12,"rainfall_mm":20.0,"temp_celsius":22.0,"humidity_pct":96,"condition":"heavy_rain"},{"hour":18,"rainfall_mm":25.0,"temp_celsius":21.5,"humidity_pct":97,"condition":"heavy_rain"}]',
        NOW() - INTERVAL '15 minutes'
    ),
    (
        'j1000000-0000-0000-0000-000000000004',
        'a1000000-0000-0000-0000-000000000004', -- Satara
        'IMD',
        175.0, 21.5, 96.0,
        32.0, 'SW',
        '[{"hour":0,"rainfall_mm":24.0,"temp_celsius":21.0,"humidity_pct":97,"condition":"very_heavy_rain"},{"hour":6,"rainfall_mm":20.0,"temp_celsius":21.5,"humidity_pct":96,"condition":"heavy_rain"},{"hour":12,"rainfall_mm":15.0,"temp_celsius":22.5,"humidity_pct":93,"condition":"heavy_rain"},{"hour":18,"rainfall_mm":18.0,"temp_celsius":21.8,"humidity_pct":95,"condition":"heavy_rain"}]',
        NOW() - INTERVAL '25 minutes'
    ),
    (
        'j1000000-0000-0000-0000-000000000005',
        'a1000000-0000-0000-0000-000000000005', -- Raigad
        'IMD',
        320.0, 23.5, 99.0,
        48.0, 'SW',
        '[{"hour":0,"rainfall_mm":42.0,"temp_celsius":23.0,"humidity_pct":99,"condition":"extremely_heavy_rain"},{"hour":3,"rainfall_mm":50.0,"temp_celsius":22.8,"humidity_pct":100,"condition":"extremely_heavy_rain"},{"hour":6,"rainfall_mm":38.0,"temp_celsius":23.2,"humidity_pct":99,"condition":"very_heavy_rain"},{"hour":12,"rainfall_mm":28.0,"temp_celsius":24.0,"humidity_pct":97,"condition":"heavy_rain"},{"hour":18,"rainfall_mm":35.0,"temp_celsius":23.5,"humidity_pct":98,"condition":"very_heavy_rain"}]',
        NOW() - INTERVAL '10 minutes'
    );

COMMIT;

-- =============================================================================
-- END OF MIGRATION 002
-- =============================================================================
