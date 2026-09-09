const express = require('express');
const router = express.Router();
const db = require('../store/db');
const { calculateRisk, getRecommendations, getAlertTargets } = require('../utils/riskEngine');

// GET /api/villages — all villages
router.get('/', (_req, res) => {
  res.json({ success: true, count: db.getAllVillages().length, data: db.getAllVillages() });
});

// GET /api/villages/search?q=name
router.get('/search', (req, res) => {
  const q = req.query.q || '';
  res.json({ success: true, data: db.searchVillagesByName(q) });
});

// GET /api/villages/:id
router.get('/:id', (req, res) => {
  const village = db.getVillageById(req.params.id);
  if (!village) return res.status(404).json({ success: false, message: 'Village not found' });

  const { score, category, factors } = calculateRisk(village);
  const recommendations = getRecommendations(category);
  const alert_targets = getAlertTargets(category);

  res.json({
    success: true,
    data: {
      ...village,
      risk_score: score,
      risk_category: category,
      risk_factors: factors,
      recommendations,
      alert_targets,
    },
  });
});

module.exports = router;
