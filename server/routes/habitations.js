const express = require('express');
const router = express.Router();
const db = require('../store/db');
const { computeHazardScore }        = require('../utils/hazardEngine');
const { computeVulnerabilityScore } = require('../utils/vulnerabilityEngine');
const { computeRelocationPriority } = require('../utils/relocationEngine');
const { getAlertTargets }           = require('../utils/riskEngine');

// GET /api/habitations
router.get('/', (_req, res) => {
  const data = db.getAllHabitations();
  res.json({ success: true, count: data.length, data });
});

// GET /api/habitations/search?q=
router.get('/search', (req, res) => {
  const q = req.query.q || '';
  res.json({ success: true, data: db.searchHabitations(q) });
});

// GET /api/habitations/:id
router.get('/:id', (req, res) => {
  const h = db.getHabitationById(req.params.id);
  if (!h) return res.status(404).json({ success: false, message: 'Habitation not found' });

  // Return full computed detail
  const hazard = computeHazardScore(h);
  const vuln   = computeVulnerabilityScore(h);
  const priority = computeRelocationPriority(hazard, vuln, h);
  const alertTargets = getAlertTargets(hazard.category);

  res.json({
    success: true,
    data: {
      ...h,
      hazardResult: hazard,
      vulnResult: vuln,
      priorityResult: priority,
      alertTargets,
    },
  });
});

module.exports = router;
