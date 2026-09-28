# USER STORIES — Aegis AI Disaster Decision Intelligence Platform
**SIH Problem Statement: SIH26191**  
**Version:** 1.0 | **Date:** 2026-09-28  
**Product Manager:** Aegis AI PM

---

## Overview

This document captures all user stories for the Aegis AI Disaster Decision Intelligence Platform. Stories are organized by role and mapped to platform modules.

### Roles Covered
| # | Role | Primary Concern |
|---|------|----------------|
| 1 | **Super Admin** | System configuration, multi-district oversight |
| 2 | **District Officer** | District-level disaster coordination |
| 3 | **Disaster Officer** | Real-time disaster operations management |
| 4 | **Police Officer** | Evacuation enforcement, crowd/traffic control |
| 5 | **Health Officer** | Medical resource allocation, casualty management |
| 6 | **Field Officer** | On-ground data collection and reporting |
| 7 | **Citizen** | Alerts, evacuation guidance, safety information |

---

## EPIC 1: Hazard Risk Assessment

### US-001 — District Officer
> **As a** District Officer,  
> **I want to** view a unified hazard risk map for my district showing flood, landslide, and earthquake vulnerability zones,  
> **So that** I can prioritize preparedness resources before monsoon season.

**Module:** Hazard Risk Assessment | **Priority:** Must Have

---

### US-002 — Disaster Officer
> **As a** Disaster Officer,  
> **I want to** receive automated risk score updates every hour during active disaster events,  
> **So that** I can track evolving hazard conditions in near-real-time without manually pulling reports.

**Module:** Hazard Risk Assessment | **Priority:** Must Have

---

### US-003 — Super Admin
> **As a** Super Admin,  
> **I want to** configure risk-scoring weights for each hazard type (flood, landslide, industrial) per region,  
> **So that** the AI model reflects local geospatial and historical risk factors accurately.

**Module:** Hazard Risk Assessment | **Priority:** Should Have

---

### US-004 — Field Officer
> **As a** Field Officer,  
> **I want to** submit field observations (water levels, road damage, structural damage) via mobile form,  
> **So that** the central system receives ground-truth data to improve risk accuracy.

**Module:** Hazard Risk Assessment | **Priority:** Must Have

---

## EPIC 2: Red Zone Identification

### US-005 — Disaster Officer
> **As a** Disaster Officer,  
> **I want to** see dynamically updated red zones highlighted on the district map as flood levels rise,  
> **So that** I can issue targeted evacuation orders only for areas at immediate risk.

**Module:** Red Zone Identification | **Priority:** Must Have

---

### US-006 — District Officer
> **As a** District Officer,  
> **I want to** compare current red zone boundaries against historical disaster footprints,  
> **So that** I can validate the AI predictions against institutional memory.

**Module:** Red Zone Identification | **Priority:** Should Have

---

### US-007 — Police Officer
> **As a** Police Officer,  
> **I want to** see which road segments fall within red zones,  
> **So that** I can set up traffic barricades at the correct entry points and redirect civilian vehicles.

**Module:** Red Zone Identification | **Priority:** Must Have

---

### US-008 — Citizen
> **As a** Citizen,  
> **I want to** check whether my home address falls within a red, orange, or green zone,  
> **So that** I know whether I need to evacuate immediately, stay alert, or remain at home.

**Module:** Red Zone Identification | **Priority:** Must Have

---

## EPIC 3: Impact Analysis

### US-009 — Disaster Officer
> **As a** Disaster Officer,  
> **I want to** see an estimated count of people, buildings, and critical infrastructure within the impact zone,  
> **So that** I can pre-position the correct volume of relief supplies and rescue teams.

**Module:** Impact Analysis | **Priority:** Must Have

---

### US-010 — Health Officer
> **As a** Health Officer,  
> **I want to** receive an impact analysis broken down by vulnerable population groups (elderly, disabled, children),  
> **So that** I can prioritize medical teams and ambulances toward high-vulnerability sub-zones.

**Module:** Impact Analysis | **Priority:** Must Have

---

### US-011 — District Officer
> **As a** District Officer,  
> **I want to** generate a post-event economic damage estimate report,  
> **So that** I can submit accurate loss assessments to state government for relief funding.

