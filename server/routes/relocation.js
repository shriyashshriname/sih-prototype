const express = require('express');
const router = express.Router();
const db = require('../store/db');
const { calculateDistance } = require('../utils/distanceEngine');

// GET /api/relocation-priority
router.get('/priority', (_req, res) => {
  const data = db.getRelocationPriority();
  const counts = { Immediate: 0, 'Short-Term': 0, 'Medium-Term': 0, Monitor: 0 };
  data.forEach((h) => counts[h.relocationTimeline] = (counts[h.relocationTimeline] || 0) + 1);
  res.json({ success: true, counts, data });
});

// GET /api/relocation/sites?habitationId=...
// Also POST /api/relocation/recommend for backward compatibility
const handleRecommend = (req, res) => {
  const habitationId = req.query.habitationId || req.body.habitationId;
  if (!habitationId) {
    return res.status(400).json({ success: false, message: 'habitationId is required' });
  }

  const result = db.getRecommendedSites(habitationId, {
    preferredRadiusKm: parseInt(req.query.preferredRadiusKm || req.body.preferredRadiusKm) || 25,
    maxRadiusKm: parseInt(req.query.maxRadiusKm || req.body.maxRadiusKm) || 50,
  });

  if (!result) {
    return res.status(404).json({ success: false, message: 'Source habitation not found' });
  }

  res.json({
    success: true,
    data: result,
  });
};

router.get('/sites', handleRecommend);
router.post('/recommend', handleRecommend);

// POST /api/relocation/plan
// Body: { habitationId, siteId, urgency, phases, targetDate, notes }
router.post('/plan', (req, res) => {
  const { habitationId, siteId, urgency, phases, targetDate, notes } = req.body;
  if (!habitationId || !siteId) {
    return res.status(400).json({ success: false, message: 'habitationId and siteId required' });
  }

  const habitation = db.getHabitationById(habitationId);
  const site       = db.getSiteById(siteId);

  if (!habitation || !site) {
    return res.status(404).json({ success: false, message: 'Habitation or site not found' });
  }

  const distKm = calculateDistance(habitation.lat, habitation.lng, site.lat, site.lng);
  const available = Math.max(0, site.maxCapacity - site.currentOccupancy - (site.reservedCapacity || 0));
  const isCapacitySufficient = available >= habitation.population;

  const actions = [
    { step: 1, action: 'Validate site ground elevation and soil stability', agency: 'District Administration / GSI', status: 'pending' },
    { step: 2, action: 'Identify and register all vulnerable households', agency: 'Revenue Department', status: 'pending' },
    { step: 3, action: 'Prepare dedicated all-weather arterial transport corridor', agency: 'Police / State Transport', status: 'pending' },
    { step: 4, action: 'Prepare emergency mobile medical units and transit aid', agency: 'Health Department', status: 'pending' },
    { step: 5, action: 'Coordinate systematic phased evacuation (vulnerable first)', agency: 'NDRF/SDRF + District Collectorate', status: 'pending' },
    { step: 6, action: 'Establish post-relocation shelter registration and rations', agency: 'Local Administration', status: 'pending' },
  ];

  const agencies = [
    'District Administration',
    'Police',
    'Health Department',
    'Public Works Department (PWD)',
    'NDRF / SDRF',
    'Local Administration',
  ];

  const plan = db.createPlan({
    sourceHabitationId: habitation._id,
    sourceHabitationName: habitation.name,
    sourceDisplayName: habitation.displayName,
    sourceDistrict: habitation.district,
    sourceCluster: habitation.relocationCluster || `${habitation.district} Cluster`,
    targetSiteId: site._id,
    targetSiteName: site.name,
    targetDisplayName: site.displayName,
    targetDistrict: site.district,
    targetCluster: site.relocationCluster || `${site.district} Cluster`,
    population: habitation.population,
    priority: habitation.relocationTimeline,
    priorityScore: habitation.relocationPriorityScore,
    timeline: habitation.relocationTimeline,
    distanceKm: distKm,
    urgency: urgency || habitation.relocationTimeline,
    phases: phases || 2,
    targetDate: targetDate || 'Within 7 days',
    notes: notes || 'AI-assisted relocation plan generated under SIH26191 framework.',
    agencies,
    actions,
    availableCapacity: available,
    isCapacitySufficient,
    utilizationPct: site.maxCapacity > 0 ? Math.round(((site.currentOccupancy + habitation.population) / site.maxCapacity) * 100) : 0,
    dataLabel: 'AI-assisted decision support output — Not an official government executive order. Human authority authorization required.',
  });

  res.json({ success: true, data: plan });
});

// GET /api/relocation/plans
router.get('/plans', (_req, res) => {
  res.json({ success: true, data: db.getAllPlans() });
});

// GET /api/relocation/plans/:id
router.get('/plans/:id', (req, res) => {
  const plan = db.getPlanById(req.params.id);
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
  res.json({ success: true, data: plan });
});

// PUT /api/relocation/plan/:id/submit
router.put('/plan/:id/submit', (req, res) => {
  const plan = db.getPlanById(req.params.id);
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

  const updated = db.updatePlan(req.params.id, {
    approvalStatus: 'pending_review',
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    submittedBy: req.body.submittedBy || 'Aegis Decision Support Operator',
  });
  res.json({ success: true, data: updated });
});

// PUT /api/relocation/plan/:id/approve
router.put('/plan/:id/approve', (req, res) => {
  const updated = db.updatePlan(req.params.id, {
    approvalStatus: 'approved',
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy: req.body.approvedBy || 'District Collector / Incident Commander',
    approvalNote: 'Relocation plan reviewed and officially validated by competent authority under Disaster Management Act, 2005.',
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Plan not found' });
  res.json({ success: true, data: updated });
});

module.exports = router;
