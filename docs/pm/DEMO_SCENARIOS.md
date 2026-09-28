# DEMO SCENARIOS — Aegis AI Disaster Decision Intelligence Platform
**SIH26191 | Version 1.0 | 2026-09-28**

> [!IMPORTANT]
> These scenarios are designed for a **15-minute SIH judging demo**. Each scenario activates different platform modules to demonstrate full system breadth. Presenters should pre-load scenario data seeds before the demo begins.

---

## SCENARIO 1: Severe Flood — Pune District
**Duration in Demo:** ~5 minutes | **Modules Showcased:** Hazard Risk Assessment, Red Zone Identification, Evacuation Routing, Decision Support Engine

---

### 1.1 Situation

| Parameter | Value |
|-----------|-------|
| **Event** | Extreme rainfall (285mm in 24h), Mula-Mutha river at 97% flood level |
| **Date/Time** | 17 July, 2:30 AM |
| **Affected Talukas** | Haveli, Mulshi, Khed |
| **At-Risk Population** | ~1.4 lakh across 47 villages |
| **Critical Infrastructure at Risk** | Khadakwasla Dam spillover, NH-48 bridge at Dehu Road |

---

### 1.2 What the System Shows

**Step 1 — Hazard Risk Score Alert (T+0)**
- Dashboard auto-detects CWC river feed crossing 90% threshold
- Risk score for Haveli taluka jumps from 62 → 88 (Red Zone)
- AI explanation: *"Score elevated due to: rainfall 285mm (weight 40%), river proximity < 500m (30%), historical flood frequency (20%), soil saturation index 0.91 (10%)"*
- Notification fires to District Officer and Disaster Officer instantly

**Step 2 — Red Zone Map Updates (T+2 min)**
- 12 villages in Haveli flagged Red; 18 in Orange
- Population count overlaid: 78,000 in Red zone
- Vulnerable population filter: 12,400 elderly, 9,800 children highlighted
- Citizen-facing: Pimpri-Chinchwad residents see "RED — Evacuate Now" on mobile app

**Step 3 — Evacuation Route Generation (T+3 min)**
- System proposes 3 evacuation corridors avoiding flooded NH-48 bridge
- Route 2 (via Pune-Satara road) flagged as primary — avoids 6 waterlogged segments
- Real-time: Field Officer reports Dehu Road bridge impassable → system recalculates Route 1 within 85 seconds
- 50 convoy assignments distributed across Police Officers with turn-by-turn routes

**Step 4 — Decision Support Engine (T+4 min)**
- Top 3 recommended actions:
  1. **[URGENT]** Pre-position 800 rescue boats at Haveli Ghat (confidence: 94%)
  2. **[HIGH]** Open Government Polytechnic camp (capacity 2,200) in Khed — nearest safe site
  3. **[HIGH]** Request NDRF battalion from Pune Cantonment (ETA: 45 min)
- District Officer reviews → Accepts Rec 1 & 2, Modifies Rec 3 (calls SDRF instead)
- Decision logged with officer name, timestamp, rationale

---

### 1.3 Decisions Made & Outcome

| Decision | Maker | System Role |
|----------|-------|-------------|
| Issue mandatory evacuation order for 12 Red villages | District Officer | Suggested + pre-filled order template |
| Redirect NH-48 traffic via Pune-Satara road | Police Officer | Route map auto-sent to officer's device |
| Open 3 relief camps (total capacity 6,500) | Disaster Officer | Camp capacity check showed headroom |
| Deploy 2 SDRF teams + 1 NDRF team | District Officer | AI flagged NDRF need; officer chose SDRF first |

**Outcome:** 1.1 lakh civilians evacuated within 6 hours. Zero casualties in villages with advance AI warning. System recalculated routes 4 times as conditions changed overnight.

---

---

## SCENARIO 2: Landslide Threat — Konkan Region (Raigad District)
**Duration in Demo:** ~5 minutes | **Modules Showcased:** Hazard Risk Assessment, Impact Analysis, Carrying Capacity, Relocation Planning

---

### 2.1 Situation