**Module:** Impact Analysis | **Priority:** Should Have

---

### US-012 — Super Admin
> **As a** Super Admin,  
> **I want to** aggregate impact analysis across multiple simultaneous district-level events,  
> **So that** I can present a unified state-level damage picture to the Chief Secretary.

**Module:** Impact Analysis | **Priority:** Should Have

---

## EPIC 4: Carrying Capacity Assessment

### US-013 — Disaster Officer
> **As a** Disaster Officer,  
> **I want to** view the current occupancy vs. maximum capacity of all active relief camps in real-time,  
> **So that** I can redirect incoming evacuees to camps with available space before overcrowding occurs.

**Module:** Carrying Capacity Assessment | **Priority:** Must Have

---

### US-014 — Health Officer
> **As a** Health Officer,  
> **I want to** see hospital bed availability, ICU capacity, and ambulance fleet status in affected districts,  
> **So that** I can coordinate patient transfers to the nearest facility with available capacity.

**Module:** Carrying Capacity Assessment | **Priority:** Must Have

---

### US-015 — Field Officer
> **As a** Field Officer,  
> **I want to** update relief camp headcount and supply inventory from the field in real-time,  
> **So that** the carrying capacity dashboard reflects accurate ground conditions.

**Module:** Carrying Capacity Assessment | **Priority:** Must Have

---

### US-016 — District Officer
> **As a** District Officer,  
> **I want to** receive alerts when any relief camp exceeds 80% of its capacity threshold,  
> **So that** I can authorize opening of additional camp sites before a crisis point is reached.

**Module:** Carrying Capacity Assessment | **Priority:** Must Have

---

## EPIC 5: Relocation Planning

### US-017 — Disaster Officer
> **As a** Disaster Officer,  
> **I want to** receive AI-generated relocation plan recommendations including site, route, and sequence of affected villages,  
> **So that** I can approve and execute a structured relocation with minimal manual planning effort.

**Module:** Relocation Planning | **Priority:** Must Have

---

### US-018 — District Officer
> **As a** District Officer,  
> **I want to** review and digitally approve or modify the AI-proposed relocation plan before it is disseminated to field teams,  
> **So that** accountability for decisions remains with the human authority.

**Module:** Relocation Planning | **Priority:** Must Have

---

### US-019 — Police Officer
> **As a** Police Officer,  
> **I want to** receive a list of households assigned to each relocation convoy, ordered by priority (most vulnerable first),  
> **So that** I can organize and escort evacuees in an orderly and safe manner.

**Module:** Relocation Planning | **Priority:** Should Have

---

### US-020 — Citizen
> **As a** Citizen,  
> **I want to** receive an SMS/notification with my assigned relocation camp address and transport pickup time,  
> **So that** I can prepare and comply with the evacuation order without confusion.

**Module:** Relocation Planning | **Priority:** Must Have

---

## EPIC 6: Evacuation Routing

### US-021 — Disaster Officer
> **As a** Disaster Officer,  
> **I want to** view AI-optimized evacuation routes that dynamically avoid flooded or damaged road segments,  
> **So that** I can direct field teams along the safest and fastest paths to relief camps.

**Module:** Evacuation Routing | **Priority:** Must Have

---

### US-022 — Police Officer
> **As a** Police Officer,  
> **I want to** see a turn-by-turn route map for each evacuation convoy I am escorting,  
> **So that** I can navigate efficiently even without prior knowledge of all local roads.

**Module:** Evacuation Routing | **Priority:** Must Have

---

### US-023 — Field Officer
> **As a** Field Officer,  
> **I want to** report a road blockage or bridge damage in real-time through the app,  
> **So that** the system automatically recalculates evacuation routes for all affected convoys.

**Module:** Evacuation Routing | **Priority:** Must Have

---

### US-024 — Citizen
> **As a** Citizen,  
> **I want to** access a self-evacuation map on my phone showing the nearest safe route from my location,  
> **So that** I can begin evacuating immediately even before official transport arrives.

**Module:** Evacuation Routing | **Priority:** Should Have

---

## EPIC 7: Decision Support Engine

