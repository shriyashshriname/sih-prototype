import React from 'react';
import TimelineBadge from '../TimelineBadge';

export default function RelocationPlanView({
  plan,
  sourceHabitation,
  targetSite,
  onSubmitForReview,
  isSubmitting,
  onBack,
}) {
  const population = plan?.population || sourceHabitation?.population || 1680;
  const distanceKm = plan?.distanceKm || targetSite?.distanceKm || 18;
  const timeline = plan?.timeline || sourceHabitation?.relocationTimeline || 'Immediate';
  const siteCapacity = plan?.availableCapacity || targetSite?.availableCapacity || 2400;
  const utilization = plan?.utilizationPct || targetSite?.utilizationPct || 70;

  const agencies = plan?.agencies || [
    'District Administration',
    'Police',
    'Health Department',
    'Public Works Department (PWD)',
    'NDRF / SDRF',
    'Local Administration',
  ];

  const actions = plan?.actions || [
    { step: 1, action: 'Validate site ground elevation and soil stability', agency: 'District Administration / GSI' },
    { step: 2, action: 'Identify and register all vulnerable households', agency: 'Revenue Department' },
    { step: 3, action: 'Prepare dedicated all-weather arterial transport corridor', agency: 'Police / State Transport' },
    { step: 4, action: 'Prepare emergency mobile medical units and transit aid', agency: 'Health Department' },
    { step: 5, action: 'Coordinate systematic phased evacuation (vulnerable first)', agency: 'NDRF/SDRF + District Collectorate' },
    { step: 6, action: 'Establish post-relocation shelter registration and rations', agency: 'Local Administration' },
  ];

  return (
    <div className="card p-6 border border-slate-200 shadow-xs space-y-6">
      {/* Plan Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            STRATEGIC RELOCATION PLAN
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2 flex-wrap">
            <span>{sourceHabitation?.displayName || sourceHabitation?.name}</span>
            <span className="text-slate-400">→</span>
            <span className="text-emerald-700">{targetSite?.displayName || targetSite?.name}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Target District: <strong>{targetSite?.district}</strong> · Planning Radius Band:{' '}
            <strong>{distanceKm <= 25 ? 'Preferred Local (≤25 km)' : 'Extended Area (≤50 km)'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TimelineBadge timeline={timeline} />
          {onBack && (
            <button type="button" onClick={onBack} className="btn btn-ghost text-xs py-1.5 px-3">
              ← Change Site
            </button>
          )}
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Population</p>
          <p className="text-lg font-black text-slate-900 mt-0.5">{population.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Displaced citizens</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Planning Distance</p>
          <p className="text-lg font-black text-blue-700 mt-0.5">{distanceKm} km</p>
          <p className="text-[10px] text-slate-500">Straight-line</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Urgency Tier</p>
          <p className="text-lg font-black text-red-600 mt-0.5">{timeline.toUpperCase()}</p>
          <p className="text-[10px] text-slate-500">0–7 Days Action</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Site Available</p>
          <p className="text-lg font-black text-emerald-700 mt-0.5">{siteCapacity.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Headroom</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Utilization</p>
          <p className="text-lg font-black text-slate-800 mt-0.5">{utilization}%</p>
          <p className="text-[10px] text-slate-500">Capacity absorbed</p>
        </div>
      </div>

      {/* Required Agencies */}
      <div>
        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <span>🏛️</span> Designated Inter-Agency Response Network
        </h4>
        <div className="flex flex-wrap gap-2">
          {agencies.map((agency) => (
            <span
              key={agency}
              className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold"
            >
              {agency}
            </span>
          ))}
        </div>
      </div>

      {/* 6-Step Action Plan */}
      <div className="space-y-3">
        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <span>📋</span> Phased Relocation Execution Protocol
        </h4>
        <div className="space-y-2">
          {actions.map((act) => (
            <div
              key={act.step}
              className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center flex-shrink-0">
                  {act.step}
                </span>
                <div>
                  <p className="font-bold text-slate-800">{act.action}</p>
                  <p className="text-[11px] text-slate-500">Responsible Entity: {act.agency}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                PENDING SIGN-OFF
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Footer */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          <p className="font-medium text-slate-700">Governance Notice:</p>
          <p className="text-[11px]">Human authority authorization required before any operational movement.</p>
        </div>

        <button
          type="button"
          onClick={onSubmitForReview}
          disabled={isSubmitting}
          className="btn btn-primary text-xs py-2 px-5 shadow-sm flex items-center gap-2 font-bold"
        >
          <span>✍️</span> {isSubmitting ? 'Submitting...' : 'Submit for Authority Review →'}
        </button>
      </div>
    </div>
  );
}