| Parameter | Value |
|-----------|-------|
| **Event** | Continuous rainfall (190mm/day for 3 days), geological survey flags 7 unstable hillslopes |
| **Date/Time** | 23 August, 11:00 AM |
| **Affected Talukas** | Mahad, Poladpur, Mangaon |
| **At-Risk Population** | ~38,000 across 22 tribal hamlets |
| **Critical Infrastructure** | Savitri River bridges (3), NH-66 (Pune-Goa highway), railway line Roha-Veer |

---

### 2.2 What the System Shows

**Step 1 — Predictive Risk Score (Pre-Event) (T+0)**
- 72 hours before event: system scores Mahad taluka at 71 (Orange) based on accumulated rainfall + slope data
- Alert sent to Disaster Officer: *"Landslide probability in next 24–48 hours: HIGH. Recommend pre-emptive relocation of 4 hamlets."*
- AI explanation: *"Key factors: Laterite soil saturation (35%), slope gradient > 30° in 6 zones (30%), rainfall accumulation 570mm in 72h (25%), 2005 Mahad landslide precedent zone overlap (10%)"*

**Step 2 — Impact Analysis (T+1 min)**
- Pre-event impact projection: 38,000 affected, 8,200 in high-probability landslide chute zones
- Infrastructure: 3 bridges flagged for structural risk, NH-66 at 2 landslide-prone cuts
- Economic pre-estimate: ₹340 crore asset risk (CWDRA methodology)
- Vulnerable groups: 4,100 tribal elderly, 6,200 children (hamlets have no vehicle access)

**Step 3 — Carrying Capacity Check (T+2 min)**
- System scans 14 registered relief sites in Raigad:
  - Mahad Municipal School: 800 capacity, 0 current occupancy ✅
  - Poladpur High School: 1,200 capacity ✅
  - Mangaon Krida Bhavan: 600 capacity ✅
- Total safe capacity: 5,200 across 7 sites
- Alert: District hospital Mahad has only 12 available beds — system flags need for medical support

**Step 4 — Relocation Plan Generation (T+3 min)**
- AI generates relocation plan for 8,200 high-risk residents in 4 minutes 22 seconds
- Plan details:
  - Convoy 1: Hamlet A (elderly-first) → Mahad Municipal School via forest road
  - Convoy 2: Hamlet B & C → Poladpur High School (jeep track only — 4WD vehicles required)
  - Convoy 3: Hamlet D (general) → Mangaon Krida Bhavan
- Helicopter evacuation flagged for 3 households with no road access
- District Officer reviews → Approves with one modification (adds 2 ambulances to Convoy 1)
- SMS sent in Marathi to 3,800 registered mobile numbers with pickup time and camp address

---

### 2.3 Decisions Made & Outcome

| Decision | Maker | System Role |
|----------|-------|-------------|
| Issue 48-hour advance relocation order for 4 hamlets | District Officer | AI risk score + recommendation |
| Request helicopter for 3 inaccessible households | Disaster Officer | AI flagged no-road-access households |
| Pre-stock Mahad hospital with 50 additional beds (makeshift) | Health Officer | Capacity gap alert from system |
| Close NH-66 at 2 landslide-prone cut sections | Police Officer | Red zone road overlay |

**Outcome:** Pre-emptive relocation of 8,200 people completed 36 hours before 2 major landslides struck. No casualties. State commendation issued for early AI-assisted warning.

---

---

## SCENARIO 3: Multi-Hazard Event — Nashik District
**Duration in Demo:** ~5 minutes | **Modules Showcased:** All 8 modules, Multi-event aggregation, XAI, Decision Support with Override

---

### 3.1 Situation

| Parameter | Value |
|-----------|-------|
| **Primary Event** | Godavari River flood — Nashik city + Igatpuri taluka |
| **Secondary Event** | Industrial chemical leak — MIDC Ambad (wind-driven plume) |
| **Date/Time** | 5 September, 6:45 AM |
| **Affected Population** | ~2.8 lakh (flood: 2.1L, chemical plume: 0.7L) |
| **Complexity** | Evacuation routes for flood conflict with chemical plume direction |

---

### 3.2 What the System Shows

**Step 1 — Dual Event Detection (T+0)**
- System simultaneously registers:
  - Godavari at Gangapur Dam gauge: 562,000 cusecs (flood stage)
  - Pollution Control Board sensor: SO₂ spike at MIDC Ambad
