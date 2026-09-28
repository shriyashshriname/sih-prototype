// ============================================================
// Aegis GIS Routes — GeoJSON Endpoints
// Returns GeoJSON FeatureCollections for map visualisation
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../store/db');

/**
 * GET /api/gis/habitations-geojson
 * Returns all habitations as a GeoJSON FeatureCollection.
 * Properties include risk scores, district, population, and status.
 */
router.get('/habitations-geojson', (_req, res) => {
  const habitations = db.getAllHabitations();

  const featureCollection = {
    type: 'FeatureCollection',
    name: 'Aegis — Maharashtra Habitations',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    generated: new Date().toISOString(),
    note: 'PROTOTYPE — Synthetic demo data. Not for operational decision-making.',
    features: habitations.map((h) => ({
      type: 'Feature',
      id: h._id,
      geometry: {
        type: 'Point',
        coordinates: [h.lng, h.lat], // GeoJSON is [lon, lat]
      },
      properties: {
        id: h._id,
        name: h.name,
        displayName: h.displayName || h.name,
        district: h.district,
        state: h.state,
        taluka: h.taluka || null,
        relocationCluster: h.relocationCluster,
        population: h.population,
        vulnerablePopulation: h.vulnerablePopulation,
        householdsCount: h.householdsCount || Math.round(h.population / 4.2),
        // Risk computed fields
        hazardScore: h.hazardScore,
        hazardCategory: h.hazardCategory,
        vulnerabilityScore: h.vulnerabilityScore,
        vulnerabilityCategory: h.vulnerabilityCategory,
        relocationPriorityScore: h.relocationPriorityScore,
        relocationTimeline: h.relocationTimeline,
        relocationLabel: h.relocationLabel,
        redZoneStatus: h.redZoneStatus,
        // Hazard breakdown
        hazardExposure: h.hazardExposure,
        terrain: h.terrain,
        evacuationAccessibility: h.evacuationAccessibility,
        housingFragility: h.housingFragility,
        historicalRisk: h.historicalRisk,
        // Infrastructure
        infrastructure: h.infrastructure,
        // Map styling hints
        markerColor: h.redZoneStatus ? '#dc2626' :
          h.relocationTimeline === 'Short-Term' ? '#f59e0b' :
          h.relocationTimeline === 'Medium-Term' ? '#3b82f6' : '#22c55e',
        markerSize: h.redZoneStatus ? 'large' : 'medium',
      },
    })),
  };

  res.json({ success: true, count: featureCollection.features.length, data: featureCollection });
});

/**
 * GET /api/gis/red-zones-geojson
 * Returns red zone polygons as a GeoJSON FeatureCollection.
 * Polygons represent composite multi-hazard risk boundaries.
 */
router.get('/red-zones-geojson', (_req, res) => {
  const polygons = db.redZonePolygons;

  const featureCollection = {
    type: 'FeatureCollection',
    name: 'Aegis — Maharashtra Red Zone Polygons',
    generated: new Date().toISOString(),
    note: 'PROTOTYPE — Illustrative polygon boundaries for demonstration only.',
    features: polygons.map((zone) => ({
      type: 'Feature',
      id: zone.id,
      geometry: {
        type: 'Polygon',
        // GeoJSON polygon rings: [[lon, lat], ...]
        coordinates: [zone.polygon.map(([lat, lng]) => [lng, lat])],
      },
      properties: {
        id: zone.id,
        name: zone.name,
        district: zone.district,
        dominantHazards: zone.dominantHazards,
        confidence: zone.confidence,
        areaHa: zone.areaHa,
        type: zone.type,
        // Styling
        fillColor: zone.type === 'landslide' ? '#7c3aed' :
          zone.type === 'flood' ? '#1d4ed8' : '#dc2626',
        fillOpacity: 0.35,
        strokeColor: zone.type === 'landslide' ? '#5b21b6' :
          zone.type === 'flood' ? '#1e40af' : '#991b1b',
        strokeWidth: 2,
      },
    })),
  };

  res.json({ success: true, count: featureCollection.features.length, data: featureCollection });
});

/**
 * GET /api/gis/shelters-geojson
 * Returns all relocation/shelter sites as GeoJSON points.
 */
router.get('/shelters-geojson', (_req, res) => {
  const sites = db.getAllSites();

  const featureCollection = {
    type: 'FeatureCollection',
    name: 'Aegis — Maharashtra Relocation & Shelter Sites',
    generated: new Date().toISOString(),
    note: 'PROTOTYPE — Demonstration data only.',
    features: sites.map((s) => ({
      type: 'Feature',
      id: s._id,
      geometry: {
        type: 'Point',
        coordinates: [s.lng, s.lat],
      },
      properties: {
        id: s._id,
        name: s.name,
        displayName: s.displayName || s.name,
        district: s.district,
        state: s.state,
        relocationCluster: s.relocationCluster,
        maxCapacity: s.maxCapacity,
        currentOccupancy: s.currentOccupancy,
        reservedCapacity: s.reservedCapacity,
        availableCapacity: Math.max(0, s.maxCapacity - s.currentOccupancy - s.reservedCapacity),
        capacityUtilisationPct: parseFloat(
          ((s.currentOccupancy / s.maxCapacity) * 100).toFixed(1)
        ),
        suitabilityScore: s.suitabilityScore,
        suitabilityStatus: s.suitabilityStatus,
        available: s.available,
        hazardExposure: s.hazardExposure,
        roadAccessibility: s.roadAccessibility,
        hospitalDistanceKm: s.hospitalDistance,
        schoolDistanceKm: s.schoolDistance,
        description: s.description,
        // Styling
        markerColor: s.suitabilityStatus === 'Suitable' ? '#16a34a' :
          s.suitabilityStatus === 'Conditionally Suitable' ? '#ca8a04' : '#dc2626',
        markerIcon: 'shelter',
      },
    })),
  };

  res.json({ success: true, count: featureCollection.features.length, data: featureCollection });
});

/**
 * GET /api/gis/overview
 * Returns all layers combined for a single map load call.
 */
router.get('/overview', (_req, res) => {
  const habitations = db.getAllHabitations();
  const sites = db.getAllSites();
  const polygons = db.redZonePolygons;

  res.json({
    success: true,
    data: {
      habitationCount: habitations.length,
      shelterCount: sites.length,
      redZoneCount: polygons.length,
      bounds: {
        // Approximate Maharashtra bounding box
        north: 22.1,
        south: 15.6,
        east: 80.9,
        west: 72.6,
      },
      centroid: { lat: 19.0, lon: 76.0 },
      note: 'Use individual /api/gis/*-geojson endpoints for full GeoJSON layers.',
    },
  });
});

module.exports = router;
