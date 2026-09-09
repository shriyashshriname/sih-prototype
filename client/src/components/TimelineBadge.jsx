import React from 'react';

const timelineMap = {
  'Immediate':   { cls: 'timeline-immediate', label: 'IMMEDIATE',   dot: '🔴', days: '0–7 days' },
  'Short-Term':  { cls: 'timeline-short',     label: 'SHORT-TERM',  dot: '🟠', days: '1–3 months' },
  'Medium-Term': { cls: 'timeline-medium',    label: 'MEDIUM-TERM', dot: '🟡', days: '3–12 months' },
  'Monitor':     { cls: 'timeline-monitor',   label: 'MONITOR',     dot: '🟢', days: 'Ongoing' },
};

export default function TimelineBadge({ timeline, showDays = false, size = 'md' }) {
  const cfg = timelineMap[timeline] || timelineMap['Monitor'];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';
  return (
    <span className={`badge font-bold ${cfg.cls} ${pad}`}>
      {cfg.dot} {cfg.label}
      {showDays && <span className="font-normal opacity-70 ml-1">({cfg.days})</span>}
    </span>
  );
}