- Dashboard shows 2 concurrent active events with combined risk overlay
- Super Admin view: State-level impact aggregation across Nashik + adjacent Ahmednagar (plume drift risk)

**Step 2 — Conflicting Evacuation Routing (T+1 min)**
- Initial flood evacuation routes run west → toward Ambad MIDC (directly into chemical plume)
- System detects route conflict: *"Proposed route crosses Level-2 chemical hazard zone — alternate routes generated"*
- 3 new routes proposed (north, south, east) that avoid both flood plain and plume corridor
- AI decision confidence: 87% for northern route (NH-160 via Sinnar)

**Step 3 — AI Risk Score + XAI Explanation (T+2 min)**
- Combined risk score for Nashik West ward: 91/100 (highest in system)
- XAI breakdown displayed:
  - Flood inundation probability: 42%
  - Chemical exposure risk (wind vector + concentration model): 31%
  - Population density (9,200/km²): 18%
  - Infrastructure criticality (2 major hospitals in zone): 9%
- Disaster Officer reviews and **overrides** chemical weighting from 31% → 38% based on local knowledge of wind patterns → system re-scores to 94/100 and generates updated recommendations
- Override logged with officer justification: *"Local met station data shows NW wind strengthening — plume will intensify"*

**Step 4 — Decision Support Engine (Multi-Hazard Mode) (T+3 min)**
- Engine presents 5 actions across both hazards:
  1. **[CRITICAL]** Evacuate Nashik West and Ambad wards immediately via NH-160 north
  2. **[CRITICAL]** Seal MIDC Ambad access; HAZMAT team deployment (Maharashtra Fire Brigade)
  3. **[URGENT]** Activate 8 relief camps (combined capacity 11,000) in Sinnar, Dindori talukas
  4. **[HIGH]** Coordinate with Nashik Municipal Corporation to open City Sports Complex (5,000 capacity)
  5. **[HIGH]** Request additional water rescue boats from Pune NDRF (2-hour ETA)
- District Officer accepts all 5; decision bundle logged as "Multi-Hazard Protocol Alpha"

**Step 5 — Carrying Capacity & Health Surge (T+4 min)**
- Civil Hospital Nashik: 340 beds available, 8 ICU — system flags insufficient for 2.8L population
- Auto-recommendation: Activate 2 mobile medical units from Pune
- Health Officer approves; mobilization order auto-generated to CMO Pune

---

### 3.3 Decisions Made & Outcome

| Decision | Maker | System Role |
|----------|-------|-------------|
| Override chemical plume weight in AI model | Disaster Officer | XAI override feature |
| Reroute all evacuations to NH-160 north | District Officer | Conflict detection + re-routing |
| Declare multi-hazard emergency to state | District Officer | System auto-generated state alert template |
| HAZMAT team deployment to MIDC | Police Officer | System flagged industrial hazard, provided team contact |
| Activate mobile medical units | Health Officer | Capacity gap recommendation |

**Outcome:** 2.3 lakh evacuated within 8 hours. Multi-hazard conflict (flood vs chemical) resolved by AI within 90 seconds of detection — estimated to have prevented evacuation of 70,000 civilians directly into chemical plume zone. State declared it a model multi-hazard response.

---

## Demo Presentation Flow

```
0:00 — Scenario 1 (Flood, Pune)       → Risk Score, Red Zone, Routing
5:00 — Scenario 2 (Landslide, Konkan) → Predictive Risk, Relocation, Capacity
10:00 — Scenario 3 (Multi-hazard, Nashik) → XAI Override, Conflict Detection
14:00 — Q&A / Judge Interaction
```

## Pre-Demo Checklist

- [ ] Seed database with Scenario 1, 2, 3 data fixtures
- [ ] Enable demo mode (auto-play data feed simulation)
- [ ] Test SMS gateway sandbox for citizen notification demo
- [ ] Verify offline mode working on Field Officer device
- [ ] Confirm Marathi language toggle active on citizen mobile screen
- [ ] Load Nashik multi-hazard wind vector layer in GIS module

---

*Document maintained by Aegis AI Product Management. Last updated: 2026-09-28.*
