import React from 'react';

export default function DataDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 font-medium">
        ⚠ Maharashtra Demonstration · Synthetic Data
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-amber-800 text-xs">
      <span className="text-base flex-shrink-0">⚠️</span>
      <p>
        <strong>Maharashtra Demonstration Dataset</strong> · All numerical values are synthetic prototype data.
        Not for operational decision-making. AI-assisted recommendations require human authority validation.
      </p>
    </div>
  );
}
