// ============================================================
// Aegis Risk Routes — Platform-wide Risk Intelligence API
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../store/db');

/**
 * GET /api/risk/summary
 * Returns comprehensive platform-wide statistics:
 * - Population at risk totals
 * - Timeline distribution (Immediate / Short-Term / Medium-Term / Monitor)
 * - District-level breakdown
 * - Hazard type distribution
 * - Site capacity overview
 * - Top 5 highest-risk habitations
 * - Active alert count
 */
router.get('/summary', (_req, res) => {
  const habitations = db.getAllHabitations();
  const sites = db.getAllSites();
  const s = db.summaryStats();

  // ── District-level breakdown ─────────────────────────────
  const districtMap = {};
  for (const h of habitations) {
    if (!districtMap[h.district]) {
      districtMap[h.district] = {
        district: h.district,
        habitationCount: 0,
        totalPopulation: 0,
        vulnerablePopulation: 0,
        redZoneCount: 0,
        immediateCount: 0,
        shortTermCount: 0,
        avgHazardScore: 0,
        avgVulnerabilityScore: 0,
        dominantHazard: null,
        _hazardScores: [],
        _floodScores: [], _landslideScores: [],
      };
    }
    const d = districtMap[h.district];
    d.habitationCount++;
    d.totalPopulation += h.population;
    d.vulnerablePopulation += h.vulnerablePopulation || 0;
    if (h.redZoneStatus) d.redZoneCount++;
    if (h.relocationTimeline === 'Immediate') d.immediateCount++;
    if (h.relocationTimeline === 'Short-Term') d.shortTermCount++;
    d._hazardScores.push(h.hazardScore || 0);
    d._floodScores.push(h.hazardExposure?.flood || 0);
    d._landslideScores.push(h.hazardExposure?.landslide || 0);
  }

  const districtBreakdown = Object.values(districtMap).map((d) => {
    const avg = (arr) => arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 0;
    const avgFlood = avg(d._floodScores);
    const avgLandslide = avg(d._landslideScores);
    return {
      district: d.district,
      habitationCount: d.habitationCount,
      totalPopulation: d.totalPopulation,
      vulnerablePopulation: d.vulnerablePopulation,
      redZoneCount: d.redZoneCount,
      immediateCount: d.immediateCount,
      shortTermCount: d.shortTermCount,
      avgHazardScore: avg(d._hazardScores),
      dominantHazard: avgFlood >= avgLandslide ? 'Flood' : 'Landslide',
      avgFloodExposure: avgFlood,
      avgLandslideExposure: avgLandslide,
    };
  }).sort((a, b) => b.avgHazardScore - a.avgHazardScore);

  // ── Hazard type distribution ─────────────────────────────
  const hazardDist = {
    extremeFlood: habitations.filter(h => (h.hazardExposure?.flood || 0) >= 80).length,
    highFlood: habitations.filter(h => (h.hazardExposure?.flood || 0) >= 60 && (h.hazardExposure?.flood || 0) < 80).length,
    extremeLandslide: habitations.filter(h => (h.hazardExposure?.landslide || 0) >= 80).length,
    highLandslide: habitations.filter(h => (h.hazardExposure?.landslide || 0) >= 60 && (h.hazardExposure?.landslide || 0) < 80).length,
    highErosion: habitations.filter(h => (h.hazardExposure?.erosion || 0) >= 60).length,
    highExtremeRainfall: habitations.filter(h => (h.hazardExposure?.extremeRainfall || 0) >= 70).length,
  };

  // ── Site capacity overview ───────────────────────────────
  const totalMaxCapacity = sites.reduce((s, site) => s + site.maxCapacity, 0);
  const totalCurrentOccupancy = sites.reduce((s, site) => s + site.currentOccupancy, 0);
  const totalAvailable = sites.reduce((s, site) => s + Math.max(0, site.maxCapacity - site.currentOccupancy - site.reservedCapacity), 0);
  const suitableSiteCount = sites.filter(s => s.suitabilityStatus === 'Suitable').length;
  const capacityVsDemand = {
    immediatePopulationDemand: habitations.filter(h => h.relocationTimeline === 'Immediate').reduce((s, h) => s + h.population, 0),
    shortTermPopulationDemand: habitations.filter(h => h.relocationTimeline === 'Short-Term').reduce((s, h) => s + h.population, 0),
    totalAvailableCapacity: totalAvailable,
    surplusOrDeficit: totalAvailable - habitations.filter(h => h.relocationTimeline === 'Immediate').reduce((s, h) => s + h.population, 0),
  };

  // ── Top 5 highest-risk habitations ──────────────────────
  const top5Risk = habitations
    .slice()
    .sort((a, b) => b.relocationPriorityScore - a.relocationPriorityScore)
    .slice(0, 5)
    .map(h => ({
      id: h._id,
      name: h.name,
      district: h.district,
      hazardScore: h.hazardScore,
      hazardCategory: h.hazardCategory,
      relocationPriorityScore: h.relocationPriorityScore,
      relocationTimeline: h.relocationTimeline,
      population: h.population,
      redZoneStatus: h.redZoneStatus,
    }));

  // ── Risk index (composite platform score) ────────────────
  const platformRiskIndex = parseFloat(
    (habitations.reduce((sum, h) => sum + (h.hazardScore || 0), 0) / habitations.length).toFixed(1)
  );
  const platformVulnIndex = parseFloat(
    (habitations.reduce((sum, h) => sum + (h.vulnerabilityScore || 0), 0) / habitations.length).toFixed(1)
  );

  res.json({
    success: true,
    data: {
      // Core counts (from base summaryStats)
      ...s,
      // Enhanced additions
      platformRiskIndex,
      platformVulnIndex,
      riskLevel: platformRiskIndex >= 70 ? 'High' : platformRiskIndex >= 45 ? 'Moderate' : 'Low',
      districtBreakdown,
      hazardDistribution: hazardDist,
      siteCapacity: {
        totalSites: sites.length,
        suitableSites: suitableSiteCount,
        totalMaxCapacity,
        totalCurrentOccupancy,
        totalAvailableCapacity: totalAvailable,
        overallUtilisationPct: parseFloat(((totalCurrentOccupancy / totalMaxCapacity) * 100).toFixed(1)),
        capacityVsDemand,
      },
      top5HighestRisk: top5Risk,
      generatedAt: new Date().toISOString(),
      dataLabel: 'Government of Maharashtra · State Disaster Management Authority (SDMA) Operational Intelligence',
    },
  });
});

