import React from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from './RiskBadge';

export default function VillageCard({ village }) {
  const navigate = useNavigate();
  const { _id, name, district, population, risk_score, risk_category, rainfall, river_level } = village;

  return (
    <div
      className="card p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fadeInUp"
      onClick={() => navigate(`/village/${_id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/village/${_id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">{name}</h3>
          <p className="text-xs text-slate-500">{district} District</p>
        </div>
        <RiskBadge category={risk_category} score={risk_score} size="sm" />
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Risk Score</span>
          <span className="font-semibold text-slate-700">{risk_score}/100</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${risk_score}%`,
              background:
                risk_category === 'Very High'
                  ? '#dc2626'
                  : risk_category === 'High'
                  ? '#ea580c'
                  : risk_category === 'Moderate'
                  ? '#ca8a04'
                  : '#16a34a',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-1.5 bg-slate-50 rounded-md">
          <p className="font-semibold text-slate-700">{population.toLocaleString()}</p>
          <p className="text-slate-400">Population</p>
        </div>
        <div className="text-center p-1.5 bg-blue-50 rounded-md">
          <p className="font-semibold text-blue-700">{rainfall} mm</p>
          <p className="text-slate-400">Rainfall</p>
        </div>
        <div className="text-center p-1.5 bg-indigo-50 rounded-md">
          <p className="font-semibold text-indigo-700">{river_level} m</p>
          <p className="text-slate-400">River Lvl</p>
        </div>
      </div>
    </div>
  );
}
