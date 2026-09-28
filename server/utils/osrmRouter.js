// ============================================================
// Aegis Enterprise OSRM Evacuation Router
// Uses the Open Source Routing Machine (OSRM) public API 
// to get 100% authentic, real-world OpenStreetMap driving routes.
// ============================================================

/**
 * Compute real-world driving route using OSRM API
 */
async function computeEvacuationRouteOSRM(fromLat, fromLon, toLat, toLon) {
  try {
    // OSRM coordinates are in longitude,latitude order
    const url = `http://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson&steps=true`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found on OSRM');
    }

    const route = data.routes[0];
    const totalDistKm = parseFloat((route.distance / 1000).toFixed(1));
    const totalTimeMin = Math.round(route.duration / 60);

    // OSRM returns coordinates as [lon, lat]. We need [lat, lon] for Leaflet on the frontend.
    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

    // Parse OSRM steps into sequential segments
    const segments = [];
    if (route.legs && route.legs.length > 0) {
      const leg = route.legs[0];
      let stepIndex = 1;
      for (const step of leg.steps) {
        if (step.distance > 0) {
          segments.push({
            from: `Step ${stepIndex}`,
            to: step.name || 'Unnamed road',
            distKm: parseFloat((step.distance / 1000).toFixed(2)),
            roadType: step.name ? 'SH/MDR' : 'VR',
            estTimeMin: Math.max(1, Math.round(step.duration / 60)),
            instruction: step.maneuver.instruction || step.maneuver.type,
          });
          stepIndex++;
        }
      }
    }

    return {
      found: true,
      from: { lat: fromLat, lon: fromLon, snappedTo: 'OSRM Nearest Road' },
      to: { lat: toLat, lon: toLon, snappedTo: 'OSRM Nearest Road' },
      totalDistKm,
      estimatedTimeMin: totalTimeMin,
      estimatedTimeFormatted: `${Math.floor(totalTimeMin / 60)}h ${totalTimeMin % 60}m`,
      waypoints: [
        { name: 'Evacuation Origin', lat: fromLat, lon: fromLon, type: 'origin', status: 'Active Hazard Area' },
        { name: 'Target Relief Center', lat: toLat, lon: toLon, type: 'destination', status: 'Designated Safe Zone' }
      ],
      segments,
      coordinates,
      hazardAvoidance: {
        status: 'OSRM Dynamic',
        avoidedZones: [],
        clearanceMarginKm: 0,
      },
      algorithm: 'OSRM OpenStreetMap Driving Router',
    };
  } catch (error) {
    console.error('OSRM Routing Error:', error);
    return computeFallbackRoute(fromLat, fromLon, toLat, toLon);
  }
}

/**
 * Fallback to mathematical distance if OSRM is down
 */
function computeFallbackRoute(fromLat, fromLon, toLat, toLon) {
  const R = 6371;
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLon = ((toLon - fromLon) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((fromLat * Math.PI) / 180) * Math.cos((toLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const directDist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const crossesGhats = (fromLon > 73.6 && toLon < 73.45) || (toLon > 73.6 && fromLon < 73.45);
  const roadFactor = crossesGhats ? 2.1 : 1.35;
  const totalDistKm = parseFloat((directDist * roadFactor).toFixed(1));
  const estimatedTimeMin = Math.round((totalDistKm / 55) * 60);

  return {
    found: false,
    from: { lat: fromLat, lon: fromLon, snappedTo: 'Mathematical Fallback' },
    to: { lat: toLat, lon: toLon, snappedTo: 'Mathematical Fallback' },
    totalDistKm,
    estimatedTimeMin,
    estimatedTimeFormatted: `${Math.floor(estimatedTimeMin / 60)}h ${estimatedTimeMin % 60}m`,
    waypoints: [
      { name: 'Evacuation Origin', lat: fromLat, lon: fromLon, type: 'origin' },
      { name: 'Target Relief Center', lat: toLat, lon: toLon, type: 'destination' }
    ],
    segments: [],
    coordinates: [[fromLat, fromLon], [toLat, toLon]],
    algorithm: 'Geodesic Terrain Fallback',
  };
}

module.exports = { computeEvacuationRouteOSRM, computeFallbackRoute };
