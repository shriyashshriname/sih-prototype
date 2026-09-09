const express = require('express');
const router = express.Router();
const db = require('../store/db');
const { computeSiteSuitability } = require('../utils/siteSuitabilityEngine');
const { assessCapacity }         = require('../utils/capacityEngine');

// GET /api/relocation-sites
router.get('/', (_req, res) => {
  res.json({ success: true, count: db.getAllSites().length, data: db.getAllSites() });
});

// GET /api/relocation-sites/:id
router.get('/:id', (req, res) => {
  const site = db.getSiteById(req.params.id);
  if (!site) return res.status(404).json({ success: false, message: 'Site not found' });

  const suitability = computeSiteSuitability(site, 0);
  const capacity    = assessCapacity(site, 0);

  res.json({ success: true, data: { ...site, suitability, capacity } });
});

// GET /api/relocation-sites/:id/capacity?required=2780
router.get('/:id/capacity', (req, res) => {
  const site = db.getSiteById(req.params.id);
  if (!site) return res.status(404).json({ success: false, message: 'Site not found' });

  const required = parseInt(req.query.required) || 0;
  const capacity = assessCapacity(site, required);
  const suitability = computeSiteSuitability(site, required);

  res.json({ success: true, data: { siteId: site._id, siteName: site.name, required, capacity, suitability } });
});

module.exports = router;
