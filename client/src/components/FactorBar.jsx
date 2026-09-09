import React from 'react';

const colorMap = {
  rainfall:             '#3b82f6',
  river_level:          '#0ea5e9',
  elevation:            '#8b5cf6',
  historical_incidents: '#f59e0b',
  soil_saturation:      '#10b981',
};

export default function FactorBar({ factor }) {
  const { label, value, unit, normalised, contribution, weight } = factor;
  const pct = Math.round(normalised * 100);
  const color = colorMap[factor.key] || '#64748b';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            {value} {unit}
          </span>
          <span className="font-semibold" style={{ color }}>
            +{contribution.toFixed(1)} pts
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="text-xs text-slate-400">
        Weight: {(weight * 100).toFixed(0)}% · Severity: {pct}%
      </p>
    </div>
  );
}
