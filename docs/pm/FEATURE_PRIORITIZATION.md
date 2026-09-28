# FEATURE PRIORITIZATION — Aegis AI Disaster Decision Intelligence Platform
**SIH26191 | MoSCoW Framework | Version 1.0 | 2026-09-28**

---

## SIH Judging Criteria Weights (Reference)

| Criterion | Weight |
|-----------|--------|
| Innovation & Novelty | 25% |
| Technical Feasibility & Implementation | 25% |
| Impact & Scalability | 20% |
| User Experience & Usability | 15% |
| Completeness & Demo Quality | 15% |

---

## MUST HAVE — Core MVP (Demo-Critical)

> Features without which the platform cannot be demonstrated or judged. Ship by Demo Day.

| Feature | Module | SIH Criteria Served | Rationale |
|---------|--------|---------------------|-----------|
| Hazard Risk Scoring (real-time, 0–100 scale) | Hazard Risk Assessment | Innovation 25%, Technical 25% | Core AI value proposition; judges will probe the model |
| Red Zone Map with dynamic boundary updates | Red Zone Identification | UX 15%, Impact 20% | Most visually compelling demo element |
| AI Risk Score + XAI Plain-Language Explanation | XAI Module | Innovation 25% | Differentiator — explainability is a judging hook |
| Impact Analysis (population + infrastructure count) | Impact Analysis | Technical 25%, Impact 20% | Ground-truth validation of AI decisions |
| Carrying Capacity Dashboard (camps + hospitals) | Carrying Capacity | Completeness 15% | Operational realism; required for end-to-end demo |
| AI-Generated Relocation Plan with approval workflow | Relocation Planning | Innovation 25%, Technical 25% | Automation + human-in-loop = strong SIH narrative |
| Evacuation Routing with real-time road blockage updates | Evacuation Routing | Technical 25%, Impact 20% | Dynamic re-routing is technically impressive |
| Decision Support Engine (ranked recommendations) | Decision Support | Innovation 25% | "AI assists, human decides" — perfect SIH message |
| Role-based access control (7 roles) | Platform Foundation | Technical 25% | Without RBAC, multi-role demo is impossible |
| Multilingual alerts — Marathi / Hindi / English | Alerts & Communication | Impact 20%, UX 15% | Mandatory for Maharashtra government applicability |
| Mobile-responsive UI (District Officer + Citizen) | UX Layer | UX 15% | Judges expect mobile demo for field use case |
| Audit / Decision Log (immutable) | Governance | Technical 25% | Government procurement requires accountability trail |

---

## SHOULD HAVE — High Value, Post-MVP Sprint

> Significant product value; complete after core MVP if time allows.

| Feature | Module | SIH Criteria Served | Rationale |
|---------|--------|---------------------|-----------|
| Predictive risk scoring (48–72h forecast) | Hazard Risk Assessment | Innovation 25% | Predictive vs reactive is major differentiator |
| Multi-hazard conflict detection & route resolution | Multi-Hazard Module | Innovation 25%, Technical 25% | Scenario 3 demo; complex but very impressive |
| Vulnerable population filter on maps | Impact Analysis | Impact 20% | Equity-focused; strong NDMA alignment |
| What-if simulation (officer adjusts inputs, sees outcome) | Decision Support | Innovation 25% | Shows model interactivity beyond passive scoring |
| Officer override of AI score with mandatory justification | XAI Module | Innovation 25% | Human-AI collaboration narrative |
| Relief camp supply inventory tracking | Carrying Capacity | Completeness 15% | Makes demo more operationally complete |
| Citizen self-evacuation routing (GPS-based) | Evacuation Routing | UX 15%, Impact 20% | High citizen impact; B2C appeal |
| Post-event incident report (PDF export) | Reporting | Completeness 15% | Judges ask about documentation |
| State-level multi-district aggregation view | Super Admin | Impact 20% | Scalability story for judges |
| District preparedness index comparison | Analytics | Impact 20% | Proactive disaster management angle |

---

## COULD HAVE — Stretch Goals / V2

> Nice-to-have enhancements that improve quality but are not demo-critical.

| Feature | Module | Rationale |
|---------|--------|-----------|
| Offline mode for Field Officer mobile | Field Operations | Complex sync; valuable for rural deployment |
| Satellite imagery integration for damage assessment | Impact Analysis | Requires paid API; powerful but expensive to demo |
| Drone feed integration for real-time reconnaissance | Situational Awareness | Hardware dependency; not feasible for SIH demo |
| SMS gateway integration (real Twilio/MSG91) | Alerts | Can be simulated in demo; production need |
| IoT sensor integration (water gauges, soil sensors) | Data Ingestion | Hardware-dependent; demo with simulated feed |
| AI chatbot for citizen FAQs (WhatsApp/Telegram) | Citizen Module | Innovative but outside core scope |
| Interoperability with IDRN / NDMA APIs | Integration | Government API access required; post-SIH |
| Automated NDRF/SDRF resource request workflow | Resource Management | Inter-agency integration complexity |
| Dark mode & accessibility (WCAG 2.1 AA) | UX | Valuable but not demo-blocking |
| Auto-generated press release for District PRO | Communication | Low priority; niche use case |

---

## WON'T HAVE — Explicitly Out of Scope (This Release)

> Documented here to manage scope creep and set judge expectations.

| Feature | Reason for Exclusion |
|---------|---------------------|
| Real satellite purchase / live satellite feed | Cost prohibitive; requires ISRO/Planet Labs agreement |
| Autonomous AI-executed decisions (no human approval) | Ethical/legal risk; contradicts design principle of human-in-the-loop |
| Public social media monitoring & sentiment analysis | Privacy concerns; out of NDMA mandate |
| Criminal tracking or police surveillance integration | Scope creep; civil liberties implications |
| Weather forecasting model (build own) | IMD/ECMWF APIs used instead |
| Insurance claim processing integration | Commercial partnership required |
| Cross-state (multi-state) disaster coordination | Regulatory complexity; state-level focus for SIH |
| Real-time video surveillance from CCTV | Hardware/legal complexity |

---

## Priority Summary Matrix

```
High Value + Low Effort → MUST HAVE (build first)
High Value + High Effort → SHOULD HAVE (plan carefully)
Low Value + Low Effort → COULD HAVE (do if time permits)
Low Value + High Effort → WON'T HAVE (drop entirely)
```

| Feature Count | Category |
|--------------|----------|
| 12 | Must Have |
| 10 | Should Have |
| 10 | Could Have |
| 8 | Won't Have |
| **40** | **Total Identified** |

---

## SIH Judging Alignment Summary

| SIH Criterion | Primary Must-Have Features Supporting It |
|---------------|------------------------------------------|
| **Innovation (25%)** | XAI explanation, AI relocation planning, conflict detection, decision engine |
| **Technical (25%)** | Dynamic risk scoring, real-time routing, RBAC, audit logs |
| **Impact (20%)** | Red zone alerts, multilingual notifications, capacity dashboards |
| **UX (15%)** | Mobile-responsive design, citizen zone lookup, officer dashboards |
| **Completeness (15%)** | All 8 modules demo-ready, 3 full scenarios preloaded |

---

*Document maintained by Aegis AI Product Management. Last updated: 2026-09-28.*
