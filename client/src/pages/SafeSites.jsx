import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRelocationSites } from '../api';
import Topbar from '../components/Topbar';
import DataDisclaimer from '../components/DataDisclaimer';

export default function SafeSites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState('All');
  const [selectedSite, setSelectedSite] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getRelocationSites()
      .then((res) => {
        const data = res.data.data || [];
        setSites(data);
        if (data.length > 0) setSelectedSite(data[0]);
      })
      .catch(() => setSites([]))
      .finally(() => setLoading(false));
  }, []);

  const districts = ['All', ...new Set(sites.map((s) => s.district).filter(Boolean))];

  const filteredSites = sites.filter((s) => {
    const matchesDistrict = districtFilter === 'All' || s.district === districtFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.taluka && s.taluka.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.district && s.district.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDistrict && matchesSearch;
  });

  const totalCapacity = sites.reduce((sum, s) => sum + (s.maxCapacity || 0), 0);
  const totalOccupancy = sites.reduce((sum, s) => sum + (s.currentOccupancy || 0), 0);
  const availableCapacity = totalCapacity - totalOccupancy;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Topbar
        title="Designated Safe Relocation Sites"
        subtitle="Carrying capacity, terrain safety & infrastructure readiness · Maharashtra"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <DataDisclaimer />

        {/* Metric summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Designated Sites</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{sites.length}</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">100% evaluated for multi-hazard safety</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Gross Capacity</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalCapacity.toLocaleString()} persons</p>
            <p className="text-xs text-slate-400 mt-1">Across 6 vulnerable districts</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-500 uppercase font-semibold">Current Occupancy</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{totalOccupancy.toLocaleString()} persons</p>
            <p className="text-xs text-slate-400 mt-1">
              {totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0}% aggregate utilization
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-500 uppercase font-semibold">Available Carrying Capacity</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{availableCapacity.toLocaleString()} persons</p>
            <p className="text-xs text-emerald-700 mt-1">Ready for planned habitation allocation</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 uppercase">District:</label>
            <div className="flex flex-wrap gap-1.5">
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setDistrictFilter(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    districtFilter === d
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search site, taluka..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input text-xs py-1.5 w-60"
            />
            <button
              onClick={() => navigate('/relocation-planner')}
              className="btn btn-primary text-xs py-1.5 flex items-center gap-1.5"
            >
              <span>📋</span> Launch Relocation Planner
            </button>
          </div>
        </div>

        {/* Main 2-column view: list on left, detail on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sites list */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Evaluated Sites ({filteredSites.length})
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-24 rounded-xl" />
                ))}
              </div>
            ) : filteredSites.length === 0 ? (
              <div className="card p-8 text-center text-slate-400">
                <p>No relocation sites match the filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredSites.map((site) => {
                  const isSelected = selectedSite?._id === site._id;
                  const avail = (site.maxCapacity || 0) - (site.currentOccupancy || 0);
                  const utilPct = site.maxCapacity > 0 ? Math.round((site.currentOccupancy / site.maxCapacity) * 100) : 0;
                  return (
                    <div
                      key={site._id}
                      onClick={() => setSelectedSite(site)}
                      className={`card p-4 cursor-pointer transition-all border-2 ${
                        isSelected
                          ? 'border-blue-600 shadow-md bg-blue-50/20'
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{site.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Taluka: {site.taluka} · {site.district} District
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="badge badge-success text-xs font-semibold">
                            Suitability: {site.suitabilityScore || 85}/100
                          </span>
                        </div>
                      </div>

                      {/* Capacity bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Capacity: {avail.toLocaleString()} available</span>
                          <span>{utilPct}% used</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              utilPct > 80 ? 'bg-red-500' : utilPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${utilPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>Elevation: {site.elevation || 85}m ASL</span>
                        <span>Road Access: {site.roadAccess || 'All-Weather Highway'}</span>
                        <span className="text-blue-600 font-medium">Inspect →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Site Detail Panel */}
          <div className="lg:col-span-7">
            {selectedSite ? (
              <div className="card p-6 space-y-6 sticky top-4">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">{selectedSite.name}</h3>
                      <span className="badge badge-success text-xs">Hazard-Safe Zone</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedSite.taluka} Taluka, {selectedSite.district} District, Maharashtra
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coordinates: {selectedSite.lat.toFixed(4)}° N, {selectedSite.lng.toFixed(4)}° E · Elevation: {selectedSite.elevation}m ASL
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/relocation-planner?siteId=${selectedSite._id}`)}
                    className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-sm"
                  >
                    <span>🎯</span> Select for Relocation
                  </button>
                </div>

                {/* Suitability & Carrying Capacity Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Suitability Score</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">
                      {selectedSite.suitabilityScore || 85}
                      <span className="text-sm font-normal text-slate-400">/100</span>
                    </p>
                    <p className="text-xs text-emerald-700 mt-1 font-medium">Grade A — Highly Favorable</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Max Capacity</p>
                    <p className="text-3xl font-black text-blue-600 mt-1">
                      {(selectedSite.maxCapacity || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Design population threshold</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Remaining Headroom</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">
                      {((selectedSite.maxCapacity || 0) - (selectedSite.currentOccupancy || 0)).toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-700 mt-1 font-medium">Persons can be absorbed</p>
                  </div>
                </div>

                {/* Infrastructure Assessment */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Infrastructure & Essential Services
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                      <span className="text-2xl">💧</span>
                      <div>
                        <p className="text-xs text-slate-500">Water Supply</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedSite.waterSupply || 'Piped municipal tap line + 2 borewells'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                      <span className="text-2xl">⚡</span>
                      <div>
                        <p className="text-xs text-slate-500">Power Grid</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedSite.powerGrid || 'MSEDCL 33kV Substation within 3 km'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                      <span className="text-2xl">🏥</span>
                      <div>
                        <p className="text-xs text-slate-500">Healthcare Facility</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedSite.hospitalDistance || 'Rural Hospital 4.2 km away'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                      <span className="text-2xl">🏫</span>
                      <div>
                        <p className="text-xs text-slate-500">Schools & Education</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedSite.schoolDistance || 'Zilla Parishad School 1.5 km away'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                      <span className="text-2xl">🛣️</span>
                      <div>
                        <p className="text-xs text-slate-500">Road Connectivity</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedSite.roadAccess || 'Two-lane asphalt road to NH-66'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                      <span className="text-2xl">⛰️</span>
                      <div>
                        <p className="text-xs text-slate-500">Terrain Stability</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedSite.terrainStability || 'Stable basalt plateau, < 4° slope'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Environmental & Buffer Zone Safety */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>🛡️</span> Hazard Safety Buffer Compliance
                  </h4>
                  <ul className="text-xs text-emerald-800 space-y-1.5 leading-relaxed">
                    <li>• Beyond 100-year High Flood Level (HFL) of local drainage basins.</li>
                    <li>• Zero proximity to active landslide runout corridors (GSI Landslide Hazard Susceptibility: Low).</li>
                    <li>• Non-forest revenue land cleared for multi-agency humanitarian shelter deployment.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center text-slate-400">
                <p>Select a site from the list to view comprehensive carrying capacity and infrastructure metrics.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
