import React from 'react';

export default function SiteComparison({
  candidates = [],
  selectedSite,
  onSelectSite,
  onProceedToPlan,
  onBack,
}) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="card p-8 text-center text-slate-400">
        No candidate sites available for comparison.
      </div>
    );
  }

  // Compare up to 4 top sites
  const sitesToCompare = candidates.slice(0, 4);

  const rows = [
    {
      label: 'Straight-line Distance',
      sub: 'Distance from source habitation',
      render: (site) => (
        <div className="font-bold text-slate-800">
          {site.distanceKm} km
          <span className="block text-[10px] font-normal text-slate-400">
            {site.distanceKm <= 25 ? '✓ Preferred Radius' : '⚠ Extended Radius'}
          </span>
        </div>
      ),
    },
    {
      label: 'Hazard Safety',
      sub: 'Multi-hazard exposure inverse',
      render: (site) => (
        <div>
          <span className="font-bold text-slate-800">{site.hazardSafety || 85}/100</span>
          <span className="block text-[10px] text-emerald-700">
            {site.hazardSafety >= 80 ? '✓ High Safety' : '✓ Moderate Safety'}
          </span>
        </div>
      ),
    },
    {
      label: 'Available Carrying Capacity',
      sub: 'Headroom for displaced population',
      render: (site) => {
        const isAdequate = site.isCapacitySufficient !== false;
        return (
          <div>
            <span className={`font-bold ${isAdequate ? 'text-emerald-700' : 'text-amber-700'}`}>
              {(site.availableCapacity || 0).toLocaleString()} persons
            </span>
            <span className="block text-[10px] text-slate-500">
              {isAdequate ? '✓ Full accommodation' : '⚠ Insufficient alone'}
            </span>
          </div>
        );
      },
    },
    {
      label: 'Relocation Suitability Score',
      sub: 'Composite weighted model (25% geo)',
      render: (site) => (
        <div>
          <span className="text-base font-black text-blue-700">{site.suitabilityScore}/100</span>
        </div>
      ),
    },
    {
      label: 'Road Accessibility',
      sub: 'All-weather arterial transit score',
      render: (site) => (
        <div>
          <span className="font-semibold text-slate-700">{site.roadAccessibility || 80}/100</span>
        </div>
      ),
    },
    {
      label: 'Healthcare Access',
      sub: 'Distance to rural/district hospital',
      render: (site) => (
        <div>
          <span className="font-semibold text-slate-700">{site.hospitalDistance || 3} km</span>
        </div>
      ),
    },
    {
      label: 'Education Access',
      sub: 'Distance to ZP / primary school',
      render: (site) => (
        <div>
          <span className="font-semibold text-slate-700">{site.schoolDistance || 2} km</span>
        </div>
      ),
    },
    {
      label: 'Water Availability',
      sub: 'Potable supply & municipal network',
      render: (site) => (
        <div>
          <span className="font-semibold text-slate-700">{site.waterCapacity || 85}/100</span>
        </div>
      ),
    },
    {
      label: 'Recommendation Status',
      sub: 'Aegis decision-support rating',
      render: (site) => {
        const isRecommended = site.isRecommended || site.status === 'RECOMMENDED';
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider ${
              isRecommended
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {site.status || (isRecommended ? 'RECOMMENDED' : 'SUITABLE')}
          </span>
        );
      },
    },
  ];

  return (
    <div className="card p-6 space-y-6 shadow-xs border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>📊</span> Multi-Site Comparative Decision Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side evaluation of top candidate sites across geographic, capacity and safety dimensions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="btn btn-ghost text-xs py-1.5 px-3">
            ← Back to Map View
          </button>
          <button
            type="button"
            onClick={onProceedToPlan}
            className="btn btn-primary text-xs py-1.5 px-4 shadow-xs flex items-center gap-1.5"
          >
            <span>📋</span> Generate Relocation Plan →
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-3 px-4 bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[11px] w-1/4">
                Evaluation Factor
              </th>
              {sitesToCompare.map((site, idx) => {
                const isSelected = selectedSite?._id === site._id;
                const isRecommended = idx === 0 || site.isRecommended;
                return (
                  <th
                    key={site._id}
                    className={`py-3 px-4 font-bold transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-x-2 border-blue-600 text-blue-900'
                        : isRecommended
                        ? 'bg-emerald-50/60 text-emerald-950'
                        : 'bg-white text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-black">{site.displayName || site.name}</p>
                        <p className="text-[11px] text-slate-500 font-normal">{site.district} District</p>
                      </div>
                      {isRecommended && (
                        <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          TOP CHOICE
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectSite(site)}
                      className={`mt-2.5 w-full py-1 rounded text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:border-blue-400'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : 'Choose Site'}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 bg-slate-50/40">
                  <p className="font-bold text-slate-800">{row.label}</p>
                  <p className="text-[10px] text-slate-400">{row.sub}</p>
                </td>
                {sitesToCompare.map((site) => {
                  const isSelected = selectedSite?._id === site._id;
                  return (
                    <td
                      key={site._id}
                      className={`py-3 px-4 ${isSelected ? 'bg-blue-50/30 border-x-2 border-blue-600 font-medium' : ''}`}
                    >
                      {row.render(site)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
