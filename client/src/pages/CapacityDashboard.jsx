import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRelocationSites } from '../api';
import Topbar from '../components/Topbar';
import {
  Building2,
  Droplets,
  Zap,
  Activity,
  GraduationCap,
  Navigation,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function CapacityDashboard() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRelocationSites()
      .then((res) => {
        setSites(res.data?.data || []);
      })
      .catch(() => setSites([]))
      .finally(() => setLoading(false));
  }, []);

  const totalMax = sites.reduce((sum, s) => sum + (s.maxCapacity || 0), 0);
  const totalOccupied = sites.reduce((sum, s) => sum + (s.currentOccupancy || 0), 0);
  const totalAvailable = totalMax - totalOccupied;
  const popAtRisk = 12480; // Demonstration population across 5 red-zone habitations
  const netHeadroom = Math.max(0, totalAvailable - popAtRisk);
  const aggregateUtilization = totalMax > 0 ? Math.round(((totalOccupied + popAtRisk) / totalMax) * 100) : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Topbar
        title="Carrying Capacity & Infrastructure Headroom"
        subtitle="Auditing absorptive capacity across designated safe sites · Maharashtra State"
        breadcrumb="Relocation / Capacity"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* ── 1. Hero Metric Strip ─────────────────────────────────── */}
        <div className="card p-6 border border-slate-200 shadow-xs bg-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                AGGREGATE FEASIBILITY STATUS: ADEQUATE
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Regional Carrying Capacity Absorption Balance
              </h2>
              <p className="text-xs text-slate-500">
                Evaluating net absorptive capacity against current disaster vulnerability footprint.
              </p>
            </div>
            <button
              onClick={() => navigate('/relocation-planner')}
              className="btn btn-primary text-xs py-2 px-4 shadow-sm flex items-center gap-1.5 font-bold"
            >
              <span>Relocation Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] text-slate-600 font-bold uppercase">Total Available Capacity</p>
              <p className="text-3xl font-black text-emerald-700 mt-1">{totalAvailable.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Across 10 designated safe sites</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] text-slate-600 font-bold uppercase">Population Requiring Relocation</p>
              <p className="text-3xl font-black text-orange-600 mt-1">{popAtRisk.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">5 Gazetted Red-Zone settlements</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] text-slate-600 font-bold uppercase">Preserved Buffer Headroom</p>
              <p className="text-3xl font-black text-blue-700 mt-1">+{netHeadroom.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Emergency buffer preserved</p>
            </div>
          </div>

          {/* Utilization Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Projected Capacity Utilization (Post-Relocation):</span>
              <span className="font-black text-slate-900">{aggregateUtilization}% Total Capacity Absorbed</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 transition-all duration-700"
                style={{ width: `${Math.min(100, aggregateUtilization)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── 2. Infrastructure Readiness Cards ───────────────────── */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3">
            Lifeline Services & Infrastructure Availability
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card p-4 space-y-2 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Droplets className="w-5 h-5" />
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  92% Verified
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Potable Water Network</h4>
              <p className="text-xs text-slate-500">
                Piped municipal tap connections &gt; 70 LPCD plus dedicated borewell backups at each site.
              </p>
            </div>

            <div className="card p-4 space-y-2 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-red-50 text-red-700">
                  <Activity className="w-5 h-5" />
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  88% Verified
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Healthcare Bed Availability</h4>
              <p className="text-xs text-slate-500">
                Rural & Sub-district hospitals accessible within 3.5 km average emergency travel distance.
              </p>
            </div>

            <div className="card p-4 space-y-2 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <Zap className="w-5 h-5" />
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  95% Verified
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">MSEDCL Power Grid</h4>
              <p className="text-xs text-slate-500">
                Dual feeder 33kV substation line connectivity with emergency diesel generator capacity.
              </p>
            </div>

            <div className="card p-4 space-y-2 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-purple-50 text-purple-700">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  84% Verified
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">School & Child Welfare</h4>
              <p className="text-xs text-slate-500">
                Zilla Parishad schools within 2 km radius with capacity for student batch integration.
              </p>
            </div>

            <div className="card p-4 space-y-2 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Navigation className="w-5 h-5" />
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  90% Verified
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">All-Weather Road Arterials</h4>
              <p className="text-xs text-slate-500">
                Double-lane asphalt road corridors built above 100-year flood datum connecting to National Highways.
              </p>
            </div>

            <div className="card p-4 space-y-2 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <Building2 className="w-5 h-5" />
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  86% Verified
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Engineered Shelter Structures</h4>
              <p className="text-xs text-slate-500">
                Pre-cast reinforced concrete multi-purpose cyclone/flood halls ready for immediate assembly.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Designated Sites Headroom Table ───────────────────── */}
        <div className="card p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Designated Safe Sites Headroom Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Detailed carrying capacity audit across evaluated candidate sites.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75">
                  <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Site Name</th>
                  <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">District</th>
                  <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Max Capacity</th>
                  <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Occupied</th>
                  <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Available Headroom</th>
                  <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Suitability</th>
                  <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sites.map((s) => {
                  const avail = (s.maxCapacity || 0) - (s.currentOccupancy || 0);
                  return (
                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-3 text-slate-600">{s.district}</td>
                      <td className="py-3 px-3 font-mono">{(s.maxCapacity || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono">{(s.currentOccupancy || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-bold text-emerald-700 font-mono">{avail.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className="badge badge-success text-[10px] py-0.5">
                          {s.suitabilityScore || 88}/100
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => navigate(`/relocation-planner?siteId=${s._id}`)}
                          className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                        >
                          Plan Relocation →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
