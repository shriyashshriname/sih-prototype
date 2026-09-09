import React, { useState } from 'react';

export default function WiderAlternatives({ widerAlternatives = [], excluded = [], onSelectSite }) {
  const [isOpen, setIsOpen] = useState(false);

  if ((!widerAlternatives || widerAlternatives.length === 0) && (!excluded || excluded.length === 0)) {
    return null;
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 mt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-100/80 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{isOpen ? '▼' : '▶'}</span>
          <span className="uppercase tracking-wider">Wider Alternatives & Excluded Candidates</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
            {(widerAlternatives?.length || 0) + (excluded?.length || 0)}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-normal">
          {isOpen ? 'Hide distant sites' : 'Inspect rejected/distant sites for full transparency'}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 bg-white">
          <p className="text-xs text-slate-500 italic pb-2 border-b border-slate-100">
            ⚠️ The following candidate sites were excluded from the primary recommendation list in accordance with Aegis geographic feasibility and capacity rules:
          </p>

          <div className="space-y-2">
            {widerAlternatives.map((site) => (
              <div
                key={site._id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{site.name}</span>
                    <span className="text-slate-400">({site.district})</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {site.distanceKm} km from source
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1 font-medium flex items-center gap-1">
                    <span>⚠</span> Excluded from primary recommendations: Exceeds 50 km local planning radius
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">
                    Available: <strong>{(site.availableCapacity || 0).toLocaleString()}</strong>
                  </span>
                  {onSelectSite && (
                    <button
                      type="button"
                      onClick={() => onSelectSite(site)}
                      className="btn btn-ghost text-[11px] py-1 px-2.5 border border-slate-200 hover:bg-slate-100"
                    >
                      Inspect Anyway →
                    </button>
                  )}
                </div>
              </div>
            ))}

            {excluded.map((item, i) => (
              <div
                key={i}
                className="p-2.5 bg-red-50/50 border border-red-200 rounded-lg flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-red-900">{item.name}</span>
                  <span className="text-red-700 text-[11px] ml-2">({item.district})</span>
                  <p className="text-[11px] text-red-600 mt-0.5">
                    ✕ {item.rejectionReason}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  Rejected
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
