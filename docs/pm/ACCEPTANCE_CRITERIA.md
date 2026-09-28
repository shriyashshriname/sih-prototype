# ACCEPTANCE CRITERIA — Aegis AI Disaster Decision Intelligence Platform
**SIH26191 | Version 1.0 | 2026-09-28**

---

## 1. Hazard Risk Assessment

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| AC-HRA-01 | System ingests IMD rainfall, CWC river level, and soil moisture data every 60 minutes | API response log audit |
| AC-HRA-02 | Risk score computed for each ward/village unit on a 0–100 scale | UI score display + DB validation |
| AC-HRA-03 | Score changes >10 points trigger an automated notification to District Officer | Notification system test |
| AC-HRA-04 | Historical risk data from last 10 years is pre-loaded for baseline computation | Data import verification |
| AC-HRA-05 | Map renders risk heatmap with Red/Orange/Green zones within 3 seconds of load | Browser performance test |
| AC-HRA-06 | Field officer observations update the risk score within 5 minutes of submission | End-to-end latency test |
| AC-HRA-07 | System gracefully degrades to last known score if external data feed fails, with clear UI warning | Fault injection test |

---

## 2. Red Zone Identification

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| AC-RZ-01 | Red zone = risk score ≥ 75; Orange = 50–74; Green = < 50 (configurable by Super Admin) | Config + boundary test |
| AC-RZ-02 | Red zone boundaries update in real-time (≤ 2-minute lag from source data change) | Latency measurement |
| AC-RZ-03 | Red zone overlay is visible on both desktop dashboard and mobile app | Cross-device UI test |
| AC-RZ-04 | System flags population count within each red zone automatically | DB join verification |
| AC-RZ-05 | Citizen can enter PIN code or enable GPS to query their zone status | Mobile QA test |
| AC-RZ-06 | Export red zone GeoJSON/shapefile for offline use by GIS teams | File export test |
| AC-RZ-07 | Red zone history retained for 5 years with timestamped polygon snapshots | Data retention audit |

---

## 3. Impact Analysis

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| AC-IA-01 | Impact report shows: affected population, households, hospitals, schools, bridges within zone | Report content check |
| AC-IA-02 | Vulnerable group breakdown: elderly (60+), children (< 12), disabled — per ward | Census data join verification |
| AC-IA-03 | Infrastructure damage score estimated using satellite + ML model with ±15% accuracy | Model evaluation report |
| AC-IA-04 | Economic loss estimate generated within 10 minutes of zone declaration | Performance test |
| AC-IA-05 | Impact report exportable as PDF and CSV | Format test |
| AC-IA-06 | Multi-event aggregation: Super Admin can combine impact from ≥2 concurrent district events | Aggregation unit test |
| AC-IA-07 | All impact figures cite data source and timestamp | UI content audit |

---

## 4. Carrying Capacity Assessment

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| AC-CC-01 | All registered relief camps display: total capacity, current occupancy, % full, supplies status | Dashboard UI audit |
| AC-CC-02 | Alert fires when camp reaches 80% capacity; critical alert at 95% | Alert threshold test |
| AC-CC-03 | Hospital capacity dashboard shows: total beds, available beds, ICU beds, ambulances — per facility | API response validation |
| AC-CC-04 | Field Officer can update camp headcount via mobile; dashboard reflects update ≤ 60 seconds | Sync latency test |
| AC-CC-05 | System recommends next available camp when any camp reaches threshold | Recommendation logic test |
| AC-CC-06 | Capacity history logged per camp for post-event analysis | DB audit |
| AC-CC-07 | Inventory tracking covers: food packets, water, medicines, blankets | CRUD test |

---

## 5. Relocation Planning

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| AC-RP-01 | AI generates relocation plan in ≤ 5 minutes of receiving zone declaration input | Performance test |
| AC-RP-02 | Plan includes: origin village → destination camp, convoy sequence, estimated travel time | Output schema check |
| AC-RP-03 | Vulnerable-first ordering: disabled > elderly > children > general population | Sorting logic unit test |
| AC-RP-04 | District Officer approval/rejection with comment is required before plan is actioned | Workflow state machine test |
| AC-RP-05 | Approved plan auto-notifies assigned Police Officer and Field Officer with task details | Notification test |
| AC-RP-06 | Citizen receives SMS (Marathi/Hindi/English) with: camp address, pickup time, contact number | SMS gateway test |
| AC-RP-07 | Plan revision history maintained; rollback possible within 30 minutes of approval | Version control test |

---

## 6. Evacuation Routing

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| AC-ER-01 | Routing engine avoids roads flagged as flooded, damaged, or blocked in real-time | Route recalculation test |
| AC-ER-02 | Alternate routes recomputed within 90 seconds of a road blockage report | Latency test |
| AC-ER-03 | Route displayed on mobile map with turn-by-turn directions, offline tile caching | Mobile offline test |
| AC-ER-04 | Self-evacuation mode allows citizens to get nearest safe route via GPS | GPS routing test |
| AC-ER-05 | Route accounts for bridge weight limits (no heavy vehicles on sub-standard bridges) | Constraint logic test |
| AC-ER-06 | All route decisions logged with timestamp, actor, and road conditions at time of decision | Audit log test |
| AC-ER-07 | System supports convoy routing for up to 50 simultaneous evacuation groups | Load test |

---

## 7. Decision Support Engine

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| AC-DS-01 | Engine presents ≤ 5 ranked recommended actions per active event, each with urgency score | UI content test |
| AC-DS-02 | Each recommendation includes: action text, rationale, impacted population, time sensitivity | Output schema check |
| AC-DS-03 | Officer can Accept / Modify / Reject each recommendation; all responses logged | Workflow test |
| AC-DS-04 | Decision log is immutable and auditable; accessible to Super Admin at any time | DB audit + access control test |
| AC-DS-05 | Escalation rule fires to State-level officer if district declares "overwhelmed" status | Escalation rule test |
| AC-DS-06 | System provides what-if simulation: officer can adjust inputs and see predicted outcome shift | Simulation unit test |
| AC-DS-07 | All recommendations refresh every 15 minutes or immediately upon significant data change | Refresh logic test |

---

## 8. AI Risk Score with Explanation (XAI)

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| AC-XAI-01 | Every risk score shows top-3 contributing factors with percentage weight | UI content test |
| AC-XAI-02 | Plain-language explanation generated in Marathi and English for each score | Language output test |
| AC-XAI-03 | Officer can request "why this score?" and receive a structured explanation within 2 seconds | Latency test |
| AC-XAI-04 | Factor breakdown includes: rainfall (mm), river level (m), soil type, slope, population density | Feature set validation |
| AC-XAI-05 | Officer override of AI score is permitted with mandatory reason field; override logged | Override workflow test |
| AC-XAI-06 | Model accuracy ≥ 80% precision and recall on historical validation set | ML evaluation report |
| AC-XAI-07 | Super Admin can view model drift metrics and trigger retraining from admin console | Admin console test |

---

## Definition of Done (Global)

All MVP features must meet these criteria before release:

- [ ] Unit tests pass with ≥ 80% code coverage for the module
- [ ] API response time ≤ 3 seconds under 100 concurrent users
- [ ] Accessible on Chrome, Firefox, Safari (desktop) and Android/iOS (mobile)
- [ ] Marathi language support verified for all citizen-facing text
- [ ] Security: Role-based access control enforced; no cross-role data leak
- [ ] Audit log entry created for every state-changing user action
- [ ] Offline mode tested for Field Officer and Citizen mobile flows

---

*Document maintained by Aegis AI Product Management. Last updated: 2026-09-28.*
