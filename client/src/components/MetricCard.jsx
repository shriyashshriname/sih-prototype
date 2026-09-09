import React from 'react';

export default function MetricCard({ icon, label, value, sub, color = '#1a3a6b', trend }) {
  return (
    <div className="card p-5 flex items-start gap-4 animate-fadeInUp">
      <div
        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
        style={{ background: color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
