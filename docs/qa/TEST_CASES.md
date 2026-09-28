# TEST CASES — Aegis AI Disaster Decision Intelligence Platform
**Project:** SIH26191  
**Version:** 1.0  
**Last Updated:** 2026-09-28  

**Legend:**  
- **Priority:** P1=Critical | P2=High | P3=Medium | P4=Low  
- **Status:** ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked  

---

## Module 1: Authentication & Authorization

---

### TC001 — Login with Valid Credentials
| Field | Value |
|-------|-------|
| **ID** | TC001 |
| **Module** | Authentication |
| **Priority** | P1 |
| **Type** | Functional |
| **Status** | ⬜ Not Run |

**Preconditions:**
- Backend server is running on `localhost:5000`
- Demo user exists: `admin@aegis.ndma.gov.in` / `AegisDemo@2026`

**Test Steps:**
1. Send `POST /api/auth/login` with body:
   ```json
   { "email": "admin@aegis.ndma.gov.in", "password": "AegisDemo@2026" }
   ```
2. Inspect HTTP response status code
3. Inspect response body for `token` and `user` fields
4. Decode JWT token and verify payload fields

**Expected Results:**
- HTTP status: `200 OK`
- Body contains: `{ success: true, token: "<JWT>", user: { role: "admin", ... } }`
- JWT payload contains: `userId`, `role`, `iat`, `exp`
- `exp` is set to 24 hours from `iat`

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 4 expected results met → PASS

---

### TC002 — Login with Invalid Credentials
| Field | Value |
|-------|-------|
| **ID** | TC002 |
| **Module** | Authentication |
| **Priority** | P1 |
| **Type** | Negative |
| **Status** | ⬜ Not Run |

**Preconditions:**
- Backend server running

**Test Steps:**
1. Send `POST /api/auth/login` with body:
   ```json
   { "email": "admin@aegis.ndma.gov.in", "password": "WrongPassword123" }
   ```
2. Inspect HTTP response status code and body

**Expected Results:**
- HTTP status: `401 Unauthorized`
- Body: `{ success: false, message: "Invalid credentials" }`
- No `token` field present in response
- No sensitive data (password hash, user ID) exposed

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 4 expected results met → PASS

---

### TC003 — Role-Based Access: District Officer Cannot Access Super Admin Panel
| Field | Value |
|-------|-------|
| **ID** | TC003 |
| **Module** | Authorization / RBAC |
| **Priority** | P1 |
| **Type** | Security / Functional |
| **Status** | ⬜ Not Run |

**Preconditions:**
- District Officer user exists: `officer@pune.gov.in` / `Officer@2026`
- Super Admin endpoints require `role: "super_admin"`

**Test Steps:**
1. Login as District Officer and capture JWT token
2. Send `GET /api/admin/users` with `Authorization: Bearer <district_officer_token>`
3. Inspect HTTP response

**Expected Results:**
- HTTP status: `403 Forbidden`
- Body: `{ success: false, message: "Access denied. Insufficient privileges." }`
- No admin data returned

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** 403 returned with no data leak → PASS

---

### TC004 — JWT Token Expiry
| Field | Value |
|-------|-------|
| **ID** | TC004 |
| **Module** | Authentication |
| **Priority** | P1 |
| **Type** | Security |
| **Status** | ⬜ Not Run |

**Preconditions:**
- A manually crafted expired JWT token is available
- Token signed with correct secret but `exp` set to past timestamp

**Test Steps:**
1. Create expired token (exp = current time - 1 hour)
2. Send `GET /api/habitations` with `Authorization: Bearer <expired_token>`
3. Inspect response

**Expected Results:**
- HTTP status: `401 Unauthorized`
- Body: `{ success: false, message: "Token expired" }` or similar
- No habitation data returned

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** 401 returned → PASS

---

## Module 2: Risk Assessment

---