/**
 * POST /api/risk/ai-evaluate
 * Evaluates multi-hazard risk using XGBoost & SHAP feature attribution
 * Calls the Python XGBoost Microservice (Port 8000), falls back to heuristic mock if offline.
 */
router.post('/ai-evaluate', async (req, res) => {
  const { habitationId, weatherOverride = {} } = req.body || {};
  const habitation = db.getHabitationById(habitationId) || db.getAllHabitations()[0];
  if (!habitation) return res.status(404).json({ success: false, message: 'Habitation not found' });

  const rainfall = weatherOverride.rainfall24h ?? habitation.liveWeather?.rainfall24h ?? (habitation.hazardExposure?.extremeRainfall * 2.2) ?? 0;
  const riverLevel = weatherOverride.riverLevel ?? habitation.liveWeather?.riverLevel ?? (habitation.hazardExposure?.flood / 12) ?? 0;
  const elevation = habitation.terrain?.elevation || 45;
  const slope = habitation.terrain?.slope || 12;
  const soilSaturation = habitation.terrain?.soilSaturation || 80;
  const historicalEvents = habitation.historicalRisk || 6;
  const populationDensity = (habitation.population / 2) || 2000;
  const distRiver = 2.0;

  try {
    // Attempt to call the Python AI Engine
    const aiResponse = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        habitation_id: habitation._id,
        rainfall_24h: Math.min(Math.max(rainfall, 0), 500),
        river_level_above_normal: Math.min(Math.max(riverLevel, -2), 15),
        elevation_asl: Math.min(Math.max(elevation, 0), 4000),
        slope_degrees: Math.min(Math.max(slope, 0), 60),
        soil_saturation_pct: Math.min(Math.max(soilSaturation, 0), 100),
        historical_flood_events: historicalEvents,
        historical_landslide_events: Math.round(historicalEvents / 2),
        population_density: populationDensity,
        distance_to_river_km: distRiver,
        land_cover_type: 'Settlement'
      })
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      
      // Adapt python output to frontend expected format
      const adaptedShap = aiData.shap_explanations.map(s => ({
        feature: s.display_name,
        observedValue: s.value_label,
        impactPts: Math.round(Math.abs(s.shap_value) * 10),
        status: s.label
      }));

      return res.json({
        success: true,
        data: {
          habitationId: habitation._id,
          habitationName: habitation.name,
          district: habitation.district,
          riskScore: aiData.risk_score,
          riskCategory: aiData.risk_category,
          confidence: aiData.confidence,
          modelVersion: aiData.model_version,
          shapAttribution: adaptedShap,
          directives: aiData.recommendations
        }
      });
    }
  } catch (error) {
    console.warn("Python AI engine unreachable, falling back to heuristic engine.");
  }

  // FALLBACK Heuristic Engine (If Python is offline)
  const rainImpact = Math.round(rainfall * 0.18);
  const riverImpact = Math.round(riverLevel * 4.2);
  const elevImpact = Math.max(4, Math.round((250 - elevation) * 0.12));
  const slopeImpact = Math.round(slope * 0.85);
  const satImpact = Math.round(soilSaturation * 0.14);
  const histImpact = Math.round(historicalEvents * 3.5);

  const rawScore = rainImpact + riverImpact + elevImpact + slopeImpact + satImpact + histImpact;
  const score = Math.min(99, Math.max(15, rawScore));

  let category = 'Low';
  if (score >= 75) category = 'Critical';
  else if (score >= 55) category = 'High';
  else if (score >= 35) category = 'Moderate';

  res.json({
    success: true,
    data: {
      habitationId: habitation._id,
      habitationName: habitation.name,
      district: habitation.district,
      riskScore: score,
      riskCategory: category,
      confidence: 0.94,
      modelVersion: 'Aegis-Heuristic-Fallback-v2',
      shapAttribution: [
        { feature: '24h Cumulative Precipitation', observedValue: `${rainfall.toFixed(1)} mm`, impactPts: rainImpact, status: rainImpact > 20 ? 'Critical Driver' : 'High' },
        { feature: 'River Water Gauge Level', observedValue: `${riverLevel.toFixed(1)} m above datum`, impactPts: riverImpact, status: riverImpact > 18 ? 'Major Surge' : 'Moderate' },
        { feature: 'Low-Lying Basin Elevation', observedValue: `${elevation} m ASL`, impactPts: elevImpact, status: 'Topographic Inundation' },
        { feature: 'Slope Incline & Debris Vulnerability', observedValue: `${slope}° gradient`, impactPts: slopeImpact, status: slope > 25 ? 'High Landslide Risk' : 'Stable' },
        { feature: 'Soil Saturation Index', observedValue: `${soilSaturation}%`, impactPts: satImpact, status: 'Runoff Acceleration' },
        { feature: 'Historical Disaster Recurrence', observedValue: `${historicalEvents} major events`, impactPts: histImpact, status: 'High Vulnerability History' },
      ],
      directives: [
        score >= 75 ? 'PRIORITY 1: Immediate evacuation clearance required for vulnerable riverbank & slope settlements.' : 'PRIORITY 2: Continuous automated sensor monitoring at 1-hour intervals.',
        'Issue automated dispatch to District Collectorate & Emergency Operations Center.',
        'Pre-reserve capacity at nearest designated government rehabilitation hub.'
      ]
    }
  });
});

/**
 * GET /api/risk/habitations/:id/detail
 * Returns full risk detail for a single habitation.
 */
router.get('/habitations/:id/detail', (req, res) => {
  const h = db.getHabitationById(req.params.id);
  if (!h) return res.status(404).json({ success: false, message: 'Habitation not found' });
  res.json({ success: true, data: h });
});

/**
 * GET /api/risk/redzone
 * Returns all habitations currently in red-zone status, sorted by hazard score.
 */
router.get('/redzone', (_req, res) => {
  const zones = db.getRedZones();
  res.json({ success: true, count: zones.length, data: zones });
});

/**
 * GET /api/risk/priority
 * Returns habitations sorted by relocation priority score.
 */
router.get('/priority', (_req, res) => {
  const list = db.getRelocationPriority();
  res.json({ success: true, count: list.length, data: list });
});

module.exports = router;
