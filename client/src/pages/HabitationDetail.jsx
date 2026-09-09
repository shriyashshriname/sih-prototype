import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHabitation, getVillage, simulateAlerts, recommendSites } from '../api';
import Topbar from '../components/Topbar';
import ScoreGauge from '../components/ScoreGauge';
import TimelineBadge from '../components/TimelineBadge';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import DataDisclaimer from '../components/DataDisclaimer';
import toast from 'react-hot-toast';

export default function HabitationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recommendedSites, setRecommendedSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertsSent, setAlertsSent] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Try habitation endpoint first, fallback to village endpoint
    getHabitation(id)
      .then((r) => {
        setData(r.data.data);
        return recommendSites(id).catch(() => null);
      })
      .then((siteRes) => {
        if (siteRes?.data?.data) {
          setRecommendedSites(siteRes.data.data.slice(0, 3));
        }
      })
      .catch(() => {
        return getVillage(id)
          .then((r) => setData(r.data.data))
          .catch(() => toast.error('Failed to load habitation details'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSimulateAlerts = async () => {
    try {
      setAlertLoading(true);
      const r = await simulateAlerts(id);
      toast.success(`${r.data.count || 0} alert notices generated for emergency agencies`);
      setAlertsSent(true);
    } catch {
      toast.error('Failed to simulate emergency alerts');
    } finally {
      setAlertLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
        <Topbar title="Habitation Risk Assessment" subtitle="Loading telemetry..." />
        <div className="flex-1 p-6 space-y-4">
          <div className="skeleton h-12 w-1/3 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            <div className="skeleton h-40 rounded-xl" />
            <div className="skeleton h-40 rounded-xl" />
            <div className="skeleton h-40 rounded-xl" />
          </div>
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
        <Topbar title="Habitation Risk Assessment" subtitle="Habitation Not Found" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="card p-8 text-center max-w-md">
            <p className="text-4xl mb-3">📍</p>
            <h3 className="text-lg font-bold text-slate-800">Habitation Not Found</h3>
            <p className="text-xs text-slate-500 mt-1">The requested habitation identifier could not be resolved in the dataset.</p>
            <button className="btn btn-primary text-xs mt-4" onClick={() => navigate('/red-zones')}>
              ← Back to Red Zones
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hazardScore = data.hazardResult?.compositeScore ?? data.risk_score ?? 65;
  const hazardCat = data.hazardResult?.category ?? data.risk_category ?? 'High';
  const vulnScore = data.vulnResult?.vulnerabilityScore ?? 68;
  const priorityScore = data.priorityResult?.priorityScore ?? 78;
  const timeline = data.priorityResult?.timeline ?? (priorityScore >= 75 ? 'Immediate' : priorityScore >= 50 ? 'Short-Term' : 'Medium-Term');
  const isRedZone = data.redZone || hazardScore >= 70;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Topbar
        title={`${data.name} · Habitation Risk & Relocation Assessment`}
        subtitle={`${data.taluka ? `${data.taluka} Taluka, ` : ''}${data.district || 'Maharashtra'} · SIH26191 Intelligence`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <DataDisclaimer />

        {/* Header summary banner */}
        <div className="card p-6 bg-white border border-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{data.name}</h1>
                {isRedZone && (
                  <span className="badge badge-danger text-xs font-bold animate-pulse">
                    🔴 RED ZONE HABITATION
                  </span>
                )}
                <TimelineBadge timeline={timeline} />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {data.taluka ? `${data.taluka} Taluka, ` : ''}{data.district} District, Maharashtra · Population:{' '}
                <strong>{(data.population || 0).toLocaleString()}</strong> residents ({data.households || Math.round((data.population || 0)/4.5)} households)
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Coordinates: {data.lat?.toFixed(4)}°N, {data.lng?.toFixed(4)}°E · Primary Hazard:{' '}
                <strong className="text-slate-700">{data.primaryHazard || 'Compound Flood & Landslide'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/relocation-planner?habitationId=${data._id}`)}
                className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-sm"
              >
                <span>📋</span> Plan Relocation
              </button>
              <button
                onClick={handleSimulateAlerts}
                disabled={alertLoading || alertsSent}
                className="btn btn-danger text-xs py-2 px-4 flex items-center gap-2 shadow-sm"
              >
                <span>🚨</span> {alertLoading ? 'Simulating...' : alertsSent ? 'Alerts Dispatched' : 'Simulate Early Warning'}
              </button>
            </div>
          </div>

          {/* 3 Core Analytical Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
            {/* Multi-hazard composite */}
            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 flex items-center gap-4">
              <ScoreGauge score={hazardScore} size={70} strokeWidth={7} />
              <div>
                <p className="text-xs font-bold text-red-900 uppercase">Multi-Hazard Composite</p>
                <p className="text-sm font-semibold text-red-700">{hazardCat} Hazard Severity</p>
                <p className="text-xs text-slate-500 mt-0.5">Flood, Landslide, Rain, Terrain</p>
              </div>
            </div>

            {/* Vulnerability */}
            <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 flex items-center gap-4">
              <ScoreGauge score={vulnScore} size={70} strokeWidth={7} />
              <div>
                <p className="text-xs font-bold text-orange-900 uppercase">Vulnerability Index</p>
                <p className="text-sm font-semibold text-orange-700">{vulnScore >= 70 ? 'High' : 'Moderate'} Vulnerability</p>
                <p className="text-xs text-slate-500 mt-0.5">Housing, density & single-road isolation</p>
              </div>
            </div>

            {/* Relocation Priority */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center gap-4">
              <ScoreGauge score={priorityScore} size={70} strokeWidth={7} />
              <div>
                <p className="text-xs font-bold text-blue-900 uppercase">Relocation Priority</p>
                <p className="text-sm font-semibold text-blue-700">{timeline.toUpperCase()} Action Required</p>
                <p className="text-xs text-slate-500 mt-0.5">Algorithmic decision threshold</p>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry & Factors Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Telemetry metrics */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>📡</span> Environmental Telemetry
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">24h Rainfall:</span>
                  <span className="font-bold text-slate-800">{data.rainfall || data.telemetry?.rainfall || 220} mm</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">River Water Level:</span>
                  <span className="font-bold text-slate-800">{data.river_level || data.telemetry?.riverLevel || 6.2} m above datum</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Slope Gradient:</span>
                  <span className="font-bold text-slate-800">{data.slope || data.terrain?.slope || 28}°</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Soil Saturation:</span>
                  <span className="font-bold text-slate-800">{data.soil_saturation || data.telemetry?.soilMoisture || 84}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Elevation:</span>
                  <span className="font-bold text-slate-800">{data.elevation || data.terrain?.elevation || 32} m ASL</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Historical Incidents:</span>
                  <span className="font-bold text-red-600">{data.historical_flood_incidents || data.historicalDisasters || 4} flood/landslide events</span>
                </div>
              </div>
            </div>

            {/* Infrastructure & Demographics */}
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>🏘️</span> Exposure Profile
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Kutcha / Fragile Housing:</span>
                  <span className="font-bold text-slate-800">{data.kutchaHousingPct || 68}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Access Road Status:</span>
                  <span className="font-bold text-amber-600">{data.accessRoad || 'Single Rural Road (Flood Prone)'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Hospitals Nearby:</span>
                  <span className="font-bold text-slate-800">{data.hospital_count || 1}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Schools Nearby:</span>
                  <span className="font-bold text-slate-800">{data.school_count || 2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center/Right: Explainability & Recommended Safe Sites */}
          <div className="lg:col-span-8 space-y-6">
            {/* Explainability factors */}
            <ExplainabilityPanel
              factors={
                data.priorityResult?.factors ||
                data.hazardResult?.factors ||
                data.risk_factors || [
                  { name: 'Multi-Hazard Exposure (Flood & Landslide)', weight: 35, score: hazardScore },
                  { name: 'Socioeconomic & Housing Vulnerability', weight: 25, score: vulnScore },
                  { name: 'Historical Repeat Inundation Frequency', weight: 15, score: 75 },
                  { name: 'Lifeline Infrastructure Exposure', weight: 15, score: 65 },
                  { name: 'Evacuation Route Inaccessibility', weight: 10, score: 80 },
                ]
              }
            />

            {/* Relocation Site Options */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span>🏕️</span> Recommended Safe Relocation Sites
                  </h3>
                  <p className="text-xs text-slate-500">Matching terrain safety and carrying capacity headroom</p>
                </div>
                <button
                  onClick={() => navigate('/safe-sites')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View All Sites →
                </button>
              </div>

              {recommendedSites.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No automated recommendations generated. Click below to inspect available sites manually.
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedSites.map((site) => {
                    const avail = (site.maxCapacity || 0) - (site.currentOccupancy || 0);
                    return (
                      <div
                        key={site._id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-300 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{site.name}</span>
                            <span className="badge badge-success text-xs">
                              Suitability: {site.suitabilityScore || 88}/100
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {site.taluka ? `${site.taluka}, ` : ''}{site.district} District · Available Headroom:{' '}
                            <strong className="text-emerald-700">{avail.toLocaleString()} persons</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/relocation-planner?habitationId=${data._id}&siteId=${site._id}`)}
                          className="btn btn-primary text-xs py-1.5 px-3"
                        >
                          Select Site →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
