import React from 'react';

export default function RelocationHeader({ scenarios = [], activeScenarioId, onSelectScenario }) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-base font-bold shadow-xs">
              🧭
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Relocation Planner</h1>
              <p className="text-xs text-slate-500">
                AI-assisted selection of geographically practical and safer relocation sites.
              </p>
            </div>
          </div>
        </div>

        {/* Demo badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Maharashtra Demo
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            Synthetic Data
          </span>
        </div>
      </div>

      {/* Demo scenario quick selector */}
      {scenarios.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <span>🎯</span> Quick Demo Scenario:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {scenarios.map((sc) => {
              const isActive = activeScenarioId === sc._id;
              return (
                <button
                  key={sc._id}
                  onClick={() => onSelectScenario(sc)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sc.label || sc.name} ({sc.district})
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
