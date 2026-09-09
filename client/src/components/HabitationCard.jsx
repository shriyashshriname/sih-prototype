import React from 'react';
import { useNavigate } from 'react-router-dom';
import TimelineBadge from './TimelineBadge';

const hazardColor = (cat) => cat === 'Very High' ? '#dc2626' : cat === 'High' ? '#ea580c' : cat === 'Moderate' ? '#d97706' : '#16a34a';

export default function HabitationCard({ habitation, compact = false }) {
  const navigate = useNavigate();
  const { _id, displayName, name, district, population, hazardScore, hazardCategory, relocationTimeline, relocationPriorityScore, redZoneStatus } = habitation;
  const color = hazardColor(hazardCategory);

  return (
    <div
      className="card p-4 cursor-pointer hover:shadow-md transition-all duration-200 anim-up"
      style={{ borderLeft: `3px solid ${color}` }}
      onClick={() => navigate(`/habitation/${_id}`)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/habitation/${_id}`)}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">{displayName || name}</p>
          <p className="text-xs text-slate-500">{district} · {population?.toLocaleString()} pop.</p>
        </div>
        {redZoneStatus && (
          <span className="badge badge-vhigh flex-shrink-0 text-xs">🔴 Red Zone</span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Hazard</span>
            <span className="font-semibold" style={{ color }}>{hazardScore}/100</span>
          </div>
          <div className="cap-bar">
            <div className="cap-bar-fill" style={{ width: `${hazardScore}%`, background: color }} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <TimelineBadge timeline={relocationTimeline} size="sm" />
        {!compact && (
          <span className="text-xs text-slate-400">Priority {relocationPriorityScore}/100</span>
        )}
      </div>
    </div>
  );
}
