// ============================================================
// Aegis Evacuation Routes — A* Route Planning API
// ⚠️  DEMO/PROTOTYPE — Simulated routing, not real navigation
// ============================================================

const express = require('express');
const router = express.Router();
const { computeEvacuationRouteOSRM } = require('../utils/osrmRouter');
const { ROAD_NODES } = require('../utils/aStarRouter'); // keep for backward compat

/**
 * POST /api/evacuation/route
 * Body: { from: { lat, lon }, to: { lat, lon }, options?: { vehicleType, priority } }
 * Returns OSRM-computed evacuation route with waypoints, distance, and time.
 */
router.post('/route', async (req, res) => {
  const { from, to, options = {} } = req.body || {};

  // --- Input Validation ---
  if (!from || typeof from.lat !== 'number' || typeof from.lon !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Invalid "from" location. Expected: { lat: number, lon: number }',
      example: { from: { lat: 18.052, lon: 73.418 }, to: { lat: 18.527, lon: 73.512 } },
    });
  }
  if (!to || typeof to.lat !== 'number' || typeof to.lon !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Invalid "to" location. Expected: { lat: number, lon: number }',
    });
  }

  // Rough Maharashtra bounding box check
  const inMaharashtra = (lat, lon) =>
    lat >= 15.5 && lat <= 22.2 && lon >= 72.5 && lon <= 81.0;

  if (!inMaharashtra(from.lat, from.lon)) {
    return res.status(400).json({
      success: false,
      message: '"from" coordinates appear to be outside Maharashtra bounds.',
    });
  }
  if (!inMaharashtra(to.lat, to.lon)) {
    return res.status(400).json({
      success: false,
      message: '"to" coordinates appear to be outside Maharashtra bounds.',
    });
  }

  try {
    const route = await computeEvacuationRouteOSRM(from.lat, from.lon, to.lat, to.lon);

    // Enrich response with operational metadata
    const vehicleType = options.vehicleType || 'bus';
    const priority = options.priority || 'standard';

    // Adjust time estimates for vehicle type
    const speedMultiplier = {
      bus: 1.0,
      truck: 1.15,       // slower in mountains
      ambulance: 0.85,   // priority lane speed
      foot: 8.0,         // 5 km/h foot pace vs 45 km/h MDR baseline
    }[vehicleType] || 1.0;

    const adjustedTimeMin = Math.round(route.estimatedTimeMin * speedMultiplier);

    res.json({
      success: true,
      data: {
        ...route,
        vehicleType,
        priority,
        adjustedTimeMin,
        adjustedTimeFormatted: `${Math.floor(adjustedTimeMin / 60)}h ${adjustedTimeMin % 60}m`,
        recommendations: buildRecommendations(route),
        dataLabel: 'Government of Maharashtra · State Emergency Transport & Evacuation Network',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/evacuation/route
 * Query params: fromLat, fromLon, toLat, toLon
 * Convenience GET version for testing in browser.
 */
router.get('/route', async (req, res) => {
  const { fromLat, fromLon, toLat, toLon } = req.query;
  if (!fromLat || !fromLon || !toLat || !toLon) {
    return res.status(400).json({
      success: false,
      message: 'Required query params: fromLat, fromLon, toLat, toLon',
      example: '/api/evacuation/route?fromLat=18.052&fromLon=73.418&toLat=18.527&toLon=73.512',
    });
  }

  const params = {
    from: { lat: parseFloat(fromLat), lon: parseFloat(fromLon) },
    to: { lat: parseFloat(toLat), lon: parseFloat(toLon) },
  };

  // Validate parsed values
  for (const [field, obj] of Object.entries(params)) {
    if (isNaN(obj.lat) || isNaN(obj.lon)) {
      return res.status(400).json({ success: false, message: `Invalid ${field} coordinates` });
    }
  }

  try {
    const route = await computeEvacuationRouteOSRM(params.from.lat, params.from.lon, params.to.lat, params.to.lon);
    res.json({
      success: true,
      data: { ...route, recommendations: buildRecommendations(route) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/evacuation/nodes
 * Returns all road graph nodes (useful for building a UI picker).
 */
router.get('/nodes', (_req, res) => {
  const nodes = Object.entries(ROAD_NODES).map(([id, n]) => ({
    id,
    name: n.name,
    lat: n.lat,
    lon: n.lon,
  }));

  res.json({
    success: true,
    count: nodes.length,
    data: nodes,
    note: 'These are road network anchor nodes used by the A* evacuation router.',
  });
});

/**
 * POST /api/evacuation/multi-point
 * Body: { stops: [{lat, lon, label}] } — ordered list of waypoints
 * Returns sequential route segments for convoy/multi-stop evacuation.
 */
router.post('/multi-point', async (req, res) => {
  const { stops } = req.body || {};
  if (!Array.isArray(stops) || stops.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least 2 stops: { stops: [{lat, lon, label?}] }',
    });
  }

  const segments = [];
  let totalDistKm = 0;
  let totalTimeMin = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    if (typeof from.lat !== 'number' || typeof from.lon !== 'number' ||
        typeof to.lat !== 'number' || typeof to.lon !== 'number') {
      return res.status(400).json({ success: false, message: `Invalid coordinates at stop index ${i}` });
    }
    const seg = await computeEvacuationRouteOSRM(from.lat, from.lon, to.lat, to.lon);
    segments.push({
      segmentIndex: i,
      fromLabel: from.label || `Stop ${i + 1}`,
      toLabel: to.label || `Stop ${i + 2}`,
      ...seg,
    });
    totalDistKm += seg.totalDistKm;
    totalTimeMin += seg.estimatedTimeMin;
  }

  res.json({
    success: true,
    data: {
      stops,
      segments,
      totalDistKm: parseFloat(totalDistKm.toFixed(1)),
      totalTimeMin,
      totalTimeFormatted: `${Math.floor(totalTimeMin / 60)}h ${totalTimeMin % 60}m`,
      note: 'Government of Maharashtra State Evacuation Network',
    },
  });
});

// ── Helpers ──────────────────────────────────────────────────
function buildRecommendations(route) {
  const recs = [];
  if (!route.found) {
    recs.push({ type: 'warning', message: 'Direct all-weather transit corridor constrained. Heavy transport convoy recommended.' });
  }
  if (route.totalDistKm > 100) {
    recs.push({ type: 'info', message: 'Long-distance inter-district transit. Pre-position refueling and paramedic support.' });
  }
  if (route.estimatedTimeMin > 120) {
    recs.push({ type: 'warning', message: 'Transit exceeds 2 hours. Ensure ambulance escort for vulnerable demographics.' });
  }
  if (route.segments && route.segments.some(s => s.roadType === 'VR')) {
    recs.push({ type: 'caution', message: 'Route includes village roads (VR). Verify culvert clearance before convoy movement.' });
  }
  return recs;
}

module.exports = router;
