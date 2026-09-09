import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import MapView from '../components/MapView';
import TimelineBadge from '../components/TimelineBadge';
import DataDisclaimer from '../components/DataDisclaimer';
import Topbar from '../components/Topbar';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Flame, 
  Clock, 
  Bell, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  Compass,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

function useCountUp(end, duration = 650) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const endVal = parseInt(end) || 0;
    if (endVal === 0) {
      setCount(0);
      return;
    }
    const stepTime = Math.abs(Math.floor(duration / 30));
    const step = Math.max(1, Math.ceil(endVal / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= endVal) {
        setCount(endVal);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
}

export default function Dashboard() {
  const { habitations, summary, alerts, loading, error, user } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'map' | 'list'
  const [selectedH, setSelectedH] = useState(null);

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorState error={error} />;
  if (!summary) return null;

  const immediate = habitations.filter((h) => h.relocationTimeline === 'Immediate');
  const shortTerm = habitations.filter((h) => h.relocationTimeline === 'Short-Term');
  const redZones = habitations.filter((h) => h.redZoneStatus);
  const activeAlerts = alerts?.slice(0, 3) || [];

  // Ranked priority list
  const priorityQueue = [...habitations]
    .sort((a, b) => (b.relocationPriorityScore || 0) - (a.relocationPriorityScore || 0));

  const topPriority = priorityQueue[0];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Topbar
        title="Disaster Risk Command Center"
        subtitle="Operational Decision-Support System · Maharashtra Sector"
        breadcrumb="Command Center"
      />

      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* Executive Situation Banner — Clean, Plain English, High Impact */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 shadow-md border border-white/10">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  STATUS: 4 HABITATIONS IN IMMEDIATE ACTION ZONE
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">
                  Western Ghats Demonstration Grid
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Officer'}.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Aegis multi-hazard models have identified <strong>4 vulnerable villages</strong> in Pune & Raigad breaching compound safety thresholds. Safe relocation sites with capacity are available within feasible transit radius.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {topPriority && (
                <button
                  type="button"
                  onClick={() => navigate(`/relocation-planner?habitationId=${topPriority._id}`)}
                  className="btn btn-primary text-xs py-2.5 px-4 font-bold shadow-lg flex items-center gap-2"
                >
                  <span>🚀 Plan Relocation for {topPriority.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/red-zones')}
                className="btn bg-white/10 text-white hover:bg-white/20 text-xs py-2.5 px-3.5 font-semibold"
              >
                Inspect 6 Red Zones
              </button>
            </div>
          </div>
        </div>

        <DataDisclaimer />

        {/* 4 Core Premium KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Monitored */}
          <div
            onClick={() => navigate('/map')}
            className="glow-card p-5 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-2xl" />
            <div className="flex items-center justify-between mb-3 pl-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-300/40">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                6 Districts
              </span>
            </div>
            <p className="text-[32px] font-black text-slate-900 tracking-tight leading-none pl-1">
              {useCountUp(summary.total || 17)}
            </p>
            <p className="font-bold text-slate-700 text-[12px] mt-1.5 pl-1">Total Habitations Monitored</p>
            <p className="text-[11px] text-slate-500 mt-0.5 pl-1">Continuous GIS sensor coverage</p>
            <div className="mt-3 pl-1">
              <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Card 2: Red Zones */}
          <div
            onClick={() => navigate('/red-zones')}
            className="glow-card p-5 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-red-600 rounded-l-2xl" />
            <div className="flex items-center justify-between mb-3 pl-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-300/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                High Exposure
              </span>
            </div>
            <p className="text-[32px] font-black text-red-600 tracking-tight leading-none pl-1">
              {useCountUp(summary.redZone || 6)}
            </p>
            <p className="font-bold text-slate-700 text-[12px] mt-1.5 pl-1">Identified Red Zones</p>
            <p className="text-[11px] text-slate-500 mt-0.5 pl-1">Unsafe for permanent habitation</p>
            <div className="mt-3 pl-1">
              <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{ width: `${((summary.redZone||6)/(summary.total||17))*100}%` }} />
              </div>
            </div>
          </div>

          {/* Card 3: Immediate Relocation */}
          <div
            onClick={() => navigate('/relocation-priority')}
            className="glow-card p-5 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-l-2xl" />
            <div className="flex items-center justify-between mb-3 pl-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center shadow-md shadow-orange-300/40">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                0–7 Days
              </span>
            </div>
            <p className="text-[32px] font-black text-orange-600 tracking-tight leading-none pl-1">
              {useCountUp(summary.immediate || 4)}
            </p>
            <p className="font-bold text-slate-700 text-[12px] mt-1.5 pl-1">Immediate Relocation Needs</p>
            <p className="text-[11px] text-slate-500 mt-0.5 pl-1">{summary.popAtRisk?.toLocaleString() || '12,480'} people at risk</p>
            <div className="mt-3 pl-1">
              <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{ width: `${((summary.immediate||4)/(summary.total||17))*100}%` }} />
              </div>
            </div>
          </div>

          {/* Card 4: Safe Sites */}
          <div
            onClick={() => navigate('/safe-sites')}
            className="glow-card p-5 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-l-2xl" />
            <div className="flex items-center justify-between mb-3 pl-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-300/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Available
              </span>
            </div>
            <p className="text-[32px] font-black text-emerald-600 tracking-tight leading-none pl-1">
              {useCountUp(summary.totalSiteCapacity || 18400).toLocaleString()}
            </p>
            <p className="font-bold text-slate-700 text-[12px] mt-1.5 pl-1">Safe Relocation Capacity</p>
            <p className="text-[11px] text-slate-500 mt-0.5 pl-1">Across {summary.suitableSites || 8} certified sites</p>
            <div className="mt-3 pl-1">
              <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* District Risk Overview Radar Strip — Clear Geographic Overview */}
        <div className="card p-4 bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Maharashtra Regional Risk Overview:
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              6 Monitored District Sectors · Live Telemetry
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-0.5">
            {[
              { district: 'Pune', status: 'Red Zone', count: '1 Immediate', color: 'border-red-200 bg-red-50/80 text-red-700', icon: '🔴' },
              { district: 'Raigad', status: 'Red Zone', count: '2 Immediate', color: 'border-red-200 bg-red-50/80 text-red-700', icon: '🔴' },
              { district: 'Ratnagiri', status: 'High Hazard', count: '1 Immediate', color: 'border-orange-200 bg-orange-50/80 text-orange-700', icon: '🟠' },
              { district: 'Kolhapur', status: 'Moderate', count: 'Short-Term', color: 'border-amber-200 bg-amber-50/80 text-amber-700', icon: '🟡' },
              { district: 'Sindhudurg', status: 'Safe Sites', count: '1,200 Capacity', color: 'border-emerald-200 bg-emerald-50/80 text-emerald-700', icon: '🟢' },
              { district: 'Sangli', status: 'Safe Sites', count: '3,200 Capacity', color: 'border-emerald-200 bg-emerald-50/80 text-emerald-700', icon: '🟢' },
            ].map((d) => (
              <div
                key={d.district}
                onClick={() => navigate('/red-zones')}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer hover:shadow-xs hover:-translate-y-0.5 transition-all ${d.color}`}
              >
                <div>
                  <p className="font-bold text-xs">{d.district}</p>
                  <p className="text-[10px] opacity-90 font-semibold">{d.count}</p>
                </div>
                <span className="text-xs">{d.icon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View Mode Switcher + Legend Helper */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Layout View:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-md transition-all ${
                  viewMode === 'split' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-md transition-all ${
                  viewMode === 'map' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Map Focus
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ranked List Focus
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Red Zone (&gt;75)</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Short-Term (50–74)</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Safe Relocation Sites</span>
            </span>
          </div>
        </div>

        {/* Main Operational Window: Map & Priority List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" style={{ minHeight: 480 }}>
          {/* Spatial Map View */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={`${viewMode === 'map' ? 'lg:col-span-12' : 'lg:col-span-7'} card overflow-hidden flex flex-col border border-slate-200 shadow-2xs`}>
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    Spatial Hazard & Relocation Map
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Click any marker to inspect village hazard profile and nearby safe sites
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                  onClick={() => navigate('/map')}
                >
                  <span>Expand GIS</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 w-full min-h-[400px] bg-slate-100">
                <MapView
                  habitations={habitations}
                  height="100%"
                  onHabitationClick={(id) => {
                    const found = habitations.find((h) => h._id === id);
                    if (found) setSelectedH(found);
                    else navigate(`/habitation/${id}`);
                  }}
                />
              </div>
            </div>
          )}

          {/* Ranked Priority Queue */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div className={`${viewMode === 'list' ? 'lg:col-span-12' : 'lg:col-span-5'} card flex flex-col overflow-hidden border border-slate-200 shadow-2xs`}>
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Ranked Relocation Queue</h3>
                  <p className="text-[11px] text-slate-600">Sorted by immediate risk & population need</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-blue-700 hover:text-blue-800"
                  onClick={() => navigate('/relocation-priority')}
                >
                  View All {habitations.length} →
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
                {priorityQueue.slice(0, 7).map((h, idx) => {
                  const rank = String(idx + 1).padStart(2, '0');
                  const isImmediate = h.relocationTimeline === 'Immediate';
                  return (
                    <div
                      key={h._id}
                      onClick={() => setSelectedH(h)}
                      className="pt-2 first:pt-0 flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-600 w-5">
                          {rank}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                              {h.name}
                            </p>
                            {h.redZoneStatus && (
                              <span className="badge badge-vhigh text-[9px] px-1.5 py-0.2">RED ZONE</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600">
                            {h.district} · {(h.population || 0).toLocaleString()} residents
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <p className={`text-sm font-black ${isImmediate ? 'text-red-600' : 'text-orange-600'}`}>
                            {h.relocationPriorityScore || h.compositeRiskScore || '--'}
                          </p>
                          <TimelineBadge timeline={h.relocationTimeline} />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/relocation-planner?habitationId=${h._id}`);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          title="Open in Relocation Planner"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Easy-to-Understand 3-Step Decision Flow */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>How Aegis Supports Officer Decisions (3-Step Flow)</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Human Authority Approved
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Detect Risk Automatically</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Satellite rainfall and slope stability telemetry continuously flag red-zone habitations when risk breaches safety norms.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Check Feasible Distance</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  The engine matches villages to verified safe sites within 25 km, keeping communities close to livelihoods and ancestral roots.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Audit Capacity & Relocate</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Water, clinics, and shelter readiness are confirmed before generating the executive relocation plan for Collector sign-off.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Row: Regional Hazard Summary + Active Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Regional Hazard Summary */}
          <div className="card p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-600" />
                <span>Regional Hazard Exposure Profile</span>
              </h3>
              <span className="text-[11px] text-slate-600">Maharashtra</span>
            </div>
            <div className="space-y-3 pt-1">
              {[
                { name: 'Monsoon Flood Inundation', count: 9, total: 17, color: 'bg-blue-600' },
                { name: 'Western Ghats Landslide Slope Slip', count: 8, total: 17, color: 'bg-purple-600' },
                { name: 'Heavy 24-hr Rainfall Anomaly', count: 11, total: 17, color: 'bg-cyan-600' },
                { name: 'Riverbank Toe Erosion', count: 6, total: 17, color: 'bg-amber-600' },
              ].map((hz) => {
                const pct = Math.round((hz.count / hz.total) * 100);
                return (
                  <div key={hz.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{hz.name}</span>
                      <span className="font-bold text-slate-900">{hz.count} of {hz.total} habitations</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${hz.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Field Alerts */}
          <div className="card p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-600" />
                <span>Simulated Field Alerts</span>
              </h3>
              <button
                type="button"
                onClick={() => navigate('/alerts')}
                className="text-xs font-bold text-blue-700 hover:text-blue-800"
              >
                Alert Center →
              </button>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-600">
                All monitored zones are currently within normal baseline tolerances.
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeAlerts.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => navigate('/alerts')}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {a.title || a.villageName || 'Field Alert'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                        {a.severity || 'CRITICAL'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      {a.message || 'Trigger threshold exceeded. Field verification recommended.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Quick Habitation Drawer */}
      {selectedH && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col anim-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Habitation Intelligence Brief
                </span>
                {selectedH.redZoneStatus && (
                  <span className="badge badge-vhigh text-[9px] px-1.5 py-0.2">RED ZONE</span>
                )}
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">
                {selectedH.displayName || selectedH.name}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedH.district} District, Maharashtra
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedH(null)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Relocation Priority</span>
                <p className="text-2xl font-black text-red-600 mt-0.5">
                  {selectedH.relocationPriorityScore || selectedH.compositeRiskScore || 85}/100
                </p>
                <TimelineBadge timeline={selectedH.relocationTimeline} size="sm" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Population Exposed</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  {(selectedH.population || 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-500">residents in danger</span>
              </div>
            </div>

            {/* Dominant Hazards Breakdown */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Multi-Hazard Exposure Factors
              </h4>
              {Object.entries(selectedH.hazardScores || {}).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-bold text-slate-800">{val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${val > 70 ? 'bg-red-500' : val > 40 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {selectedH.scenarioNote && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  Field Assessment Summary
                </p>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  {selectedH.scenarioNote}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary flex-1 text-xs"
              onClick={() => navigate(`/habitation/${selectedH._id}`)}
            >
              Full Profile View
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1 text-xs flex items-center justify-center gap-1.5"
              onClick={() => navigate(`/relocation-planner?habitationId=${selectedH._id}`)}
            >
              <span>Relocation Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <div className="h-16 bg-white border-b border-slate-200 flex-shrink-0" />
      <div className="p-6 space-y-4 max-w-7xl mx-auto w-full">
        <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-50 p-6">
      <div className="card p-8 text-center max-w-md border border-slate-200 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">Connection Notice</h3>
        <p className="text-xs text-slate-600">{error}</p>
        <p className="text-[11px] bg-slate-100 rounded-lg p-2.5 font-mono text-slate-700">
          npm start (Server port 5000)
        </p>
      </div>
    </div>
  );
}
