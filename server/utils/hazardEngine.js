// ============================================================
// Aegis Multi-Hazard Engine
// Computes composite flood, landslide, erosion, rainfall, terrain scores
// ⚠️  PROTOTYPE — Demonstration weighting. Replace with validated weights for deployment.
// ============================================================

const HAZARD_WEIGHTS = {
  flood:          0.30,
  landslide:      0.25,
  erosion:        0.15,
  extremeRainfall:0.15,
  terrain:        0.15,
};

const HAZARD_LABELS = {
  flood: 'Flood Exposure',
  landslide: 'Landslide Susceptibility',
  erosion: 'Erosion Risk',
  extremeRainfall: 'Extreme Rainfall Exposure',
  terrain: 'Terrain Vulnerability',
};

const norm = (v, min, max) => Math.min(1, Math.max(0, (v - min) / (max - min)));

// Derive terrain score from elevation, slope, soil saturation
const computeTerrainScore = ({ elevation = 100, slope = 5, soilSaturation = 50 }) => {
  const elevRisk = 1 - norm(elevation, 10, 500); // lower = riskier
  const slopeRisk = norm(slope, 0, 35);
  const satRisk   = norm(soilSaturation, 0, 100);
  return Math.round((elevRisk * 0.4 + slopeRisk * 0.3 + satRisk * 0.3) * 100);
};

/**
 * computeHazardScore
 * @param {object} habitation - has hazardExposure + terrain fields
 * @returns {{ composite, scores, factors }}
 */
const computeHazardScore = (habitation) => {
  const { hazardExposure = {}, terrain = {} } = habitation;

  const terrainScore = habitation.hazardExposure?.terrain ?? computeTerrainScore(terrain);

  const raw = {
    flood:           hazardExposure.flood          ?? 0,
    landslide:       hazardExposure.landslide       ?? 0,
    erosion:         hazardExposure.erosion         ?? 0,
    extremeRainfall: hazardExposure.extremeRainfall ?? 0,
    terrain:         terrainScore,
  };

  const composite = Math.round(
    Object.entries(HAZARD_WEIGHTS).reduce(
      (sum, [key, w]) => sum + (raw[key] / 100) * w * 100,
      0
    )
  );

  const factors = Object.entries(HAZARD_WEIGHTS).map(([key, weight]) => ({
    key,
    label: HAZARD_LABELS[key],
    score: raw[key],
    weight,
    contribution: parseFloat(((raw[key] / 100) * weight * 100).toFixed(1)),
  })).sort((a, b) => b.contribution - a.contribution);

  const category =
    composite >= 76 ? 'Very High' :
    composite >= 51 ? 'High' :
    composite >= 26 ? 'Moderate' : 'Low';

  return { composite, scores: raw, factors, category };
};

module.exports = { computeHazardScore, computeTerrainScore };
