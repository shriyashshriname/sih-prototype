const express = require('express');
const router = express.Router();
const db = require('../store/db');

// GET /api/red-zones — list of red-zone habitations + polygons
router.get('/', (_req, res) => {
  const zones = db.getRedZones();
  const polygons = db.redZonePolygons;

  const stats = {
    totalZones: zones.length,
    affectedPopulation: zones.reduce((s, z) => s + z.population, 0),
    polygonCount: polygons.length,
    districts: [...new Set(zones.map(z => z.district))],
    dataLabel: 'Maharashtra Demonstration Dataset · Illustrative Analysis · Not for operational use',
  };

  res.json({ success: true, stats, zones, polygons });
});

// GET /api/red-zones/polygons — just the polygon GeoJSON
router.get('/polygons', (_req, res) => {
  res.json({ success: true, data: db.redZonePolygons });
});

module.exports = router;
