import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Topbar from '../components/Topbar';
import axios from 'axios';
import { 
  BrainCircuit, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  ArrowRight, 
  BarChart3,
  Layers,
  Zap,
  Activity
} from 'lucide-react';

export default function AIRiskAssessment() {
  const { habitations, loading } = useApp();
  const [selectedId, setSelectedId] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [assessing, setAssessing] = useState(false);

  useEffect(() => {
    if (habitations && habitations.length > 0 && !selectedId) {
      setSelectedId(habitations[0]._id);
    }
  }, [habitations]);

  const selectedHabitation = habitations?.find(h => h._id === selectedId) || habitations?.[0];

  const runAssessment = async () => {
    if (!selectedHabitation) return;
    setAssessing(true);
    try {
      const res = await axios.post('http://localhost:5000/api/risk/ai-evaluate', {
        habitationId: selectedHabitation._id
      });
      if (res.data?.success) {
        const data = res.data.data;
        setAssessment({
          score: data.riskScore,
          category: data.riskCategory,
          confidence: data.confidence,
          modelVersion: data.modelVersion,
          shapFactors: data.shapAttribution.map(s => ({
            feature: s.feature,
            value: s.observedValue,
            impact: s.impactPts,
            label: s.status
          })),
          recommendations: data.directives
        });
      }
    } catch (err) {
      console.error('Error running AI assessment:', err);
    } finally {
      setAssessing(false);
    }
  };

  useEffect(() => {
    if (selectedHabitation) {
      runAssessment();
    }
  }, [selectedId]);

  if (loading || !selectedHabitation) {
    return (
      <div className="flex flex-col h-screen bg-slate-900 text-white p-8 items-center justify-center">
        <Cpu className="w-12 h-12 text-sky-400 animate-spin mb-4" />
        <p className="text-slate-400">Loading AI Multi-Hazard Risk Model...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Topbar 
        title="AI Risk Assessment Engine" 
        subtitle="Explainable XGBoost Multi-Hazard Scoring & SHAP Decision Attribution"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2.5 bg-sky-500/10 rounded-lg text-sky-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block">Select Habitation for AI Diagnosis</label>
              <select 
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none min-w-[320px]"
              >
                {habitations.map(h => (
                  <option key={h._id} value={h._id}>
                    {h.name} ({h.district}) — Priority Score: {h.relocationPriorityScore || h.hazardScore}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {assessment?.modelVersion || 'XGBoost v2.4 Live'}
            </span>
            <button
              onClick={runAssessment}
              disabled={assessing}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`w-4 h-4 ${assessing ? 'animate-bounce' : ''}`} />
              {assessing ? 'Evaluating SHAP...' : 'Re-Run Model'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                  SHAP Explainer Active
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Composite AI Risk Score</h3>
              
              <div className="relative w-44 h-44 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-slate-700" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="42" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    className={
                      assessment?.category === 'Critical' ? 'text-red-500' :
                      assessment?.category === 'High' ? 'text-orange-500' :
                      assessment?.category === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                    }
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * (assessment?.score || 0)) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{assessment?.score || 0}</span>
                  <span className="text-xs text-slate-400 font-medium">Out of 100</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  assessment?.category === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  assessment?.category === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                  assessment?.category === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {assessment?.category} Risk Threshold
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                Model confidence: <strong className="text-slate-200">{((assessment?.confidence || 0.94) * 100).toFixed(0)}%</strong>. Multi-variate gradient boosted estimation calibrated on Maharashtra disaster matrices.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Target Habitation Metadata
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block">District / Taluka</span>
                  <span className="font-semibold text-white">{selectedHabitation.district} ({selectedHabitation.taluka || 'Rural'})</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block">Population at Risk</span>
                  <span className="font-semibold text-amber-400">{selectedHabitation.population?.toLocaleString()}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block">Elevation ASL</span>
                  <span className="font-semibold text-white">{selectedHabitation.terrain?.elevation || 85} m</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block">Red Zone Status</span>
                  <span className={`font-semibold ${selectedHabitation.redZoneStatus ? 'text-red-400' : 'text-slate-300'}`}>
                    {selectedHabitation.redZoneStatus ? 'ACTIVE RED ZONE' : 'Monitored'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-sky-400" />
                    SHAP Feature Contribution Attribution
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    TreeExplainer marginal attribution of real-world environmental drivers on risk severity
                  </p>
                </div>
                <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20">
                  Explainable AI (XAI)
                </span>
              </div>

              <div className="space-y-4">
                {assessment?.shapFactors?.map((f, i) => (
                  <div key={i} className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{f.feature}</span>
                        <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          Observed: {f.value}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-red-400 font-bold">+{f.impact} risk pts</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (f.impact / 35) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>Reason: <strong className="text-slate-300">{f.label}</strong></span>
                      <span className="text-slate-400">Attribution Weight: High</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Automated Decision-Support Directives
              </h3>

              <div className="space-y-3">
                {assessment?.recommendations?.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/50">
                    <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded mt-0.5">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
