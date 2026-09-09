import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRedZones } from '../api';
import MapView from '../components/MapView';
import TimelineBadge from '../components/TimelineBadge';
import DataDisclaimer from '../components/DataDisclaimer';
import Topbar from '../components/Topbar';

const HAZARD_TAG = {
  'Flood': 'bg-blue-100 text-blue-800',
  'Landslide': 'bg-purple-100 text-purple-800',
  'Erosion': 'bg-amber-100 text-amber-800',
  'Extreme Rainfall': 'bg-cyan-100 text-cyan-800',
};

export default function RedZones() {
  const [data, setData]             = useState(null);
  const [selectedZone, setSelected] = useState(null);
  const [loading, setLoading]       = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getRedZones().then(r => {
      setData(r.data);
      if (r.data.zones.length > 0) setSelected(r.data.zones[0]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="page-body flex items-center justify-center"><div className="skeleton h-96 w-full rounded-xl" /></div></div>;
  if (!data) return null;

  const { stats, zones, polygons } = data;
  const totalHa = polygons.reduce((s, p) => s + (p.areaHa || 0), 0);

  return (
    <div className="page">
      <Topbar title="Red Zone Intelligence" subtitle="Multi-hazard areas unsuitable for permanent habitation — demonstration analysis" />

      <div className="page-body space-y-4 anim-in">
        <DataDisclaimer />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: '🔴', v: polygons.length, label: 'Composite Red Zones', sub: 'Illustrative polygons' },
            { icon: '🏘️', v: stats.totalZones, label: 'Affected Habitations', sub: `${stats.districts.join(', ')}` },
            { icon: '👥', v: stats.affectedPopulation.toLocaleString(), label: 'Population Exposed', sub: 'Synthetic estimate' },
            { icon: '📐', v: `${totalHa.toLocaleString()} ha`, label: 'Total Zone Area', sub: 'Illustrative boundary' },
          ].map(({ icon, v, label, sub }) => (
            <div key={label} className="card p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-xl font-black text-slate-800">{v}</p>
              <p className="text-sm font-semibold text-slate-600 mt-0.5">{label}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* Map + Side Panel */}
        <div className="grid grid-cols-5 gap-4" style={{ minHeight: 480 }}>
          {/* Map */}
          <div className="col-span-3 card overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="section-title">Multi-Hazard Red Zone Map</p>
                <p className="text-xs text-slate-400">Translucent overlays = illustrative hazard zones</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="badge badge-vhigh">🔴 Composite</span>
                <span className="bg-blue-100 text-blue-700 badge">🔵 Flood</span>
                <span className="bg-purple-100 text-purple-700 badge">🟣 Landslide</span>
              </div>
            </div>
            <div className="flex-1" style={{ minHeight: 420 }}>
              <MapView
                habitations={zones}
                polygons={polygons}
                showSites={false}
                height="100%"
                onHabitationClick={id => navigate(`/habitation/${id}`)}
              />
            </div>
          </div>

          {/* Zone Panel */}
          <div className="col-span-2 flex flex-col gap-3 overflow-hidden">
            {/* Polygon list */}
            <div className="card p-4 flex-shrink-0">
              <p className="section-title mb-3">Identified Zones</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {polygons.map(z => (
                  <div key={z.id} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedZone?._id === z.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`} onClick={() => setSelected(zones.find(h => h.district === z.district) || zones[0])}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{z.name}</p>
                        <p className="text-xs text-slate-500">{z.district} · {z.areaHa.toLocaleString()} ha</p>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {z.dominantHazards.map(h => <span key={h} className={`badge text-xs ${HAZARD_TAG[h] || 'badge-gray'}`}>{h}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected habitation */}
            {selectedZone && (
              <div className="card p-4 flex-1 overflow-y-auto anim-in">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-800">{selectedZone.displayName || selectedZone.name}</p>
                    <p className="text-xs text-slate-500">{selectedZone.district}, Maharashtra</p>
                  </div>
                  <TimelineBadge timeline={selectedZone.relocationTimeline} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { l: 'Hazard Score', v: `${selectedZone.hazardScore}/100`, color: '#dc2626' },
                    { l: 'Population',   v: selectedZone.population?.toLocaleString() },
                    { l: 'Vulnerability',v: `${selectedZone.vulnerabilityScore}/100`, color: '#ea580c' },
                    { l: 'Priority',     v: `${selectedZone.relocationPriorityScore}/100`, color: '#dc2626' },
                  ].map(({ l, v, color }) => (
                    <div key={l} className="bg-slate-50 rounded-lg p-2.5">
                      <p className="text-xs text-slate-500">{l}</p>
                      <p className="font-bold text-slate-800" style={color ? { color } : {}}>{v}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Multi-Hazard Exposure</p>
                  {Object.entries(selectedZone.hazardScores || {}).filter(([k]) => k !== 'terrain').map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 py-1">
                      <span className="text-xs text-slate-500 w-24 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="flex-1 cap-bar">
                        <div className="cap-bar-fill" style={{ width: `${v}%`, background: v > 75 ? '#dc2626' : v > 50 ? '#ea580c' : v > 25 ? '#d97706' : '#16a34a' }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-3 text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  <strong>Why this location?</strong>
                  <p className="mt-1">{selectedZone.scenarioNote}</p>
                </div>

                <button
                  className="btn btn-danger w-full"
                  onClick={() => navigate(`/habitation/${selectedZone._id}`)}
                >
                  View Full Relocation Analysis →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Zones table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="section-title">All Red-Zone Habitations — Ranked by Hazard Score</p>
            <p className="text-xs text-slate-400 mt-0.5">Synthetic assessment · Not official government designation</p>
          </div>
          <table className="priority-table">
            <thead>
              <tr>
                <th>#</th><th>Habitation</th><th>District</th>
                <th>Hazard Score</th><th>Vulnerability</th><th>Priority</th>
                <th>Timeline</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => (
                <tr key={z._id} className="cursor-pointer" onClick={() => navigate(`/habitation/${z._id}`)}>
                  <td className="text-slate-400 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    <p className="font-semibold">{z.displayName || z.name}</p>
                    <p className="text-xs text-slate-400">{z.population?.toLocaleString()} pop.</p>
                  </td>
                  <td>{z.district}</td>
                  <td><span className="font-bold text-red-600">{z.hazardScore}/100</span></td>
                  <td>{z.vulnerabilityScore}/100</td>
                  <td><span className="font-bold text-red-600">{z.relocationPriorityScore}/100</span></td>
                  <td><TimelineBadge timeline={z.relocationTimeline} size="sm" /></td>
                  <td><button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); navigate(`/habitation/${z._id}`); }}>Analyse →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
