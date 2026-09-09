import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import DataDisclaimer from '../components/DataDisclaimer';
import { 
  ShieldCheck, 
  BrainCircuit, 
  UserCheck, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Users, 
  Navigation, 
  Home, 
  Zap, 
  Scale, 
  BookOpen, 
  CheckCircle2,
  FileText
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview & Principles', icon: BookOpen },
  { id: 'hazard', label: 'Multi-Hazard Model', icon: Flame },
  { id: 'vulnerability', label: 'Vulnerability Index', icon: Users },
  { id: 'priority', label: 'Relocation Priority', icon: Navigation },
  { id: 'suitability', label: 'Site Suitability', icon: Home },
  { id: 'capacity', label: 'Carrying Capacity', icon: Zap },
  { id: 'governance', label: 'Governance & SOP', icon: Scale },
];

export default function Methodology() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedFormulas, setExpandedFormulas] = useState({});

  const toggleFormula = (id) => {
    setExpandedFormulas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Topbar
        title="Data, Methodology & Explainability"
        subtitle="Analytical formulations, weight distributions & decision-support frameworks for SIH26191"
        breadcrumb="Methodology"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
        <DataDisclaimer />

        {/* Hero Header */}
        <div className="card p-8 border-l-4 border-l-blue-700 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest">
            <BrainCircuit className="w-4 h-4" />
            <span>Analytical Architecture & Methodology</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Scientific Framework for Hazard-Based Red Zones & Safe Relocation
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            Aegis translates raw meteorological, geological, and socio-economic datasets into auditable, 
            explainable decision metrics. Every relocation priority score and safe site recommendation exposes 
            its mathematical sub-factors to support authoritative validation by State & District Disaster Management Authorities.
          </p>

          {/* Top 3 Core Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-600 text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Transparent</h3>
                <p className="text-xs text-slate-600 mt-1">
                  100% deterministic, open mathematical equations without black-box machine obscurity.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-600 text-white">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Explainable</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Every recommendation decomposes into explicit percentage contributions and weights.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Human-in-the-Loop</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Designed for officer decision support; all evacuation and resettlement orders mandate executive sign-off.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-xs transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-blue-700 text-blue-800 bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-base text-slate-900">Platform Workflow & Coupled Models</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Disaster risk is not a single number. Aegis combines five distinct analytical layers to move 
                from raw trigger detection to logistical execution:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                {[
                  { step: '01', title: 'Hazard Exposure', desc: 'Compound flood, landslide, erosion, and rainfall triggers' },
                  { step: '02', title: 'Vulnerability', desc: 'Socio-economic density, housing durability, and evacuation accessibility' },
                  { step: '03', title: 'Relocation Priority', desc: 'Algorithmic ranking across Immediate, Short-Term, and Medium-Term' },
                  { step: '04', title: 'Site Suitability', desc: 'Distance, slope, flood buffer, and road access matching' },
                  { step: '05', title: 'Carrying Capacity', desc: 'Water, power, clinic, school, and temporary shelter headroom' },
                ].map((s) => (
                  <div key={s.step} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{s.step}</span>
                    <h4 className="font-bold text-slate-900 text-xs mt-2">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Statutory & Regulatory Alignment</h4>
                <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                  <li><strong>Disaster Management Act, 2005 (Sec 38 & 39)</strong>: Establishes district collector evacuation mandates.</li>
                  <li><strong>NDMA Guidelines on Landslide & Flood Management</strong>: Informs runout distance and high-hazard zone buffers.</li>
                  <li><strong>Spheres Humanitarian Charter</strong>: Governs per-capita water (15 L/person/day) and shelter requirements (3.5 m²).</li>
                </ul>
              </div>

              <div className="card p-6 space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Prototype Demonstration Context</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The current deployment uses synthetic sensor data modeled after western Maharashtra's 
                  Sahyadri mountain range and coastal Konkan belt (Pune, Raigad, Ratnagiri, Kolhapur). 
                  Thresholds emulate real monsoonal flash floods and slope slips without exposing live citizen registries.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hazard' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Multi-Hazard Composite Score (MHCS)</h3>
                  <p className="text-xs text-slate-500">Normalizes physical exposure across compounding natural hazards</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFormula('mhcs')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>{expandedFormulas['mhcs'] ? 'Hide Formula' : 'View Formula'}</span>
                  {expandedFormulas['mhcs'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {expandedFormulas['mhcs'] && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
                  <p className="text-blue-700 font-bold">// Multi-Hazard Mathematical Model</p>
                  <p>MHCS = (w_fl × Flood) + (w_ls × Landslide) + (w_er × Erosion) + (w_rf × Rainfall) + (w_tr × Terrain)</p>
                  <p className="text-slate-500 text-[11px]">Normalized onto a standardized scale [0, 100] using MinMax feature clipping.</p>
                </div>
              )}

              {/* Factor Contribution Bars */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Weight Distribution</p>
                {[
                  { name: 'Flood Hazard Exposure (w_fl)', weight: 30, desc: 'River basin proximity, historical high water mark, discharge rate' },
                  { name: 'Landslide Susceptibility (w_ls)', weight: 25, desc: 'Slope gradient > 28°, soil saturation, Geological Survey data' },
                  { name: 'Extreme 24-hr Rainfall Anomaly (w_rf)', weight: 15, desc: 'IMD AWS rain gauge deviation against 10-year monsoon baseline' },
                  { name: 'Riverbank / Slope Erosion (w_er)', weight: 15, desc: 'Vegetative cover loss, river curve cut velocity, toe erosion' },
                  { name: 'Terrain Constraint Index (w_tr)', weight: 15, desc: 'Valley funneling, elevation profile, debris flow chokepoints' },
                ].map((f) => (
                  <div key={f.name} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800">{f.name}</span>
                      <span className="font-black text-blue-700">{f.weight}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${f.weight}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Thresholds */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
                  <span className="font-bold text-red-800 block">Very High (76–100)</span>
                  <span className="text-[11px] text-red-700 mt-1 block">Critical compound failure imminent. Immediate Red Zone.</span>
                </div>
                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-lg">
                  <span className="font-bold text-orange-800 block">High (51–75)</span>
                  <span className="text-[11px] text-orange-700 mt-1 block">Severe exposure. Priority relocation assessment needed.</span>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <span className="font-bold text-amber-800 block">Moderate (26–50)</span>
                  <span className="text-[11px] text-amber-700 mt-1 block">Elevated risk during peak monsoonal downpours.</span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                  <span className="font-bold text-emerald-800 block">Low (0–25)</span>
                  <span className="text-[11px] text-emerald-700 mt-1 block">Baseline conditions. Ongoing routine sensor surveillance.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vulnerability' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Habitation Vulnerability Index (HVI)</h3>
                  <p className="text-xs text-slate-500">Estimates physical and socio-economic susceptibility</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFormula('hvi')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>{expandedFormulas['hvi'] ? 'Hide Formula' : 'View Formula'}</span>
                  {expandedFormulas['hvi'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {expandedFormulas['hvi'] && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
                  <p className="text-blue-700 font-bold">// Vulnerability Formulation</p>
                  <p>HVI = 0.25 × PopDensity + 0.25 × SocialVulnerability + 0.20 × HousingFragility + 0.15 × CriticalInfra + 0.15 × Isolation</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[
                  { title: 'Population Density & Settlement Clustering (25%)', text: 'Concentration of residents per sq km within the high-hazard flood plain or debris path.' },
                  { title: 'Demographic & Social Vulnerability (25%)', text: 'Ratio of dependent populations including senior citizens (>65 yrs), infants, and mobility-challenged individuals.' },
                  { title: 'Housing Stock Fragility (20%)', text: 'Proportion of kutcha (non-engineered mud, tin sheet, unreinforced thatch) vs pucca masonry dwellings.' },
                  { title: 'Lifeline Infrastructure Exposure (15%)', text: 'Proximity of primary health centers, power transformers, and water filtration heads to hazard footprint.' },
                  { title: 'Evacuation Isolation & Road Access (15%)', text: 'Single-access cul-de-sac routes vulnerable to culvert washouts and bridge submergence.' },
                ].map((v) => (
                  <div key={v.title} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <h4 className="font-bold text-slate-800 text-xs">{v.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 pl-6">{v.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'priority' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Relocation Priority Score (RPS)</h3>
                  <p className="text-xs text-slate-500">Coupled multi-criteria formula ranking intervention urgency</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFormula('rps')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>{expandedFormulas['rps'] ? 'Hide Formula' : 'View Formula'}</span>
                  {expandedFormulas['rps'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {expandedFormulas['rps'] && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
                  <p className="text-blue-700 font-bold">// Coupled Priority Model</p>
                  <p>RPS = (0.35 × MHCS) + (0.25 × HVI) + (0.15 × HistoricalRecurrence) + (0.15 × InfraRisk) + (0.10 × RoadIsolation)</p>
                  <p className="text-slate-500 text-[11px]">Score range: 0 to 100. Habitations scoring ≥ 75 are designated for Immediate evacuation review.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Immediate</span>
                  <p className="text-2xl font-black text-red-700 mt-1">Score ≥ 75</p>
                  <p className="text-xs text-red-600 mt-2 font-medium">Action: 0–7 days authority review</p>
                  <p className="text-[11px] text-red-700/80 mt-1">Mandatory relocation planning and emergency shelter pre-activation.</p>
                </div>

                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                  <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Short-Term</span>
                  <p className="text-2xl font-black text-orange-700 mt-1">Score 60–74</p>
                  <p className="text-xs text-orange-600 mt-2 font-medium">Action: 1–3 months planning</p>
                  <p className="text-[11px] text-orange-700/80 mt-1">Engineering reinforcement or seasonal resettlement scheduling.</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Medium-Term</span>
                  <p className="text-2xl font-black text-amber-700 mt-1">Score 40–59</p>
                  <p className="text-xs text-amber-600 mt-2 font-medium">Action: 3–12 months review</p>
                  <p className="text-[11px] text-amber-700/80 mt-1">Long-term master plan integration and mitigation works.</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Monitor</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">Score &lt; 40</p>
                  <p className="text-xs text-emerald-600 mt-2 font-medium">Action: Ongoing surveillance</p>
                  <p className="text-[11px] text-emerald-700/80 mt-1">Sensor telemetry monitoring; no planned relocation required.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suitability' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Safe Site Suitability & Geographic Feasibility</h3>
                  <p className="text-xs text-slate-500">Multi-criteria spatial matching ensuring relocated populations are moved to viable terrain</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFormula('suitability')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>{expandedFormulas['suitability'] ? 'Hide Formula' : 'View Formula'}</span>
                  {expandedFormulas['suitability'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {expandedFormulas['suitability'] && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
                  <p className="text-blue-700 font-bold">// Geographic Matching Engine</p>
                  <p>Suitability = (w_dist × DistanceScore) + (w_cap × CapacityScore) + (w_safety × SafetyBuffer) + (w_infra × InfraScore)</p>
                  <p className="text-slate-500 text-[11px]">Hard Geographic Constraints: Distance ≤ 40 km (same or contiguous district) and Slope &lt; 15°.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Distance Feasibility Constraint
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Aegis employs Haversine great-circle distance evaluation. Candidate relocation sites must 
                    be located within the same district or contiguous boundary (typically &lt; 40 km) to preserve 
                    livelihood access, agricultural fields, and community cultural cohesion.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Zero-Hazard Guarantee
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A site cannot be designated "Suitable" if its local Multi-Hazard Exposure is Moderate or High. 
                    Candidate sites must reside on stable bedrock plateaus outside 100-year flood levels and 
                    debris runout paths.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'capacity' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-base text-slate-900">Carrying Capacity Assessment Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Relocating a village without adequate carrying capacity causes secondary humanitarian crises. 
                Aegis calculates real-time infrastructure headroom across five core pillars:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                {[
                  { label: 'Drinking Water', norm: '15 L / capita / day', basis: 'NDMA standard pipeline & tanker reserve' },
                  { label: 'Primary Healthcare', norm: '1 PHC bed per 250 pop', basis: 'Sub-district hospital ambulance range' },
                  { label: 'Primary Schooling', norm: '1 classroom per 40 pupils', basis: 'Local Zilla Parishad school spare seats' },
                  { label: 'Sanitation & Sewage', norm: '1 latrine per 20 persons', basis: 'Community soak-pit & septic capacity' },
                  { label: 'Shelter Footprint', norm: '3.5 m² living area', basis: 'Emergency pre-fabricated plinths' },
                ].map((c) => (
                  <div key={c.label} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <h4 className="font-bold text-slate-800 text-xs">{c.label}</h4>
                    <p className="text-xs font-black text-blue-700 mt-1">{c.norm}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{c.basis}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-base text-slate-900">Standard Operating Procedure & Human Authority Governance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aegis acts strictly as an intelligence advisory system. The transition from risk detection 
                to ground deployment adheres to statutory multi-agency governance protocols:
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { step: 'Stage 1: Automated Detection', role: 'Aegis Risk Engine', desc: 'Continuous ingest of IMD rainfall, satellite soil moisture, and river gauges triggers automatic red-zone flag.' },
                  { step: 'Stage 2: District Technical Verification', role: 'District Disaster Management Officer (DDMO)', desc: 'Field engineers inspect slope inclinometers and verify local habitation survey data.' },
                  { step: 'Stage 3: Relocation Plan Formulation', role: 'Aegis Planner & District Administration', desc: 'Matching algorithm proposes highest-scoring safe site within feasible transit radius.' },
                  { step: 'Stage 4: Executive Statutory Sanction', role: 'District Magistrate / Collector (IAS)', desc: 'Formal executive order issued under DM Act 2005 authorizing budget, transport, and rehabilitation.' },
                  { step: 'Stage 5: Coordinated Field Mobilization', role: 'NDRF, Police, Health, PWD, Revenue', desc: 'Agencies execute synchronized evacuation, shelter handover, and ration distribution.' },
                ].map((s) => (
                  <div key={s.step} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {s.step.split(':')[0].replace('Stage ', '')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{s.step}</h4>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">{s.role}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
