// ============================================================
// Aegis Relocation Matching Engine
// Geographic-First Decision Support for Vulnerable Habitations
// Implements SIH26191 core principles:
// GEOGRAPHIC FEASIBILITY → HAZARD SAFETY → POPULATION → ACCESSIBILITY → CARRYING CAPACITY → SITE SUITABILITY → FINAL RANKING
// ⚠️ Prototype Demonstration Algorithm — Not for operational life-safety decisions.
// ============================================================

const { calculateDistance, scoreGeographicPracticality } = require('./distanceEngine');

// Adjacent / neighboring district lookup for Maharashtra demo
const NEIGHBORING_DISTRICTS = {
  'Pune': ['Raigad', 'Satara', 'Ahilyanagar', 'Thane'],
  'Raigad': ['Pune', 'Ratnagiri', 'Thane'],
  'Ratnagiri': ['Raigad', 'Sindhudurg', 'Satara', 'Kolhapur'],
  'Kolhapur': ['Sangli', 'Ratnagiri', 'Sindhudurg'],
  'Sangli': ['Kolhapur', 'Satara', 'Solapur'],
  'Sindhudurg': ['Ratnagiri', 'Kolhapur'],
};

/**
 * Score district relationship
 * @param {string} sourceDistrict 
 * @param {string} targetDistrict 
 * @returns {number} Bonus score (+8 same, +3 neighboring, 0 far)
 */
function getDistrictBonus(sourceDistrict, targetDistrict) {
  if (!sourceDistrict || !targetDistrict) return 0;
  if (sourceDistrict.toLowerCase() === targetDistrict.toLowerCase()) return 8;
  const neighbors = NEIGHBORING_DISTRICTS[sourceDistrict] || [];
  if (neighbors.some(n => n.toLowerCase() === targetDistrict.toLowerCase())) return 3;
  return 0;
}

/**
 * Invert hazard exposure into a 0-100 safety score
 */
function calculateHazardSafety(hazardExposure = {}) {
  const flood = hazardExposure.flood || 0;
  const landslide = hazardExposure.landslide || 0;
  const erosion = hazardExposure.erosion || 0;
  const rainfall = hazardExposure.extremeRainfall || hazardExposure.rainfall || 0;
  
  const compositeHazard = (flood * 0.35) + (landslide * 0.35) + (erosion * 0.15) + (rainfall * 0.15);
  return Math.max(0, Math.min(100, Math.round(100 - compositeHazard)));
}

/**
 * Main matching function
 * @param {object} sourceHabitation 
 * @param {Array} candidateSites 
 * @param {object} options 
 */
