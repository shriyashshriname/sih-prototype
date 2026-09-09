import React from 'react';
import TimelineBadge from '../TimelineBadge';

export default function SourceHabitationCard({ habitation, onReselect, compact = false }) {
  if (!habitation) return null;

  const timeline = habitation.relocationTimeline || 'Immediate';

  if (compact) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
            📍
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm">{habitation.name}</h3>
              <TimelineBadge timeline={timeline} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {habitation.district} District · Population: <strong>{(habitation.population || 0).toLocaleString()}</strong> residents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div>
            <span className="text-slate-400">Preferred Radius:</span>{' '}
            <strong className="text-slate-700">25 km</strong>
          </div>
          <div>
            <span className="text-slate-400">Search Mode:</span>{' '}
            <strong className="text-emerald-700">Local Area First</strong>
          </div>
          {onReselect && (
            <button
              onClick={onReselect}
              className="text-blue-600 hover:text-blue-700 font-semibold ml-2 underline"
            >
              Change
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 border border-slate-200 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold">
              🔴
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900">{habitation.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {habitation.taluka ? `${habitation.taluka} Taluka, ` : ''}{habitation.district} District, Maharashtra
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TimelineBadge timeline={timeline} />
          {onReselect && (
            <button
              onClick={onReselect}
              className="btn btn-ghost text-xs py-1 px-2.5"
            >
              ← Change Habitation
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-slate-400 uppercase font-semibold text-[10px]">Population</p>
          <p className="font-bold text-slate-800 text-sm mt-0.5">{(habitation.population || 0).toLocaleString()} residents</p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-slate-400 uppercase font-semibold text-[10px]">Priority Score</p>
          <p className="font-bold text-red-600 text-sm mt-0.5">{habitation.relocationPriorityScore || 85} / 100</p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-slate-400 uppercase font-semibold text-[10px]">Preferred Radius</p>
          <p className="font-bold text-emerald-700 text-sm mt-0.5">0–25 km (Local First)</p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-slate-400 uppercase font-semibold text-[10px]">Primary Hazards</p>
          <p className="font-bold text-slate-700 text-sm mt-0.5 truncate">
            {habitation.primaryHazard || 'Landslide + Extreme Rain'}
          </p>
        </div>
      </div>
    </div>
  );
}
