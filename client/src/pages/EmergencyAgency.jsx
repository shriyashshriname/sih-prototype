import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts, acknowledgeAlert, resolveAlert, simulateAlerts } from '../api';
import { useApp } from '../context/AppContext';
import Topbar from '../components/Topbar';
import { 
  ShieldAlert, 
  RefreshCw, 
  Building2, 
  Users, 
  Bell, 
  AlertCircle,
  Radio,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  Activity,
  Check,
  Compass,
  FileText,
  Truck,
  Flame,
  PhoneCall,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const AGENCIES = [
  'Fire Department',
  'Police',
  'Hospitals',
  'NDRF/SDRF',
  'District Administration',
  'Local Administration',
  'Emergency Response Team',
];

const DEPARTMENT_PROFILES = {
  'Fire Department': {
    icon: '🚒',
    name: 'Fire Department',
    roleTag: 'Search & Rescue • Flood Extraction • Hazmat Response',
    leadTitle: 'Chief Fire Officer / Incident Controller',
    readinessScore: 86,
    metrics: {
      teams: { label: 'Response Teams', value: '6 / 7 Ready', pct: 86 },
      vehicles: { label: 'Boats & Fire Tenders', value: '12 / 15 Available', pct: 80 },
      equipment: { label: 'Extraction Pumps & Hazmat', value: '92% Ready', pct: 92 },
      personnel: { label: 'Active Firefighters', value: '42 On Duty', pct: 85 },
      shelter: { label: 'Water Supply Support', value: 'Verified Ready', pct: 100 },
    },
    nextActions: [
      'Pre-position inflatable rescue craft near vulnerable river sectors',
      'Verify high-capacity flood extraction pumps and auxiliary fuel reserves',
      'Maintain continuous tactical radio comms with District EOC',
    ],
  },
  'Police': {
    icon: '👮',
    name: 'Police Department',
    roleTag: 'Law & Order • Traffic Cordon • Evacuation Route Security',
    leadTitle: 'Superintendent of Police / Tactical Lead',
    readinessScore: 90,
    metrics: {
      teams: { label: 'Patrol & Cordon Units', value: '9 / 10 Deployed', pct: 90 },
      vehicles: { label: 'Patrol Fleet & Transport', value: '18 / 20 Available', pct: 90 },
      equipment: { label: 'Road Blocks & Comms Gear', value: '88% Ready', pct: 88 },
      personnel: { label: 'Sworn Police Officers', value: '65 On Duty', pct: 92 },
      shelter: { label: 'Evacuation Route Clearance', value: 'Secured', pct: 100 },
    },
    nextActions: [
      'Enforce security perimeter cordons around critical slope hazard zones',
      'Secure unobstructed emergency transit corridors along state highways',
      'Deploy mobile public address teams for community evacuation alerts',
    ],
  },
  'Hospitals': {
    icon: '🏥',
    name: 'Health & Medical Services',
    roleTag: 'Emergency Medical Relief • Triage • Trauma Care',
    leadTitle: 'Chief Medical Officer / Health Services',
    readinessScore: 92,
    metrics: {
      teams: { label: 'Mobile Medical Units', value: '5 / 5 Standby', pct: 100 },
      vehicles: { label: 'ALS & BLS Ambulances', value: '8 / 10 Available', pct: 80 },
      equipment: { label: 'Trauma Kits & Antivenom', value: '94% Stocked', pct: 94 },
      personnel: { label: 'Doctors & Paramedics', value: '38 On Duty', pct: 88 },
      shelter: { label: 'Relocation Camp Triage Beds', value: '120 Beds Reserved', pct: 100 },
    },
    nextActions: [
      'Stock emergency trauma kits, IV fluids, and waterborne disease medications',
      'Pre-position mobile triage ambulances near designated safe relocation sites',
      'Activate emergency surge beds at Sub-District & Civil Hospitals',
    ],
  },
  'NDRF/SDRF': {
    icon: '⛑️',
    name: 'NDRF / SDRF Battalion',
    roleTag: 'Specialized Debris Rescue • Deep Water Extraction • Air Drop Staging',
    leadTitle: 'Commandant, 5th Battalion NDRF',
    readinessScore: 95,
    metrics: {
      teams: { label: 'Specialized Rescue Teams', value: '4 / 4 Deployed', pct: 100 },
      vehicles: { label: 'All-Terrain Carriers & BAVs', value: '10 / 12 Ready', pct: 83 },
      equipment: { label: 'Sonar, Drones & Breaching Gear', value: '96% Ready', pct: 96 },
      personnel: { label: 'Certified Commandos', value: '50 On Duty', pct: 95 },
      shelter: { label: 'Helipad Staging Ground', value: 'Operational', pct: 100 },
    },
    nextActions: [
      'Station motorized Gemini boat crews along vulnerable low-lying valleys',
      'Deploy ground-penetrating radar and thermal imaging search units',
      'Coordinate aerial rescue transit corridors with State Disaster Management',
    ],
  },
  'District Administration': {
    icon: '🏛️',
    name: 'District Administration',
    roleTag: 'Executive Incident Command • Collectorate Orders • Relocation Authorization',
    leadTitle: 'District Magistrate & Collector (IAS)',
    readinessScore: 94,
    metrics: {
      teams: { label: 'Incident Command Cells', value: '8 / 8 Active', pct: 100 },
      vehicles: { label: 'Command Fleet & Logistics', value: '14 / 16 Available', pct: 88 },
      equipment: { label: 'Satellite EOC Telemetry', value: '98% Online', pct: 98 },
      personnel: { label: 'Administrative Officers', value: '32 Active Duty', pct: 90 },
      shelter: { label: 'Relocation Quotas Authorized', value: '41,350 Approved', pct: 100 },
    },
    nextActions: [
      'Issue formal evacuation directives under Disaster Management Act, 2005',
      'Approve emergency relocation plan quotas for high-risk habitations',
      'Convene multi-agency tactical coordination briefing at District EOC',
    ],
  },
  'Local Administration': {
    icon: '🏢',
    name: 'Local Administration & Zilla Parishad',
    roleTag: 'Shelter Management • Relief Camp Logistics • Community Rations',
    leadTitle: 'Chief Executive Officer, Zilla Parishad',
    readinessScore: 84,
    metrics: {
      teams: { label: 'Shelter Logistics Teams', value: '7 / 8 Field Units', pct: 88 },
      vehicles: { label: 'Supply Trucks & Water Tankers', value: '9 / 12 Available', pct: 75 },
      equipment: { label: 'Dry Rations, Tarpaulins & Power', value: '85% Stocked', pct: 85 },
      personnel: { label: 'Gram Sevaks & Camp Staff', value: '28 Active Duty', pct: 82 },
      shelter: { label: 'Safe Site Camp Readiness', value: '5 Sites Prepared', pct: 90 },
    },
    nextActions: [
      'Pre-position drinking water tankers and dry rations at designated safe sites',
      'Verify mobile generator power supplies and emergency sanitation blocks',
      'Coordinate community reception desks at designated safe schools and community halls',
    ],
  },
  'Emergency Response Team': {
    icon: '🚨',
    name: 'Emergency Response Team',
    roleTag: 'Rapid Field Assessment • Sensor Verification • VHF Relay Comms',
    leadTitle: 'Tactical Reconnaissance Commander',
    readinessScore: 89,
    metrics: {
      teams: { label: 'Rapid Assessment Teams', value: '5 / 6 Deployed', pct: 83 },
      vehicles: { label: '4WD Rapid Recon Vehicles', value: '7 / 8 Available', pct: 88 },
      equipment: { label: 'Recon Drones & VHF Repeaters', value: '91% Ready', pct: 91 },
      personnel: { label: 'Field Comms Specialists', value: '24 On Duty', pct: 86 },
      shelter: { label: 'Telemetry Link to Safe Sites', value: 'Linked', pct: 100 },
    },
    nextActions: [
      'Deploy reconnaissance drones to monitor landslide fissures and flood crests',
      'Establish backup VHF repeater stations in rain-shadow terrain zones',
      'Transmit real-time telemetry updates to Aegis Command Center GIS',
    ],
  },
};

export default function EmergencyAgency() {
  const navigate = useNavigate();
  const { habitations } = useApp();
  const [agency, setAgency] = useState('Fire Department');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const r = await getAlerts({ agency });
      setAlerts(r.data.data || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [agency]);

  // Handle acknowledge action
  const handleAcknowledge = async (id) => {
    try {
      setActionLoadingId(id);
      await acknowledgeAlert(id, 'Duty Commander');
      toast.success('Alert acknowledged and logged in agency dispatch register');
      fetchAlerts();
    } catch {
      toast.error('Failed to acknowledge alert');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle resolve action
  const handleResolve = async (id) => {
    try {
      setActionLoadingId(id);
      await resolveAlert(id);
      toast.success('Incident resolved and archived');
      fetchAlerts();
    } catch {
      toast.error('Failed to resolve alert');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick simulation trigger if alerts are empty
  const handleSimulateAlert = async () => {
    try {
      setLoading(true);
      const targetHab = habitations.find(h => h.redZoneStatus) || habitations[0];
      if (targetHab) {
        await simulateAlerts(targetHab._id);
        toast.success(`Simulated early warning alerts dispatched for ${targetHab.name}`);
        fetchAlerts();
      } else {
        toast.error('No habitation available for simulation');
      }
    } catch {
      toast.error('Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  // Derived metrics
  const criticalCount = alerts.filter(a => a.priority === 'critical' || a.risk_category === 'Very High').length;
  const activeCount = alerts.filter(a => a.status === 'active').length;
  const ackCount = alerts.filter(a => a.status === 'acknowledged').length;

  const currentProfile = DEPARTMENT_PROFILES[agency] || DEPARTMENT_PROFILES['Fire Department'];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      {/* ── 1. Topbar ───────────────────────────────────────────── */}
      <Topbar
        title="Agency Coordination"
        subtitle="Departmental incident command & tactical readiness workspace"
        breadcrumb="Agency Coordination"
      />

      {/* ── 2. Scrollable Body ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-5 w-full">
        
        {/* ── Page-Level Demo Notice (Section 9) ─────────────────── */}
        <div className="bg-blue-50/90 border border-blue-200/90 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />
            <span className="font-bold tracking-wide uppercase text-[11px] text-blue-950">DEMO ENVIRONMENT</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">
              Synthetic alert simulation · No real emergency messages or broadcast sirens are transmitted.
            </span>
          </div>
          <span className="text-[10px] text-blue-800 bg-white border border-blue-200 px-2 py-0.5 rounded font-semibold hidden md:inline-block">
            Maharashtra SDMA Prototype
          </span>
        </div>

        {/* ── 3. Department Workspace Hero (Section 1 & 4) ───────── */}
        <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-950 via-[#0a1638] to-slate-900 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start sm:items-center gap-4.5 z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-3xl shadow-inner flex-shrink-0 backdrop-blur-xs">
              {currentProfile.icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h1 className="text-2xl sm:text-[26px] font-black text-white tracking-tight uppercase">
                  {currentProfile.name}
                </h1>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ACTIVE OPERATIONAL UNIT</span>
                </div>
              </div>
              <p className="text-xs sm:text-[13px] text-blue-200 font-medium leading-relaxed max-w-xl">
                {currentProfile.roleTag}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10 self-start md:self-auto flex-wrap">
            {criticalCount > 0 ? (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-2 text-red-200">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
                <span className="text-xs font-black tracking-wide">
                  {criticalCount} CRITICAL ALERT{criticalCount !== 1 ? 'S' : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-4 py-2 text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold">All Clear · Normal Standby</span>
              </div>
            )}

            <button
              onClick={fetchAlerts}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 active:scale-[0.99] text-white text-xs font-bold py-2.5 px-3.5 rounded-xl border border-white/15 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── 4. Department Switcher (Section 1 & 5) ──────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {AGENCIES.map((a) => {
              const isSelected = agency === a;
              const prof = DEPARTMENT_PROFILES[a];
              return (
                <button
                  key={a}
                  onClick={() => setAgency(a)}
                  className={`px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm translate-y-[-1px]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-base">{prof?.icon || '🏢'}</span>
                  <span>{a}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 5. Alert Summary Metrics (Section 6) ────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Critical */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">CRITICAL DISPATCHES</p>
              <p className="text-2xl font-black text-red-600 mt-0.5">{criticalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
          </div>

          {/* Active */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">ACTIVE INCIDENTS</p>
              <p className="text-2xl font-black text-amber-600 mt-0.5">{activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          {/* Acknowledged */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">ACKNOWLEDGED / IN TRANSIT</p>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{ackCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* ── 6. Two-Column Dashboard (Section 7 & 13: 65% / 35%) ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ════════════════════════════════════════════════════════
              LEFT COLUMN (~65%): Active Operational Alerts Feed
             ════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            
            {/* Feed Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Active Operational Alerts
                </h2>
                <span className="text-xs bg-slate-200/80 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                  {alerts.length}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Live field alerts routed to {agency}
              </span>
            </div>

            {/* Alert Cards Feed */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : alerts.length === 0 ? (
              /* Professional Empty State with Instant Demonstration Trigger */
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold border border-emerald-100">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  All Clear · Normal Standby Status
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  No active critical hazard alerts are currently assigned to {agency}. Telemetry across all 17 habitations remains actively monitored.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleSimulateAlert}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Demonstration Alert for {agency}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Compact Professional Incident Cards (Section 8) */
              <div className="space-y-3.5">
                {alerts.map((alert) => {
                  const isCritical = alert.priority === 'critical' || alert.risk_category === 'Very High';
                  const isHigh = alert.priority === 'high' || alert.risk_category === 'High';
                  const isWarning = alert.priority === 'warning' || alert.risk_category === 'Moderate';

                  return (
                    <div 
                      key={alert._id} 
                      className={`bg-white rounded-2xl p-4.5 sm:p-5 border transition-all duration-200 shadow-2xs hover:shadow-sm ${
                        isCritical 
                          ? 'border-red-200/90 border-l-4 border-l-red-600' 
                          : isHigh 
                          ? 'border-orange-200/90 border-l-4 border-l-orange-500'
                          : 'border-slate-200/90 border-l-4 border-l-blue-600'
                      }`}
                    >
                      {/* Top Header: Priority Badge + Hazard Label */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span 
                            className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                              isCritical
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : isHigh
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />}
                            <span>{alert.priority?.toUpperCase() || (isCritical ? 'CRITICAL' : 'HIGH')}</span>
                          </span>

                          <span className="text-xs font-bold text-slate-800">
                            {alert.risk_category} Risk Directive
                          </span>
                        </div>

                        {/* Habitation Link */}
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors">
                          <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          <span>{alert.village_name || 'Habitation'}</span>
                        </div>
                      </div>

                      {/* Directive Message */}
                      <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-relaxed mb-3.5">
                        {alert.message}
                      </p>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <span>
                            Risk Score: <strong className="text-slate-800">{alert.risk_score}/100</strong>
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(alert.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </span>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-2">
                          {alert.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleAcknowledge(alert._id)}
                                disabled={actionLoadingId === alert._id}
                                className="bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <Check className="w-3 h-3" />
                                <span>Acknowledge</span>
                              </button>

                              <button
                                onClick={() => handleResolve(alert._id)}
                                disabled={actionLoadingId === alert._id}
                                className="bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Resolve</span>
                              </button>
                            </>
                          )}

                          {alert.status === 'acknowledged' && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Acknowledged by {alert.acknowledged_by || 'Duty Lead'}</span>
                              </span>

                              <button
                                onClick={() => handleResolve(alert._id)}
                                disabled={actionLoadingId === alert._id}
                                className="bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Resolve</span>
                              </button>
                            </div>
                          )}

                          {alert.status === 'resolved' && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Resolved & Archived</span>
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>


          {/* ════════════════════════════════════════════════════════
              RIGHT COLUMN (~35%): Department Readiness & Command Panel
             ════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            
            {/* Readiness Card (Section 10) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    DEPARTMENT READINESS
                  </h3>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {currentProfile.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-blue-600">
                    {currentProfile.readinessScore}%
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Operational</p>
                </div>
              </div>

              {/* Progress Bars Stack */}
              <div className="space-y-3.5">
                {Object.entries(currentProfile.metrics).map(([key, item]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="font-bold text-slate-900">{item.value}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Operational Actions (Section 10) */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  NEXT OPERATIONAL ACTIONS
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {currentProfile.nextActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-snug">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Quick Operational Actions (Section 11) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                QUICK OPERATIONAL ACTIONS
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/map')}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>View GIS Risk Map</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigate('/red-zones')}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>View Red Zones Intel</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigate('/relocation-planner')}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Open Relocation Planner</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