function matchRelocationSites(sourceHabitation, candidateSites = [], options = {}) {
  const preferredRadiusKm = options.preferredRadiusKm || 25;
  const maxRadiusKm = options.maxRadiusKm || 50;
  const population = sourceHabitation.population || 1000;

  const evaluated = [];
  const excluded = [];
  const rejectionBreakdown = { capacity: 0, hazard: 0, distance: 0 };

  candidateSites.forEach((site) => {
    // 1. Calculate precise straight-line distance
    const distKm = calculateDistance(
      sourceHabitation.lat,
      sourceHabitation.lng,
      site.lat,
      site.lng
    );

    // 2. Capacity analysis
    const maxCap = site.maxCapacity || 0;
    const currentOcc = site.currentOccupancy || 0;
    const reserved = site.reservedCapacity || 0;
    const available = Math.max(0, maxCap - currentOcc - reserved);
    const isCapacitySufficient = available >= population;
    const utilizationPct = maxCap > 0 ? Math.round(((currentOcc + (isCapacitySufficient ? population : available)) / maxCap) * 100) : 0;

    // 3. Safety & Component Scores
    const geoScore = scoreGeographicPracticality(distKm);
    const hazardSafety = calculateHazardSafety(site.hazardExposure);
    
    // Capacity score: full points if sufficient, scaled if partial
    const capScore = isCapacitySufficient ? 100 : (population > 0 ? Math.round((available / population) * 80) : 0);

    const roadAccess = site.roadAccessibility || 80;
    const hospDist = site.hospitalDistance || site.hospitalDistanceKm || 3;
    const healthScore = Math.max(0, Math.min(100, Math.round((1 - (hospDist / 20)) * 100)));
    const schoolDist = site.schoolDistance || site.schoolDistanceKm || 2;
    const eduScore = Math.max(0, Math.min(100, Math.round((1 - (schoolDist / 15)) * 100)));
    const waterScore = site.waterCapacity || site.waterAvailability || 80;
    const envScore = site.environmentalSuitability || 80;

    // 4. District Bonus
    const districtBonus = getDistrictBonus(sourceHabitation.district, site.district);

    // 5. Final Relocation Score (SIH26191 Weights)
    // Geographic Practicality: 25%
    // Hazard Safety: 25%
    // Carrying Capacity: 20%
    // Road Accessibility: 10%
    // Healthcare Access: 5%
    // Education Access: 5%
    // Water Availability: 5%
    // Environmental Suitability: 5%
    const baseScore = 
      (geoScore * 0.25) +
      (hazardSafety * 0.25) +
      (capScore * 0.20) +
      (roadAccess * 0.10) +
      (healthScore * 0.05) +
      (eduScore * 0.05) +
      (waterScore * 0.05) +
      (envScore * 0.05);

    // Add district bonus only if distance is reasonable and not severely hazardous
    const finalScore = Math.min(100, Math.round(baseScore + (distKm <= 50 && hazardSafety >= 60 ? districtBonus : 0)));

    // Determine status badge
    let status = 'SUITABLE';
    let isRecommended = false;
    let rejectionReason = null;

    if (distKm > maxRadiusKm) {
      status = 'TOO FAR';
      rejectionReason = `${distKm} km from source habitation (exceeds ${maxRadiusKm} km local planning radius)`;
      rejectionBreakdown.distance++;
    } else if (!isCapacitySufficient) {
      status = 'INSUFFICIENT CAPACITY';
      rejectionReason = `Available capacity (${available.toLocaleString()}) is less than required population (${population.toLocaleString()})`;
      rejectionBreakdown.capacity++;
    } else if (hazardSafety < 60) {
      status = 'HIGH HAZARD';
      rejectionReason = `Elevated multi-hazard exposure (Safety score: ${hazardSafety}/100)`;
      rejectionBreakdown.hazard++;
    } else if (distKm <= preferredRadiusKm && finalScore >= 80) {
      status = 'RECOMMENDED';
      isRecommended = true;
    } else if (finalScore >= 70) {
      status = 'SUITABLE';
    } else {
      status = 'CONDITIONAL';
    }

    const candidateObj = {
      _id: site._id,
      name: site.name,
      displayName: site.displayName || site.name,
      district: site.district,
      relocationCluster: site.relocationCluster || `${site.district} Cluster`,
      lat: site.lat,
      lng: site.lng,
      distanceKm: distKm,
      distanceLabel: `${distKm} km from source habitation`,
      isWithinPreferredRadius: distKm <= preferredRadiusKm,
      isWithinExtendedRadius: distKm <= maxRadiusKm,
      maxCapacity: maxCap,
      currentOccupancy: currentOcc,
      availableCapacity: available,
      isCapacitySufficient,
      utilizationPct,
      hazardSafety,
      hazardExposure: site.hazardExposure || {},
      roadAccessibility: roadAccess,
      hospitalDistance: hospDist,
      schoolDistance: schoolDist,
      waterCapacity: waterScore,
      environmentalSuitability: envScore,
      suitabilityScore: finalScore,
      status,
      isRecommended,
      districtBonus,
      rejectionReason,
      factors: [
        { label: 'Geographic Practicality', score: geoScore, weight: 25, value: `${distKm} km` },
        { label: 'Hazard Safety', score: hazardSafety, weight: 25, value: `${hazardSafety}/100` },
        { label: 'Carrying Capacity', score: capScore, weight: 20, value: `${available.toLocaleString()} available` },
        { label: 'Road Accessibility', score: roadAccess, weight: 10, value: `${roadAccess}/100` },
        { label: 'Healthcare Access', score: healthScore, weight: 5, value: `${hospDist} km` },
        { label: 'Education Access', score: eduScore, weight: 5, value: `${schoolDist} km` },
        { label: 'Water Availability', score: waterScore, weight: 5, value: `${waterScore}/100` },
        { label: 'Environmental Suitability', score: envScore, weight: 5, value: `${envScore}/100` },
      ],
    };

    evaluated.push(candidateObj);

    if (rejectionReason) {
      excluded.push({
        _id: site._id,
        name: site.name,
        district: site.district,
        distanceKm: distKm,
        availableCapacity: available,
        suitabilityScore: finalScore,
        rejectionReason,
      });
    }
  });

  // Split into Nearby (<=25km), Extended (25-50km), and Wider (>50km)
  const nearbyCandidates = evaluated
    .filter(c => c.isWithinPreferredRadius && c.isCapacitySufficient && c.hazardSafety >= 60)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const extendedCandidates = evaluated
    .filter(c => !c.isWithinPreferredRadius && c.isWithinExtendedRadius && c.isCapacitySufficient && c.hazardSafety >= 60)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const widerAlternatives = evaluated
    .filter(c => !c.isWithinExtendedRadius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Combine primary candidates following Step 1 and Step 2 logic:
  // If nearby has >= 3 viable sites, primary is nearby. Otherwise expand with extended.
  let primaryCandidates = [...nearbyCandidates];
  if (primaryCandidates.length < 3) {
    primaryCandidates = primaryCandidates.concat(extendedCandidates);
  }

  // If still empty (e.g. all rejected by capacity/hazard), fallback to nearest valid sites with warnings
  if (primaryCandidates.length === 0) {
    primaryCandidates = evaluated
      .filter(c => c.isWithinExtendedRadius)
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  // Ensure top candidate has 'RECOMMENDED' status badge
  if (primaryCandidates.length > 0 && primaryCandidates[0].isCapacitySufficient) {
    primaryCandidates[0].status = 'RECOMMENDED';
    primaryCandidates[0].isRecommended = true;
  }

  const topSite = primaryCandidates[0] || null;

  // Generate "Why this site?" reasons for the recommended site
  const whyReasons = topSite ? [
    `Geographically close (${topSite.distanceKm} km straight-line planning distance from source)`,
    `Sufficient carrying capacity (${topSite.availableCapacity.toLocaleString()} available for ${population.toLocaleString()} residents)`,
    `High multi-hazard safety profile (${topSite.hazardSafety}/100 terrain and flood safety)`,
    `Strong road connectivity (${topSite.roadAccessibility}/100 all-weather road access)`,
    `Essential services access (Rural hospital ${topSite.hospitalDistance} km, School ${topSite.schoolDistance} km)`,
  ] : [];

  // Generate "Why not the other sites?" comparison notes
  const whyNotReasons = primaryCandidates.slice(1, 4).map(site => {
    let reason = '';
    if (!site.isCapacitySufficient) {
      reason = `Insufficient headroom: only ${site.availableCapacity.toLocaleString()} capacity available.`;
    } else if (site.distanceKm > (topSite?.distanceKm || 0) + 10) {
      reason = `${site.distanceKm - (topSite?.distanceKm || 0)} km farther away than ${topSite?.name}.`;
    } else if (site.roadAccessibility < (topSite?.roadAccessibility || 80)) {
      reason = `Lower road accessibility score (${site.roadAccessibility}/100).`;
    } else {
      reason = `Lower composite suitability (${site.suitabilityScore}/100 vs ${topSite?.suitabilityScore}/100).`;
    }
    return {
      siteId: site._id,
      siteName: site.name,
      reason,
    };
  });

  // Multi-Site Split Relocation Strategy:
  // If population > any single site's capacity, find a 2-site split
  let multiSiteStrategy = null;
  const singleCanAccommodate = evaluated.some(s => s.isCapacitySufficient && s.isWithinExtendedRadius);
  if (!singleCanAccommodate || population > 3000) {
    // Find pair of nearby sites that together cover the population
    const candidatesForSplit = evaluated.filter(s => s.isWithinExtendedRadius && s.availableCapacity > 0);
    candidatesForSplit.sort((a, b) => b.availableCapacity - a.availableCapacity);
    if (candidatesForSplit.length >= 2) {
      const siteA = candidatesForSplit[0];
      const siteB = candidatesForSplit[1];
      if (siteA.availableCapacity + siteB.availableCapacity >= population) {
        const allocA = Math.min(siteA.availableCapacity, Math.ceil(population * 0.6));
        const allocB = population - allocA;
        multiSiteStrategy = {
          enabled: true,
          title: 'Two-Site Relocation Strategy',
          description: `Accommodate ${population.toLocaleString()} residents across two complementary regional safe sites.`,
          siteA: {
            id: siteA._id,
            name: siteA.name,
            district: siteA.district,
            distanceKm: siteA.distanceKm,
            allocatedPopulation: allocA,
            availableCapacity: siteA.availableCapacity,
          },
          siteB: {
            id: siteB._id,
            name: siteB.name,
            district: siteB.district,
            distanceKm: siteB.distanceKm,
            allocatedPopulation: allocB,
            availableCapacity: siteB.availableCapacity,
          },
          totalAccommodated: allocA + allocB,
        };
      }
    }
  }

  // Summary Text
  const searchSummaryText = `For ${sourceHabitation.name} (${sourceHabitation.district}), Aegis evaluated ${candidateSites.length} candidate sites and prioritized ${nearbyCandidates.length} within the preferred ${preferredRadiusKm} km relocation radius.`;

  return {
    source: {
      _id: sourceHabitation._id,
      name: sourceHabitation.name,
      displayName: sourceHabitation.displayName || sourceHabitation.name,
      district: sourceHabitation.district,
      relocationCluster: sourceHabitation.relocationCluster || `${sourceHabitation.district} Cluster`,
      lat: sourceHabitation.lat,
      lng: sourceHabitation.lng,
      population,
      relocationTimeline: sourceHabitation.relocationTimeline || 'Immediate',
      relocationPriorityScore: sourceHabitation.relocationPriorityScore || 85,
    },
    preferredRadiusKm,
    maximumRadiusKm: maxRadiusKm,
    evaluatedCount: candidateSites.length,
    nearbyCount: nearbyCandidates.length,
    suitableCount: primaryCandidates.filter(c => c.status === 'RECOMMENDED' || c.status === 'SUITABLE').length,
    rejectedCount: excluded.length,
    rejectionBreakdown,
    searchSummaryText,
    recommendedSite: topSite,
    candidates: primaryCandidates,
    nearbyCandidates,
    extendedCandidates,
    widerAlternatives: widerAlternatives.slice(0, 5),
    excluded,
    whyReasons,
    whyNotReasons,
    multiSiteStrategy,
    dataLabel: 'Maharashtra Demonstration Dataset · Synthetic Prototype Values · Not for Operational Decision-Making',
  };
}

module.exports = {
  matchRelocationSites,
  getDistrictBonus,
};