### US-025 — Disaster Officer
> **As a** Disaster Officer,  
> **I want to** see the top 3 AI-recommended actions ranked by urgency for the current event,  
> **So that** I spend my cognitive resources on validation and judgment rather than data collection.

**Module:** Decision Support Engine | **Priority:** Must Have

---

### US-026 — District Officer
> **As a** District Officer,  
> **I want to** access a decision log that records every system recommendation, who approved it, and when,  
> **So that** there is full accountability and auditability of all disaster management decisions.

**Module:** Decision Support Engine | **Priority:** Must Have

---

### US-027 — Super Admin
> **As a** Super Admin,  
> **I want to** configure escalation rules that auto-alert state-level officers when district capacity is overwhelmed,  
> **So that** inter-district resource sharing is triggered automatically without manual escalation.

**Module:** Decision Support Engine | **Priority:** Should Have

---

## EPIC 8: AI Risk Score with Explanation

### US-028 — Disaster Officer
> **As a** Disaster Officer,  
> **I want to** see a plain-language explanation of why a specific area received a high risk score,  
> **So that** I can confidently justify evacuation orders to local officials and the public.

**Module:** AI Risk Score | **Priority:** Must Have

---

### US-029 — District Officer
> **As a** District Officer,  
> **I want to** view the key contributing factors (rainfall, soil saturation, proximity to river, population density) for each risk score,  
> **So that** I understand the model's reasoning and can override it with local knowledge when appropriate.

**Module:** AI Risk Score | **Priority:** Must Have

---

### US-030 — Super Admin
> **As a** Super Admin,  
> **I want to** access model performance metrics (accuracy, false-positive rate) per hazard type per season,  
> **So that** I can validate model reliability and trigger retraining when accuracy degrades.

**Module:** AI Risk Score | **Priority:** Should Have

---

## EPIC 9: Alerts & Communication

### US-031 — Citizen
> **As a** Citizen,  
> **I want to** receive multilingual (Marathi/Hindi/English) push notifications when my area risk level changes,  
> **So that** language is not a barrier to receiving life-saving warnings.

**Module:** Alerts & Communication | **Priority:** Must Have

---

### US-032 — Health Officer
> **As a** Health Officer,  
> **I want to** broadcast mass alerts to all registered medical volunteers and ambulance drivers within the affected district,  
> **So that** medical surge capacity is mobilized immediately when a major event is declared.

**Module:** Alerts & Communication | **Priority:** Must Have

---

### US-033 — Field Officer
> **As a** Field Officer,  
> **I want to** receive offline-capable task assignments on my device that sync when connectivity is restored,  
> **So that** I can operate effectively even in areas with damaged communication infrastructure.

**Module:** Alerts & Communication | **Priority:** Should Have

---

## EPIC 10: Reporting & Analytics

### US-034 — Super Admin
> **As a** Super Admin,  
> **I want to** generate a State-level disaster preparedness index report comparing all districts,  
> **So that** I can identify the weakest preparedness zones and allocate training and resources proactively.

**Module:** Reporting & Analytics | **Priority:** Should Have

---

### US-035 — District Officer
> **As a** District Officer,  
> **I want to** export a complete incident report PDF with maps, decisions, and timelines for each concluded disaster event,  
> **So that** I can submit the mandatory government post-event report without duplicating data entry.

**Module:** Reporting & Analytics | **Priority:** Should Have

---

## Story Map Summary

| Role | # Stories | Key Epics |
|------|-----------|-----------|
| Super Admin | 6 | System Config, Multi-district, Analytics, AI Model |
| District Officer | 8 | Risk Maps, Impact, Relocation Approval, Reporting |
| Disaster Officer | 8 | Real-time Ops, Red Zone, Routing, Decision Support |
| Police Officer | 4 | Red Zone, Relocation, Routing |
| Health Officer | 4 | Impact, Carrying Capacity, Alerts |
| Field Officer | 4 | Data Collection, Routing, Camp Updates |
| Citizen | 5 | Zone Status, Routing, Alerts, Relocation Notification |
| **Total** | **35** | **10 Epics** |

---

*Document maintained by Aegis AI Product Management. Last updated: 2026-09-28.*
