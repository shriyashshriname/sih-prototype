// ============================================================
// Aegis Capacity Engine
// Validates site carrying capacity against required population
// ⚠️  PROTOTYPE — Demonstration calculation only.
// ============================================================

/**
 * assessCapacity
 * @param {object} site       - relocation site record
 * @param {number} required   - population needing relocation
 * @returns {{ available, utilization, isAdequate, status, breakdown }}
 */
const assessCapacity = (site, required = 0) => {
  const {
    maxCapacity = 0,
    currentOccupancy = 0,
    reservedCapacity = 0,
    waterCapacity = 70,
    healthcareCapacity = 70,
    educationCapacity = 70,
    shelterCapacity = 70,
  } = site;

  const available = Math.max(0, maxCapacity - currentOccupancy - reservedCapacity);
  const isAdequate = available >= required;
  const utilizationAfter = required > 0
    ? Math.round(((currentOccupancy + required) / maxCapacity) * 100)
    : Math.round((currentOccupancy / maxCapacity) * 100);

  const status = isAdequate
    ? (utilizationAfter > 90 ? 'Near Capacity' : 'Sufficient')
    : 'Insufficient';

  const infrastructure = [
    { label: 'Water Supply',      capacity: waterCapacity,      status: waterCapacity >= 70 ? 'Adequate' : 'Limited' },
    { label: 'Healthcare',        capacity: healthcareCapacity, status: healthcareCapacity >= 70 ? 'Adequate' : 'Limited' },
    { label: 'Education',         capacity: educationCapacity,  status: educationCapacity >= 70 ? 'Adequate' : 'Limited' },
    { label: 'Shelter / Housing', capacity: shelterCapacity,    status: shelterCapacity >= 70 ? 'Adequate' : 'Limited' },
  ];

  const constraints = infrastructure
    .filter(i => i.capacity < 70)
    .map(i => i.label);

  return {
    maxCapacity,
    currentOccupancy,
    reservedCapacity,
    available,
    required,
    utilizationAfter,
    isAdequate,
    status,
    infrastructure,
    constraints,
  };
};

module.exports = { assessCapacity };
