import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Shield,
  ArrowRight,
  Activity,
  MapPin,
  Users,
  Compass,
  Building2,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  PhoneCall,
  Clock,
  ExternalLink,
  BadgeCheck
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState('pune');
  const [previewTab, setPreviewTab] = useState('dashboard');

  const demoScenarios = [
    {
      id: 'pune',
      name: 'Pune Hillside Settlement',
      district: 'Pune District',
      hazard: 'Landslide Runout & Torrential Rain',
      priority: 'Immediate (92/100)',
      siteMatch: 'Mulshi Rehabilitation Zone (18 km)',
      capacity: '2,400 available',
    },
    {
      id: 'mahad',
      name: 'Mahad Peripheral Settlement',
      district: 'Raigad District',
      hazard: 'Compound Savitri River Flood',
      priority: 'Immediate (88/100)',
      siteMatch: 'North Mahad Safe Plateau (3.1 km)',
      capacity: '2,780 available',
    },
    {
      id: 'chiplun',
      name: 'Chiplun Riverside Cluster',
      district: 'Ratnagiri District',
      hazard: 'Vashishti River Flash Inundation',
      priority: 'Short-Term (82/100)',
      siteMatch: 'Chiplun Inland Safe Zone (3.1 km)',
      capacity: '3,600 available',
    },
    {
      id: 'shahuwadi',
      name: 'Shahuwadi Forest Margin',
      district: 'Kolhapur District',
      hazard: 'Slope Debris Flow & Road Cut-off',
      priority: 'Short-Term (76/100)',
      siteMatch: 'Shahuwadi Elevated Site (4.6 km)',
      capacity: '2,100 available',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* ── 1. Glassmorphism Sticky Navbar ───────────────────────── */}
      <header className="sticky top-0 z-50 glass-nav transition-all duration-200">
        <div className="section-container px-6 h-18 flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 border border-blue-500/30">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cyber font-extrabold text-xl text-slate-950 tracking-wider">AEGIS</span>
                <span className="text-[10px] font-cyber uppercase font-bold tracking-widest bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  SIH26191
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                AI Disaster Risk Intelligence Platform
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-blue-600 transition-colors">Capabilities</a>
            <a href="#maharashtra-demo" className="hover:text-blue-600 transition-colors">Maharashtra Demo</a>
            <a href="#interface-preview" className="hover:text-blue-600 transition-colors">Prototype Spotlight</a>
            <a href="#explainable-ai" className="hover:text-blue-600 transition-colors">Explainable AI</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-blue-600 px-2 transition-colors"
            >
              Officer Access
            </button>
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="btn-cyber bg-slate-950 hover:bg-slate-900 text-white text-xs py-2 px-4 shadow-sm flex items-center gap-2 font-bold rounded-xl border border-blue-500/30"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAuthenticated ? 'COMMAND CENTER' : 'OFFICER LOGIN'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Spacious Hero Section ───────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200/80">
        {/* Subtle background geographic contour and glow */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-[500px] h-[400px] bg-cyan-400/15 rounded-full blur-3xl" />
        </div>

        <div className="section-container px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Cyber Kicker Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs shadow-xs animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span className="font-cyber text-[11px] font-bold uppercase tracking-wider">
                AI-POWERED DISASTER RISK INTELLIGENCE & DECISION SUPPORT
              </span>
            </div>

            {/* Main Headline — Spacious, High Impact */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight uppercase leading-[1.1] animate-slide-up">
              See Risk. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600">
                Plan Relocation.
              </span> <br />
              Protect Communities.
            </h1>

            {/* Subtitle — Clean, Uncluttered */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              AEGIS helps authorities identify multi-hazard red zones, prioritize vulnerable habitations, and assess carrying capacity for geographically viable, safer relocation.
            </p>

            {/* Cyber Call-To-Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                className="btn-cyber bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm py-3 px-7 shadow-xl rounded-xl border border-blue-400/40 flex items-center gap-2 cyber-glow"
              >
                <span>{isAuthenticated ? 'ENTER COMMAND CENTER' : 'ACCESS COMMAND CENTER'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                className="btn-cyber bg-slate-950 hover:bg-slate-900 text-slate-200 hover:text-white text-xs sm:text-sm py-3 px-6 shadow-md rounded-xl border border-white/15 flex items-center gap-2"
              >
                <span>OFFICER ACCESS PORTAL</span>
                <Shield className="w-4 h-4 text-blue-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500 pt-1 font-medium">
              Maharashtra Environment · Live OSRM & Open-Meteo Satellite Feeds Active
            </p>
          </div>

          {/* ── 3. Interactive Hero Visual (GIS Simulated Product Mockup) ── */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="card-lg bg-slate-950 border border-white/15 text-white overflow-hidden shadow-2xl p-6 sm:p-8 relative">
              {/* Grid backdrop */}
              <div
                className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]"
              />

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-cyber text-xs uppercase tracking-widest text-blue-400 font-bold">
                    GEOSPATIAL RISK GRID · MAHARASHTRA SECTOR
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="text-emerald-400">STATUS: ACTIVE SENSOR FEED</span>
                  <span>·</span>
                  <span>SAHYADRI & COASTAL BASIN</span>
                </div>
              </div>

              {/* Map Canvas with Floating Telemetry Cards */}
              <div className="relative h-80 sm:h-96 my-6 rounded-xl bg-slate-900/90 border border-white/10 overflow-hidden flex items-center justify-center p-6">
                {/* Visual contour sonar rings */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div className="w-64 h-64 rounded-full border border-blue-400/50" />
                  <div className="w-96 h-96 rounded-full border border-dashed border-blue-400/40" />
                  <div className="w-[480px] h-[480px] rounded-full border border-blue-400/20" />
                </div>

                {/* Connecting Transit Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1="28%"
                    y1="48%"
                    x2="70%"
                    y2="36%"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                  />
                </svg>

                {/* Floating Card: Red Zone */}
                <div className="absolute top-5 left-5 z-20 card p-4 bg-slate-950/95 backdrop-blur-md border border-red-500/40 text-white max-w-xs shadow-xl animate-float">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-cyber text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/50">
                      🔴 Red Zone Habitation
                    </span>
                    <span className="font-cyber text-xs font-bold text-red-400">Score 92</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">Pune Hillside Settlement</h4>
                  <p className="text-[11px] text-slate-400">Pune District · Pop: 1,680</p>
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Hazard: Landslide + Rain</span>
                    <span className="font-cyber text-red-400 font-bold">IMMEDIATE</span>
                  </div>
                </div>

                {/* Floating Card: Safe Site Match */}
                <div
                  className="absolute bottom-5 right-5 z-20 card p-4 bg-slate-950/95 backdrop-blur-md border border-emerald-500/40 text-white max-w-xs shadow-xl animate-float"
                  style={{ animationDelay: '1.8s' }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-cyber text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                      ✅ Recommended Safe Site
                    </span>
                    <span className="font-cyber text-xs font-bold text-emerald-400">18 km</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">Mulshi Rehabilitation Zone</h4>
                  <p className="text-[11px] text-slate-400">Carrying Capacity: 2,400 available</p>
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">✓ Net Headroom OK</span>
                    <span className="text-slate-300">Transit: 28 min</span>
                  </div>
                </div>

                {/* Center Node Indicator */}
                <div className="text-center space-y-1 z-10">
                  <div className="inline-flex p-3 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 shadow-lg">
                    <Activity className="w-8 h-8 animate-pulse" />
                  </div>
                  <p className="font-cyber text-xs text-blue-300 font-bold tracking-wider">
                    DISTANCE-FIRST RELOCATION MATCHING
                  </p>
                </div>
              </div>

              {/* Bottom Telemetry Strip */}
              <div className="relative z-10 pt-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-6">
                  <span>HABITATIONS: <strong className="text-white font-cyber">17</strong></span>
                  <span>RED ZONES: <strong className="text-red-400 font-cyber">6</strong></span>
                  <span>CAPACITY: <strong className="text-emerald-400 font-cyber">18,400</strong></span>
                </div>
                <button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="font-cyber text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  ENTER OPERATIONAL VIEW →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Trust Strip — Clean & Spacious ───────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-12">
        <div className="section-container px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Multi-Hazard AI</h4>
                <p className="text-xs text-slate-500 mt-0.5">Compound flood & landslide</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">GIS Red Zones</h4>
                <p className="text-xs text-slate-500 mt-0.5">Spatial boundary mapping</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Action Timelines</h4>
                <p className="text-xs text-slate-500 mt-0.5">Immediate (0–7d) ranking</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Carrying Capacity</h4>
                <p className="text-xs text-slate-500 mt-0.5">Water, clinic, shelter headroom</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. The Critical Problem Section ────────────────────────── */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="section-container px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-cyber text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              OPERATIONAL CHALLENGE
            </span>
            <h2 className="text-3xl sm:text-4xl text-slate-950 font-black tracking-tight">
              Disaster Management Needs More Than an Alert.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Early alerts notify authorities of incoming rain and river swell. But authorities face an immediate logistical question: <strong>Where are the red zones, who needs relocation first, and where can they be housed safely?</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 space-y-3 border border-slate-200 hover:border-red-300 card-hover bg-white">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Reactive Evacuations</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ad-hoc rescue during peak monsoon inundation overburdens emergency response units and risks lives on submerged roads.
              </p>
            </div>

            <div className="card p-6 space-y-3 border border-slate-200 hover:border-amber-300 card-hover bg-white">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Fragmented Risk Telemetry</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Weather radar, river gauge levels, and slope stability records remain in isolated silos without composite village risk scoring.
              </p>
            </div>

            <div className="card p-6 space-y-3 border border-slate-200 hover:border-blue-300 card-hover bg-white">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Unplanned Resettlement</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Moving populations to distant or overcrowded shelters without prior water and healthcare capacity audits causes secondary crises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Solution: 6-Step Horizontal Pipeline ────────────────── */}
      <section id="how-it-works" className="py-24 bg-white border-b border-slate-200">
        <div className="section-container px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-cyber text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              DECISION-SUPPORT PIPELINE
            </span>
            <h2 className="text-3xl sm:text-4xl text-slate-950 font-black tracking-tight">
              From Hazard Detection to Relocation Execution.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              A structured 6-step workflow guiding district collectors and emergency agencies from telemetry alerts to authorized relocation orders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { step: '01', title: 'DETECT', desc: 'Ingest IMD rainfall, river water levels, and slope terrain telemetry' },
              { step: '02', title: 'ASSESS', desc: 'Calculate composite hazard and socio-economic vulnerability indices' },
              { step: '03', title: 'PRIORITIZE', desc: 'Rank habitations into Immediate (0–7d), Short-Term, and Monitor' },
              { step: '04', title: 'MATCH', desc: 'Filter verified safe sites within 25 km local travel radius' },
              { step: '05', title: 'PLAN', desc: 'Verify drinking water, healthcare, and temporary shelter headroom' },
              { step: '06', title: 'RESPOND', desc: 'Issue formal decision-support brief for District Magistrate sign-off' },
            ].map((s) => (
              <div
                key={s.step}
                className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:bg-white hover:shadow-md transition-all relative"
              >
                <span className="font-cyber text-xs font-black text-blue-700 block">STEP {s.step}</span>
                <h4 className="font-black text-sm text-slate-900 font-cyber">{s.title}</h4>
                <p className="text-xs text-slate-600 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Prototype Visual Spotlight (Dashboard & Login) ─── */}
      <section id="interface-preview" className="py-24 bg-slate-950 text-white relative overflow-hidden border-b border-white/10">
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="section-container px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="font-cyber text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-900/50 px-3 py-1 rounded-full border border-blue-700/60">
              ★ PROTOTYPE INTERFACE SHOWCASE
            </span>
            <h2 className="text-3xl sm:text-4xl text-white font-black tracking-tight">
              Designed for Speed, Authority & Clarity.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore the high-resolution interfaces built for State & District Disaster Decision Makers.
            </p>

            {/* Toggle Switcher */}
            <div className="inline-flex p-1.5 rounded-2xl bg-white/10 border border-white/15 gap-2 mt-4">
              <button
                type="button"
                onClick={() => setPreviewTab('dashboard')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 font-cyber ${
                  previewTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>🖥️</span>
                <span>COMMAND DASHBOARD</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('login')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 font-cyber ${
                  previewTab === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>🔐</span>
                <span>OFFICER LOGIN / SIGN UP</span>
              </button>
            </div>
          </div>

          {/* Interactive Mockup Display */}
          <div className="max-w-5xl mx-auto">
            {previewTab === 'dashboard' ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 animate-slide-up group">
                <img
                  src="/assets/dashboard_preview.jpg"
                  alt="Aegis Operational Command Center Dashboard"
                  className="w-full object-cover rounded-2xl max-h-[540px] group-hover:scale-[1.01] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20 pointer-events-none" />

                <div className="absolute top-4 left-4 p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/15 text-xs text-white max-w-xs shadow-xl hidden sm:block">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <strong className="font-cyber text-slate-100 text-[11px]">GIS RED-ZONE OVERLAY</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Compound flood and landslide danger perimeter mapping</p>
                </div>

                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/95 backdrop-blur-md border border-white/15 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-cyber text-[10px] uppercase font-bold text-emerald-400">
                      LIVE DECISION SUPPORT MATRIX
                    </span>
                    <h4 className="text-white font-black text-sm">
                      Interactive Hazard Map · 0–7 Day Relocation Queue · Headroom Balance Sheet
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                      className="btn-cyber bg-blue-600 hover:bg-blue-500 text-white text-xs py-2.5 px-5 font-bold shadow-lg rounded-xl flex items-center border border-blue-400/40"
                    >
                      <span>LAUNCH DASHBOARD</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 animate-slide-up group">
                <img
                  src="/assets/login_artwork.jpg"
                  alt="Aegis Secure Officer Authentication Portal"
                  className="w-full object-cover rounded-2xl max-h-[540px] group-hover:scale-[1.01] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20 pointer-events-none" />

                <div className="absolute top-4 left-4 p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/15 text-xs text-white max-w-xs shadow-xl hidden sm:block">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 radar-ping" />
                    <strong className="font-cyber text-slate-100 text-[11px]">ROLE-BASED CLEARANCE GATE</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">District Magistrate, DDMO, and Emergency Agency units</p>
                </div>

                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/95 backdrop-blur-md border border-white/15 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-cyber text-[10px] uppercase font-bold text-blue-400">
                      SECURE OFFICER PORTAL
                    </span>
                    <h4 className="text-white font-black text-sm">
                      Encrypted Authentication & 1-Click Presentation Access
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/login')}
                      className="btn-cyber bg-blue-600 hover:bg-blue-500 text-white text-xs py-2.5 px-5 font-bold shadow-lg rounded-xl flex items-center border border-blue-400/40"
                    >
                      <span>SIGN IN / REGISTER</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 8. Maharashtra Demonstration Scenarios ─────────────────── */}
      <section id="maharashtra-demo" className="py-24 bg-slate-900 text-white">
        <div className="section-container px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="font-cyber text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
              REGIONAL DEMONSTRATION SCENARIOS
            </span>
            <h2 className="text-3xl sm:text-4xl text-white font-black tracking-tight">
              Location-Aware Planning Across Maharashtra.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore how Aegis matches high-risk settlements in the Western Ghats and Konkan basin to verified nearby safe plateaus.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Scenario switcher tabs */}
            <div className="lg:col-span-5 space-y-3">
              {demoScenarios.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => setActiveTab(sc.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    activeTab === sc.id
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-100">{sc.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      {sc.district}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Hazard: {sc.hazard}</p>
                  <div className="mt-2 text-xs flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-amber-400 font-bold font-cyber text-[11px]">{sc.priority}</span>
                    <span className="text-blue-300 text-xs">{sc.siteMatch}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Scenario Preview Display */}
            <div className="lg:col-span-7">
              {(() => {
                const current = demoScenarios.find((s) => s.id === activeTab) || demoScenarios[0];
                return (
                  <div className="card-lg p-6 bg-slate-950 border border-white/15 text-white space-y-5 shadow-2xl rounded-2xl">
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <span className="font-cyber text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                          ACTIVE DEMONSTRATION SCENARIO
                        </span>
                        <h3 className="text-xl font-black text-white mt-1">{current.name}</h3>
                        <p className="text-xs text-slate-400">{current.district} · Maharashtra</p>
                      </div>
                      <button
                        onClick={() => navigate(isAuthenticated ? '/relocation-planner' : '/login')}
                        className="btn-cyber bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 px-4 font-bold shadow-md rounded-xl border border-blue-400/40"
                      >
                        PLAN NOW →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Assessed Urgency</span>
                        <strong className="text-red-400 font-cyber text-sm mt-0.5 block">{current.priority}</strong>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Verified Safe Site</span>
                        <strong className="text-emerald-400 font-cyber text-sm mt-0.5 block">{current.siteMatch}</strong>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 space-y-2 text-xs text-slate-300">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Distance-First Matching Guarantee</span>
                      </p>
                      <p className="leading-relaxed text-slate-400">
                        Aegis strictly enforces a 25 km preferred relocation radius. Residents are matched to nearby viable plateaus rather than distant alternatives hundreds of kilometers away.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Final CTA Section ───────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white relative overflow-hidden">
        <div className="section-container px-6 text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-cyber">
            <span>●</span> SIH26191 PROTOTYPE · READY FOR EVALUATION
          </span>
          <h2 className="text-3xl sm:text-5xl text-white font-black max-w-2xl mx-auto tracking-tight uppercase leading-tight">
            Make the Next Decision Before the Next Disaster.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            Equip authorities with multi-hazard red zone intelligence, carrying capacity audits, and safe relocation decision support.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="btn-cyber bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm py-3.5 px-8 font-bold shadow-2xl rounded-xl border border-blue-400/40 cyber-glow"
            >
              <span>{isAuthenticated ? 'ENTER COMMAND CENTER' : 'ACCESS AEGIS PLATFORM'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
            <button
              onClick={() => navigate('/methodology')}
              className="btn bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm py-3 px-6 font-semibold rounded-xl border border-white/15"
            >
              Explore Methodology
            </button>
          </div>
        </div>
      </section>

      {/* ── 10. Professional Footer ───────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-white/10 text-xs">
        <div className="section-container px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="font-cyber font-black tracking-wider">AEGIS</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              AI-Powered Disaster Risk Intelligence & Multi-Agency Relocation Planning Platform for SIH26191.
            </p>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3 font-cyber">Platform Views</h5>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-white">Command Center</button></li>
              <li><button onClick={() => navigate('/red-zones')} className="hover:text-white">Red Zone Intelligence</button></li>
              <li><button onClick={() => navigate('/relocation-planner')} className="hover:text-white">Relocation Planner</button></li>
              <li><button onClick={() => navigate('/safe-sites')} className="hover:text-white">Designated Safe Sites</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3 font-cyber">Governance</h5>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/methodology')} className="hover:text-white">Scientific Methodology</button></li>
              <li><button onClick={() => navigate('/alerts')} className="hover:text-white">Early Warning Alerts</button></li>
              <li><button onClick={() => navigate('/agency')} className="hover:text-white">Emergency Response Agencies</button></li>
              <li><button onClick={() => navigate('/citizen')} className="hover:text-white">Citizen Safety Portal</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3 font-cyber">Notice & Audit</h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Maharashtra Production Dataset · Connected to live OpenStreetMap Routing & Open-Meteo Satellite feeds. All executive orders require authorized DM sign-off.
            </p>
          </div>
        </div>

        <div className="section-container px-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Aegis Project · Smart India Hackathon Problem Statement SIH26191</p>
          <div className="flex items-center gap-4">
            <span>NDMA Guidelines Aligned</span>
            <span>·</span>
            <span>Disaster Management Act, 2005</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
