import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getHabitations, getRelocationMatching, createRelocationPlan, submitPlan } from '../api';
import RelocationHeader from '../components/relocation/RelocationHeader';
import RelocationStepper from '../components/relocation/RelocationStepper';
import SourceHabitationCard from '../components/relocation/SourceHabitationCard';
import RelocationMap from '../components/relocation/RelocationMap';
import CandidateSiteList from '../components/relocation/CandidateSiteList';
import SiteComparison from '../components/relocation/SiteComparison';
import CapacitySummary from '../components/relocation/CapacitySummary';
import RelocationPlanView from '../components/relocation/RelocationPlanView';
import AuthorityReview from '../components/relocation/AuthorityReview';
import ScoreGauge from '../components/ScoreGauge';
import TimelineBadge from '../components/TimelineBadge';
import toast from 'react-hot-toast';

export default function RelocationPlanner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Select, 2: Assess, 3: Find Sites, 4: Compare, 5: Plan, 6: Review
  const [habitations, setHabitations] = useState([]);
  const [selectedH, setSelectedH] = useState(null);
  const [matchingData, setMatchingData] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search & Filter state for Step 1
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');

  // Load habitations and handle pre-selection from query params
  useEffect(() => {
    getHabitations().then((res) => {
      const data = res.data?.data || [];
      setHabitations(data);

      const preId = searchParams.get('habitationId');
      if (preId) {
        const found = data.find((h) => h._id === preId);
        if (found) {
          handleSelectHabitation(found);
        }
      }
    });
  }, [searchParams]);

  // Demo Scenarios list for Quick Selector
  const demoScenarios = [
    habitations.find((h) => h.name.includes('Pune Hillside')),
    habitations.find((h) => h.name.includes('Mahad')),
    habitations.find((h) => h.name.includes('Chiplun')),
    habitations.find((h) => h.name.includes('Shahuwadi')),
    habitations.find((h) => h.name.includes('Sawantwadi')),
  ].filter(Boolean).map((h) => ({
    _id: h._id,
    name: h.name,
    district: h.district,
    label: h.name.replace(' Settlement', '').replace(' Peripheral', '').replace(' Zone', ''),
    raw: h,
  }));

  const handleSelectHabitation = useCallback((h) => {
    setSelectedH(h);
    setSelectedSite(null);
    setMatchingData(null);
    setPlan(null);
    setStep(2); // Go to Assess
  }, []);

  // Fetch geographic matching recommendations for selected habitation
  const fetchMatchingSites = useCallback(async (h) => {
    const targetH = h || selectedH;
    if (!targetH) return;
    setLoading(true);
    try {
      const res = await getRelocationMatching(targetH._id);
      const data = res.data?.data;
      setMatchingData(data);
      if (data?.candidates?.length > 0) {
        setSelectedSite(data.candidates[0]);
      }
      setStep(3); // Go to Find Sites
    } catch {
      toast.error('Failed to load geographic matching candidate sites');
    } finally {
      setLoading(false);
    }
  }, [selectedH]);

  const handleGeneratePlan = useCallback(async () => {
    if (!selectedH || !selectedSite) {
      toast.error('Please select a target safe site first');
      return;
    }
    setLoading(true);
    try {
      const res = await createRelocationPlan({
        habitationId: selectedH._id,
        siteId: selectedSite._id,
        urgency: selectedH.relocationTimeline || 'Immediate',
        phases: 2,
      });
      setPlan(res.data?.data);
      setStep(5); // Go to Plan
      toast.success('Relocation plan successfully formulated');
    } catch {
      toast.error('Failed to generate relocation plan');
    } finally {
      setLoading(false);
    }
  }, [selectedH, selectedSite]);

  const handleSubmitForReview = useCallback(async () => {
    if (!plan) return;
    setLoading(true);
    try {
      await submitPlan(plan._id, 'Aegis Decision Support Operator');
      setPlan((p) => ({ ...p, approvalStatus: 'pending_review' }));
      setStep(6); // Go to Authority Review
      toast.success('Submitted for District Authority review');
    } catch {
      toast.error('Failed to submit plan');
    } finally {
      setLoading(false);
    }
  }, [plan]);

  const handleReset = () => {
    setSelectedH(null);
    setSelectedSite(null);
    setMatchingData(null);
    setPlan(null);
    setStep(1);
  };

  // Filter habitations for Step 1
  const districts = ['All', ...new Set(habitations.map((h) => h.district).filter(Boolean))];
  const filteredHabitations = habitations.filter((h) => {
    const matchesDistrict = districtFilter === 'All' || h.district === districtFilter;
    const matchesQuery =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.taluka && h.taluka.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (h.district && h.district.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDistrict && matchesQuery;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* 1. Header with Demo Badges and Scenario Quick Selector */}
      <RelocationHeader
        scenarios={demoScenarios}
        activeScenarioId={selectedH?._id}
        onSelectScenario={(sc) => {
          const found = habitations.find((h) => h._id === sc._id);
          if (found) {
            handleSelectHabitation(found);
            fetchMatchingSites(found);
          }
        }}
      />

      {/* 2. Compact Stepper */}
      <RelocationStepper
        currentStep={step}
        onStepClick={(sId) => setStep(sId)}
        maxAllowedStep={plan ? 6 : matchingData ? 4 : selectedH ? 3 : 1}
      />

      {/* 3. Main Body */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* STEP 1: SELECT HABITATION */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="card p-5 border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      Step 1: Select Vulnerable Source Habitation
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose a community requiring relocation assessment across Maharashtra demonstration districts.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search habitation (e.g. Pune Hillside, Mahad, Chiplun...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input text-xs py-1.5 w-72"
                    />
                  </div>
                </div>

                {/* District Filter Pills */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap text-xs">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">District:</span>
                  {districts.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDistrictFilter(d)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                        districtFilter === d
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Habitation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredHabitations.map((h) => {
                  const isImmediate = h.relocationTimeline === 'Immediate';
                  return (
                    <div
                      key={h._id}
                      onClick={() => handleSelectHabitation(h)}
                      className="card p-4 border border-slate-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-md space-y-3 bg-white"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-black text-slate-900 text-sm tracking-tight">{h.name}</h3>
                            {h.redZoneStatus && (
                              <span className="badge badge-danger text-[9px] px-1 py-0 font-bold">RED ZONE</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {h.district} District · {h.relocationCluster || `${h.district} Cluster`}
                          </p>
                        </div>
                        <TimelineBadge timeline={h.relocationTimeline || 'Immediate'} />
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-center text-xs">
                        <div className="bg-slate-50 rounded p-1.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">Population</span>
                          <strong className="text-slate-800">{(h.population || 0).toLocaleString()}</strong>
                        </div>
                        <div className="bg-slate-50 rounded p-1.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">Hazard</span>
                          <strong className="text-red-600">{h.hazardScore || 75}/100</strong>
                        </div>
                        <div className="bg-slate-50 rounded p-1.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">Priority</span>
                          <strong className="text-blue-700">{h.relocationPriorityScore || 80}/100</strong>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs text-blue-600 font-semibold">
                        <span>Select Habitation</span>
                        <span>→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: ASSESS RISK & PROFILE */}
          {step === 2 && selectedH && (
            <div className="space-y-5">
              <SourceHabitationCard habitation={selectedH} onReselect={() => setStep(1)} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 border border-slate-200 flex items-center gap-4">
                  <ScoreGauge score={selectedH.hazardScore || 85} size={72} strokeWidth={7} />
                  <div>
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Multi-Hazard Severity</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {selectedH.hazardCategory || 'High'} Exposure
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Composite flood, landslide, rain, slope</p>
                  </div>
                </div>

                <div className="card p-5 border border-slate-200 flex items-center gap-4">
                  <ScoreGauge score={selectedH.vulnerabilityScore || 68} size={72} strokeWidth={7} />
                  <div>
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Vulnerability Index</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {selectedH.vulnerabilityScore >= 70 ? 'High' : 'Moderate'} Vulnerability
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Housing fragility & lifeline roads</p>
                  </div>
                </div>

                <div className="card p-5 border border-slate-200 flex items-center gap-4">
                  <ScoreGauge score={selectedH.relocationPriorityScore || 88} size={72} strokeWidth={7} />
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Relocation Priority</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {selectedH.relocationTimeline?.toUpperCase() || 'IMMEDIATE'} Action
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Algorithmic action timeline</p>
                  </div>
                </div>
              </div>

              {/* Action trigger */}
              <div className="card p-6 bg-blue-50/50 border border-blue-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-blue-950 text-sm">
                    Ready to Run Geographic Feasibility Analysis
                  </h3>
                  <p className="text-xs text-blue-800 mt-0.5">
                    The matching engine will search safe relocation sites within the 25 km preferred local radius first.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchMatchingSites(selectedH)}
                  disabled={loading}
                  className="btn btn-primary text-xs py-2 px-5 shadow-sm font-extrabold flex items-center gap-2"
                >
                  <span>🔍</span> {loading ? 'Analyzing Nearby Proximity...' : 'Find Geographically Practical Safe Sites →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FIND SITES (60/40 Split Map & Recommendation List) */}
          {step === 3 && selectedH && matchingData && (
            <div className="space-y-4">
              <SourceHabitationCard habitation={selectedH} onReselect={() => setStep(1)} compact />

              {/* 60% Left Map + 40% Right Site List */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" style={{ minHeight: '520px' }}>
                {/* 60% Interactive Map */}
                <div className="lg:col-span-7 flex flex-col min-h-[480px]">
                  <RelocationMap
                    sourceHabitation={selectedH}
                    candidates={matchingData.candidates}
                    selectedSite={selectedSite}
                    onSelectSite={(site) => setSelectedSite(site)}
                    height="100%"
                  />
                </div>

                {/* 40% Compact Recommendation List */}
                <div className="lg:col-span-5 flex flex-col min-h-[480px]">
                  <CandidateSiteList
                    matchingData={matchingData}
                    selectedSite={selectedSite}
                    onSelectSite={(site) => setSelectedSite(site)}
                    onCompare={() => setStep(4)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: COMPARE SITES */}
          {step === 4 && matchingData && (
            <div className="space-y-4">
              <SourceHabitationCard habitation={selectedH} compact />
              <SiteComparison
                candidates={matchingData.candidates}
                selectedSite={selectedSite}
                onSelectSite={(site) => setSelectedSite(site)}
                onProceedToPlan={handleGeneratePlan}
                onBack={() => setStep(3)}
              />
            </div>
          )}

          {/* STEP 5: RELOCATION PLAN & CAPACITY UTILIZATION */}
          {step === 5 && selectedH && selectedSite && (
            <div className="space-y-5">
              <SourceHabitationCard habitation={selectedH} compact />

              <CapacitySummary
                site={selectedSite}
                population={selectedH.population}
                multiSiteStrategy={matchingData?.multiSiteStrategy}
              />

              <RelocationPlanView
                plan={plan}
                sourceHabitation={selectedH}
                targetSite={selectedSite}
                onSubmitForReview={handleSubmitForReview}
                isSubmitting={loading}
                onBack={() => setStep(4)}
              />
            </div>
          )}

          {/* STEP 6: AUTHORITY REVIEW & VALIDATION */}
          {step === 6 && (
            <AuthorityReview
              plan={plan}
              sourceHabitation={selectedH}
              targetSite={selectedSite}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
