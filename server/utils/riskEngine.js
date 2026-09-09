// ============================================================
// Aegis Risk Engine — Transparent Weighted Flood Risk Scoring
// ⚠️  PROTOTYPE / DEMO: Uses synthetic data. Not a live prediction.
// ============================================================

/**
 * Normalise a value to 0–1 range
 * @param {number} val
 * @param {number} min
 * @param {number} max
 */
const normalise = (val, min, max) => {
  if (max === min) return 0;
  return Math.min(1, Math.max(0, (val - min) / (max - min)));
};

/**
 * Reference ranges for normalisation (based on plausible Indian district values)
 */
const RANGES = {
  rainfall: { min: 0, max: 400 },         // mm / 24h
  river_level: { min: 0, max: 12 },        // metres above normal
  elevation: { min: 10, max: 500 },        // metres ASL (low = higher flood risk)
  historical_incidents: { min: 0, max: 10 },
  soil_saturation: { min: 0, max: 100 },   // percentage
};

/**
 * Factor weights — must sum to 1.0
 */
const WEIGHTS = {
  rainfall: 0.30,
  river_level: 0.25,
  elevation: 0.20,          // inverted: lower elevation → higher risk
  historical_incidents: 0.15,
  soil_saturation: 0.10,
};

/**
 * Calculate flood risk for a single village document.
 * @param {object} village  Mongoose village document or plain object
 * @returns {{ score: number, category: string, factors: Array }}
 */
const calculateRisk = (village) => {
  const {
    rainfall = 0,
    river_level = 0,
    elevation = 100,
    historical_flood_incidents = 0,
    soil_saturation = 0,
  } = village;

  // Normalised factor scores (0–1, where 1 = highest contribution to risk)
  const factors = {
    rainfall: normalise(rainfall, RANGES.rainfall.min, RANGES.rainfall.max),
    river_level: normalise(river_level, RANGES.river_level.min, RANGES.river_level.max),
    elevation: 1 - normalise(elevation, RANGES.elevation.min, RANGES.elevation.max), // invert
    historical_incidents: normalise(
      historical_flood_incidents,
      RANGES.historical_incidents.min,
      RANGES.historical_incidents.max
    ),
    soil_saturation: normalise(
      soil_saturation,
      RANGES.soil_saturation.min,
      RANGES.soil_saturation.max
    ),
  };

  // Weighted sum → 0–100 score
  const raw =
    factors.rainfall * WEIGHTS.rainfall +
    factors.river_level * WEIGHTS.river_level +
    factors.elevation * WEIGHTS.elevation +
    factors.historical_incidents * WEIGHTS.historical_incidents +
    factors.soil_saturation * WEIGHTS.soil_saturation;

  const score = Math.round(raw * 100);

  // Category
  let category;
  if (score <= 25) category = 'Low';
  else if (score <= 50) category = 'Moderate';
  else if (score <= 75) category = 'High';
  else category = 'Very High';

  // Top contributing factors (for explainability)
  const factorDetails = [
    {
      key: 'rainfall',
      label: 'Rainfall Intensity',
      value: rainfall,
      unit: 'mm/24h',
      contribution: factors.rainfall * WEIGHTS.rainfall * 100,
      weight: WEIGHTS.rainfall,
      normalised: factors.rainfall,
    },
    {
      key: 'river_level',
      label: 'River Level',
      value: river_level,
      unit: 'm above normal',
      contribution: factors.river_level * WEIGHTS.river_level * 100,
      weight: WEIGHTS.river_level,
      normalised: factors.river_level,
    },
    {
      key: 'elevation',
      label: 'Low Elevation',
      value: elevation,
      unit: 'm ASL',
      contribution: factors.elevation * WEIGHTS.elevation * 100,
      weight: WEIGHTS.elevation,
      normalised: factors.elevation,
    },
    {
      key: 'historical_incidents',
      label: 'Historical Flood Incidents',
      value: historical_flood_incidents,
      unit: 'events',
      contribution: factors.historical_incidents * WEIGHTS.historical_incidents * 100,
      weight: WEIGHTS.historical_incidents,
      normalised: factors.historical_incidents,
    },
    {
      key: 'soil_saturation',
      label: 'Soil Saturation',
      value: soil_saturation,
      unit: '%',
      contribution: factors.soil_saturation * WEIGHTS.soil_saturation * 100,
      weight: WEIGHTS.soil_saturation,
      normalised: factors.soil_saturation,
    },
  ].sort((a, b) => b.contribution - a.contribution);

  return { score, category, factors: factorDetails };
};

/**
 * Generate decision-support recommendations based on risk category.
 * All recommendations require human authorisation — not autonomous actions.
 */
const getRecommendations = (category) => {
  const base = [
    { priority: 'info', text: 'Continue routine monitoring of rainfall and river levels.' },
    { priority: 'info', text: 'Ensure community awareness of local shelter locations.' },
  ];

  if (category === 'Moderate') {
    return [
      { priority: 'warning', text: 'Increase monitoring frequency to every 6 hours.' },
      { priority: 'warning', text: 'Verify shelter readiness and stock emergency supplies.' },
      { priority: 'info', text: 'Alert local response teams to standby status.' },
      ...base,
    ];
  }

  if (category === 'High') {
    return [
      { priority: 'danger', text: 'Issue advisory to residents in low-lying areas to prepare for possible evacuation.' },
      { priority: 'danger', text: 'Alert District Administration, Police, and Fire Department.' },
      { priority: 'warning', text: 'Open designated shelters and pre-position emergency resources.' },
      { priority: 'warning', text: 'Coordinate with hospitals to increase emergency capacity.' },
      { priority: 'info', text: 'Deploy flood relief teams to staging areas.' },
    ];
  }

  if (category === 'Very High') {
    return [
      { priority: 'critical', text: 'IMMEDIATE: Prepare evacuation orders for high-risk zones — awaiting human authorisation.' },
      { priority: 'critical', text: 'Alert all agencies: District Administration, Police, Fire, NDRF, Hospitals.' },
      { priority: 'critical', text: 'Activate Emergency Operations Centre (EOC) at district level.' },
      { priority: 'danger', text: 'Deploy NDRF/SDRF teams immediately.' },
      { priority: 'danger', text: 'Enforce road closures on flood-prone routes.' },
      { priority: 'warning', text: 'Ensure all shelters are at full operational capacity.' },
    ];
  }

  return base;
};

/**
 * Generate alert targets based on risk category.
 */
const getAlertTargets = (category) => {
  if (category === 'Low') return [];
  if (category === 'Moderate') {
    return ['Local Administration', 'Emergency Response Team'];
  }
  if (category === 'High') {
    return ['District Administration', 'Police', 'Fire Department', 'Hospitals', 'Local Administration'];
  }
  // Very High
  return ['District Administration', 'Police', 'Fire Department', 'Hospitals', 'NDRF/SDRF', 'Citizens', 'Local Administration'];
};

module.exports = { calculateRisk, getRecommendations, getAlertTargets };