### TC010 — Risk Score Calculated Correctly for High-Risk Habitation
| Field | Value |
|-------|-------|
| **ID** | TC010 |
| **Module** | Risk Assessment / AI Engine |
| **Priority** | P1 |
| **Type** | Functional |
| **Status** | ⬜ Not Run |

**Preconditions:**
- AI engine running on `localhost:8000`
- XGBoost model is trained and loaded

**Test Steps:**
1. Send `POST /api/ai/predict` with high-risk payload:
   ```json
   {
     "rainfall_mm": 280,
     "flood_history_count": 8,
     "soil_type": "alluvial",
     "distance_to_river_km": 0.3,
     "elevation_m": 45,
     "population": 1200,
     "infrastructure_score": 2
   }
   ```
2. Record returned `risk_score` and `risk_category`

**Expected Results:**
- HTTP status: `200 OK`
- `risk_score` is between 75 and 100 (inclusive)
- `risk_category` is `"Critical"`
- Response includes `shap_factors` array

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 4 conditions met → PASS

---

### TC011 — Risk Score = 0 for Safe Habitation
| Field | Value |
|-------|-------|
| **ID** | TC011 |
| **Module** | Risk Assessment / AI Engine |
| **Priority** | P2 |
| **Type** | Functional |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Send `POST /api/ai/predict` with safe-habitation payload:
   ```json
   {
     "rainfall_mm": 30,
     "flood_history_count": 0,
     "soil_type": "rocky",
     "distance_to_river_km": 15,
     "elevation_m": 850,
     "population": 200,
     "infrastructure_score": 9
   }
   ```
2. Record returned `risk_score` and `risk_category`

**Expected Results:**
- HTTP status: `200 OK`
- `risk_score` is between 0 and 25 (inclusive)
- `risk_category` is `"Low"`

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 3 conditions met → PASS

---

### TC012 — Risk Category Boundaries (0–25 Low, 26–50 Moderate, 51–75 High, 76–100 Critical)
| Field | Value |
|-------|-------|
| **ID** | TC012 |
| **Module** | Risk Assessment |
| **Priority** | P1 |
| **Type** | Boundary Value |
| **Status** | ⬜ Not Run |

**Test Steps:**

| Sub-Test | Input Score | Expected Category |
|----------|------------|-------------------|
| TC012a | 0 | Low |
| TC012b | 25 | Low |
| TC012c | 26 | Moderate |
| TC012d | 50 | Moderate |
| TC012e | 51 | High |
| TC012f | 75 | High |
| TC012g | 76 | Critical |
| TC012h | 100 | Critical |

1. For each sub-test, call the risk category classifier function directly (unit test) or via API
2. Assert returned category matches expected

**Expected Results:**
- All 8 boundary assertions pass
- No off-by-one errors at boundaries (25/26, 50/51, 75/76)

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 8 sub-tests pass → PASS

---

### TC013 — AI Explainability Returns Top 3 Factors
| Field | Value |
|-------|-------|
| **ID** | TC013 |
| **Module** | AI Engine / Explainability |
| **Priority** | P2 |
| **Type** | Functional |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Send `POST /api/ai/predict` with any valid payload
2. Parse response `shap_factors` field

**Expected Results:**
- `shap_factors` is an array
- `shap_factors.length === 3`
- Each factor has: `{ factor: string, contribution: number, direction: "increases" | "decreases" }`
- Factors are sorted by `|contribution|` descending

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 4 conditions met → PASS

---

## Module 3: Red Zone Identification

---

### TC020 — Red Zone Correctly Identified for Habitations with Risk > 75
| Field | Value |
|-------|-------|
| **ID** | TC020 |
| **Module** | Red Zone Identification |
| **Priority** | P1 |
| **Type** | Functional |
| **Status** | ⬜ Not Run |

**Preconditions:**
- Database seeded with at least one habitation having `risk_score > 75`

