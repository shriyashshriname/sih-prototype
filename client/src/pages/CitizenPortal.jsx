import React, { useState } from 'react';
import { searchHabitations, searchVillages } from '../api';
import TimelineBadge from '../components/TimelineBadge';
import { useNavigate } from 'react-router-dom';

const preparednessGuide = [
  { icon: '🎒', tip: 'Keep emergency grab-bag with ID, property documents, cash & essential medicines in waterproof pouch.' },
  { icon: '💧', tip: 'Stock 3 days of potable water (min. 3L/day/person) and non-perishable high-energy food rations.' },
  { icon: '🔦', tip: 'Keep charged flashlights, power banks, and battery-operated AM/FM radio for state broadcasts.' },
  { icon: '🚗', tip: 'Familiarize family with designated high-ground arterial routes and primary government safe centers.' },
  { icon: '📞', tip: 'Save state emergency contacts: SEOC 1070 · DEOC 1077 · NDRF Pune 020-27144888 · Ambulance 108.' },
  { icon: '⚠️', tip: 'Heed early warning bulletins immediately. Relocation advisories prioritize life safety over property.' },
  { icon: '⛰️', tip: 'In hilly/landslide areas, watch for new cracks in plaster/ground, tilting trees, or sudden muddy water flow.' },
  { icon: '👵', tip: 'Maintain priority assistance checklist for elderly relatives, pregnant women, infants, and persons with disabilities.' },
];

const emergencyNumbers = [
  { label: 'State Emergency Ops', number: '1070' },
  { label: 'District Disaster Helpline', number: '1077' },
  { label: 'NDRF 5th Bn (Maharashtra)', number: '020-27144888' },
  { label: 'Emergency Response', number: '112' },
  { label: 'Medical Ambulance', number: '108' },
];

