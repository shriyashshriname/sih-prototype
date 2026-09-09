import React from 'react';

export default function CapacitySummary({
  site,
  population = 1000,
  multiSiteStrategy,
}) {
  if (!site) return null;

  const maxCap = site.maxCapacity || 0;
  const currentOcc = site.currentOccupancy || 0;
  const reserved = site.reservedCapacity || 0;
  const available = site.availableCapacity ?? Math.max(0, maxCap - currentOcc - reserved);
  const isAdequate = available >= population;
  const remainingAfterRelocation = Math.max(0, available - population);

  // Utilization calculation
  const totalPlannedLoad = currentOcc + population;
  const utilizationPct = maxCap > 0 ? Math.min(100, Math.round((totalPlannedLoad / maxCap) * 100)) : 0;

  return (
    <div className="card p-5 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-2">
            <span>🏠</span> Carrying Capacity Absorption Assessment
          </h4>
          <p className="text-xs text-slate-500">
            Destination: <strong>{site.displayName || site.name}</strong> ({site.district} District)
          </p>
        </div>
        <div>
          {isAdequate ? (
            <span className="badge badge-success text-xs font-bold flex items-center gap-1">
              <span>✓</span> Sufficient for Full Relocation
            </span>
          ) : (
            <span className="badge badge-warning text-xs font-bold flex items-center gap-1">
              <span>⚠</span> Insufficient Single-Site Capacity
            </span>
          )}
        </div>
      </div>

      {/* 3 Number Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Population to Relocate</p>
          <p className="text-xl font-black text-slate-900 mt-1">{population.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Displaced residents</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Available Headroom</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{available.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Max: {maxCap.toLocaleString()} (Occ: {currentOcc})</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Remaining Buffer Capacity</p>
          <p className="text-xl font-black text-blue-700 mt-1">{remainingAfterRelocation.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Safety reserve preserved</p>
        </div>
      </div>

      {/* Horizontal Utilization Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Destination Capacity Utilization:</span>
          <span className="font-extrabold text-slate-900">{utilizationPct}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              utilizationPct > 85 ? 'bg-red-500' : utilizationPct > 65 ? 'bg-blue-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${utilizationPct}%` }}
          />
        </div>
      </div>

      {/* Multi-site Split Relocation (if population exceeds or advanced strategy present) */}
      {multiSiteStrategy && (
        <div className="mt-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🔀</span>
            <span className="font-extrabold text-purple-950 uppercase tracking-wide">
              {multiSiteStrategy.title}
            </span>
          </div>
          <p className="text-purple-900">{multiSiteStrategy.description}</p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white/80 p-2.5 rounded-lg border border-purple-200">
              <p className="font-bold text-slate-800">{multiSiteStrategy.siteA.name}</p>
              <p className="text-slate-500 text-[11px]">{multiSiteStrategy.siteA.distanceKm} km from source</p>
              <p className="text-purple-700 font-bold mt-1">
                Allocate: {multiSiteStrategy.siteA.allocatedPopulation.toLocaleString()} people
              </p>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-purple-200">
              <p className="font-bold text-slate-800">{multiSiteStrategy.siteB.name}</p>
              <p className="text-slate-500 text-[11px]">{multiSiteStrategy.siteB.distanceKm} km from source</p>
              <p className="text-purple-700 font-bold mt-1">
                Allocate: {multiSiteStrategy.siteB.allocatedPopulation.toLocaleString()} people
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
