import React from 'react';

const categoryMap = {
  'Low':       { cls: 'risk-low',       label: 'Low Risk' },
  'Moderate':  { cls: 'risk-moderate',  label: 'Moderate Risk' },
  'High':      { cls: 'risk-high',      label: 'High Risk' },
  'Very High': { cls: 'risk-very-high', label: 'Very High Risk' },
};

export default function RiskBadge({ category, score, size = 'md' }) {
  const map = categoryMap[category] || categoryMap['Low'];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${padding} ${map.cls}`}>
      <span
        className="inline-block rounded-full"
        style={{ width: 8, height: 8, background: 'currentColor', opacity: 0.7 }}
      />
      {map.label}
      {score !== undefined && <span className="opacity-70 font-normal">({score})</span>}
    </span>
  );
}
