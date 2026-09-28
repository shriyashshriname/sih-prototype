import React, { useState, useEffect, useMemo } from 'react';
import { getAlerts, simulateAlerts } from '../api';
import AlertCard from '../components/AlertCard';
import Topbar from '../components/Topbar';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Filter,
  Search,
  RefreshCw,
  Radio,
  Zap,
  Check,
  ChevronRight,
  Shield,
  Activity,
  Sparkles,
  Info,
  X,
  Send,
  Building2,
} from 'lucide-react';

const AGENCIES = [
  'All',
  'District Administration',
  'Police',
  'Fire Department',
  'Hospitals',
  'NDRF/SDRF',
  'Citizens',
  'Local Administration',
  'Emergency Response Team',
];

const STATUS_TABS = [
  { id: 'all', label: 'All Alerts' },
  { id: 'active', label: 'Active Queue' },
  { id: 'acknowledged', label: 'In Transit' },
  { id: 'resolved', label: 'Resolved' },
];

const PRIORITIES = ['All', 'Critical', 'High', 'Warning', 'Info'];

/* ── KPI Metric Tile ────────────────────────────────────────── */
function TelemetryKPI({ label, value, sub, icon: Icon, accent, pulse, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800/90 backdrop-blur-md border ${
        active ? 'border-sky-500/80 ring-1 ring-sky-500/40' : 'border-slate-700/60'
      } rounded-xl p-4 cursor-pointer hover:border-slate-500 hover:bg-slate-800 transition-all group relative overflow-hidden flex flex-col justify-between`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${accent.glow} pointer-events-none`} />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`w-10 h-10 rounded-xl ${accent.iconBg} flex items-center justify-center border border-white/5`}>
          <Icon className={`w-5 h-5 ${accent.iconText}`} />
        </div>
        {pulse && (
          <span className={`w-2.5 h-2.5 rounded-full ${accent.dot} animate-pulse`} />
        )}
      </div>

      <div className="relative z-10">
        <p className={`text-2xl font-cyber font-bold ${accent.value} leading-none mb-1 tracking-tight`}>
          {value}
        </p>
        <p className="text-xs font-tech font-bold text-slate-300 uppercase tracking-wide">{label}</p>
        {sub && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AlertCenter() {
  const { habitations, refetch } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agency, setAgency] = useState('All');
  const [status, setStatus] = useState('active');
  const [priority, setPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [simulating, setSimulating] = useState(false);

  // Fetch all alerts
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status !== 'all') params.status = status;
      if (agency !== 'All') params.agency = agency;
      const r = await getAlerts(params);
      setAlerts(r.data?.data || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [agency, status]);

  const handleUpdate = () => {
    fetchAlerts();
    refetch();
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
    refetch();
  };

  // Simulate new alert drill
  const handleSimulateAlert = async () => {
    const targetId = selectedVillageId || (habitations.length > 0 ? habitations[0]._id : null);
    if (!targetId) {
      toast.error('No target habitation available for simulation');
      return;
    }

    try {
      setSimulating(true);
      await simulateAlerts(targetId);
      toast.success('Disaster alert simulation broadcasted to agency terminals', {
        icon: '🚨',
        style: {
          borderRadius: '10px',
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid rgba(239, 68, 68, 0.4)',
        },
      });
      fetchAlerts();
      refetch();
    } catch {
      toast.error('Simulation trigger failed');
    } finally {
      setSimulating(false);
    }
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      // Priority filter
      if (priority !== 'All' && a.priority?.toLowerCase() !== priority.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesVillage = a.village_name?.toLowerCase().includes(q);
        const matchesAgency = a.target_agency?.toLowerCase().includes(q);
        const matchesMessage = a.message?.toLowerCase().includes(q);
        const matchesRisk = a.risk_category?.toLowerCase().includes(q);
        if (!matchesVillage && !matchesAgency && !matchesMessage && !matchesRisk) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, priority, searchQuery]);

  // Aggregate metrics
  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const criticalCount = alerts.filter((a) => a.priority?.toLowerCase() === 'critical').length;
  const ackCount = alerts.filter((a) => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 text-slate-100">
      <Topbar
        title="Multi-Agency Alert Command Center"
        subtitle="Disaster Early Warning Telemetry · Inter-Agency Response Stream"
        breadcrumb="Alert Center"
      />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* ── Operational Sandbox Banner ──────────────────────── */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 via-slate-800/95 to-slate-900 border border-slate-700/60 p-5 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-red-500/10 via-amber-500/5 to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-cyber font-bold tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
                  SANDBOX DISASTER SIMULATION GATEWAY · AIR-GAPPED
                </span>
                <span className="text-[10px] font-cyber text-slate-500 hidden sm:inline">
                  PROTOCOL: C-CAP/NDMA-V4
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Early Warning & Inter-Agency Dispatch Grid
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
                Alerts simulated across the Aegis decision loop are dispatched to tactical terminals for
                <strong className="text-slate-200"> NDRF/SDRF, Police, Fire, and District Emergency Cells</strong>. All actions are isolated within this operational prototype.
              </p>
            </div>

            {/* Quick Simulation Trigger Button */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {habitations.length > 0 && (
                <select
                  value={selectedVillageId}
                  onChange={(e) => setSelectedVillageId(e.target.value)}
                  className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-sky-500 max-w-[200px]"
                >
                  <option value="">Top Priority Village</option>
                  {habitations.slice(0, 10).map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.district})
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleSimulateAlert}
                disabled={simulating}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xs font-cyber font-bold rounded-lg transition-all shadow-lg shadow-red-500/25 disabled:opacity-50"
              >
                <Radio className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{simulating ? 'Broadcasting...' : 'Simulate Alert Drill'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4 Telemetry KPI Cards ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TelemetryKPI
            label="Active Incidents"
            value={status === 'all' || status === 'active' ? activeCount : alerts.length}
            sub="Requiring duty action"
            icon={Bell}
            pulse={activeCount > 0}
            active={status === 'active'}
            onClick={() => setStatus('active')}
            accent={{
              glow: 'from-red-500/10 to-transparent',
              iconBg: 'bg-red-500/15',
              iconText: 'text-red-400',
              value: 'text-red-400',
              dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
            }}
          />

          <TelemetryKPI
            label="Critical Severity"
            value={criticalCount}
            sub="Breaching safe threshold"
            icon={ShieldAlert}
            pulse={criticalCount > 0}
            active={priority === 'Critical'}
            onClick={() => setPriority((p) => (p === 'Critical' ? 'All' : 'Critical'))}
            accent={{
              glow: 'from-amber-500/10 to-transparent',
              iconBg: 'bg-amber-500/15',
              iconText: 'text-amber-400',
              value: 'text-amber-400',
              dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
            }}
          />

          <TelemetryKPI
            label="In Transit / Acknowledged"
            value={ackCount}
            sub="Units assigned & en-route"
            icon={Activity}
            pulse={false}
            active={status === 'acknowledged'}
            onClick={() => setStatus('acknowledged')}
            accent={{
              glow: 'from-sky-500/10 to-transparent',
              iconBg: 'bg-sky-500/15',
              iconText: 'text-sky-400',
              value: 'text-sky-400',
              dot: 'bg-sky-400',
            }}
          />

          <TelemetryKPI
            label="Resolved Incidents"
            value={resolvedCount}
            sub="Evacuation completed"
            icon={CheckCircle2}
            pulse={false}
            active={status === 'resolved'}
            onClick={() => setStatus('resolved')}
            accent={{
              glow: 'from-emerald-500/10 to-transparent',
              iconBg: 'bg-emerald-500/15',
              iconText: 'text-emerald-400',
              value: 'text-emerald-400',
              dot: 'bg-emerald-400',
            }}
          />
        </div>

        {/* ── Filters & Search Control Bar ─────────────────────── */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/70 overflow-x-auto">
            {STATUS_TABS.map((tab) => {
              const isActive = status === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatus(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-tech font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.id === 'active' && activeCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Search, Agency Filter, and Refresh */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search village, message, agency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Agency Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              <select
                className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-sky-500"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
              >
                {AGENCIES.map((a) => (
                  <option key={a} value={a}>
                    {a === 'All' ? 'All Agencies' : a}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <select
              className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-sky-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Severities' : `${p} Severity`}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              title="Refresh Alert Stream"
              className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-700/60 text-slate-400 hover:text-sky-400 border border-slate-700/80 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Active Filters Tag Bar ───────────────────────────── */}
        {(agency !== 'All' || priority !== 'All' || searchQuery) && (
          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
            <span className="font-tech uppercase text-[11px] font-bold text-slate-500">Active Filters:</span>
            {agency !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-sky-400 text-xs">
                Agency: {agency}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setAgency('All')} />
              </span>
            )}
            {priority !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs">
                Severity: {priority}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setPriority('All')} />
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs">
                Search: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />
              </span>
            )}
            <button
              onClick={() => {
                setAgency('All');
                setPriority('All');
                setSearchQuery('');
              }}
              className="text-xs text-sky-400 hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Alerts Grid & Stream ─────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-tech font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <span>Incident Stream</span>
              <span className="font-cyber text-xs text-sky-400 font-bold ml-1">
                ({filteredAlerts.length} record{filteredAlerts.length !== 1 ? 's' : ''})
              </span>
            </h3>
            <span className="text-[11px] font-tech text-slate-500 uppercase tracking-widest">
              Real-time NDMA Cap Feed
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 h-44 animate-pulse"
                >
                  <div className="flex justify-between mb-4">
                    <div className="h-4 bg-slate-700 rounded w-1/3" />
                    <div className="h-4 bg-slate-700 rounded w-16" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-slate-700 rounded w-full" />
                    <div className="h-3 bg-slate-700 rounded w-4/5" />
                  </div>
                  <div className="h-8 bg-slate-700/40 rounded w-full mt-4" />
                </div>
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-cyber font-bold text-lg text-white mb-1">
                NO {status.toUpperCase()} ALERTS IN QUEUE
              </h4>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed">
                All telemetry channels and district clusters report within safe thresholds for current filters.
              </p>
              <button
                onClick={handleSimulateAlert}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-cyber font-bold rounded-lg transition-colors border border-slate-600/50 flex items-center gap-2"
              >
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>Simulate Early Warning Drill</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAlerts.map((a) => (
                <AlertCard key={a._id} alert={a} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </div>

        {/* ── System Telemetry Status Bar ─────────────────────── */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="font-cyber font-bold text-slate-300">DISPATCH MESH ONLINE</span>
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">CAP/SACHET PROTOCOL COMPLIANT</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span>ENCRYPTION: AES-256</span>
            <span>GATEWAY: AIR-GAPPED SIMULATION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
