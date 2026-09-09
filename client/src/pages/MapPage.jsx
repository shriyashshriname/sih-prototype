import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getRedZones, getRelocationSites } from '../api';
import MapView from '../components/MapView';
import Topbar from '../components/Topbar';
import DataDisclaimer from '../components/DataDisclaimer';

export default function MapPage() {
  const { habitations, loading } = useApp();
  const [polygons, setPolygons] = useState([]);
  const [sites, setSites] = useState([]);
  const [showSites, setShowSites] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);
  const [selectedTimeline, setSelectedTimeline] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    getRedZones()
      .then((r) => {
        if (r.data?.data?.polygons) {
          setPolygons(r.data.data.polygons);
        }
      })
      .catch(() => {});

    getRelocationSites()
      .then((r) => {
        if (r.data?.data) {
          setSites(r.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredHabitations = habitations.filter((h) => {
    if (selectedTimeline === 'All') return true;
    return h.relocationTimeline === selectedTimeline;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Topbar
        title="Multi-Hazard GIS Spatial Map"
        subtitle={`${habitations.length} Habitations · 6 Vulnerable Districts · Maharashtra`}
      />

      <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        {/* Layer Controls & Timeline Filters */}
        <div className="card p-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 bg-white shadow-xs">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Layers:</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showPolygons}
                onChange={(e) => setShowPolygons(e.target.checked)}
                className="rounded text-red-600 focus:ring-0"
              />
              <span>🔴 Hazard Red Zones</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showSites}
                onChange={(e) => setShowSites(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>✅ Safe Relocation Sites</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filter Priority:</span>
            {['All', 'Immediate', 'Short-Term', 'Medium-Term', 'Monitor'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTimeline(t)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  selectedTimeline === t
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/red-zones')}
            className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <span>🔴</span> Red Zone Intel →
          </button>
        </div>

        {/* Map Container */}
        <div className="card overflow-hidden flex-1 relative border border-slate-200 shadow-sm">
          {loading ? (
            <div className="skeleton w-full h-full" />
          ) : (
            <MapView
              habitations={filteredHabitations}
              sites={sites}
              polygons={polygons}
              showSites={showSites}
              showPolygons={showPolygons}
              height="100%"
              onHabitationClick={(id) => navigate(`/habitation/${id}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
