// ============================================================
// Aegis Distance Engine — Geographic Distance Calculation
// Haversine formula implementation for coordinate pairs (lat/lng)
// Returns distance in kilometers (km)
// ⚠️ Straight-line planning distance for spatial feasibility analysis
// ============================================================

/**
 * Calculates straight-line geographic distance between two lat/lng coordinates
 * using the Haversine formula on spherical earth approximation.
 * 
 * @param {number} lat1 - Source latitude in degrees
 * @param {number} lon1 - Source longitude in degrees
 * @param {number} lat2 - Target latitude in degrees
 * @param {number} lon2 - Target longitude in degrees
 * @returns {number} Distance in kilometers rounded to 1 decimal place
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return 9999;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Categorize distance into planning bands
 * @param {number} distKm 
 * @returns {'preferred' | 'extended' | 'distant'}
 */
function getDistanceCategory(distKm) {
  if (distKm <= 25) return 'preferred';
  if (distKm <= 50) return 'extended';
  return 'distant';
}

/**
 * Score geographic practicality (0-100) based on distance bands
 * 0–10 km: 100
 * 10–20 km: 95
 * 20–30 km: 90
 * 30–40 km: 80
 * 40–50 km: 65
 * >50 km: 0 / excluded
 */
function scoreGeographicPracticality(distKm) {
  if (distKm <= 10) return 100;
  if (distKm <= 20) return 95;
  if (distKm <= 30) return 90;
  if (distKm <= 40) return 80;
  if (distKm <= 50) return 65;
  return 0;
}

module.exports = {
  calculateDistance,
  getDistanceCategory,
  scoreGeographicPracticality,
};
