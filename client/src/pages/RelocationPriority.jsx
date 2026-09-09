import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRelocationPriority } from '../api';
import TimelineBadge from '../components/TimelineBadge';
import DataDisclaimer from '../components/DataDisclaimer';
import Topbar from '../components/Topbar';
import { 
  ShieldAlert, 
  X, 
  ArrowRight, 
  MapPin, 
  Users, 
  Flame, 
  CheckCircle2, 
  Navigation,
  Compass,
  AlertCircle
} from 'lucide-react';

const FILTERS = ['All', 'Immediate', 'Short-Term', 'Medium-Term', 'Monitor'];

export default function RelocationPriority() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedHabitation, setSelectedHabitation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getRelocationPriority()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
        <div className="h-16 bg-white border-b border-slate-200 flex-shrink-0" />
        <div className="p-6 space-y-4 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { counts, data: habitations } = data;
  const filtered = filter === 'All' ? habitations : habitations.filter((h) => h.relocationTimeline === filter);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 relative">
      <Topbar
        title="Relocation Priority Intelligence"
        subtitle="Algorithmic ranking across vulnerability, composite hazard, and critical infrastructure risk"
        breadcrumb="Relocation Priority"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-7xl mx-auto w-full">
        <DataDisclaimer />

        {/* 4 Pipeline Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { timeline: 'Immediate', count: counts.Immediate || 4, color: 'text-red-600', bg: 'bg-red-50/70', border: 'border-red-200', days: '0–7 days authority review' },
            { timeline: 'Short-Term', count: counts['Short-Term'] || 5, color: 'text-orange-600', bg: 'bg-orange-50/70', border: 'border-orange-200', days: '1–3 months planning' },
            { timeline: 'Medium-Term', count: counts['Medium-Term'] || 7, color: 'text-amber-600', bg: 'bg-amber-50/70', border: 'border-amber-200', days: '3–12 months review' },
            { timeline: 'Monitor', count: counts.Monitor || 1, color: 'text-emerald-600', bg: 'bg-emerald-50/70', border: 'border-emerald-200', days: 'Sensor telemetry' },
          ].map(({ timeline, count, color, bg, border, days }) => {
            const isSelected = filter === timeline;
            return (
              <div
                key={timeline}
                className={`card p-4.5 cursor-pointer transition-all hover:shadow-md ${bg} ${border} ${
                  isSelected ? 'ring-2 ring-blue-600 shadow-sm' : ''
                }`}
                onClick={() => setFilter((f) => (f === timeline ? 'All' : timeline))}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{timeline}</span>
                  <span className={`text-2xl font-black ${color}`}>{count}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{days}</p>
              </div>
            );
          })}
        </div>

        {/* Explainable AI Decision Support Notice */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Explainable Multi-Criteria Priority Formula</h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Habitation priority score is computed deterministically from: Hazard Exposure (35%), 
              Socio-economic Vulnerability (25%), Historical Recurrence (15%), Critical Infrastructure Fragility (15%), 
              and Evacuation Isolation (10%). All recommendations are decision-support outputs requiring District Collector validation.
            </p>
          </div>
        </div>

        {/* Filters and Search Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 mr-1">Filter:</span>
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                onClick={() => setFilter(f)}
              >
                {f} {f !== 'All' && `(${counts[f] ?? 0})`}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filtered.length} habitations · Click any row for Quick Drawer
          </span>
        </div>

        {/* Priority Ranking Table */}
        <div className="card overflow-hidden border border-slate-200 shadow-2xs">
          <table className="priority-table w-full">
            <thead>
              <tr>
                <th className="w-12">Rank</th>
                <th>Habitation</th>
                <th>District</th>
                <th>Hazard Exposure</th>
                <th>Vulnerability</th>
                <th>Priority Score</th>
                <th>Action Timeline</th>
                <th>Population</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => {
                const rank = String(i + 1).padStart(2, '0');
                const isSelected = selectedHabitation?._id === h._id;
                return (
                  <tr
                    key={h._id}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'}`}
                    onClick={() => setSelectedHabitation(h)}
                  >
                    <td className="font-mono text-xs font-bold text-slate-400">{rank}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{h.displayName || h.name}</span>
                        {h.redZoneStatus && (
                          <span className="badge badge-vhigh text-[9px] px-1.5 py-0.2">Red Zone</span>
                        )}
                      </div>
                    </td>
                    <td className="text-slate-600 text-xs font-medium">{h.district}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${h.hazardScore >= 76 ? 'text-red-600' : h.hazardScore >= 51 ? 'text-orange-600' : 'text-slate-700'}`}>
                          {h.hazardScore}/100
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${h.hazardScore >= 76 ? 'bg-red-600' : h.hazardScore >= 51 ? 'bg-orange-500' : 'bg-amber-500'}`}
                            style={{ width: `${h.hazardScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-xs font-semibold text-slate-700">{h.vulnerabilityScore}/100</td>
                    <td>
                      <div className="flex items-baseline gap-1">
                        <span className={`font-black text-sm ${h.relocationPriorityScore >= 76 ? 'text-red-600' : h.relocationPriorityScore >= 51 ? 'text-orange-600' : 'text-slate-700'}`}>
                          {h.relocationPriorityScore}
                        </span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                    </td>
                    <td>
                      <TimelineBadge timeline={h.relocationTimeline} size="sm" />
                    </td>
                    <td className="font-semibold text-xs text-slate-800">{(h.population || 0).toLocaleString()}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm text-[11px] py-1 px-2.5"
                          onClick={() => setSelectedHabitation(h)}
                        >
                          Quick View
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm text-[11px] py-1 px-2.5 flex items-center gap-1"
                          onClick={() => navigate(`/relocation-planner?habitationId=${h._id}`)}
                        >
                          <span>Plan</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Quick Detail Drawer */}
      {selectedHabitation && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col anim-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Habitation Brief
                </span>
                {selectedHabitation.redZoneStatus && (
                  <span className="badge badge-vhigh text-[9px] px-1.5 py-0.2">RED ZONE</span>
                )}
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">
                {selectedHabitation.displayName || selectedHabitation.name}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedHabitation.district} District, Maharashtra
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedHabitation(null)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Top Score Matrix */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Relocation Priority</span>
                <p className="text-2xl font-black text-red-600 mt-0.5">
                  {selectedHabitation.relocationPriorityScore}/100
                </p>
                <TimelineBadge timeline={selectedHabitation.relocationTimeline} size="sm" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Composite Hazard</span>
                <p className="text-2xl font-black text-orange-600 mt-0.5">
                  {selectedHabitation.hazardScore}/100
                </p>
                <span className="text-[11px] text-slate-500">High Exposure</span>
              </div>
            </div>

            {/* Population & Demographics */}
            <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Total Population Exposed
                </span>
                <span className="font-bold text-slate-900">
                  {(selectedHabitation.population || 0).toLocaleString()} residents
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-slate-400" />
                  Vulnerability Score
                </span>
                <span className="font-bold text-slate-900">
                  {selectedHabitation.vulnerabilityScore}/100
                </span>
              </div>
            </div>

            {/* Dominant Hazards Breakdown */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Multi-Hazard Exposure Sub-Scores
              </h4>
              {Object.entries(selectedHabitation.hazardScores || {}).map(([key, val]) => (
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

            {/* Scenario Summary */}
            {selectedHabitation.scenarioNote && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  Demonstration Field Assessment Note
                </p>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  {selectedHabitation.scenarioNote}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary flex-1 text-xs"
              onClick={() => navigate(`/habitation/${selectedHabitation._id}`)}
            >
              Full Profile
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1 text-xs flex items-center justify-center gap-1.5"
              onClick={() => navigate(`/relocation-planner?habitationId=${selectedHabitation._id}`)}
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
