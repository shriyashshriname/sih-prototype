import React from 'react';
import CandidateSiteCard from './CandidateSiteCard';
import WiderAlternatives from './WiderAlternatives';

export default function CandidateSiteList({
  matchingData,
  selectedSite,
  onSelectSite,
  onCompare,
}) {
  if (!matchingData) return null;

  const {
    searchSummaryText,
    evaluatedCount,
    nearbyCount,
    suitableCount,
    rejectedCount,
    rejectionBreakdown = {},
    candidates = [],
    widerAlternatives = [],
    excluded = [],
    whyReasons = [],
    whyNotReasons = [],
  } = matchingData;

  const recommendedSite = candidates.find((c) => c.isRecommended) || candidates[0];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* 1. Dynamic Search Summary Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 leading-relaxed shadow-xs">
        <div className="flex items-start gap-2">
          <span className="text-base flex-shrink-0">🎯</span>
          <div>
            <p className="font-bold text-blue-950">Local Relocation Radius Assessment</p>
            <p className="text-blue-800/90 mt-0.5">{searchSummaryText}</p>
          </div>
        </div>
      </div>

      {/* 2. Site Search Evaluation Summary */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-white border border-slate-200 rounded-lg p-2.5">
          <p className="text-slate-400 font-semibold text-[10px] uppercase">Evaluated</p>
          <p className="text-lg font-black text-slate-800">{evaluatedCount || candidates.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2.5">
          <p className="text-slate-400 font-semibold text-[10px] uppercase">≤ 25 km</p>
          <p className="text-lg font-black text-emerald-700">{nearbyCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2.5">
          <p className="text-slate-400 font-semibold text-[10px] uppercase">Suitable</p>
          <p className="text-lg font-black text-blue-700">{suitableCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2.5">
          <p className="text-slate-400 font-semibold text-[10px] uppercase">Rejected</p>
          <p className="text-lg font-black text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Rejection reasons pills */}
      {rejectedCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 px-1">
          <span className="font-semibold text-slate-600">Rejections:</span>
          {rejectionBreakdown.distance > 0 && (
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
              Distance &gt; 50 km ({rejectionBreakdown.distance})
            </span>
          )}
          {rejectionBreakdown.capacity > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-medium">
              Insufficient Capacity ({rejectionBreakdown.capacity})
            </span>
          )}
          {rejectionBreakdown.hazard > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 font-medium">
              High Hazard ({rejectionBreakdown.hazard})
            </span>
          )}
        </div>
      )}

      {/* 3. Primary Candidates List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
          <span>Prioritized Candidate Sites ({candidates.length})</span>
          <span className="text-[11px] text-emerald-700 font-semibold normal-case">
            ✓ Geographically Practical
          </span>
        </h4>

        {candidates.map((site) => {
          const isSelected = selectedSite?._id === site._id;
          const isTop = recommendedSite?._id === site._id;

          return (
            <div key={site._id} className="space-y-2">
              <CandidateSiteCard
                site={site}
                isSelected={isSelected}
                isTopRecommended={isTop}
                onSelect={() => onSelectSite(site)}
              />

              {/* If selected or recommended: show "Why Aegis recommends this site" */}
              {isTop && whyReasons.length > 0 && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1.5 shadow-xs">
                  <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <span>💡</span> Why Aegis Recommends This Site:
                  </p>
                  <ul className="space-y-1 text-emerald-900/90 pl-4 list-disc">
                    {whyReasons.map((reason, idx) => (
                      <li key={idx} className="leading-snug">{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        {/* 4. Why Not The Other Sites? (Transparency for judges) */}
        {whyNotReasons.length > 0 && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 mt-3">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <span>⚖️</span> Comparative Evaluation Notes:
            </p>
            <div className="space-y-1 text-slate-600">
              {whyNotReasons.map((item) => (
                <p key={item.siteId} className="text-[11px]">
                  • <strong>{item.siteName}:</strong> {item.reason}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 5. Collapsible Wider Alternatives */}
        <WiderAlternatives
          widerAlternatives={widerAlternatives}
          excluded={excluded}
          onSelectSite={onSelectSite}
        />
      </div>

      {/* Advance Button */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Selected: <strong className="text-slate-800">{selectedSite?.name || recommendedSite?.name}</strong>
        </span>
        <button
          type="button"
          onClick={onCompare}
          className="btn btn-primary text-xs py-2 px-4 shadow-sm flex items-center gap-1.5"
        >
          <span>📊</span> Compare Selected Sites →
        </button>
      </div>
    </div>
  );
}
