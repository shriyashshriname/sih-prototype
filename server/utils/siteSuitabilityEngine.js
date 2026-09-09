// ============================================================
// Aegis Site Suitability Engine
// Computes suitability score (0–100) for a relocation site
// ⚠️  PROTOTYPE — Demonstration weighting.
// ============================================================

const SUITABILITY_WEIGHTS = {
  hazardSafety:           0.30,
  carryingCapacity:       0.20,
  roadAccessibility:      0.15,
  healthcareAccess:       0.10,
  educationAccess:        0.10,
  waterAvailability:      0.05,
  shelterAvailability:    0.05,
  environmentalSuitability:0.05,
};

const norm = (v, min, max) => Math.min(1, Math.max(0, (v - min) / (max - min)));

// Invert a hazard score → safety score
const hazardToSafety = (hazardComposite) => Math.max(0, 100 - hazardComposite);

// Distance → accessibility score (shorter = better)
const distToScore = (distKm, maxKm = 20) => Math.round((1 - norm(distKm, 0, maxKm)) * 100);

// Capacity utilization → capacity score
const capacityScore = (max, current, reserved, required) => {
  const available = Math.max(0, max - current - reserved);
  if (available >= required) return 100;
  if (available <= 0) return 0;
  return Math.round((available / required) * 100);
};

/**
 * computeSiteSuitability
 * @param {object} site         - relocation site record
 * @param {number} requiredPop  - population that needs to relocate
 * @returns {{ score, status, factors, available, isAdequate }}
 */
const computeSiteSuitability = (site, requiredPop = 0) => {
  const {
    hazardExposure = {},
    maxCapacity = 0,
    currentOccupancy = 0,
    reservedCapacity = 0,
    waterCapacity = 70,
    healthcareCapacity = 70,
    educationCapacity = 70,
    shelterCapacity = 70,
    roadAccessibility = 70,
    hospitalDistance = 5,
    schoolDistance = 3,
    environmentalSuitability = 70,
  } = site;

  // Hazard safety
  const hazardComposite =
    (hazardExposure.flood ?? 0) * 0.4 +
    (hazardExposure.landslide ?? 0) * 0.35 +
    (hazardExposure.erosion ?? 0) * 0.15 +
    (hazardExposure.extremeRainfall ?? 0) * 0.1;
  const hazardSafetyScore = hazardToSafety(hazardComposite);

  const available = Math.max(0, maxCapacity - currentOccupancy - reservedCapacity);
  const isAdequate = available >= requiredPop;
  const capScore = requiredPop > 0
    ? capacityScore(maxCapacity, currentOccupancy, reservedCapacity, requiredPop)
    : Math.round((available / Math.max(1, maxCapacity)) * 100);

  const raw = {
    hazardSafety:            Math.round(hazardSafetyScore),
    carryingCapacity:        capScore,
    roadAccessibility:       Math.round(roadAccessibility),
    healthcareAccess:        distToScore(hospitalDistance, 20),
    educationAccess:         distToScore(schoolDistance, 15),
    waterAvailability:       Math.round(waterCapacity),
    shelterAvailability:     Math.round(shelterCapacity),
    environmentalSuitability:Math.round(environmentalSuitability),
  };

  const score = Math.round(
    Object.entries(SUITABILITY_WEIGHTS).reduce(
      (sum, [key, w]) => sum + (raw[key] / 100) * w * 100,
      0
    )
  );

  const labels = {
    hazardSafety:            'Hazard Safety',
    carryingCapacity:        'Carrying Capacity',
    roadAccessibility:       'Road Accessibility',
    healthcareAccess:        'Healthcare Access',
    educationAccess:         'Education Access',
    waterAvailability:       'Water Availability',
    shelterAvailability:     'Shelter Availability',
    environmentalSuitability:'Environmental Suitability',
  };

  const factors = Object.entries(SUITABILITY_WEIGHTS).map(([key, weight]) => ({
    key,
    label: labels[key],
    score: raw[key],
    weight,
    contribution: parseFloat(((raw[key] / 100) * weight * 100).toFixed(1)),
  })).sort((a, b) => b.contribution - a.contribution);

  const status =
    score >= 80 ? 'Suitable' :
    score >= 60 ? 'Conditional' : 'Unsuitable';

  return { score, status, factors, available, isAdequate, rawScores: raw };
};

module.exports = { computeSiteSuitability };
