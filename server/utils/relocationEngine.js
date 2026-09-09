// ============================================================
// Aegis Relocation Priority Engine
// Computes urgency score (0–100) and recommended timeline
// ⚠️  PROTOTYPE — AI-assisted recommendation. Human authority validation required.
// ============================================================

const PRIORITY_WEIGHTS = {
  hazardExposure:         0.35,
  populationVulnerability:0.25,
  historicalExposure:     0.15,
  infrastructureRisk:     0.15,
  accessibilityRisk:      0.10,
};

const norm = (v, min, max) => Math.min(1, Math.max(0, (v - min) / (max - min)));

const accessMap = { good: 10, moderate: 35, poor: 70, very_poor: 95 };

/**
 * computeRelocationPriority
 * @param {object} hazardResult   - from computeHazardScore()
 * @param {object} vulnResult     - from computeVulnerabilityScore()
 * @param {object} habitation     - raw habitation record
 * @returns {{ score, timeline, label, reason, factors }}
 */
const computeRelocationPriority = (hazardResult, vulnResult, habitation) => {
  const {
    historicalRisk = 0,
    evacuationAccessibility = 'moderate',
    infrastructure = {},
  } = habitation;

  const infraRisk = (() => {
    let r = 0;
    if ((infrastructure.hospitals ?? 0) === 0) r += 40;
    if ((infrastructure.shelters ?? 0) === 0) r += 35;
    if ((infrastructure.schools ?? 0) < 2) r += 25;
    return Math.min(100, r);
  })();

  const raw = {
    hazardExposure:          hazardResult.composite,
    populationVulnerability: vulnResult.score,
    historicalExposure:      Math.round(norm(historicalRisk, 0, 10) * 100),
    infrastructureRisk:      infraRisk,
    accessibilityRisk:       accessMap[evacuationAccessibility] ?? 50,
  };

  const score = Math.round(
    Object.entries(PRIORITY_WEIGHTS).reduce(
      (sum, [key, w]) => sum + (raw[key] / 100) * w * 100,
      0
    )
  );

  const timeline =
    score >= 76 ? 'Immediate' :
    score >= 51 ? 'Short-Term' :
    score >= 26 ? 'Medium-Term' : 'Monitor';

  const label =
    score >= 76 ? 'IMMEDIATE' :
    score >= 51 ? 'SHORT-TERM' :
    score >= 26 ? 'MEDIUM-TERM' : 'MONITOR';

  const timelineDesc = {
    Immediate:   '0–7 days — Urgent authority review required',
    'Short-Term':'1–3 months — Priority planning required',
    'Medium-Term':'3–12 months — Systematic assessment recommended',
    Monitor:     'Ongoing — Continue routine monitoring',
  };

  const factors = [
    { key: 'hazardExposure',          label: 'Multi-Hazard Exposure',       score: raw.hazardExposure,          weight: PRIORITY_WEIGHTS.hazardExposure,          contribution: parseFloat(((raw.hazardExposure / 100) * PRIORITY_WEIGHTS.hazardExposure * 100).toFixed(1)) },
    { key: 'populationVulnerability', label: 'Population Vulnerability',    score: raw.populationVulnerability, weight: PRIORITY_WEIGHTS.populationVulnerability, contribution: parseFloat(((raw.populationVulnerability / 100) * PRIORITY_WEIGHTS.populationVulnerability * 100).toFixed(1)) },
    { key: 'historicalExposure',      label: 'Historical Disaster Exposure',score: raw.historicalExposure,      weight: PRIORITY_WEIGHTS.historicalExposure,      contribution: parseFloat(((raw.historicalExposure / 100) * PRIORITY_WEIGHTS.historicalExposure * 100).toFixed(1)) },
    { key: 'infrastructureRisk',      label: 'Critical Infrastructure Risk',score: raw.infrastructureRisk,      weight: PRIORITY_WEIGHTS.infrastructureRisk,      contribution: parseFloat(((raw.infrastructureRisk / 100) * PRIORITY_WEIGHTS.infrastructureRisk * 100).toFixed(1)) },
    { key: 'accessibilityRisk',       label: 'Evacuation Accessibility Risk',score: raw.accessibilityRisk,     weight: PRIORITY_WEIGHTS.accessibilityRisk,       contribution: parseFloat(((raw.accessibilityRisk / 100) * PRIORITY_WEIGHTS.accessibilityRisk * 100).toFixed(1)) },
  ].sort((a, b) => b.contribution - a.contribution);

  // Generate human-readable reason
  const topFactors = factors.slice(0, 3).map(f => f.label.toLowerCase());
  const reason = `High ${topFactors.join(', ')} identified through AEGIS synthetic assessment model. This is an AI-assisted recommendation — authority validation required before any relocation action.`;

  return {
    score,
    timeline,
    label,
    timelineDesc: timelineDesc[timeline],
    reason,
    factors,
  };
};

module.exports = { computeRelocationPriority };
