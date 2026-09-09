// ============================================================
// Aegis In-Memory Data Store — Maharashtra Demonstration Dataset
// ⚠️  ALL DATA IS SYNTHETIC / DEMO
// Uses real Maharashtra place names as DEMONSTRATION LOCATIONS.
// Numerical values are prototype/synthetic — NOT official government data.
// NOT for operational decision-making.
// ============================================================

const { v4: uuidv4 } = require('uuid');
const { computeHazardScore }        = require('../utils/hazardEngine');
const { computeVulnerabilityScore } = require('../utils/vulnerabilityEngine');
const { computeRelocationPriority } = require('../utils/relocationEngine');
const { computeSiteSuitability }    = require('../utils/siteSuitabilityEngine');
const { matchRelocationSites }      = require('../utils/relocationMatchingEngine');

// ── Raw Habitation Data ──────────────────────────────────────
const rawHabitations = [
  // ── PUNE DISTRICT (Cluster: Pune Cluster) ───────────────────
  {
    name: 'Pune Hillside Settlement',
    displayName: 'Pune Hillside Settlement',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.6200, lng: 73.6500,
    population: 1680, vulnerablePopulation: 580,
    hazardExposure: { flood: 32, landslide: 91, erosion: 65, extremeRainfall: 76, earthquake: 20 },
    terrain: { elevation: 188, slope: 29.8, soilSaturation: 86 },
    historicalRisk: 9,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'very_poor', water: 'partial' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 85,
    scenarioNote: 'Western Pune Ghats — steep terrain landslide and torrential rainfall exposure.',
  },
  {
    name: 'Malin Hillside Zone',
    displayName: 'Malin — Hillside Settlement',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 19.3521, lng: 73.4945,
    population: 1420, vulnerablePopulation: 510,
    hazardExposure: { flood: 35, landslide: 94, erosion: 68, extremeRainfall: 80, earthquake: 18 },
    terrain: { elevation: 210, slope: 31.5, soilSaturation: 89 },
    historicalRisk: 9,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'very_poor', water: 'partial' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 88,
    scenarioNote: 'Ambegaon, Pune — steep-terrain landslide vulnerability demo.',
  },
  {
    name: 'Bhor Hillside Settlement',
    displayName: 'Bhor — Periphery Zone',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.1512, lng: 73.8467,
    population: 2840, vulnerablePopulation: 880,
    hazardExposure: { flood: 48, landslide: 62, erosion: 42, extremeRainfall: 65, earthquake: 18 },
    terrain: { elevation: 78, slope: 14.2, soilSaturation: 68 },
    historicalRisk: 4,
    infrastructure: { hospitals: 1, schools: 3, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 52,
    scenarioNote: 'Pune — landslide and flood exposure demonstration.',
  },
  {
    name: 'Mulshi Valley Zone',
    displayName: 'Mulshi — Valley Settlement',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.5275, lng: 73.5125,
    population: 3120, vulnerablePopulation: 920,
    hazardExposure: { flood: 72, landslide: 68, erosion: 52, extremeRainfall: 78, earthquake: 16 },
    terrain: { elevation: 58, slope: 11.8, soilSaturation: 80 },
    historicalRisk: 6,
    infrastructure: { hospitals: 1, schools: 3, shelters: 0, roads: 'poor', water: 'partial' },
    evacuationAccessibility: 'poor',
    housingFragility: 68,
    scenarioNote: 'Pune — Mulshi reservoir area, flood and terrain exposure demonstration.',
  },

  // ── RAIGAD DISTRICT (Cluster: Raigad Cluster) ───────────────
  {
    name: 'Mahad Peripheral Settlement',
    displayName: 'Mahad — Peripheral Zone',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.0520, lng: 73.4176,
    population: 2780, vulnerablePopulation: 980,
    hazardExposure: { flood: 92, landslide: 78, erosion: 61, extremeRainfall: 88, earthquake: 32 },
    terrain: { elevation: 18, slope: 4.2, soilSaturation: 91 },
    historicalRisk: 9,
    infrastructure: { hospitals: 1, schools: 2, shelters: 0, roads: 'poor', water: 'partial' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 88,
    scenarioNote: 'Location selected — Raigad has documented flood and landslide exposure.',
  },
  {
    name: 'Taliye Demonstration Zone',
    displayName: 'Taliye — Hillside Zone',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 17.9872, lng: 73.4956,
    population: 1450, vulnerablePopulation: 560,
    hazardExposure: { flood: 45, landslide: 94, erosion: 72, extremeRainfall: 82, earthquake: 28 },
    terrain: { elevation: 142, slope: 28.4, soilSaturation: 87 },
    historicalRisk: 9,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'very_poor', water: 'partial' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 92,
    scenarioNote: 'Location selected — demonstrates landslide exposure in Western Ghats terrain.',
  },
  {
    name: 'Irshalwadi Simulation Zone',
    displayName: 'Irshalwadi — Hillside Settlement',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.7854, lng: 73.2934,
    population: 890, vulnerablePopulation: 310,
    hazardExposure: { flood: 38, landslide: 96, erosion: 68, extremeRainfall: 79, earthquake: 22 },
    terrain: { elevation: 185, slope: 31.2, soilSaturation: 89 },
    historicalRisk: 8,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'very_poor', water: 'partial' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 90,
    scenarioNote: 'Location selected — Khalapur-Raigad region illustrates hillside exposure.',
  },
  {
    name: 'Poladpur Hillside Zone',
    displayName: 'Poladpur — Hillside Periphery',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.2452, lng: 73.5014,
    population: 1920, vulnerablePopulation: 620,
    hazardExposure: { flood: 58, landslide: 82, erosion: 55, extremeRainfall: 75, earthquake: 25 },
    terrain: { elevation: 95, slope: 18.6, soilSaturation: 82 },
    historicalRisk: 7,
    infrastructure: { hospitals: 1, schools: 2, shelters: 0, roads: 'poor', water: 'partial' },
    evacuationAccessibility: 'poor',
    housingFragility: 78,
    scenarioNote: 'Raigad district — illustrative landslide and flood zone.',
  },
  {
    name: 'Mangaon Riverside Settlement',
    displayName: 'Mangaon — Riverside Zone',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.2328, lng: 73.2833,
    population: 3240, vulnerablePopulation: 1020,
    hazardExposure: { flood: 78, landslide: 42, erosion: 58, extremeRainfall: 72, earthquake: 18 },
    terrain: { elevation: 32, slope: 5.1, soilSaturation: 84 },
    historicalRisk: 6,
    infrastructure: { hospitals: 1, schools: 3, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 68,
    scenarioNote: 'Raigad — flood-prone riverside demonstration zone.',
  },
  {
    name: 'Khalapur Lowland Zone',
    displayName: 'Khalapur — Low-lying Settlement',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.8345, lng: 73.2456,
    population: 4120, vulnerablePopulation: 1280,
    hazardExposure: { flood: 64, landslide: 38, erosion: 44, extremeRainfall: 68, earthquake: 15 },
    terrain: { elevation: 48, slope: 6.8, soilSaturation: 74 },
    historicalRisk: 5,
    infrastructure: { hospitals: 1, schools: 4, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 55,
    scenarioNote: 'Raigad — illustrative low-lying flood-prone settlement.',
  },

  // ── RATNAGIRI DISTRICT (Cluster: Ratnagiri Cluster) ─────────
  {
    name: 'Chiplun Riverside Settlement',
    displayName: 'Chiplun — Riverside Settlement',
    district: 'Ratnagiri', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.5288, lng: 73.5137,
    population: 4200, vulnerablePopulation: 1340,
    hazardExposure: { flood: 88, landslide: 52, erosion: 63, extremeRainfall: 85, earthquake: 20 },
    terrain: { elevation: 24, slope: 7.2, soilSaturation: 88 },
    historicalRisk: 8,
    infrastructure: { hospitals: 2, schools: 5, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 72,
    scenarioNote: 'Ratnagiri — Vashishti river flood exposure demonstration.',
  },
  {
    name: 'Khed Periphery',
    displayName: 'Khed — Peripheral Settlement',
    district: 'Ratnagiri', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.7176, lng: 73.3967,
    population: 2680, vulnerablePopulation: 820,
    hazardExposure: { flood: 72, landslide: 58, erosion: 48, extremeRainfall: 78, earthquake: 22 },
    terrain: { elevation: 42, slope: 12.4, soilSaturation: 79 },
    historicalRisk: 6,
    infrastructure: { hospitals: 1, schools: 3, shelters: 0, roads: 'poor', water: 'partial' },
    evacuationAccessibility: 'poor',
    housingFragility: 70,
    scenarioNote: 'Ratnagiri — flood and landslide exposure demonstration.',
  },
  {
    name: 'Rajapur Coastal Zone',
    displayName: 'Rajapur — Coastal Periphery',
    district: 'Ratnagiri', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 16.6511, lng: 73.5196,
    population: 1850, vulnerablePopulation: 580,
    hazardExposure: { flood: 68, landslide: 35, erosion: 78, extremeRainfall: 74, earthquake: 15 },
    terrain: { elevation: 18, slope: 4.8, soilSaturation: 76 },
    historicalRisk: 5,
    infrastructure: { hospitals: 1, schools: 2, shelters: 0, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 62,
    scenarioNote: 'Ratnagiri coast — erosion and flood exposure demonstration.',
  },
  {
    name: 'Guhagar Coastal Settlement',
    displayName: 'Guhagar — Coastal Zone',
    district: 'Ratnagiri', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.4789, lng: 73.1987,
    population: 1340, vulnerablePopulation: 420,
    hazardExposure: { flood: 55, landslide: 28, erosion: 82, extremeRainfall: 70, earthquake: 14 },
    terrain: { elevation: 12, slope: 3.2, soilSaturation: 72 },
    historicalRisk: 4,
    infrastructure: { hospitals: 0, schools: 2, shelters: 0, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 58,
    scenarioNote: 'Ratnagiri coast — coastal erosion demonstration.',
  },

  // ── KOLHAPUR DISTRICT (Cluster: Kolhapur Cluster) ───────────
  {
    name: 'Kolhapur Flood Zone',
    displayName: 'Kolhapur — Panchganga Flood Zone',
    district: 'Kolhapur', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.7050, lng: 74.2433,
    population: 5840, vulnerablePopulation: 1720,
    hazardExposure: { flood: 82, landslide: 22, erosion: 45, extremeRainfall: 80, earthquake: 12 },
    terrain: { elevation: 28, slope: 3.4, soilSaturation: 82 },
    historicalRisk: 7,
    infrastructure: { hospitals: 3, schools: 8, shelters: 2, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 58,
    scenarioNote: 'Kolhapur — Panchganga river flood exposure demonstration.',
  },
  {
    name: 'Shahuwadi Hillside Settlement',
    displayName: 'Shahuwadi — Hillside Settlement',
    district: 'Kolhapur', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.6845, lng: 74.0845,
    population: 1480, vulnerablePopulation: 480,
    hazardExposure: { flood: 42, landslide: 58, erosion: 48, extremeRainfall: 62, earthquake: 10 },
    terrain: { elevation: 88, slope: 13.6, soilSaturation: 65 },
    historicalRisk: 3,
    infrastructure: { hospitals: 0, schools: 2, shelters: 0, roads: 'poor', water: 'partial' },
    evacuationAccessibility: 'poor',
    housingFragility: 60,
    scenarioNote: 'Kolhapur — hillside settlement demonstration.',
  },
  {
    name: 'Radhanagari Reservoir Zone',
    displayName: 'Radhanagari — Reservoir Periphery',
    district: 'Kolhapur', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.4056, lng: 73.9725,
    population: 1920, vulnerablePopulation: 580,
    hazardExposure: { flood: 62, landslide: 44, erosion: 38, extremeRainfall: 68, earthquake: 8 },
    terrain: { elevation: 65, slope: 9.2, soilSaturation: 72 },
    historicalRisk: 4,
    infrastructure: { hospitals: 1, schools: 2, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 55,
    scenarioNote: 'Kolhapur — reservoir-adjacent flood exposure demonstration.',
  },

  // ── SINDHUDURG DISTRICT (Cluster: Sindhudurg Cluster) ───────
  {
    name: 'Sawantwadi Coastal Zone',
    displayName: 'Sawantwadi — Coastal Periphery',
    district: 'Sindhudurg', state: 'Maharashtra',
    relocationCluster: 'Sindhudurg Cluster',
    lat: 15.9082, lng: 73.8178,
    population: 2140, vulnerablePopulation: 640,
    hazardExposure: { flood: 55, landslide: 38, erosion: 72, extremeRainfall: 65, earthquake: 8 },
    terrain: { elevation: 22, slope: 7.4, soilSaturation: 70 },
    historicalRisk: 4,
    infrastructure: { hospitals: 1, schools: 3, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 52,
    scenarioNote: 'Sindhudurg — coastal erosion and rainfall demonstration.',
  },
  {
    name: 'Kudal Riverine Settlement',
    displayName: 'Kudal — Riverine Zone',
    district: 'Sindhudurg', state: 'Maharashtra',
    relocationCluster: 'Sindhudurg Cluster',
    lat: 16.0342, lng: 73.6956,
    population: 1760, vulnerablePopulation: 520,
    hazardExposure: { flood: 68, landslide: 32, erosion: 52, extremeRainfall: 64, earthquake: 8 },
    terrain: { elevation: 28, slope: 5.8, soilSaturation: 74 },
    historicalRisk: 3,
    infrastructure: { hospitals: 1, schools: 2, shelters: 0, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 48,
    scenarioNote: 'Sindhudurg — river flood exposure demonstration.',
  },

  // ── SANGLI DISTRICT (Cluster: Sangli Cluster) ───────────────
  {
    name: 'Sangli Flood-Prone Zone',
    displayName: 'Sangli — Flood-Prone Periphery',
    district: 'Sangli', state: 'Maharashtra',
    relocationCluster: 'Sangli Cluster',
    lat: 16.8524, lng: 74.5815,
    population: 4680, vulnerablePopulation: 1380,
    hazardExposure: { flood: 78, landslide: 18, erosion: 38, extremeRainfall: 72, earthquake: 10 },
    terrain: { elevation: 22, slope: 2.8, soilSaturation: 78 },
    historicalRisk: 7,
    infrastructure: { hospitals: 2, schools: 6, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 62,
    scenarioNote: 'Sangli — Krishna river flood exposure demonstration.',
  },
  {
    name: 'Miraj Periphery',
    displayName: 'Miraj — Peripheral Zone',
    district: 'Sangli', state: 'Maharashtra',
    relocationCluster: 'Sangli Cluster',
    lat: 16.8261, lng: 74.6467,
    population: 2820, vulnerablePopulation: 780,
    hazardExposure: { flood: 38, landslide: 12, erosion: 22, extremeRainfall: 42, earthquake: 8 },
    terrain: { elevation: 78, slope: 3.2, soilSaturation: 45 },
    historicalRisk: 2,
    infrastructure: { hospitals: 2, schools: 5, shelters: 2, roads: 'good', water: 'available' },
    evacuationAccessibility: 'good',
    housingFragility: 28,
    scenarioNote: 'Sangli — low-risk demonstration settlement.',
  },
];

// ── Relocation Sites (Coherent Maharashtra Coordinates) ───────
const rawSites = [
  // ── PUNE CLUSTER SITES ─────────────────────────────────────
  {
    name: 'Mulshi Rehabilitation Zone',
    displayName: 'Mulshi Rehabilitation Zone',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.5275, lng: 73.5125,
    maxCapacity: 3000, currentOccupancy: 300, reservedCapacity: 300, // available: 2,400
    hazardExposure: { flood: 10, landslide: 8, erosion: 8, extremeRainfall: 15 },
    roadAccessibility: 94, hospitalDistance: 1.2, schoolDistance: 0.8,
    waterCapacity: 95, healthcareCapacity: 94, educationCapacity: 90, shelterCapacity: 92,
    environmentalSuitability: 92,
    description: 'Elevated plateau in Mulshi with all-weather road access, minimal hazard exposure, and strong services.',
    dataNote: 'Demonstration safe relocation site for Pune Cluster.',
  },
  {
    name: 'Maval Safe Settlement Zone',
    displayName: 'Maval Safe Settlement Zone',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.7500, lng: 73.5800,
    maxCapacity: 2600, currentOccupancy: 300, reservedCapacity: 200, // available: 2,100
    hazardExposure: { flood: 14, landslide: 12, erosion: 10, extremeRainfall: 18 },
    roadAccessibility: 90, hospitalDistance: 2.4, schoolDistance: 1.5,
    waterCapacity: 90, healthcareCapacity: 88, educationCapacity: 85, shelterCapacity: 88,
    environmentalSuitability: 89,
    description: 'Flat basalt ridge near Talegaon-Maval corridor with direct highway proximity.',
    dataNote: 'Demonstration safe relocation site for Pune Cluster.',
  },
  {
    name: 'Bhor Rehabilitation Zone',
    displayName: 'Bhor Rehabilitation Zone',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.3300, lng: 73.8400,
    maxCapacity: 2500, currentOccupancy: 350, reservedCapacity: 200, // available: 1,950
    hazardExposure: { flood: 16, landslide: 15, erosion: 12, extremeRainfall: 20 },
    roadAccessibility: 85, hospitalDistance: 3.5, schoolDistance: 2.1,
    waterCapacity: 85, healthcareCapacity: 82, educationCapacity: 80, shelterCapacity: 84,
    environmentalSuitability: 86,
    description: 'Elevated southern plateau zone near Bhor with stable subsoil and good water access.',
    dataNote: 'Demonstration safe relocation site for Pune Cluster.',
  },
  {
    name: 'Khed Rehabilitation Zone',
    displayName: 'Khed Rehabilitation Zone',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.8600, lng: 73.8900,
    maxCapacity: 2200, currentOccupancy: 400, reservedCapacity: 200, // available: 1,600
    hazardExposure: { flood: 20, landslide: 16, erosion: 14, extremeRainfall: 22 },
    roadAccessibility: 81, hospitalDistance: 4.2, schoolDistance: 2.8,
    waterCapacity: 82, healthcareCapacity: 78, educationCapacity: 76, shelterCapacity: 80,
    environmentalSuitability: 81,
    description: 'Northern Pune plateau outside flood and landslide hazard boundaries.',
    dataNote: 'Demonstration safe relocation site for Pune Cluster.',
  },
  {
    name: 'Junnar Safe Site',
    displayName: 'Junnar Safe Site',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 19.2000, lng: 73.8700,
    maxCapacity: 2800, currentOccupancy: 500, reservedCapacity: 300, // available: 2,000
    hazardExposure: { flood: 15, landslide: 12, erosion: 10, extremeRainfall: 18 },
    roadAccessibility: 80, hospitalDistance: 4.8, schoolDistance: 3.1,
    waterCapacity: 84, healthcareCapacity: 75, educationCapacity: 75, shelterCapacity: 82,
    environmentalSuitability: 85,
    description: 'Elevated highland in northern Pune taluka — extended regional fallback.',
    dataNote: 'Extended planning alternative for Pune Cluster.',
  },
  {
    name: 'Shirur Rehabilitation Zone',
    displayName: 'Shirur Rehabilitation Zone',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.8200, lng: 74.3700,
    maxCapacity: 3200, currentOccupancy: 600, reservedCapacity: 400, // available: 2,200
    hazardExposure: { flood: 12, landslide: 5, erosion: 8, extremeRainfall: 15 },
    roadAccessibility: 88, hospitalDistance: 3.2, schoolDistance: 2.0,
    waterCapacity: 88, healthcareCapacity: 82, educationCapacity: 80, shelterCapacity: 85,
    environmentalSuitability: 84,
    description: 'Eastern Pune agricultural high ground with minimal slope and zero landslide risk.',
    dataNote: 'Extended planning alternative for Pune Cluster.',
  },

  // ── RAIGAD CLUSTER SITES ───────────────────────────────────
  {
    name: 'Mahad Rehabilitation Site A (North Mahad)',
    displayName: 'North Mahad Safe Plateau',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.0712, lng: 73.3965,
    maxCapacity: 3500, currentOccupancy: 420, reservedCapacity: 300, // available: 2,780
    hazardExposure: { flood: 12, landslide: 8, erosion: 10, extremeRainfall: 18 },
    roadAccessibility: 88, hospitalDistance: 2.1, schoolDistance: 1.3,
    waterCapacity: 91, healthcareCapacity: 82, educationCapacity: 75, shelterCapacity: 88,
    environmentalSuitability: 90,
    description: 'Elevated plateau northwest of Mahad with good road access and lower flood exposure.',
    dataNote: 'Demonstration safe relocation site for Raigad Cluster.',
  },
  {
    name: 'Mahad Rehabilitation Site B (East Mahad)',
    displayName: 'East Mahad Safe Highland',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.0298, lng: 73.4389,
    maxCapacity: 2200, currentOccupancy: 180, reservedCapacity: 200, // available: 1,820
    hazardExposure: { flood: 22, landslide: 15, erosion: 18, extremeRainfall: 25 },
    roadAccessibility: 72, hospitalDistance: 3.8, schoolDistance: 2.4,
    waterCapacity: 78, healthcareCapacity: 68, educationCapacity: 65, shelterCapacity: 75,
    environmentalSuitability: 82,
    description: 'Plateau east of Mahad — moderate accessibility with lower hazard exposure.',
    dataNote: 'Demonstration safe relocation site for Raigad Cluster.',
  },
  {
    name: 'Poladpur Safe Site',
    displayName: 'Poladpur Safe Site',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.2654, lng: 73.5234,
    maxCapacity: 2400, currentOccupancy: 200, reservedCapacity: 200, // available: 2,000
    hazardExposure: { flood: 14, landslide: 20, erosion: 12, extremeRainfall: 20 },
    roadAccessibility: 82, hospitalDistance: 3.2, schoolDistance: 2.0,
    waterCapacity: 85, healthcareCapacity: 78, educationCapacity: 75, shelterCapacity: 82,
    environmentalSuitability: 85,
    description: 'Safe plateau above flood line near Poladpur with NH-66 connectivity.',
    dataNote: 'Demonstration safe relocation site for Raigad Cluster.',
  },
  {
    name: 'Mangaon Rehabilitation Zone',
    displayName: 'Mangaon Rehabilitation Zone',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.2512, lng: 73.2634,
    maxCapacity: 2500, currentOccupancy: 250, reservedCapacity: 250, // available: 2,000
    hazardExposure: { flood: 16, landslide: 12, erosion: 14, extremeRainfall: 20 },
    roadAccessibility: 85, hospitalDistance: 2.8, schoolDistance: 1.6,
    waterCapacity: 88, healthcareCapacity: 80, educationCapacity: 78, shelterCapacity: 84,
    environmentalSuitability: 86,
    description: 'Elevated non-flood zone near Mangaon with railway and highway nexus.',
    dataNote: 'Demonstration safe relocation site for Raigad Cluster.',
  },

  // ── RATNAGIRI CLUSTER SITES ────────────────────────────────
  {
    name: 'Chiplun Inland Safe Zone',
    displayName: 'Chiplun Inland Safe Zone',
    district: 'Ratnagiri', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.5489, lng: 73.5345,
    maxCapacity: 4500, currentOccupancy: 500, reservedCapacity: 400, // available: 3,600
    hazardExposure: { flood: 14, landslide: 10, erosion: 15, extremeRainfall: 20 },
    roadAccessibility: 88, hospitalDistance: 1.8, schoolDistance: 1.2,
    waterCapacity: 90, healthcareCapacity: 88, educationCapacity: 85, shelterCapacity: 90,
    environmentalSuitability: 88,
    description: 'Inland highland near Chiplun, 25m above Vashishti peak flood level.',
    dataNote: 'Demonstration safe relocation site for Ratnagiri Cluster.',
  },
  {
    name: 'Khed Inland Safe Site',
    displayName: 'Khed Inland Safe Site',
    district: 'Ratnagiri', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.7200, lng: 73.4100,
    maxCapacity: 3000, currentOccupancy: 300, reservedCapacity: 300, // available: 2,400
    hazardExposure: { flood: 15, landslide: 12, erosion: 14, extremeRainfall: 22 },
    roadAccessibility: 84, hospitalDistance: 2.6, schoolDistance: 1.8,
    waterCapacity: 85, healthcareCapacity: 82, educationCapacity: 80, shelterCapacity: 84,
    environmentalSuitability: 86,
    description: 'Elevated safe site near Khed town center with good municipal infrastructure.',
    dataNote: 'Demonstration safe relocation site for Ratnagiri Cluster.',
  },

  // ── KOLHAPUR CLUSTER SITES ─────────────────────────────────
  {
    name: 'Kolhapur Safe Settlement Zone',
    displayName: 'Kolhapur Safe Settlement Zone',
    district: 'Kolhapur', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.7234, lng: 74.2678,
    maxCapacity: 5500, currentOccupancy: 800, reservedCapacity: 500, // available: 4,200
    hazardExposure: { flood: 16, landslide: 5, erosion: 8, extremeRainfall: 18 },
    roadAccessibility: 95, hospitalDistance: 1.2, schoolDistance: 0.8,
    waterCapacity: 95, healthcareCapacity: 94, educationCapacity: 90, shelterCapacity: 92,
    environmentalSuitability: 90,
    description: 'Elevated urban plateau beyond Panchganga flood contour with top tier hospital network.',
    dataNote: 'Demonstration safe relocation site for Kolhapur Cluster.',
  },
  {
    name: 'Shahuwadi Elevated Safe Site',
    displayName: 'Shahuwadi Elevated Safe Site',
    district: 'Kolhapur', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.7100, lng: 74.0500,
    maxCapacity: 2500, currentOccupancy: 200, reservedCapacity: 200, // available: 2,100
    hazardExposure: { flood: 14, landslide: 16, erosion: 12, extremeRainfall: 20 },
    roadAccessibility: 85, hospitalDistance: 2.9, schoolDistance: 1.7,
    waterCapacity: 86, healthcareCapacity: 80, educationCapacity: 78, shelterCapacity: 82,
    environmentalSuitability: 86,
    description: 'Stable highland plateau near Shahuwadi, safely away from steep forest ravines.',
    dataNote: 'Demonstration safe relocation site for Kolhapur Cluster.',
  },

  // ── SINDHUDURG CLUSTER SITES ───────────────────────────────
  {
    name: 'Sawantwadi Plateau Safe Site',
    displayName: 'Sawantwadi Plateau Safe Site',
    district: 'Sindhudurg', state: 'Maharashtra',
    relocationCluster: 'Sindhudurg Cluster',
    lat: 15.9234, lng: 73.8412,
    maxCapacity: 3000, currentOccupancy: 300, reservedCapacity: 300, // available: 2,400
    hazardExposure: { flood: 10, landslide: 12, erosion: 15, extremeRainfall: 18 },
    roadAccessibility: 86, hospitalDistance: 2.2, schoolDistance: 1.5,
    waterCapacity: 88, healthcareCapacity: 82, educationCapacity: 80, shelterCapacity: 86,
    environmentalSuitability: 88,
    description: 'Elevated laterite plateau in Sawantwadi with robust road connections to Goa border highway.',
    dataNote: 'Demonstration safe relocation site for Sindhudurg Cluster.',
  },
  {
    name: 'Kudal Rehabilitation Zone',
    displayName: 'Kudal Rehabilitation Zone',
    district: 'Sindhudurg', state: 'Maharashtra',
    relocationCluster: 'Sindhudurg Cluster',
    lat: 16.0500, lng: 73.7100,
    maxCapacity: 2800, currentOccupancy: 350, reservedCapacity: 250, // available: 2,200
    hazardExposure: { flood: 12, landslide: 10, erosion: 12, extremeRainfall: 18 },
    roadAccessibility: 88, hospitalDistance: 2.5, schoolDistance: 1.4,
    waterCapacity: 90, healthcareCapacity: 85, educationCapacity: 82, shelterCapacity: 88,
    environmentalSuitability: 88,
    description: 'High ground near Kudal central junction, non-inundating and well serviced.',
    dataNote: 'Demonstration safe relocation site for Sindhudurg Cluster.',
  },

  // ── SANGLI CLUSTER SITES ───────────────────────────────────
  {
    name: 'Sangli North Safe Zone',
    displayName: 'Sangli North Safe Zone',
    district: 'Sangli', state: 'Maharashtra',
    relocationCluster: 'Sangli Cluster',
    lat: 16.8712, lng: 74.5456,
    maxCapacity: 4500, currentOccupancy: 500, reservedCapacity: 400, // available: 3,600
    hazardExposure: { flood: 15, landslide: 5, erosion: 8, extremeRainfall: 18 },
    roadAccessibility: 92, hospitalDistance: 1.5, schoolDistance: 1.0,
    waterCapacity: 92, healthcareCapacity: 90, educationCapacity: 88, shelterCapacity: 90,
    environmentalSuitability: 88,
    description: 'High elevation northern belt in Sangli outside Krishna river inundation zones.',
    dataNote: 'Demonstration safe relocation site for Sangli Cluster.',
  },
];

// ── Red Zone Polygons (Composite Hazard Boundaries) ─────────
const redZonePolygons = [
  {
    id: 'MH-RZ-001',
    name: 'Mahad Multi-Hazard Zone',
    district: 'Raigad',
    dominantHazards: ['Flood', 'Landslide'],
    confidence: 86,
    areaHa: 1240,
    polygon: [
      [18.0420, 73.3976], [18.0620, 73.3976], [18.0620, 73.4376],
      [18.0420, 73.4376], [18.0420, 73.3976],
    ],
    type: 'composite',
    dataNote: 'Illustrative polygon — demonstration only.',
  },
  {
    id: 'MH-RZ-002',
    name: 'Taliye — Irshalwadi Landslide Zone',
    district: 'Raigad',
    dominantHazards: ['Landslide', 'Erosion'],
    confidence: 82,
    areaHa: 680,
    polygon: [
      [17.9772, 73.4856], [17.9972, 73.4856], [17.9972, 73.5056],
      [17.9772, 73.5056], [17.9772, 73.4856],
    ],
    type: 'landslide',
    dataNote: 'Illustrative polygon — demonstration only.',
  },
  {
    id: 'MH-RZ-003',
    name: 'Chiplun Flood Zone',
    district: 'Ratnagiri',
    dominantHazards: ['Flood', 'Extreme Rainfall'],
    confidence: 84,
    areaHa: 920,
    polygon: [
      [17.5188, 73.5037], [17.5388, 73.5037], [17.5388, 73.5237],
      [17.5188, 73.5237], [17.5188, 73.5037],
    ],
    type: 'flood',
    dataNote: 'Illustrative polygon — demonstration only.',
  },
  {
    id: 'MH-RZ-004',
    name: 'Malin & Ambegaon Hillside Zone',
    district: 'Pune',
    dominantHazards: ['Landslide'],
    confidence: 78,
    areaHa: 380,
    polygon: [
      [19.3421, 73.4845], [19.3621, 73.4845], [19.3621, 73.5045],
      [19.3421, 73.5045], [19.3421, 73.4845],
    ],
    type: 'landslide',
    dataNote: 'Illustrative polygon — demonstration only.',
  },
  {
    id: 'MH-RZ-005',
    name: 'Kolhapur Panchganga Flood Zone',
    district: 'Kolhapur',
    dominantHazards: ['Flood'],
    confidence: 80,
    areaHa: 1480,
    polygon: [
      [16.6950, 74.2333], [16.7150, 74.2333], [16.7150, 74.2533],
      [16.6950, 74.2533], [16.6950, 74.2333],
    ],
    type: 'flood',
    dataNote: 'Illustrative polygon — demonstration only.',
  },
  {
    id: 'MH-RZ-006',
    name: 'Sangli Krishna River Zone',
    district: 'Sangli',
    dominantHazards: ['Flood'],
    confidence: 76,
    areaHa: 860,
    polygon: [
      [16.8424, 74.5715], [16.8624, 74.5715], [16.8624, 74.5915],
      [16.8424, 74.5915], [16.8424, 74.5715],
    ],
    type: 'flood',
    dataNote: 'Illustrative polygon — demonstration only.',
  },
];

// ── Build computed records ───────────────────────────────────
let habitations = rawHabitations.map((h) => {
  const hazardResult = computeHazardScore(h);
  const vulnResult   = computeVulnerabilityScore(h);
  const priorityResult = computeRelocationPriority(hazardResult, vulnResult, h);

  const redZoneStatus =
    priorityResult.timeline === 'Immediate' ||
    (priorityResult.timeline === 'Short-Term' && hazardResult.composite > 70);

  return {
    _id: uuidv4(),
    ...h,
    hazardScore: hazardResult.composite,
    hazardCategory: hazardResult.category,
    hazardScores: hazardResult.scores,
    hazardFactors: hazardResult.factors,
    vulnerabilityScore: vulnResult.score,
    vulnerabilityCategory: vulnResult.category,
    vulnerabilityFactors: vulnResult.factors,
    relocationPriorityScore: priorityResult.score,
    relocationTimeline: priorityResult.timeline,
    relocationLabel: priorityResult.label,
    relocationReason: priorityResult.reason,
    relocationFactors: priorityResult.factors,
    redZoneStatus,
    dataLabel: 'Maharashtra Demonstration Dataset · Synthetic Prototype Data · Not for operational decision-making',
    createdAt: new Date().toISOString(),
  };
});

let sites = rawSites.map((s) => {
  const suitability = computeSiteSuitability(s, 0);
  return {
    _id: uuidv4(),
    ...s,
    suitabilityScore: suitability.score,
    suitabilityStatus: suitability.status,
    available: suitability.available,
    dataLabel: 'Maharashtra Demonstration Dataset · Synthetic Prototype Data',
    createdAt: new Date().toISOString(),
  };
});

let relocationPlans = [];
let alerts = [];

// ── Habitation CRUD ──────────────────────────────────────────
const getAllHabitations = () =>
  [...habitations].sort((a, b) => b.relocationPriorityScore - a.relocationPriorityScore);

const getHabitationById = (id) => habitations.find((h) => h._id === id) || null;

const searchHabitations = (q) =>
  habitations
    .filter((h) => h.name.toLowerCase().includes(q.toLowerCase()) || h.district.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 10);

const getRedZones = () =>
  habitations
    .filter((h) => h.redZoneStatus)
    .sort((a, b) => b.hazardScore - a.hazardScore);

const getRelocationPriority = () =>
  [...habitations].sort((a, b) => b.relocationPriorityScore - a.relocationPriorityScore);

// ── Site CRUD ────────────────────────────────────────────────
const getAllSites = () => [...sites].sort((a, b) => b.suitabilityScore - a.suitabilityScore);
const getSiteById = (id) => sites.find((s) => s._id === id) || null;

// Geographic-first recommendation matching engine
const getRecommendedSites = (habitationId, options = {}) => {
  const habitation = habitations.find((h) => h._id === habitationId);
  if (!habitation) return null;
  return matchRelocationSites(habitation, sites, options);
};

// ── Relocation Plan CRUD ─────────────────────────────────────
const createPlan = (planData) => {
  const plan = {
    _id: uuidv4(),
    ...planData,
    approvalStatus: 'pending',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  relocationPlans.push(plan);
  return plan;
};

const getAllPlans = () => [...relocationPlans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const getPlanById = (id) => relocationPlans.find((p) => p._id === id) || null;
const updatePlan = (id, updates) => {
  const idx = relocationPlans.findIndex((p) => p._id === id);
  if (idx === -1) return null;
  relocationPlans[idx] = { ...relocationPlans[idx], ...updates, updatedAt: new Date().toISOString() };
  return relocationPlans[idx];
};

// ── Alert CRUD ───────────────────────────────────────────────
const getAllAlerts = (filter = {}) => {
  let result = [...alerts];
  if (filter.status) result = result.filter((a) => a.status === filter.status);
  if (filter.agency) result = result.filter((a) => a.target_agency === filter.agency);
  if (filter.village) result = result.filter((a) => a.village_id === filter.village);
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100);
};

const createAlerts = (docs) => {
  const created = docs.map((d) => ({
    _id: uuidv4(),
    ...d,
    acknowledged_by: null,
    acknowledged_at: null,
    simulation_note: 'SIMULATION ONLY — No real SMS/WhatsApp/calls sent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  alerts = alerts.concat(created);
  return created;
};

const updateAlert = (id, updates) => {
  const idx = alerts.findIndex((a) => a._id === id);
  if (idx === -1) return null;
  alerts[idx] = { ...alerts[idx], ...updates, updatedAt: new Date().toISOString() };
  return alerts[idx];
};

const deleteAlertsByHabitation = (habitationId) => {
  alerts = alerts.filter((a) => !(a.village_id === habitationId && a.status === 'active'));
};

const clearResolvedAlerts = () => {
  alerts = alerts.filter((a) => a.status !== 'resolved');
};

const summaryStats = () => {
  const total = habitations.length;
  const redZone = habitations.filter((h) => h.redZoneStatus).length;
  const immediate = habitations.filter((h) => h.relocationTimeline === 'Immediate').length;
  const shortTerm = habitations.filter((h) => h.relocationTimeline === 'Short-Term').length;
  const mediumTerm = habitations.filter((h) => h.relocationTimeline === 'Medium-Term').length;
  const monitor = habitations.filter((h) => h.relocationTimeline === 'Monitor').length;
  const popAtRisk = habitations.filter((h) => h.redZoneStatus).reduce((s, h) => s + h.population, 0);
  const totalPop = habitations.reduce((s, h) => s + h.population, 0);
  const totalSiteCapacity = sites.reduce((s, site) => s + Math.max(0, site.maxCapacity - site.currentOccupancy - site.reservedCapacity), 0);
  const suitableSites = sites.filter((s) => s.suitabilityStatus === 'Suitable').length;
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;

  return {
    total, redZone, immediate, shortTerm, mediumTerm, monitor,
    popAtRisk, totalPop, totalSiteCapacity, suitableSites,
    totalSites: sites.length, activeAlerts,
    districts: [...new Set(habitations.map(h => h.district))],
    dataLabel: 'Maharashtra Demonstration Dataset · Synthetic Prototype Data',
  };
};

module.exports = {
  // habitations
  getAllHabitations, getHabitationById, searchHabitations,
  getRedZones, getRelocationPriority,
  // sites
  getAllSites, getSiteById, getRecommendedSites,
  // plans
  createPlan, getAllPlans, getPlanById, updatePlan,
  // alerts
  getAllAlerts, createAlerts, updateAlert,
  deleteAlertsByHabitation, clearResolvedAlerts,
  // summary
  summaryStats,
  // polygons
  redZonePolygons,
};
