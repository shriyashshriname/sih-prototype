import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import MapView from '../components/MapView';
import TimelineBadge from '../components/TimelineBadge';
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
  TrendingUp,
  AlertTriangle,
  Building2,
  Brain,
  ShieldCheck,
  X,
  Activity,
  Zap,
  ChevronRight,
} from 'lucide-react';

/* ── Count-up animation hook ─────────────────────────────────── */
function useCountUp(end, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const endVal = parseInt(end) || 0;
    if (endVal === 0) { setCount(0); return; }
    const steps = 40;
    const stepTime = Math.max(10, Math.floor(duration / steps));
    const step = Math.max(1, Math.ceil(endVal / steps));
    const timer = setInterval(() => {
      start += step;
      if (start >= endVal) { setCount(endVal); clearInterval(timer); }
      else setCount(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
}

/* ── KPI Card ───────────────────────────────────────────────── */
function KPICard({ label, value, sub, icon: Icon, accent, onClick, pulse }) {
  const count = useCountUp(value);
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-5 cursor-pointer hover:border-slate-500 hover:bg-slate-800 transition-all group relative overflow-hidden flex flex-col justify-between h-full`}
    >
      {/* Subtle accent glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${accent.glow} pointer-events-none`} />

      <div>
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className={`w-11 h-11 rounded-xl ${accent.iconBg} flex items-center justify-center border border-white/5`}>
            <Icon className={`w-5 h-5 ${accent.iconText}`} />
          </div>
          {pulse && (
            <span className={`w-2.5 h-2.5 rounded-full ${accent.dot} shadow-[0_0_8px_rgba(255,255,255,0.4)] animate-pulse`} />
          )}
        </div>

        <p className={`text-3xl font-cyber font-bold ${accent.value} leading-none mb-2 relative z-10 tracking-tight`}>
          {typeof count === 'number' && value > 999 ? count.toLocaleString() : count}
        </p>
      </div>
      
      <div className="relative z-10 mt-1">
        <p className="text-[13px] font-tech font-bold text-slate-300 tracking-wide uppercase">{label}</p>
        {sub && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Risk badge ─────────────────────────────────────────────── */
function RiskBadge({ score }) {
  if (score >= 75) return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">{score} CRITICAL</span>;
  if (score >= 50) return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">{score} HIGH</span>;
  if (score >= 25) return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">{score} MOD</span>;
  return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">{score} LOW</span>;
}

/* ── Main Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const { habitations, summary, alerts, loading, error, user } = useApp();
  const navigate = useNavigate();
  const [selectedH, setSelectedH] = useState(null);

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorState error={error} />;
  if (!summary) return null;

  const immediate = habitations.filter((h) => h.relocationTimeline === 'Immediate');
  const activeAlerts = alerts?.slice(0, 3) || [];
  const priorityQueue = [...habitations]
    .sort((a, b) => (b.relocationPriorityScore || 0) - (a.relocationPriorityScore || 0));
  const topPriority = priorityQueue[0];

  const kpis = [
    {
      label: 'Habitations Monitored',
      value: summary.total || 17,
      sub: '6 Districts · GIS Coverage',
      icon: MapPin,
      onClick: () => navigate('/map'),
      pulse: false,
      accent: {
        glow: 'from-sky-500/5 to-transparent',
        iconBg: 'bg-sky-500/15',
        iconText: 'text-sky-400',
        value: 'text-white',
        dot: 'bg-sky-400',
      },
    },
    {
      label: 'Red Zone Locations',
      value: summary.redZone || 6,
      sub: 'Unsafe for habitation',
      icon: ShieldAlert,
      onClick: () => navigate('/red-zones'),
      pulse: true,
      accent: {
        glow: 'from-red-500/5 to-transparent',
        iconBg: 'bg-red-500/15',
        iconText: 'text-red-400',
        value: 'text-red-400',
        dot: 'bg-red-500',
      },
    },
    {
      label: 'Population at Risk',
      value: summary.popAtRisk || 12480,
      sub: 'Requires relocation support',
      icon: Users,
      onClick: () => navigate('/relocation-priority'),
      pulse: true,
      accent: {
        glow: 'from-amber-500/5 to-transparent',
        iconBg: 'bg-amber-500/15',
        iconText: 'text-amber-400',
        value: 'text-amber-400',
        dot: 'bg-amber-500',
      },
    },
    {
      label: 'Immediate Relocations',
      value: summary.immediate || 4,
      sub: '0–7 day action window',
      icon: Zap,
      onClick: () => navigate('/relocation-priority'),
      pulse: true,
      accent: {
        glow: 'from-red-500/5 to-transparent',
        iconBg: 'bg-red-500/15',
        iconText: 'text-red-400',
        value: 'text-red-400',
        dot: 'bg-red-500',
      },
    },
    {
      label: 'Available Shelters',
      value: summary.suitableSites || 8,
      sub: `${(summary.totalSiteCapacity || 18400).toLocaleString()} total capacity`,
      icon: ShieldCheck,
      onClick: () => navigate('/safe-sites'),
      pulse: false,
      accent: {
        glow: 'from-emerald-500/5 to-transparent',
        iconBg: 'bg-emerald-500/15',
        iconText: 'text-emerald-400',
        value: 'text-emerald-400',
        dot: 'bg-emerald-400',
      },
    },
    {
      label: 'Active Alerts',
      value: activeAlerts.length || alerts.length || 3,
      sub: 'Requires attention',
      icon: Bell,
      onClick: () => navigate('/alerts'),
      pulse: activeAlerts.length > 0,
      accent: {
        glow: 'from-amber-500/5 to-transparent',
        iconBg: 'bg-amber-500/15',
        iconText: 'text-amber-400',
        value: 'text-amber-400',
        dot: 'bg-amber-500',
      },
    },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900">
      <Topbar
        title="Disaster Risk Command Center"
        subtitle="Operational Decision-Support System · Maharashtra Sector"
        breadcrumb="Command Center"
      />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* ── Situation Banner ───────────────────────────────── */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 via-slate-800/95 to-slate-800 border border-slate-700/60 p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-cyber font-bold tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                  STATUS: {immediate.length} HABITATIONS IN IMMEDIATE ACTION ZONE
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Officer'}.
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                {['Emergency Agency', 'Field Officer', 'Fire Department', 'Police Department', 'Hospital / Medical'].includes(user?.role)
                  ? `Attention: There are currently `
                  : `Aegis multi-hazard models have identified `}
                <strong className="text-slate-200">{immediate.length} vulnerable habitations</strong>
                {['Emergency Agency', 'Field Officer', 'Fire Department', 'Police Department', 'Hospital / Medical'].includes(user?.role)
                  ? ` requiring urgent ground response and evacuation support. Please stand by for transit operations.`
                  : ` breaching compound safety thresholds. Safe relocation sites with capacity are available within feasible transit radius.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {topPriority && ['District Officer', 'Disaster Management Officer', 'Administrator'].includes(user?.role) && (
                <button
                  onClick={() => navigate(`/relocation-planner?habitationId=${topPriority._id}`)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-sky-500/20"
                >
                  <span>Plan Relocation for {topPriority.name?.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => navigate('/red-zones')}
                className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-600/50"
              >
                Inspect Red Zones →
              </button>
            </div>
          </div>
        </div>

        {/* ── 6 KPI Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* ── Main Split: Priority Table (60%) + Map (40%) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" style={{ minHeight: 460 }}>

          {/* Priority Table — 60% (Only for DO, DDMO, Admin) */}
          {['District Officer', 'Disaster Management Officer', 'Administrator'].includes(user?.role) && (
            <div className="lg:col-span-7 bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-xl flex flex-col overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-slate-700/60 flex items-center justify-between flex-shrink-0 bg-slate-800/50">
                <div>
                  <h3 className="font-tech font-bold text-base text-white tracking-wide uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    Priority Relocation Queue
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Ranked by composite risk score — top {Math.min(10, priorityQueue.length)} habitations</p>
                </div>
                <button
                  onClick={() => navigate('/relocation-priority')}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Table header */}
              <div className="px-5 py-3 grid grid-cols-12 text-[10px] font-tech font-bold uppercase tracking-widest text-slate-400 bg-slate-800/40 border-b border-slate-700/40 flex-shrink-0">
                <span className="col-span-1">#</span>
                <span className="col-span-4">Habitation</span>
                <span className="col-span-2">District</span>
                <span className="col-span-2 text-center">Risk Score</span>
                <span className="col-span-2 text-center">Timeline</span>
                <span className="col-span-1" />
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-700/30">
                {priorityQueue.slice(0, 10).map((h, idx) => (
                  <div
                    key={h._id}
                    onClick={() => setSelectedH(h)}
                    className="px-5 py-3.5 grid grid-cols-12 items-center hover:bg-slate-700/40 cursor-pointer transition-colors group"
                  >
                    <span className="col-span-1 font-cyber text-[11px] font-bold text-slate-500">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="col-span-4 min-w-0 pr-2">
                      <p className="font-bold text-sm text-slate-200 group-hover:text-sky-400 transition-colors truncate">
                        {h.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{(h.population || 0).toLocaleString()} residents</p>
                    </div>
                    <span className="col-span-2 text-xs font-semibold text-slate-400 truncate pr-2">{h.district}</span>
                    <div className="col-span-2 flex justify-center">
                      <RiskBadge score={h.relocationPriorityScore || h.compositeRiskScore || 0} />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <TimelineBadge timeline={h.relocationTimeline} />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/relocation-planner?habitationId=${h._id}`); }}
                        className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                        title="Open Relocation Planner"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spatial Map (Expanded to full width if Priority table hidden) */}
          <div className={`${['District Officer', 'Disaster Management Officer', 'Administrator'].includes(user?.role) ? 'lg:col-span-5' : 'lg:col-span-12'} bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-xl flex flex-col overflow-hidden shadow-xl`}>
            <div className="px-5 py-4 border-b border-slate-700/60 flex items-center justify-between flex-shrink-0 bg-slate-800/50">
              <div>
                <h3 className="font-tech font-bold text-base text-white uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse" />
                  Spatial Hazard Map
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Click marker to inspect habitation profile</p>
              </div>
              <button
                onClick={() => navigate('/map')}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                Expand GIS <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-h-[300px]">
              <MapView
                habitations={habitations}
                height="100%"
                onHabitationClick={(id) => {
                  const found = habitations.find((h) => h._id === id);
                  if (found) setSelectedH(found);
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Hazard Profile + Activity Feed ───── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Regional Hazard Profile */}
          <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-tech font-bold text-base text-white uppercase tracking-wide flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Regional Hazard Exposure
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">MAHARASHTRA</span>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Monsoon Flood Inundation', count: 9, total: 17, color: 'bg-sky-500' },
                { name: 'Landslide Slope Failure', count: 8, total: 17, color: 'bg-violet-500' },
                { name: 'Heavy Rainfall Anomaly', count: 11, total: 17, color: 'bg-cyan-500' },
                { name: 'Riverbank Erosion', count: 6, total: 17, color: 'bg-amber-500' },
              ].map((hz) => {
                const pct = Math.round((hz.count / hz.total) * 100);
                return (
                  <div key={hz.name}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">{hz.name}</span>
                      <span className="font-cyber font-bold text-slate-400">{hz.count}/{hz.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                      <div className={`h-full ${hz.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-tech font-bold text-base text-white uppercase tracking-wide flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                Recent Field Alerts
              </h3>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
              >
                Alert Center →
              </button>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                <CheckCircle className="w-8 h-8 mb-2 text-emerald-500/50" />
                <p className="text-xs">All zones within normal baseline tolerances.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map((a, i) => (
                  <div
                    key={a._id || i}
                    onClick={() => navigate('/alerts')}
                    className="p-3.5 rounded-xl border border-slate-700/60 bg-slate-900/50 hover:bg-slate-700/80 cursor-pointer transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-200 truncate pr-2">
                        {a.title || a.villageName || 'Field Alert'}
                      </span>
                      <span className="font-cyber text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex-shrink-0 ml-2 uppercase tracking-widest">
                        {a.severity || 'CRITICAL'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {a.message || 'Trigger threshold exceeded. Field verification recommended.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Slide-out Habitation Drawer ───────────────────────── */}
      {selectedH && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-700/60 shadow-2xl z-50 flex flex-col">
          <div className="p-5 border-b border-slate-700/60 flex items-center justify-between flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Habitation Brief
                </span>
                {selectedH.redZoneStatus && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                    RED ZONE
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base text-white mt-1">
                {selectedH.displayName || selectedH.name}
              </h3>
              <p className="text-xs text-slate-500">{selectedH.district} District, Maharashtra</p>
            </div>
            <button
              onClick={() => setSelectedH(null)}
              className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700/60">
                <span className="text-[11px] text-slate-500">Priority Score</span>
                <p className="text-2xl font-black text-red-400 mt-0.5">
                  {selectedH.relocationPriorityScore || selectedH.compositeRiskScore || 85}
                  <span className="text-sm text-slate-500">/100</span>
                </p>
                <TimelineBadge timeline={selectedH.relocationTimeline} size="sm" />
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700/60">
                <span className="text-[11px] text-slate-500">Population Exposed</span>
                <p className="text-2xl font-black text-white mt-0.5">
                  {(selectedH.population || 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-500">residents at risk</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Multi-Hazard Factors</h4>
              {Object.entries(selectedH.hazardScores || {}).map(([key, val]) => (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-bold text-slate-300">{val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${val > 70 ? 'bg-red-500' : val > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-700/60 flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(`/habitation/${selectedH._id}`)}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors"
            >
              Full Profile
            </button>
            <button
              onClick={() => navigate(`/relocation-planner?habitationId=${selectedH._id}`)}
              className="flex-1 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
            >
              Relocation Plan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────── */
function SkeletonDashboard() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900">
      <div className="h-16 bg-slate-800 border-b border-slate-700/50 flex-shrink-0 animate-pulse" />
      <div className="p-6 space-y-5 flex-1">
        <div className="h-24 bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-7 h-80 bg-slate-800 rounded-xl animate-pulse" />
          <div className="col-span-5 h-80 bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ── Error State ─────────────────────────────────────────────── */
function ErrorState({ error }) {
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-900 p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-white text-lg">Connection Notice</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <p className="text-[11px] bg-slate-900 rounded-lg p-2.5 font-mono text-slate-500">
          npm start (Server port 5000)
        </p>
      </div>
    </div>
  );
}
