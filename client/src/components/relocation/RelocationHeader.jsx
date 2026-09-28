import React from 'react';

export default function RelocationHeader({ scenarios = [], activeScenarioId, onSelectScenario }) {
  return (
    <div className="bg-slate-900 border-b border-slate-700/60 px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-1/3 w-[500px] h-full bg-gradient-to-r from-transparent via-sky-500/5 to-transparent pointer-events-none" />
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-lg shadow-[0_0_10px_rgba(56,189,248,0.3)] border border-sky-400/30">
              🧭
            </div>
            <div>
              <h1 className="text-xl font-tech font-bold text-white tracking-wide uppercase">Relocation Planner</h1>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                AI-assisted selection of geographically practical and safer relocation sites.
              </p>
            </div>
          </div>
        </div>

        {/* Demo badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-cyber font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse" />
            Maharashtra Environment
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-cyber font-bold uppercase tracking-wider">
            Live OSRM Routing
          </span>
        </div>
      </div>

      {/* Demo scenario quick selector */}
      {scenarios.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-3 flex-wrap relative z-10">
          <span className="text-xs font-tech font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>🎯</span> Quick Demo Scenario:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {scenarios.map((sc) => {
              const isActive = activeScenarioId === sc._id;
              return (
                <button
                  key={sc._id}
                  onClick={() => onSelectScenario(sc)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-cyber font-bold transition-all uppercase tracking-wider border ${
                    isActive
                      ? 'bg-sky-500/20 border-sky-500 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-500'
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
