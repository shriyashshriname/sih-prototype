import React from 'react';

export default function CandidateSiteCard({
  site,
  isSelected,
  onSelect,
  isTopRecommended = false,
}) {
  const isCapAdequate = site.isCapacitySufficient !== false;
  const isRecommended = isTopRecommended || site.isRecommended || site.status === 'RECOMMENDED';

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl cursor-pointer transition-all border-2 text-left relative ${
        isSelected
          ? 'border-blue-600 bg-blue-50/20 shadow-md ring-2 ring-blue-500/20'
          : isRecommended
          ? 'border-emerald-300 bg-emerald-50/10 hover:border-emerald-400 shadow-xs'
          : 'border-slate-200 hover:border-slate-300 bg-white shadow-xs'
      }`}
    >
      {/* Header with Site Name and Badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">
              {site.displayName || site.name}
            </h4>
            {isRecommended ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                RECOMMENDED
              </span>
            ) : (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  site.status === 'INSUFFICIENT CAPACITY'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {site.status || 'SUITABLE'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {site.district} District · <strong className="text-blue-700 font-semibold">{site.distanceKm} km from source habitation</strong>
          </p>
        </div>

        {/* Score pill */}
        <div className="text-right flex-shrink-0">
          <span className="text-xl font-black text-slate-900 leading-none">
            {site.suitabilityScore}
          </span>
          <span className="text-[10px] text-slate-400 block font-normal -mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Key metric bullets */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-2.5 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className={isCapAdequate ? 'text-emerald-600' : 'text-amber-600 font-bold'}>
            {isCapAdequate ? '✓' : '⚠'}
          </span>
          <span className="text-slate-600 truncate">
            <strong>{(site.availableCapacity || 0).toLocaleString()}</strong> capacity available
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-emerald-600">✓</span>
          <span className="text-slate-600 truncate">
            Safety: <strong>{site.hazardSafety || 88}/100</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-blue-600">🛣️</span>
          <span className="text-slate-600 truncate">
            Road Access: <strong>{site.roadAccessibility || 80}/100</strong>
          </span>
        </div>
      </div>

      {/* Selection action button */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[11px] text-slate-400">
          Hospital: {site.hospitalDistance || 2} km · School: {site.schoolDistance || 1.5} km
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            isSelected
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white'
          }`}
        >
          {isSelected ? '✓ Selected' : 'Select Site →'}
        </button>
      </div>
    </div>
  );
}
