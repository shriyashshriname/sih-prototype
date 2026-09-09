import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVillage, simulateAlerts } from '../api';
import RiskBadge from '../components/RiskBadge';
import FactorBar from '../components/FactorBar';
import toast from 'react-hot-toast';

const priorityStyle = {
  info:     'bg-blue-50 border-blue-200 text-blue-800',
  warning:  'bg-yellow-50 border-yellow-200 text-yellow-800',
  danger:   'bg-orange-50 border-orange-200 text-orange-800',
  critical: 'bg-red-50 border-red-200 text-red-800',
};

const priorityIcon = {
  info: 'ℹ️', warning: '⚠️', danger: '🔶', critical: '🚨',
};

const InfoRow = ({ label, value, unit, highlight }) => (
  <div className={`flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 ${highlight ? 'bg-red-50 -mx-4 px-4 rounded' : ''}`}>
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`text-sm font-semibold ${highlight ? 'text-red-700' : 'text-slate-800'}`}>
      {value}{unit ? ` ${unit}` : ''}
    </span>
  </div>
);

export default function VillageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertsSent, setAlertsSent] = useState(false);

  useEffect(() => {
    setLoading(true);
    getVillage(id)
      .then((r) => setData(r.data.data))
      .catch(() => toast.error('Failed to load village data'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSimulateAlerts = async () => {
    try {
      setAlertLoading(true);
      const r = await simulateAlerts(id);
      toast.success(`${r.data.count} alerts generated for ${r.data.count > 0 ? 'relevant agencies' : 'no agencies (risk too low)'}`);
      setAlertsSent(true);
    } catch {
      toast.error('Failed to generate alerts');
    } finally {
      setAlertLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-32 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="card p-8 text-center">
          <p className="text-slate-500">Village not found.</p>
          <button className="btn btn-ghost mt-4" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const isHighRisk = data.risk_category === 'High' || data.risk_category === 'Very High';
  const riskColor = data.risk_category === 'Very High' ? '#dc2626' : data.risk_category === 'High' ? '#ea580c' : data.risk_category === 'Moderate' ? '#ca8a04' : '#16a34a';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header strip */}
      <div
        className="px-6 py-5"
        style={{ background: `linear-gradient(135deg, ${riskColor}15, ${riskColor}05)`, borderBottom: `3px solid ${riskColor}` }}
      >
        <button
          className="text-sm text-slate-500 hover:text-slate-800 mb-3 flex items-center gap-1"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{data.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{data.district} District, {data.state}</p>
            <p className="text-xs mt-1 text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 inline-block">
              {data.data_label}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <RiskBadge category={data.risk_category} score={data.risk_score} size="lg" />
            <div className="text-right">
              <p className="text-4xl font-black" style={{ color: riskColor }}>{data.risk_score}</p>
              <p className="text-xs text-slate-500 -mt-1">out of 100</p>
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-4">
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${data.risk_score}%`, background: riskColor }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0 — Low</span><span>25 — Moderate</span><span>50 — High</span><span>75 — Very High</span><span>100</span>
          </div>
        </div>
      </div>

      {/* Alert simulation CTA */}
      {isHighRisk && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-300 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-red-800 text-sm">🚨 {data.risk_category} Risk Detected</p>
            <p className="text-xs text-red-600 mt-0.5">
              System recommends alerting relevant agencies. <strong>Human authorisation required.</strong>
            </p>
          </div>
          <button
            className="btn btn-danger ml-4 flex-shrink-0"
            onClick={handleSimulateAlerts}
            disabled={alertLoading || alertsSent}
          >
            {alertLoading ? '⏳ Sending...' : alertsSent ? '✓ Alerts Sent' : '🚨 Simulate Alert'}
          </button>
        </div>
      )}

      {/* Main content grid */}
      <div className="p-6 grid grid-cols-3 gap-5">

        {/* Left: Environmental data */}
        <div className="col-span-1 space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm flex items-center gap-2">
              🌧 Environmental Readings
            </h3>
            <InfoRow label="Rainfall" value={data.rainfall} unit="mm/24h" highlight={data.rainfall > 250} />
            <InfoRow label="River Level" value={data.river_level} unit="m above normal" highlight={data.river_level > 7} />
            <InfoRow label="Elevation" value={data.elevation} unit="m ASL" highlight={data.elevation < 40} />
            <InfoRow label="Slope" value={data.slope} unit="°" />
            <InfoRow label="Soil Saturation" value={`${data.soil_saturation}%`} highlight={data.soil_saturation > 75} />
            <InfoRow label="Historical Incidents" value={data.historical_flood_incidents} unit="events" highlight={data.historical_flood_incidents >= 7} />
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">👥 Population & Infrastructure</h3>
            <InfoRow label="Total Population" value={data.population.toLocaleString()} highlight={isHighRisk} />
            <InfoRow label="Hospitals Nearby" value={data.hospital_count} />
            <InfoRow label="Schools Nearby" value={data.school_count} />
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">🏠 Nearest Shelter</h3>
            <p className="text-sm font-semibold text-slate-800 mb-2">{data.shelter_name}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700">
                <strong>Capacity:</strong> {data.shelter_capacity.toLocaleString()} persons
              </p>
              {data.shelter_lat && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${data.shelter_lat}&mlon=${data.shelter_lng}&zoom=15`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 block"
                >
                  📍 View on Map →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Centre: Explainability */}
        <div className="col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-1 text-sm">🔍 Why is this area at risk?</h3>
            <p className="text-xs text-slate-400 mb-4">
              Top contributing factors · Weights sum to 100%
            </p>
            <div className="space-y-5">
              {(data.risk_factors || []).map((f) => (
                <FactorBar key={f.key} factor={f} />
              ))}
            </div>
            <div className="mt-5 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500">
                <strong>Formula:</strong> Score = Σ(factor_normalised × weight) × 100
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Rainfall (30%) + River Level (25%) + Low Elevation (20%) + Historical Incidents (15%) + Soil Saturation (10%)
              </p>
            </div>
          </div>
        </div>

        {/* Right: Recommendations */}
        <div className="col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-1 text-sm">📋 Decision Support Recommendations</h3>
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-4">
              System-generated · Require human authorisation before action
            </p>
            <div className="space-y-3">
              {(data.recommendations || []).map((rec, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-sm ${priorityStyle[rec.priority] || priorityStyle.info}`}
                >
                  <span className="mr-2">{priorityIcon[rec.priority] || 'ℹ️'}</span>
                  {rec.text}
                </div>
              ))}
            </div>
          </div>

          {isHighRisk && (
            <div className="card p-4 bg-slate-800">
              <h3 className="font-semibold text-white mb-2 text-sm">📡 Alert Distribution</h3>
              <p className="text-xs text-slate-300 mb-3">
                On simulation, alerts will be routed to:
              </p>
              {(data.alert_targets || []).map((t) => (
                <div key={t} className="flex items-center gap-2 py-1 border-b border-white/10 last:border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-sm text-slate-200">{t}</span>
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-3 italic">
                SIMULATION ONLY — No real messages sent
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
