import React, { useState } from 'react';

const colorMap = {
  hazardExposure:          '#dc2626',
  populationVulnerability: '#ea580c',
  historicalExposure:      '#d97706',
  infrastructureRisk:      '#7c3aed',
  accessibilityRisk:       '#0ea5e9',
  flood:                   '#3b82f6',
  landslide:               '#8b5cf6',
  erosion:                 '#f59e0b',
  extremeRainfall:         '#06b6d4',
  terrain:                 '#10b981',
  populationDensity:       '#f97316',
  socialVulnerability:     '#ec4899',
  infrastructureExposure:  '#6366f1',
  housingFragility:        '#ef4444',
  evacuationAccessibility: '#14b8a6',
  historicalDisaster:      '#f59e0b',
  hazardSafety:            '#16a34a',
  carryingCapacity:        '#2563eb',
  roadAccessibility:       '#0ea5e9',
  healthcareAccess:        '#dc2626',
  educationAccess:         '#7c3aed',
};

const DEFAULT_COLOR = '#64748b';

export default function ExplainabilityPanel({ factors = [], title = 'Why this assessment?', formulaNote }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? factors : factors.slice(0, 4);

  return (
    <div>
      {title && <p className="section-title mb-3">{title}</p>}
      <div className="space-y-4">
        {visible.map((f) => {
          const color = colorMap[f.key] || DEFAULT_COLOR;
          const pct = Math.round((f.normalised ?? f.score / 100) * 100);
          return (
            <div key={f.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{f.label}</span>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {f.value !== undefined && <span>{f.value}{f.unit ? ` ${f.unit}` : ''}</span>}
                  {f.score !== undefined && <span className="font-semibold text-slate-600">Score: {f.score}</span>}
                  <span className="font-semibold" style={{ color }}>+{f.contribution} pts</span>
                </div>
              </div>
              <div className="cap-bar">
                <div
                  className="cap-bar-fill"
                  style={{ width: `${Math.min(100, f.score ?? pct)}%`, background: color }}
                />
              </div>
              <p className="text-xs text-slate-400">Weight: {Math.round(f.weight * 100)}%</p>
            </div>
          );
        })}
      </div>

      {factors.length > 4 && (
        <button
          className="text-xs text-blue-600 hover:underline mt-3"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? '↑ Show less' : `↓ Show all ${factors.length} factors`}
        </button>
      )}

      {formulaNote && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
          <strong>Formula:</strong> {formulaNote}
          <p className="mt-1 text-slate-400">Prototype demonstration weighting — replace with validated methodology for deployment.</p>
        </div>
      )}
    </div>
  );
}