**Test Steps:**
1. Send `GET /api/habitations?risk_category=Critical`
2. For each returned habitation, verify `risk_score > 75`
3. Cross-reference with `GET /api/gis/red-zones`

**Expected Results:**
- All returned habitations have `risk_score > 75`
- Each Critical habitation appears in the red zones GeoJSON
- Count matches between habitations endpoint and red zones endpoint

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 3 conditions met → PASS

---

### TC021 — Map Displays Red Zone Polygons
| Field | Value |
|-------|-------|
| **ID** | TC021 |
| **Module** | Red Zone / GIS Map |
| **Priority** | P1 |
| **Type** | UI / Functional |
| **Status** | ⬜ Not Run |

**Preconditions:**
- Frontend running on `localhost:3000`
- At least one Critical-risk habitation in the database

**Test Steps:**
1. Load the frontend map page in browser
2. Visually inspect map for red zone overlay polygons
3. Check browser network tab: confirm `GET /api/gis/habitations-geojson` returns GeoJSON with `risk_category: "Critical"` features

**Expected Results:**
- Red polygon(s) visible on the map
- Polygons rendered in red (#FF0000 or theme red color)
- Network response is valid GeoJSON (`type: "FeatureCollection"`)

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 3 conditions met → PASS

---

### TC022 — Red Zone Polygon Click Shows Zone Details
| Field | Value |
|-------|-------|
| **ID** | TC022 |
| **Module** | Red Zone / GIS Map |
| **Priority** | P2 |
| **Type** | UI Interaction |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Load the frontend map
2. Click on a red zone polygon
3. Observe popup/panel that appears

**Expected Results:**
- A popup or side panel opens
- Popup displays: Habitation name, Risk score, Risk category, Population at risk, Recommended action
- Popup has a "View Details" or "Plan Evacuation" button

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 3 conditions met → PASS

---

## Module 4: GIS Map

---

### TC030 — Map Loads with CartoDB Dark Tiles
| Field | Value |
|-------|-------|
| **ID** | TC030 |
| **Module** | GIS Map |
| **Priority** | P2 |
| **Type** | Functional / UI |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Navigate to the map page (`localhost:3000/map` or main dashboard)
2. Open browser network tab
3. Observe tile requests

**Expected Results:**
- Map initializes without console errors
- Tile requests go to `*.basemaps.cartocdn.com` or similar CartoDB URL
- Dark theme tiles visible (dark grey/black basemap)
- Map centers on correct default coordinates (India region)

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 4 conditions met → PASS

---

### TC031 — Layer Toggle Shows/Hides Habitation Markers
| Field | Value |
|-------|-------|
| **ID** | TC031 |
| **Module** | GIS Map |
| **Priority** | P2 |
| **Type** | UI Interaction |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Load map with habitation markers visible
2. Click layer toggle control to hide "Habitations" layer
3. Observe map
4. Click layer toggle again to show "Habitations" layer
5. Observe map

**Expected Results:**
- Step 3: All habitation markers disappear from map
- Step 5: All habitation markers reappear on map
- No page reload required
- Other layers (shelters, red zones) unaffected by toggle

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 4 conditions met → PASS

---

### TC032 — Habitation Marker Click Shows Popup with Correct Data
| Field | Value |
|-------|-------|
| **ID** | TC032 |
| **Module** | GIS Map |
| **Priority** | P2 |
| **Type** | UI Interaction |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Load map
2. Click on any habitation marker
3. Read popup content
4. Cross-reference with `GET /api/habitations/:id`

**Expected Results:**
- Popup appears at marker location
- Popup contains: Name, District, Population, Risk Score, Risk Category
- Data matches API response for that habitation
- Risk category color-coded (green/yellow/orange/red)

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 4 conditions met → PASS

---

### TC033 — Shelter Markers Visible in Green
| Field | Value |
|-------|-------|
| **ID** | TC033 |
| **Module** | GIS Map |
| **Priority** | P2 |
| **Type** | UI |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Load map
2. Ensure shelter layer is toggled on
3. Visually inspect shelter markers

**Expected Results:**
- Shelter markers are visually distinct from habitation markers
- Shelter markers display in green color
- Hovering shows shelter name and available capacity

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 3 conditions met → PASS

---

### TC034 — Red Zone Polygons Render Correctly
| Field | Value |
|-------|-------|
| **ID** | TC034 |
| **Module** | GIS Map |
| **Priority** | P1 |
| **Type** | UI |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Load map
2. Confirm GeoJSON is loaded from `/api/gis/habitations-geojson`
3. Inspect red zone polygons visually and via browser DevTools (Leaflet layers)

**Expected Results:**
- Polygons rendered with red fill and semi-transparency
- Polygon boundaries are geographically accurate
- No rendering artifacts or broken polygons
- Polygons load within 3 seconds of map initialization

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 4 conditions met → PASS

---

## Module 5: Shelter Management

---

### TC040 — Shelter Capacity Correctly Calculated (max - occupancy - reserved)
| Field | Value |
|-------|-------|
| **ID** | TC040 |
| **Module** | Shelter Management |
| **Priority** | P1 |
| **Type** | Functional / Calculation |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Send `GET /api/shelters`
2. For a shelter with known values, verify:
   - `capacity_max = 500`
   - `current_occupancy = 120`
   - `reserved = 50`
   - Expected `available = 500 - 120 - 50 = 330`
3. Check `available_capacity` field in response

**Expected Results:**
- `available_capacity === 330` for the test shelter
- `available_capacity` is never negative
- Formula `available = capacity_max - current_occupancy - reserved` holds for all shelters

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 3 conditions met → PASS

---

### TC041 — Shelter Shows "Full" When Occupancy >= Capacity
| Field | Value |
|-------|-------|
| **ID** | TC041 |
| **Module** | Shelter Management |
| **Priority** | P2 |
| **Type** | Boundary / Functional |
| **Status** | ⬜ Not Run |

**Preconditions:**
- Seed a shelter with `capacity_max = 200`, `current_occupancy = 200`

**Test Steps:**
1. Send `GET /api/shelters/:id` for the full shelter
2. Check response fields

**Expected Results:**
- `available_capacity === 0`
- `status === "Full"` or equivalent flag
- UI displays shelter in red/disabled state (visual check)

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 3 conditions met → PASS

---

### TC042 — Available Shelter Count Matches UI Display
| Field | Value |
|-------|-------|
| **ID** | TC042 |
| **Module** | Shelter Management |
| **Priority** | P2 |
| **Type** | Integration / UI |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Send `GET /api/shelters` and count shelters where `available_capacity > 0`
2. Navigate to frontend dashboard
3. Read "Available Shelters" KPI card value

**Expected Results:**
- Frontend KPI count === API count of shelters with `available_capacity > 0`
- No off-by-one discrepancy
- Count updates if a shelter is marked full

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 3 conditions met → PASS

---

## Module 6: Relocation Planning

---

### TC050 — Priority Queue Sorted by Risk Score Descending
| Field | Value |
|-------|-------|
| **ID** | TC050 |
| **Module** | Relocation Planning |
| **Priority** | P1 |
| **Type** | Functional |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Send `GET /api/relocation/priority-queue`
2. Extract `risk_score` from each item in the returned array
3. Verify array is sorted in descending order

**Expected Results:**
- HTTP status: `200 OK`
- `data[0].risk_score >= data[1].risk_score >= ... >= data[n].risk_score`
- No two adjacent items are out of order

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** Array is fully sorted descending → PASS

---

### TC051 — Recommended Sites Filtered by Distance
| Field | Value |
|-------|-------|
| **ID** | TC051 |
| **Module** | Relocation Planning |
| **Priority** | P2 |
| **Type** | Functional |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Send `GET /api/relocation/recommended-sites?habitation_id=<id>&max_distance_km=20`
2. Verify all returned shelter sites are within 20 km of the habitation

**Expected Results:**
- All returned sites have `distance_km <= 20`
- Sites sorted by distance ascending
- Only sites with available capacity returned

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 3 conditions met → PASS

---

### TC052 — Relocation Plan Creation Workflow
| Field | Value |
|-------|-------|
| **ID** | TC052 |
| **Module** | Relocation Planning |
| **Priority** | P2 |
| **Type** | E2E Workflow |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Login as District Officer
2. Navigate to Relocation Planning page
3. Select a habitation from the priority queue
4. Select a recommended shelter site
5. Click "Create Relocation Plan"
6. Confirm plan created

**Expected Results:**
- Plan creation POST returns `201 Created`
- Plan appears in relocation plans list
- Habitation status updated to "Relocation Planned"
- Shelter's reserved capacity increases by habitation population

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 4 conditions met → PASS

---

## Module 7: Evacuation Routing

---

### TC060 — Route Generated Between Habitation and Shelter
| Field | Value |
|-------|-------|
| **ID** | TC060 |
| **Module** | Evacuation Routing |
| **Priority** | P1 |
| **Type** | Functional |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Send `POST /api/evacuation/route`:
   ```json
   {
     "origin": { "lat": 18.5204, "lng": 73.8567 },
     "destination": { "lat": 18.6298, "lng": 73.7997 },
     "habitation_id": "HAB001",
     "shelter_id": "SHE001"
   }
   ```
2. Inspect response

**Expected Results:**
- HTTP status: `200 OK`
- Response contains `route` object with `coordinates` array
- `distance_km` and `estimated_time_minutes` fields present
- Coordinates form a continuous path from origin to destination

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 4 conditions met → PASS

---

### TC061 — Route Distance Calculated Correctly
| Field | Value |
|-------|-------|
| **ID** | TC061 |
| **Module** | Evacuation Routing |
| **Priority** | P2 |
| **Type** | Calculation |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Use two points with known real-world distance (e.g., 10.5 km apart per Google Maps)
2. Send `POST /api/evacuation/route` with those coordinates
3. Compare returned `distance_km` to known distance

**Expected Results:**
- `distance_km` within ±15% of known actual road distance
- `estimated_time_minutes` = `distance_km / avg_speed_kmh * 60` (reasonable estimate)

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** Within 15% tolerance → PASS

---

### TC062 — Route Avoids Red Zone Areas
| Field | Value |
|-------|-------|
| **ID** | TC062 |
| **Module** | Evacuation Routing |
| **Priority** | P1 |
| **Type** | Functional / Safety |
| **Status** | ⬜ Not Run |

**Preconditions:**
- A red zone polygon exists between origin and destination
- Routing algorithm is configured to avoid red zones

**Test Steps:**
1. Send `POST /api/evacuation/route` with `avoid_red_zones: true`
2. Check returned route coordinates
3. Verify no coordinate falls within a known red zone polygon

**Expected Results:**
- Route does not pass through red zone polygon bounds
- If forced (no alternative), response includes `warning: "No safe route available"`
- Response flag `red_zone_avoided: true` is present

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** Route coordinates do not intersect red zone → PASS

---

## Module 8: AI Engine

---

### TC070 — XGBoost Prediction Returns 0–100 Score
| Field | Value |
|-------|-------|
| **ID** | TC070 |
| **Module** | AI Engine |
| **Priority** | P1 |
| **Type** | Functional |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Send 10 different `POST /api/ai/predict` requests with varied inputs
2. Record `risk_score` for each

**Expected Results:**
- All 10 responses return `risk_score` between 0 and 100 inclusive
- No `NaN`, `null`, or out-of-range values
- All responses have HTTP status `200 OK`

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 10 scores in [0, 100] → PASS

---

### TC071 — SHAP Values Sum Roughly to Risk Score
| Field | Value |
|-------|-------|
| **ID** | TC071 |
| **Module** | AI Engine / Explainability |
| **Priority** | P3 |
| **Type** | Mathematical Validation |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Send `POST /api/ai/predict` with a known input
2. Sum all `contribution` values in `shap_factors`
3. Compare sum to `risk_score`

**Expected Results:**
- `|sum(shap_factors.contribution) - risk_score| <= 10` (within 10 points tolerance due to normalization)
- All SHAP contributions are numeric (not `NaN`)

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** Difference within tolerance → PASS

---

### TC072 — High Rainfall Input → High/Critical Risk Output
| Field | Value |
|-------|-------|
| **ID** | TC072 |
| **Module** | AI Engine |
| **Priority** | P1 |
| **Type** | Functional / Domain Logic |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Send `POST /api/ai/predict` with:
   ```json
   { "rainfall_mm": 350, "flood_history_count": 5, "distance_to_river_km": 0.5, "elevation_m": 30 }
   ```
2. Verify risk category

**Expected Results:**
- `risk_score >= 51`
- `risk_category` is `"High"` or `"Critical"`
- `shap_factors[0].factor` includes "rainfall" (top contributor)

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** All 3 conditions met → PASS

---

### TC073 — AI Engine Health Endpoint Returns 200
| Field | Value |
|-------|-------|
| **ID** | TC073 |
| **Module** | AI Engine |
| **Priority** | P1 |
| **Type** | Smoke / Health Check |
| **Status** | ⬜ Not Run |

**Test Steps:**
1. Ensure Python Flask AI engine is running on port 8000
2. Send `GET http://localhost:8000/health`
3. Inspect response

**Expected Results:**
- HTTP status: `200 OK`
- Body: `{ status: "healthy", model: "loaded", version: "<version>" }`
- Response time < 500ms

**Actual Results:** *(Fill during execution)*

**Pass/Fail Criteria:** 200 OK with healthy status → PASS

---

## Test Execution Summary Table

| TC ID | Module | Priority | Status |
|-------|--------|----------|--------|
| TC001 | Authentication | P1 | ⬜ |
| TC002 | Authentication | P1 | ⬜ |
| TC003 | Authorization | P1 | ⬜ |
| TC004 | Authentication | P1 | ⬜ |
| TC010 | Risk Assessment | P1 | ⬜ |
| TC011 | Risk Assessment | P2 | ⬜ |
| TC012 | Risk Assessment | P1 | ⬜ |
| TC013 | AI Explainability | P2 | ⬜ |
| TC020 | Red Zone | P1 | ⬜ |
| TC021 | Red Zone / GIS | P1 | ⬜ |
| TC022 | Red Zone / GIS | P2 | ⬜ |
| TC030 | GIS Map | P2 | ⬜ |
| TC031 | GIS Map | P2 | ⬜ |
| TC032 | GIS Map | P2 | ⬜ |
| TC033 | GIS Map | P2 | ⬜ |
| TC034 | GIS Map | P1 | ⬜ |
| TC040 | Shelter Mgmt | P1 | ⬜ |
| TC041 | Shelter Mgmt | P2 | ⬜ |
| TC042 | Shelter Mgmt | P2 | ⬜ |
| TC050 | Relocation | P1 | ⬜ |
| TC051 | Relocation | P2 | ⬜ |
| TC052 | Relocation | P2 | ⬜ |
| TC060 | Evacuation Routing | P1 | ⬜ |
| TC061 | Evacuation Routing | P2 | ⬜ |
| TC062 | Evacuation Routing | P1 | ⬜ |
| TC070 | AI Engine | P1 | ⬜ |
| TC071 | AI Engine | P3 | ⬜ |
| TC072 | AI Engine | P1 | ⬜ |
| TC073 | AI Engine | P1 | ⬜ |

**Total: 29 test cases | P1: 16 | P2: 11 | P3: 2**

---

*Document End — Aegis AI Test Cases v1.0*
