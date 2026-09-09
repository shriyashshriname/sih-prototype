const express = require('express');
const router = express.Router();
const db = require('../store/db');
const { getAlertTargets } = require('../utils/riskEngine');

// GET /api/alerts
router.get('/', (req, res) => {
  const { status, agency, village } = req.query;
  const data = db.getAllAlerts({ status, agency, village });
  res.json({ success: true, count: data.length, data });
});

// POST /api/alerts/simulate/:habitationId
router.post('/simulate/:habitationId', (req, res) => {
  const h = db.getHabitationById(req.params.habitationId);
  if (!h) return res.status(404).json({ success: false, message: 'Habitation not found' });

  // Use hazardCategory to determine targets
  const category = h.hazardCategory || 'High';
  const targets = getAlertTargets(category);
  if (targets.length === 0) {
    return res.json({ success: true, message: 'Risk too low to generate alerts', count: 0, data: [] });
  }

  const priority =
    category === 'Very High' ? 'critical' :
    category === 'High' ? 'high' : 'warning';

  const shelter = 'See Relocation Plan for recommended site';

  const messages = {
    'District Administration': `⚠️ AEGIS Alert: ${h.displayName || h.name} — ${category} multi-hazard exposure (Score: ${h.hazardScore}/100). Population: ${h.population?.toLocaleString()}. Relocation priority: ${h.relocationTimeline}. Immediate review required.`,
    Police: `HAZARD ALERT: ${h.displayName || h.name} — ${category} risk. Prepare evacuation route management. Coordinate with District EOC.`,
    'Fire Department': `HAZARD ALERT: ${h.displayName || h.name} — ${category} risk. Pre-position rescue equipment. Standby for deployment.`,
    Hospitals: `MEDICAL READINESS: ${h.displayName || h.name} — ${category} exposure. Increase emergency capacity. Prepare disaster-related medical supplies.`,
    'NDRF/SDRF': `DEPLOYMENT ADVISORY: ${h.displayName || h.name} — ${category} multi-hazard (Score: ${h.hazardScore}/100). Activate response teams. Relocation timeline: ${h.relocationTimeline}.`,
    Citizens: `⚠️ PUBLIC NOTICE: ${h.displayName || h.name} has been assessed at ${category} hazard risk by AEGIS prototype. ${shelter}. Follow official instructions. Emergency: 112`,
    'Local Administration': `ALERT: ${h.displayName || h.name} — ${category} hazard. Verify evacuation readiness. Coordinate with District EOC.`,
    'Emergency Response Team': `STANDBY: ${h.displayName || h.name} — ${category} risk. Monitor hazard levels. Prepare rapid response.`,
  };

  db.deleteAlertsByHabitation(h._id);

  const docs = targets.map((agency) => ({
    village_id: h._id,
    village_name: h.displayName || h.name,
    risk_score: h.hazardScore,
    risk_category: category,
    target_agency: agency,
    message: messages[agency] || `Hazard alert for ${h.name}: ${category}`,
    priority,
    status: 'active',
  }));

  const created = db.createAlerts(docs);
  res.json({ success: true, count: created.length, data: created });
});

// PUT /api/alerts/:id/acknowledge
router.put('/:id/acknowledge', (req, res) => {
  const updated = db.updateAlert(req.params.id, {
    status: 'acknowledged',
    acknowledged_by: req.body.acknowledged_by || 'Duty Officer',
    acknowledged_at: new Date().toISOString(),
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Alert not found' });
  res.json({ success: true, data: updated });
});

// PUT /api/alerts/:id/resolve
router.put('/:id/resolve', (req, res) => {
  const updated = db.updateAlert(req.params.id, { status: 'resolved' });
  if (!updated) return res.status(404).json({ success: false, message: 'Alert not found' });
  res.json({ success: true, data: updated });
});

router.delete('/clear', (_req, res) => {
  db.clearResolvedAlerts();
  res.json({ success: true, message: 'Resolved alerts cleared' });
});

module.exports = router;