export default function CitizenPortal() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      let r = null;
      try {
        r = await searchHabitations(query);
      } catch {
        r = await searchVillages(query);
      }
      setResults(r?.data?.data || []);
      setSelected(null);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const priorityColor = (t) => {
    if (t === 'Immediate') return 'border-red-400 bg-red-50/50';
    if (t === 'Short-Term') return 'border-orange-400 bg-orange-50/50';
    if (t === 'Medium-Term') return 'border-amber-400 bg-amber-50/50';
    return 'border-emerald-400 bg-emerald-50/50';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-8 shadow-md bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-blue-600/40 border border-blue-400/30 rounded-xl">🛡️</span>
              <div>
                <h1 className="text-white text-2xl font-black tracking-tight">Aegis Citizen Portal</h1>
                <p className="text-blue-200 text-xs mt-0.5">
                  Community Multi-Hazard Risk Awareness & Relocation Advisory · Maharashtra
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl transition-all border border-white/10"
            >
              ← Back to Authority Platform
            </button>
          </div>
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              <strong>Demonstration Prototype (SIH26191):</strong> This portal provides simulated hazard intelligence and relocation guidance for public awareness.
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Habitation Search Card */}
        <div className="card p-6 border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-800 text-base mb-1">Check Habitation Risk & Relocation Advisory</h2>
          <p className="text-xs text-slate-500 mb-4">
            Search by village or settlement name across Raigad, Ratnagiri, Pune, Kolhapur, Sindhudurg, Sangli.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              id="habitation-search"
              className="input flex-1 text-sm py-2"
              placeholder="Search habitation (e.g. Mahad, Chiplun, Malin, Ambegaon, Shirol, Sangmeshwar...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary text-xs px-5" disabled={searching}>
              {searching ? 'Searching...' : '🔍 Search'}
            </button>
          </form>

          {/* Search suggestions */}
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-400">
            <span>Quick search:</span>
            {['Mahad', 'Chiplun', 'Malin', 'Shirol', 'Sangmeshwar'].map((quick) => (
              <button
                key={quick}
                onClick={() => {
                  setQuery(quick);
                  searchHabitations(quick).then((r) => setResults(r.data?.data || []));
                }}
                className="text-blue-600 hover:underline px-1"
              >
                {quick}
              </button>
            ))}
          </div>

          {/* Search results */}
          {results.length > 0 && !selected && (
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
              <p className="text-xs font-semibold text-slate-500 mb-2">Matching Habitations ({results.length}):</p>
              {results.map((h) => {
                const timeline = h.relocationTimeline || (h.hazardScore >= 75 ? 'Immediate' : h.hazardScore >= 50 ? 'Short-Term' : 'Medium-Term');
                return (
                  <button
                    key={h._id}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all hover:shadow-md ${priorityColor(timeline)}`}
                    onClick={() => setSelected(h)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-sm">{h.name}</p>
                          {h.redZone && (
                            <span className="badge badge-danger text-xs font-semibold">🔴 RED ZONE</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {h.taluka ? `${h.taluka}, ` : ''}{h.district} District · Pop: {(h.population || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <TimelineBadge timeline={timeline} />
                        <p className="text-xs text-slate-400 mt-1">Hazard: {h.hazardScore ?? h.risk_score ?? 70}/100</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {results.length === 0 && query && !searching && (
            <p className="mt-4 text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-lg">
              No matching habitations found in Maharashtra database. Try another search term.
            </p>
          )}
        </div>

        {/* Selected Habitation Details */}
        {selected && (
          <div className={`card p-6 border-2 shadow-md ${priorityColor(selected.relocationTimeline || 'Immediate')}`}>
            <div className="flex items-start justify-between pb-4 border-b border-slate-200/60">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">{selected.name}</h3>
                  {selected.redZone && (
                    <span className="badge badge-danger text-xs font-bold">🔴 Gazetted Red Zone</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selected.taluka ? `${selected.taluka} Taluka, ` : ''}{selected.district} District, Maharashtra
                </p>
              </div>
              <TimelineBadge timeline={selected.relocationTimeline || 'Immediate'} />
            </div>

            {/* Advisory alert */}
            <div className="mt-4 p-4 rounded-xl bg-white/90 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <span>📋</span> Public Safety Advisory
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                This habitation is situated in an identified <strong>{selected.primaryHazard || 'Compound Flood & Landslide'}</strong> exposure corridor.
                {selected.relocationTimeline === 'Immediate'
                  ? ' Pre-emptive evacuation preparations are recommended. Keep your emergency grab-bag ready and monitor local taluka authority broadcasts.'
                  : ' Planned relocation assessment is ongoing with the District Administration. Follow taluka officer guidelines.'}
              </p>
            </div>

            {/* Telemetry and Safe Shelter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/80 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Hazard Assessment</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Hazard Score:</span><strong>{selected.hazardScore ?? 78}/100</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Slope Gradient:</span><strong>{selected.slope || selected.terrain?.slope || 24}°</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Soil Saturation:</span><strong>{selected.soil_saturation || selected.telemetry?.soilMoisture || 80}%</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Access Road:</span><strong className="text-amber-700">{selected.accessRoad || 'Single Rural Road'}</strong></div>
                </div>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Designated Safe Center</p>
                <p className="text-sm font-bold text-slate-800">{selected.shelter_name || 'Taluka High-Ground Relief Shelter'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Capacity: <strong>{(selected.shelter_capacity || 2500).toLocaleString()} persons</strong>
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  ✓ Verified all-weather road connectivity & emergency medical point
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-200/60">
              <button
                onClick={() => setSelected(null)}
                className="btn btn-ghost text-xs"
              >
                ← Back to Search
              </button>
              <button
                onClick={() => navigate(`/habitation/${selected._id}`)}
                className="btn btn-primary text-xs py-2 px-4 shadow-xs"
              >
                View Technical Risk Dossier →
              </button>
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="card p-6 border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">
            📞 Maharashtra Emergency Response Helpline
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {emergencyNumbers.map((n) => (
              <div key={n.label} className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-blue-800">{n.number}</p>
                <p className="text-xs text-slate-600 mt-1 font-medium leading-tight">{n.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preparedness Guidelines */}
        <div className="card p-6 border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">
            🛡️ NDMA Citizen Disaster Preparedness Protocol
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {preparednessGuide.map((g, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-2xl flex-shrink-0">{g.icon}</span>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">{g.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
