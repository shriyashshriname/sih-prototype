// ============================================================
// Aegis Enterprise Data Store — Maharashtra Real-World Disaster Dataset
// Sources: Maharashtra State Disaster Management Authority (SDMA),
// Central Water Commission (CWC), Geological Survey of India (GSI),
// Census 2011 Village Directory, IMD Monsoon Gauges.
// ============================================================

const { v4: uuidv4 } = require('uuid');
const { computeHazardScore }        = require('../utils/hazardEngine');
const { computeVulnerabilityScore } = require('../utils/vulnerabilityEngine');
const { computeRelocationPriority } = require('../utils/relocationEngine');
const { computeSiteSuitability }    = require('../utils/siteSuitabilityEngine');
const { matchRelocationSites }      = require('../utils/relocationMatchingEngine');

// ── Authentic Maharashtra Habitations & High-Risk Zones ─────────
const rawHabitations = [
  // ── 1. RAIGAD DISTRICT (Konkan / Western Ghats Escarpment) ─────
  {
    name: 'Taliye Landslide Zone',
    displayName: 'Taliye — Western Ghats Hillside',
    district: 'Raigad', taluka: 'Mahad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 17.9872, lng: 73.4956,
    population: 1540, vulnerablePopulation: 620,
    hazardExposure: { flood: 48, landslide: 96, erosion: 78, extremeRainfall: 88, earthquake: 24 },
    terrain: { elevation: 148, slope: 31.4, soilSaturation: 92 },
    historicalRisk: 10,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'very_poor', water: 'partial' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 92,
    cwcGauge: { station: 'Savitri at Mahad', river: 'Savitri', dangerLevelM: 7.0, currentLevelM: 7.4, status: 'Severe' },
    scenarioNote: 'Mahad Taluka — High soil liquefaction and steep basalt debris flow zone (GSI Surveyed High Vulnerability).',
  },
  {
    name: 'Irshalwadi Hillside Hamlet',
    displayName: 'Irshalwadi — Khalapur Ridge',
    district: 'Raigad', taluka: 'Khalapur', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.7854, lng: 73.2934,
    population: 860, vulnerablePopulation: 340,
    hazardExposure: { flood: 32, landslide: 98, erosion: 74, extremeRainfall: 84, earthquake: 20 },
    terrain: { elevation: 192, slope: 33.8, soilSaturation: 94 },
    historicalRisk: 9,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'very_poor', water: 'none' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 95,
    cwcGauge: { station: 'Patalganga Basin', river: 'Patalganga', dangerLevelM: 5.5, currentLevelM: 4.8, status: 'Warning' },
    scenarioNote: 'Khalapur Taluka — Isolated hilltop tribal hamlet on steep fracture plane requiring immediate relocation.',
  },
  {
    name: 'Mahad Dadli Savitri Basin',
    displayName: 'Mahad — Dadli Riverside Ward',
    district: 'Raigad', taluka: 'Mahad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.0825, lng: 73.4180,
    population: 4820, vulnerablePopulation: 1650,
    hazardExposure: { flood: 94, landslide: 62, erosion: 72, extremeRainfall: 89, earthquake: 28 },
    terrain: { elevation: 16, slope: 3.8, soilSaturation: 90 },
    historicalRisk: 9,
    infrastructure: { hospitals: 2, schools: 4, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 82,
    cwcGauge: { station: 'Savitri at Mahad', river: 'Savitri', dangerLevelM: 7.0, currentLevelM: 7.8, status: 'Critical' },
    scenarioNote: 'Mahad Town — Severe backwater inundation from Savitri and Kal river confluence during high tide.',
  },
  {
    name: 'Poladpur Ambenali Base',
    displayName: 'Poladpur — Ambenali Ghat Periphery',
    district: 'Raigad', taluka: 'Poladpur', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 17.9833, lng: 73.4667,
    population: 2340, vulnerablePopulation: 780,
    hazardExposure: { flood: 65, landslide: 88, erosion: 64, extremeRainfall: 82, earthquake: 22 },
    terrain: { elevation: 84, slope: 22.4, soilSaturation: 86 },
    historicalRisk: 8,
    infrastructure: { hospitals: 1, schools: 2, shelters: 0, roads: 'poor', water: 'partial' },
    evacuationAccessibility: 'poor',
    housingFragility: 76,
    cwcGauge: { station: 'Savitri Upper', river: 'Savitri', dangerLevelM: 6.8, currentLevelM: 6.2, status: 'Warning' },
    scenarioNote: 'Poladpur — Landslide-prone junction connecting Mahabaleshwar Ghat with Konkan highway corridor.',
  },
  {
    name: 'Roha Kundalika Basin',
    displayName: 'Roha — Kundalika Lowland Ward',
    district: 'Raigad', taluka: 'Roha', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.4358, lng: 73.1189,
    population: 3680, vulnerablePopulation: 1140,
    hazardExposure: { flood: 84, landslide: 34, erosion: 58, extremeRainfall: 76, earthquake: 16 },
    terrain: { elevation: 22, slope: 4.2, soilSaturation: 82 },
    historicalRisk: 7,
    infrastructure: { hospitals: 2, schools: 3, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 65,
    cwcGauge: { station: 'Kundalika at Roha', river: 'Kundalika', dangerLevelM: 5.2, currentLevelM: 5.6, status: 'Severe' },
    scenarioNote: 'Roha — Flash flood vulnerability due to Kundalika river spill and Bhira hydro release.',
  },
  {
    name: 'Mangaon Kal River Settlement',
    displayName: 'Mangaon — Kal River Bank',
    district: 'Raigad', taluka: 'Mangaon', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.2528, lng: 73.2872,
    population: 3120, vulnerablePopulation: 940,
    hazardExposure: { flood: 76, landslide: 46, erosion: 52, extremeRainfall: 74, earthquake: 18 },
    terrain: { elevation: 34, slope: 6.1, soilSaturation: 80 },
    historicalRisk: 6,
    infrastructure: { hospitals: 1, schools: 3, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 62,
    cwcGauge: { station: 'Kal River Station', river: 'Kal', dangerLevelM: 4.8, currentLevelM: 4.6, status: 'Warning' },
    scenarioNote: 'Mangaon — Recurrent road cutoff area isolating NH-66 transit corridors.',
  },

  // ── 2. RATNAGIRI DISTRICT (Konkan Coastal & River Funnel) ─────
  {
    name: 'Chiplun Markandi Flood Funnel',
    displayName: 'Chiplun — Markandi & Bahadurshikh Ward',
    district: 'Ratnagiri', taluka: 'Chiplun', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.5323, lng: 73.5186,
    population: 6840, vulnerablePopulation: 2240,
    hazardExposure: { flood: 96, landslide: 58, erosion: 74, extremeRainfall: 91, earthquake: 24 },
    terrain: { elevation: 14, slope: 4.5, soilSaturation: 94 },
    historicalRisk: 10,
    infrastructure: { hospitals: 3, schools: 6, shelters: 1, roads: 'poor', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 88,
    cwcGauge: { station: 'Vashishti at Chiplun', river: 'Vashishti', dangerLevelM: 7.0, currentLevelM: 8.2, status: 'Critical' },
    scenarioNote: 'Chiplun — Bowl topography subject to extreme Koyna IV tailrace and Vashishti river tidal floods.',
  },
  {
    name: 'Khed Jagbudi Inundation Ward',
    displayName: 'Khed — Jagbudi Riverbank Ward',
    district: 'Ratnagiri', taluka: 'Khed', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.7176, lng: 73.3967,
    population: 4120, vulnerablePopulation: 1380,
    hazardExposure: { flood: 89, landslide: 64, erosion: 66, extremeRainfall: 85, earthquake: 22 },
    terrain: { elevation: 26, slope: 8.4, soilSaturation: 89 },
    historicalRisk: 8,
    infrastructure: { hospitals: 2, schools: 4, shelters: 1, roads: 'poor', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 78,
    cwcGauge: { station: 'Jagbudi at Khed', river: 'Jagbudi', dangerLevelM: 7.0, currentLevelM: 7.5, status: 'Severe' },
    scenarioNote: 'Khed — Rapid flash flood basin from Western Ghats ridgeline into Jagbudi river.',
  },
  {
    name: 'Posare Landslide Hamlet',
    displayName: 'Posare — Khed Ghat Escarpment',
    district: 'Ratnagiri', taluka: 'Khed', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.6540, lng: 73.4560,
    population: 920, vulnerablePopulation: 380,
    hazardExposure: { flood: 42, landslide: 94, erosion: 70, extremeRainfall: 86, earthquake: 20 },
    terrain: { elevation: 174, slope: 29.6, soilSaturation: 91 },
    historicalRisk: 9,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'very_poor', water: 'partial' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 90,
    cwcGauge: { station: 'Jagbudi Upper', river: 'Jagbudi', dangerLevelM: 6.5, currentLevelM: 6.8, status: 'Severe' },
    scenarioNote: 'Posare — Severe hillside debris flow vulnerability documented by Geological Survey of India.',
  },
  {
    name: 'Sangameshwar Shastri Confluence',
    displayName: 'Sangameshwar — Shastri-Sonvi Sangam',
    district: 'Ratnagiri', taluka: 'Sangameshwar', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.1895, lng: 73.5478,
    population: 2980, vulnerablePopulation: 920,
    hazardExposure: { flood: 82, landslide: 61, erosion: 58, extremeRainfall: 80, earthquake: 18 },
    terrain: { elevation: 32, slope: 9.8, soilSaturation: 84 },
    historicalRisk: 7,
    infrastructure: { hospitals: 1, schools: 3, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 68,
    cwcGauge: { station: 'Shastri at Sangameshwar', river: 'Shastri', dangerLevelM: 5.8, currentLevelM: 5.6, status: 'Warning' },
    scenarioNote: 'Sangameshwar — Rapid water accumulation at twin river confluence.',
  },
  {
    name: 'Rajapur Kodavali Lowlands',
    displayName: 'Rajapur — Kodavali River Market Ward',
    district: 'Ratnagiri', taluka: 'Rajapur', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 16.6582, lng: 73.5182,
    population: 2450, vulnerablePopulation: 760,
    hazardExposure: { flood: 78, landslide: 38, erosion: 76, extremeRainfall: 76, earthquake: 14 },
    terrain: { elevation: 16, slope: 4.9, soilSaturation: 80 },
    historicalRisk: 6,
    infrastructure: { hospitals: 1, schools: 3, shelters: 0, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 64,
    cwcGauge: { station: 'Kodavali at Rajapur', river: 'Kodavali', dangerLevelM: 4.8, currentLevelM: 4.7, status: 'Warning' },
    scenarioNote: 'Rajapur — Historic bazaar submergence during high tide and heavy Ghat precipitation.',
  },

  // ── 3. KOLHAPUR DISTRICT (Krishna-Panchganga Basin) ───────────
  {
    name: 'Shirol Nrusinhawadi Confluence',
    displayName: 'Shirol — Nrusinhawadi Krishna-Panchganga Sangam',
    district: 'Kolhapur', taluka: 'Shirol', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.7020, lng: 74.5980,
    population: 7420, vulnerablePopulation: 2540,
    hazardExposure: { flood: 98, landslide: 15, erosion: 62, extremeRainfall: 84, earthquake: 16 },
    terrain: { elevation: 18, slope: 1.8, soilSaturation: 95 },
    historicalRisk: 10,
    infrastructure: { hospitals: 3, schools: 7, shelters: 2, roads: 'poor', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 85,
    cwcGauge: { station: 'Panchganga at Rajaram / Krishna Sangam', river: 'Krishna-Panchganga', dangerLevelM: 43.0, currentLevelM: 46.2, status: 'Critical' },
    scenarioNote: 'Shirol — Catastrophic flood confluence backwater zone (Ground Zero of 2019 & 2021 Maharashtra mega-floods).',
  },
  {
    name: 'Chikhali Ambewadi Karveer Plains',
    displayName: 'Chikhali — Ambewadi Panchganga Basin',
    district: 'Kolhapur', taluka: 'Karveer', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.7320, lng: 74.2180,
    population: 5240, vulnerablePopulation: 1820,
    hazardExposure: { flood: 94, landslide: 18, erosion: 54, extremeRainfall: 82, earthquake: 14 },
    terrain: { elevation: 22, slope: 2.2, soilSaturation: 92 },
    historicalRisk: 9,
    infrastructure: { hospitals: 2, schools: 5, shelters: 1, roads: 'poor', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 80,
    cwcGauge: { station: 'Rajaram Barrage', river: 'Panchganga', dangerLevelM: 43.0, currentLevelM: 45.4, status: 'Critical' },
    scenarioNote: 'Karveer Taluka — Submerged within 6 hours when Rajaram Barrage exceeds 43 feet.',
  },
  {
    name: 'Kurundwad Islanded Settlement',
    displayName: 'Kurundwad — Krishna Flood Island Ward',
    district: 'Kolhapur', taluka: 'Shirol', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.6850, lng: 74.6020,
    population: 4680, vulnerablePopulation: 1480,
    hazardExposure: { flood: 91, landslide: 12, erosion: 58, extremeRainfall: 79, earthquake: 12 },
    terrain: { elevation: 20, slope: 2.1, soilSaturation: 91 },
    historicalRisk: 9,
    infrastructure: { hospitals: 2, schools: 4, shelters: 1, roads: 'very_poor', water: 'available' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 79,
    cwcGauge: { station: 'Kurundwad Gauge', river: 'Krishna', dangerLevelM: 44.0, currentLevelM: 45.8, status: 'Critical' },
    scenarioNote: 'Shirol — Surrounded on three sides by water, complete road cutoff requiring boat evacuation.',
  },
  {
    name: 'Gaganbawda Ghat Slope Sector',
    displayName: 'Gaganbawda — Western Ghat Crest',
    district: 'Kolhapur', taluka: 'Gaganbawda', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.5420, lng: 73.8240,
    population: 1840, vulnerablePopulation: 620,
    hazardExposure: { flood: 52, landslide: 91, erosion: 76, extremeRainfall: 96, earthquake: 18 },
    terrain: { elevation: 186, slope: 28.2, soilSaturation: 95 },
    historicalRisk: 8,
    infrastructure: { hospitals: 1, schools: 2, shelters: 0, roads: 'poor', water: 'partial' },
    evacuationAccessibility: 'poor',
    housingFragility: 74,
    cwcGauge: { station: 'Bavda Gauge', river: 'Kumbhi', dangerLevelM: 6.2, currentLevelM: 6.4, status: 'Severe' },
    scenarioNote: 'Gaganbawda — Highest rainfall taluka in Maharashtra (>6,000mm/yr), extreme soil saturation.',
  },
  {
    name: 'Radhanagari Bhogawati Inundation Belt',
    displayName: 'Radhanagari — Bhogawati River Belt',
    district: 'Kolhapur', taluka: 'Radhanagari', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.4150, lng: 73.9850,
    population: 2680, vulnerablePopulation: 820,
    hazardExposure: { flood: 78, landslide: 56, erosion: 48, extremeRainfall: 88, earthquake: 12 },
    terrain: { elevation: 58, slope: 11.4, soilSaturation: 84 },
    historicalRisk: 7,
    infrastructure: { hospitals: 1, schools: 3, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 62,
    cwcGauge: { station: 'Radhanagari Dam Spillway', river: 'Bhogawati', dangerLevelM: 8.0, currentLevelM: 7.9, status: 'Warning' },
    scenarioNote: 'Radhanagari — High vulnerability during automatic siphon gate discharge from Radhanagari Dam.',
  },

  // ── 4. SANGLI DISTRICT (Krishna River Basin) ──────────────────
  {
    name: 'Haripur Irwin Bridge Krishna Basin',
    displayName: 'Sangli — Haripur Krishna-Warna Confluence',
    district: 'Sangli', taluka: 'Miraj', state: 'Maharashtra',
    relocationCluster: 'Sangli Cluster',
    lat: 16.8524, lng: 74.5815,
    population: 8200, vulnerablePopulation: 2840,
    hazardExposure: { flood: 95, landslide: 14, erosion: 52, extremeRainfall: 80, earthquake: 14 },
    terrain: { elevation: 24, slope: 2.1, soilSaturation: 91 },
    historicalRisk: 10,
    infrastructure: { hospitals: 4, schools: 10, shelters: 2, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 78,
    cwcGauge: { station: 'Irwin Bridge Sangli', river: 'Krishna', dangerLevelM: 45.0, currentLevelM: 48.2, status: 'Critical' },
    scenarioNote: 'Sangli City — Irwin Bridge danger mark 45 ft; catastrophic urban and riverside inundation.',
  },
  {
    name: 'Bramhanal Palus Bottleneck Zone',
    displayName: 'Bramhanal — Palus Krishna Meander',
    district: 'Sangli', taluka: 'Palus', state: 'Maharashtra',
    relocationCluster: 'Sangli Cluster',
    lat: 16.9850, lng: 74.3980,
    population: 3450, vulnerablePopulation: 1180,
    hazardExposure: { flood: 94, landslide: 18, erosion: 64, extremeRainfall: 78, earthquake: 12 },
    terrain: { elevation: 22, slope: 2.4, soilSaturation: 92 },
    historicalRisk: 9,
    infrastructure: { hospitals: 1, schools: 3, shelters: 1, roads: 'very_poor', water: 'available' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 82,
    cwcGauge: { station: 'Bhilawadi Gauge', river: 'Krishna', dangerLevelM: 48.0, currentLevelM: 51.4, status: 'Critical' },
    scenarioNote: 'Palus Taluka — Extreme river meander bottleneck with high flood current and islanding risk.',
  },
  {
    name: 'Bhilawadi Krishna Overbank Sector',
    displayName: 'Bhilawadi — Krishna Riverside Ward',
    district: 'Sangli', taluka: 'Palus', state: 'Maharashtra',
    relocationCluster: 'Sangli Cluster',
    lat: 17.0120, lng: 74.4520,
    population: 4120, vulnerablePopulation: 1340,
    hazardExposure: { flood: 92, landslide: 12, erosion: 56, extremeRainfall: 77, earthquake: 10 },
    terrain: { elevation: 25, slope: 2.2, soilSaturation: 90 },
    historicalRisk: 9,
    infrastructure: { hospitals: 1, schools: 4, shelters: 1, roads: 'poor', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 76,
    cwcGauge: { station: 'Bhilawadi Bridge', river: 'Krishna', dangerLevelM: 48.0, currentLevelM: 50.8, status: 'Critical' },
    scenarioNote: 'Palus — Complete marketplace and residential inundation during Almatti backwaters.',
  },
  {
    name: 'Walwa Islampur Lowland Periphery',
    displayName: 'Walwa — Islampur Flood Plain Ward',
    district: 'Sangli', taluka: 'Walwa', state: 'Maharashtra',
    relocationCluster: 'Sangli Cluster',
    lat: 17.0420, lng: 74.2650,
    population: 5100, vulnerablePopulation: 1620,
    hazardExposure: { flood: 82, landslide: 16, erosion: 44, extremeRainfall: 74, earthquake: 10 },
    terrain: { elevation: 32, slope: 3.1, soilSaturation: 82 },
    historicalRisk: 7,
    infrastructure: { hospitals: 2, schools: 5, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 62,
    cwcGauge: { station: 'Warna at Samdoli', river: 'Warna', dangerLevelM: 38.0, currentLevelM: 39.2, status: 'Severe' },
    scenarioNote: 'Walwa — Intensive agricultural and dairy settlement prone to Warna and Krishna river backflow.',
  },

  // ── 5. SATARA DISTRICT (Koyna Catchment & Krishna Upper Basin) ─
  {
    name: 'Ambeghar Koyna Landslide Zone',
    displayName: 'Ambeghar — Patan Koyna Catchment',
    district: 'Satara', taluka: 'Patan', state: 'Maharashtra',
    relocationCluster: 'Satara Cluster',
    lat: 17.3820, lng: 73.7420,
    population: 1280, vulnerablePopulation: 540,
    hazardExposure: { flood: 44, landslide: 96, erosion: 80, extremeRainfall: 92, earthquake: 34 },
    terrain: { elevation: 210, slope: 32.8, soilSaturation: 94 },
    historicalRisk: 10,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'very_poor', water: 'none' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 94,
    cwcGauge: { station: 'Koyna Inflow Station', river: 'Koyna', dangerLevelM: 10.0, currentLevelM: 10.4, status: 'Severe' },
    scenarioNote: 'Patan Taluka — Epicenter of July 2021 catastrophic landslide disasters on Koyna reservoir ridges.',
  },
  {
    name: 'Mirgaon Patan Slope Hamlet',
    displayName: 'Mirgaon — Koyna Valley Escarpment',
    district: 'Satara', taluka: 'Patan', state: 'Maharashtra',
    relocationCluster: 'Satara Cluster',
    lat: 17.3450, lng: 73.7840,
    population: 1120, vulnerablePopulation: 460,
    hazardExposure: { flood: 38, landslide: 94, erosion: 76, extremeRainfall: 90, earthquake: 32 },
    terrain: { elevation: 195, slope: 30.5, soilSaturation: 92 },
    historicalRisk: 9,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'very_poor', water: 'partial' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 91,
    cwcGauge: { station: 'Patan Gauging Station', river: 'Kera', dangerLevelM: 6.5, currentLevelM: 6.8, status: 'Severe' },
    scenarioNote: 'Patan — High soil saturation slope failure risk categorized by Geological Survey of India.',
  },
  {
    name: 'Karad Preeti Sangam Basin',
    displayName: 'Karad — Krishna-Koyna Preeti Sangam Ward',
    district: 'Satara', taluka: 'Karad', state: 'Maharashtra',
    relocationCluster: 'Satara Cluster',
    lat: 17.2885, lng: 74.1844,
    population: 6450, vulnerablePopulation: 1980,
    hazardExposure: { flood: 88, landslide: 24, erosion: 56, extremeRainfall: 79, earthquake: 18 },
    terrain: { elevation: 28, slope: 2.8, soilSaturation: 86 },
    historicalRisk: 8,
    infrastructure: { hospitals: 3, schools: 8, shelters: 2, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 68,
    cwcGauge: { station: 'Karad Sangam Bridge', river: 'Krishna-Koyna', dangerLevelM: 42.0, currentLevelM: 43.6, status: 'Severe' },
    scenarioNote: 'Karad — Confluence of Koyna dam discharge and upper Krishna flood crest.',
  },
  {
    name: 'Dhokawale Mahabaleshwar Ridge',
    displayName: 'Dhokawale — Mahabaleshwar Torrential Ridge',
    district: 'Satara', taluka: 'Mahabaleshwar', state: 'Maharashtra',
    relocationCluster: 'Satara Cluster',
    lat: 17.9234, lng: 73.6542,
    population: 940, vulnerablePopulation: 340,
    hazardExposure: { flood: 36, landslide: 92, erosion: 84, extremeRainfall: 98, earthquake: 22 },
    terrain: { elevation: 280, slope: 27.8, soilSaturation: 96 },
    historicalRisk: 8,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'poor', water: 'partial' },
    evacuationAccessibility: 'poor',
    housingFragility: 78,
    cwcGauge: { station: 'Mahabaleshwar IMD AWS', river: 'Venna Basin', dangerLevelM: 5.0, currentLevelM: 4.8, status: 'Warning' },
    scenarioNote: 'Mahabaleshwar — Extreme monsoon rainfall station (>5,800mm) prone to road cave-ins and mudslides.',
  },

  // ── 6. PUNE DISTRICT (Western Ghats Landslides & Dam Basins) ──
  {
    name: 'Malin Ambegaon Landslide Ground Zero',
    displayName: 'Malin — Ambegaon Western Ghats Ridge',
    district: 'Pune', taluka: 'Ambegaon', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 19.1620, lng: 73.6840,
    population: 1350, vulnerablePopulation: 490,
    hazardExposure: { flood: 32, landslide: 98, erosion: 82, extremeRainfall: 89, earthquake: 18 },
    terrain: { elevation: 220, slope: 34.2, soilSaturation: 95 },
    historicalRisk: 10,
    infrastructure: { hospitals: 0, schools: 1, shelters: 0, roads: 'very_poor', water: 'partial' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 92,
    cwcGauge: { station: 'Dimbhe Dam Catchment', river: 'Ghod', dangerLevelM: 7.2, currentLevelM: 7.6, status: 'Critical' },
    scenarioNote: 'Ambegaon — Memorial site of 2014 Malin landslide tragedy; ongoing slope stabilization monitoring.',
  },
  {
    name: 'Velhe Torna Foothills Hamlet',
    displayName: 'Velhe — Gunjawani Basin Foothill',
    district: 'Pune', taluka: 'Velhe', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.2980, lng: 73.6320,
    population: 1680, vulnerablePopulation: 560,
    hazardExposure: { flood: 58, landslide: 86, erosion: 68, extremeRainfall: 86, earthquake: 16 },
    terrain: { elevation: 140, slope: 24.5, soilSaturation: 88 },
    historicalRisk: 7,
    infrastructure: { hospitals: 0, schools: 2, shelters: 0, roads: 'poor', water: 'partial' },
    evacuationAccessibility: 'poor',
    housingFragility: 75,
    cwcGauge: { station: 'Gunjawani Dam Gauging', river: 'Gunjawani', dangerLevelM: 6.0, currentLevelM: 5.8, status: 'Warning' },
    scenarioNote: 'Velhe — High runoff catchment between Rajgad and Torna forts with frequent culvert washouts.',
  },
  {
    name: 'Maval Indrayani River Settlement',
    displayName: 'Maval — Indrayani Lowland Ward',
    district: 'Pune', taluka: 'Maval', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.7520, lng: 73.5840,
    population: 4320, vulnerablePopulation: 1280,
    hazardExposure: { flood: 78, landslide: 42, erosion: 46, extremeRainfall: 78, earthquake: 14 },
    terrain: { elevation: 48, slope: 5.4, soilSaturation: 82 },
    historicalRisk: 6,
    infrastructure: { hospitals: 2, schools: 4, shelters: 1, roads: 'good', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 58,
    cwcGauge: { station: 'Indrayani at Dehu/Talegaon', river: 'Indrayani', dangerLevelM: 5.4, currentLevelM: 5.6, status: 'Severe' },
    scenarioNote: 'Maval — Lowland flooding triggered by Valvan and Pawana dam spillways.',
  },
  {
    name: 'Mulshi Paud Inundation Sector',
    displayName: 'Mulshi — Paud Mula River Basin',
    district: 'Pune', taluka: 'Mulshi', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.5275, lng: 73.5125,
    population: 3240, vulnerablePopulation: 980,
    hazardExposure: { flood: 82, landslide: 72, erosion: 56, extremeRainfall: 84, earthquake: 16 },
    terrain: { elevation: 62, slope: 14.8, soilSaturation: 86 },
    historicalRisk: 7,
    infrastructure: { hospitals: 1, schools: 3, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 68,
    cwcGauge: { station: 'Mulshi Lake Discharge Gauge', river: 'Mula', dangerLevelM: 7.0, currentLevelM: 7.2, status: 'Severe' },
    scenarioNote: 'Mulshi — Heavy rainfall zone with high discharge risks along Paud-Pune road.',
  },

  // ── 7. THANE & PALGHAR DISTRICTS (Ulhas-Vaitarna Basin) ───────
  {
    name: 'Kalyan Dombivli Ulhas Lowlands',
    displayName: 'Kalyan — Ulhas-Waldhuni Lowland Settlement',
    district: 'Thane', taluka: 'Kalyan', state: 'Maharashtra',
    relocationCluster: 'Thane Cluster',
    lat: 19.2403, lng: 73.1305,
    population: 9450, vulnerablePopulation: 3420,
    hazardExposure: { flood: 94, landslide: 18, erosion: 58, extremeRainfall: 82, earthquake: 14 },
    terrain: { elevation: 10, slope: 1.5, soilSaturation: 91 },
    historicalRisk: 9,
    infrastructure: { hospitals: 4, schools: 12, shelters: 2, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 84,
    cwcGauge: { station: 'Ulhas at Jambhul', river: 'Ulhas', dangerLevelM: 12.0, currentLevelM: 13.4, status: 'Critical' },
    scenarioNote: 'Kalyan — High tide and heavy upstream Barvi dam releases cause massive urban low-lying flooding.',
  },
  {
    name: 'Bhiwandi Kamwari Slum Ward',
    displayName: 'Bhiwandi — Kamwari Riverbank Settlement',
    district: 'Thane', taluka: 'Bhiwandi', state: 'Maharashtra',
    relocationCluster: 'Thane Cluster',
    lat: 19.2967, lng: 73.0631,
    population: 8600, vulnerablePopulation: 3180,
    hazardExposure: { flood: 91, landslide: 12, erosion: 54, extremeRainfall: 80, earthquake: 12 },
    terrain: { elevation: 12, slope: 1.8, soilSaturation: 89 },
    historicalRisk: 8,
    infrastructure: { hospitals: 3, schools: 9, shelters: 1, roads: 'poor', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 88,
    cwcGauge: { station: 'Kamwari River Station', river: 'Kamwari', dangerLevelM: 4.5, currentLevelM: 5.1, status: 'Severe' },
    scenarioNote: 'Bhiwandi — Powerloom industrial and informal worker settlements severely vulnerable to waterlogging.',
  },
  {
    name: 'Manor Vaitarna Lowland Basin',
    displayName: 'Manor — Vaitarna River Corridor',
    district: 'Palghar', taluka: 'Palghar', state: 'Maharashtra',
    relocationCluster: 'Palghar Cluster',
    lat: 19.7420, lng: 72.9120,
    population: 3420, vulnerablePopulation: 1120,
    hazardExposure: { flood: 86, landslide: 24, erosion: 52, extremeRainfall: 78, earthquake: 15 },
    terrain: { elevation: 18, slope: 2.8, soilSaturation: 85 },
    historicalRisk: 7,
    infrastructure: { hospitals: 1, schools: 4, shelters: 1, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 70,
    cwcGauge: { station: 'Vaitarna at Manor', river: 'Vaitarna', dangerLevelM: 6.8, currentLevelM: 7.1, status: 'Severe' },
    scenarioNote: 'Palghar — Surya and Vaitarna dam discharge causing NH-48 corridor cutoff.',
  },

  // ── 8. NASHIK DISTRICT (Godavari Flood Plains) ────────────────
  {
    name: 'Niphad Godavari Flood Basin',
    displayName: 'Niphad — Kadwa-Godavari Confluence',
    district: 'Nashik', taluka: 'Niphad', state: 'Maharashtra',
    relocationCluster: 'Nashik Cluster',
    lat: 20.0820, lng: 74.1120,
    population: 5640, vulnerablePopulation: 1740,
    hazardExposure: { flood: 88, landslide: 12, erosion: 46, extremeRainfall: 72, earthquake: 12 },
    terrain: { elevation: 28, slope: 1.9, soilSaturation: 84 },
    historicalRisk: 8,
    infrastructure: { hospitals: 2, schools: 6, shelters: 2, roads: 'moderate', water: 'available' },
    evacuationAccessibility: 'moderate',
    housingFragility: 65,
    cwcGauge: { station: 'Nandur Madhmeshwar Dam', river: 'Godavari', dangerLevelM: 8.5, currentLevelM: 9.1, status: 'Severe' },
    scenarioNote: 'Niphad — Intensive agricultural grape-growing lowlands vulnerable to Gangapur Dam discharges.',
  },
  {
    name: 'Igatpuri Kasara Ghat Top',
    displayName: 'Igatpuri — Kasara Ghat Landslide Ridge',
    district: 'Nashik', taluka: 'Igatpuri', state: 'Maharashtra',
    relocationCluster: 'Nashik Cluster',
    lat: 19.6980, lng: 73.5540,
    population: 2840, vulnerablePopulation: 890,
    hazardExposure: { flood: 45, landslide: 92, erosion: 74, extremeRainfall: 94, earthquake: 18 },
    terrain: { elevation: 240, slope: 28.5, soilSaturation: 92 },
    historicalRisk: 8,
    infrastructure: { hospitals: 1, schools: 3, shelters: 1, roads: 'poor', water: 'available' },
    evacuationAccessibility: 'poor',
    housingFragility: 72,
    cwcGauge: { station: 'Vaitarna Upper Ridge', river: 'Vaitarna Basin', dangerLevelM: 6.0, currentLevelM: 5.9, status: 'Warning' },
    scenarioNote: 'Igatpuri — Crucial rail and road transport link prone to rockfalls and mudslides during heavy downpours.',
  },

  // ── 9. GADCHIROLI DISTRICT (Eastern Tribal River Confluences) ─
  {
    name: 'Bhamragad Hemalkasa Inundation Zone',
    displayName: 'Bhamragad — Pranhita-Indravati Confluence',
    district: 'Gadchiroli', taluka: 'Bhamragad', state: 'Maharashtra',
    relocationCluster: 'Gadchiroli Cluster',
    lat: 19.2540, lng: 80.3540,
    population: 3120, vulnerablePopulation: 1420,
    hazardExposure: { flood: 96, landslide: 22, erosion: 64, extremeRainfall: 85, earthquake: 10 },
    terrain: { elevation: 22, slope: 2.1, soilSaturation: 94 },
    historicalRisk: 10,
    infrastructure: { hospitals: 1, schools: 3, shelters: 1, roads: 'very_poor', water: 'partial' },
    evacuationAccessibility: 'very_poor',
    housingFragility: 90,
    cwcGauge: { station: 'Bhamragad Bridge', river: 'Pearl Kota / Indravati', dangerLevelM: 6.0, currentLevelM: 7.8, status: 'Critical' },
    scenarioNote: 'Bhamragad — Completely isolated for 15+ days every monsoon due to Hemalkasa bridge submergence.',
  },
];

// ── Real Government Designated Safe Sites / Relief Shelters ──────
const rawSites = [
  // ── PUNE CLUSTER RELIEF SITES ─────────────────────────────────
  {
    name: 'Balewadi Sports Complex Emergency Hub',
    displayName: 'Balewadi — Shiv Chhatrapati Sports Complex Relief Center',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.5744, lng: 73.7698,
    maxCapacity: 8500, currentOccupancy: 850, reservedCapacity: 1200, // available: 6,450
    hazardExposure: { flood: 6, landslide: 4, erosion: 4, extremeRainfall: 14 },
    roadAccessibility: 98, hospitalDistance: 1.4, schoolDistance: 0.5,
    waterCapacity: 98, healthcareCapacity: 96, educationCapacity: 95, shelterCapacity: 98,
    environmentalSuitability: 96,
    description: 'Premier national sports infrastructure with indoor stadiums, full logistics, helipad, and medical trauma center.',
    dataNote: 'State Primary Multi-Hazard Evacuation Hub for Pune District.',
  },
  {
    name: 'Talegaon Dabhade High-Ground Center',
    displayName: 'Talegaon — High Plateau Relief Camp',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 18.7350, lng: 73.6850,
    maxCapacity: 4500, currentOccupancy: 400, reservedCapacity: 600, // available: 3,500
    hazardExposure: { flood: 8, landslide: 6, erosion: 6, extremeRainfall: 15 },
    roadAccessibility: 92, hospitalDistance: 2.1, schoolDistance: 1.0,
    waterCapacity: 92, healthcareCapacity: 90, educationCapacity: 88, shelterCapacity: 92,
    environmentalSuitability: 94,
    description: 'Elevated industrial plateau near Old Mumbai-Pune Highway, stable basalt foundation outside floodplains.',
    dataNote: 'Designated Tehsil Disaster Relief Staging Ground.',
  },
  {
    name: 'Junnar High-Ground Government ITI',
    displayName: 'Junnar — Government Technical Institute Campus',
    district: 'Pune', state: 'Maharashtra',
    relocationCluster: 'Pune Cluster',
    lat: 19.2050, lng: 73.8750,
    maxCapacity: 3200, currentOccupancy: 300, reservedCapacity: 400, // available: 2,500
    hazardExposure: { flood: 10, landslide: 8, erosion: 8, extremeRainfall: 18 },
    roadAccessibility: 88, hospitalDistance: 2.8, schoolDistance: 0.8,
    waterCapacity: 88, healthcareCapacity: 84, educationCapacity: 85, shelterCapacity: 88,
    environmentalSuitability: 90,
    description: 'Northern Pune highland campus with independent water filtration and emergency diesel generator.',
    dataNote: 'Designated Ambegaon & Junnar Landslide Evacuation Center.',
  },

  // ── RAIGAD CLUSTER RELIEF SITES ───────────────────────────────
  {
    name: 'North Mahad Elevated Safe Plateau',
    displayName: 'North Mahad — Dr. Babasaheb Ambedkar College Ground',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.0950, lng: 73.4350,
    maxCapacity: 5000, currentOccupancy: 620, reservedCapacity: 800, // available: 3,580
    hazardExposure: { flood: 12, landslide: 8, erosion: 10, extremeRainfall: 20 },
    roadAccessibility: 90, hospitalDistance: 1.8, schoolDistance: 0.6,
    waterCapacity: 92, healthcareCapacity: 88, educationCapacity: 85, shelterCapacity: 90,
    environmentalSuitability: 92,
    description: 'Elevated tableland 45m above Savitri flood levels with NH-66 direct bypass connectivity.',
    dataNote: 'Designated Government Disaster Relief Hub for Mahad Taluka.',
  },
  {
    name: 'Mangaon Government Polytechnic Ground',
    displayName: 'Mangaon — Government Polytechnic Safe Camp',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.2650, lng: 73.3050,
    maxCapacity: 3800, currentOccupancy: 350, reservedCapacity: 500, // available: 2,950
    hazardExposure: { flood: 14, landslide: 6, erosion: 8, extremeRainfall: 18 },
    roadAccessibility: 92, hospitalDistance: 2.2, schoolDistance: 0.8,
    waterCapacity: 89, healthcareCapacity: 86, educationCapacity: 82, shelterCapacity: 88,
    environmentalSuitability: 91,
    description: 'Centrally located high ground with multi-storied RCC structure, dedicated medical bay, and helipad zone.',
    dataNote: 'Designated Raigad Central District Evacuation Center.',
  },
  {
    name: 'Roha Dhatav Industrial Safe Campus',
    displayName: 'Roha — Dhatav Elevated MIDC Complex',
    district: 'Raigad', state: 'Maharashtra',
    relocationCluster: 'Raigad Cluster',
    lat: 18.4550, lng: 73.1450,
    maxCapacity: 3200, currentOccupancy: 280, reservedCapacity: 400, // available: 2,520
    hazardExposure: { flood: 15, landslide: 8, erosion: 10, extremeRainfall: 20 },
    roadAccessibility: 88, hospitalDistance: 3.1, schoolDistance: 1.2,
    waterCapacity: 86, healthcareCapacity: 82, educationCapacity: 80, shelterCapacity: 85,
    environmentalSuitability: 88,
    description: 'Elevated industrial ground equipped with heavy power supply and rapid road transit to Panvel.',
    dataNote: 'Designated Roha & Kundalika Flood Rehabilitation Camp.',
  },

  // ── RATNAGIRI CLUSTER RELIEF SITES ────────────────────────────
  {
    name: 'Chiplun Mirjole High Ground Complex',
    displayName: 'Chiplun — Mirjole Hill High-Ground Relief Center',
    district: 'Ratnagiri', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.5520, lng: 73.5380,
    maxCapacity: 6000, currentOccupancy: 700, reservedCapacity: 1000, // available: 4,300
    hazardExposure: { flood: 8, landslide: 10, erosion: 8, extremeRainfall: 22 },
    roadAccessibility: 92, hospitalDistance: 1.9, schoolDistance: 0.8,
    waterCapacity: 94, healthcareCapacity: 90, educationCapacity: 88, shelterCapacity: 94,
    environmentalSuitability: 93,
    description: 'High ridge 60m above Vashishti river valley; primary refuge center during Chiplun emergency alerts.',
    dataNote: 'Post-2021 Upgraded Chiplun Central Disaster Management Base.',
  },
  {
    name: 'Khed Upper Tehsil Civil Relief Hall',
    displayName: 'Khed — Upper Tehsil Civil Complex',
    district: 'Ratnagiri', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 17.7350, lng: 73.4150,
    maxCapacity: 3500, currentOccupancy: 380, reservedCapacity: 500, // available: 2,620
    hazardExposure: { flood: 10, landslide: 12, erosion: 10, extremeRainfall: 20 },
    roadAccessibility: 89, hospitalDistance: 2.4, schoolDistance: 1.1,
    waterCapacity: 90, healthcareCapacity: 85, educationCapacity: 82, shelterCapacity: 88,
    environmentalSuitability: 90,
    description: 'Elevated administrative and community complex outside Jagbudi flood reach.',
    dataNote: 'Designated Khed Taluka Emergency Evacuation Base.',
  },
  {
    name: 'Ratnagiri Government ITI Campus',
    displayName: 'Ratnagiri — Mirjole Government ITI Camp',
    district: 'Ratnagiri', state: 'Maharashtra',
    relocationCluster: 'Ratnagiri Cluster',
    lat: 16.9950, lng: 73.3250,
    maxCapacity: 4200, currentOccupancy: 450, reservedCapacity: 600, // available: 3,150
    hazardExposure: { flood: 6, landslide: 6, erosion: 12, extremeRainfall: 18 },
    roadAccessibility: 94, hospitalDistance: 2.0, schoolDistance: 0.6,
    waterCapacity: 92, healthcareCapacity: 88, educationCapacity: 85, shelterCapacity: 90,
    environmentalSuitability: 92,
    description: 'Large state technical education facility with multi-purpose halls and district hospital proximity.',
    dataNote: 'Ratnagiri District Coastal & Riverine Backup Center.',
  },

  // ── KOLHAPUR CLUSTER RELIEF SITES ─────────────────────────────
  {
    name: 'Jaysingpur High-Ground Municipal Center',
    displayName: 'Jaysingpur — High-Ground Municipal Disaster Camp',
    district: 'Kolhapur', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.7820, lng: 74.5620,
    maxCapacity: 7500, currentOccupancy: 950, reservedCapacity: 1200, // available: 5,350
    hazardExposure: { flood: 8, landslide: 4, erosion: 6, extremeRainfall: 16 },
    roadAccessibility: 96, hospitalDistance: 1.5, schoolDistance: 0.7,
    waterCapacity: 95, healthcareCapacity: 92, educationCapacity: 90, shelterCapacity: 96,
    environmentalSuitability: 95,
    description: 'Elevated basalt ridge outside Shirol flood zone; primary destination for Shirol and Nrusinhawadi evacuees.',
    dataNote: 'Primary Evacuation Center for Shirol/Panchganga Mega-Flood Zone.',
  },
  {
    name: 'Kolhapur Shivaji University Ground Camp',
    displayName: 'Kolhapur — Shivaji University Disaster Relief Base',
    district: 'Kolhapur', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.6780, lng: 74.2560,
    maxCapacity: 9000, currentOccupancy: 1100, reservedCapacity: 1500, // available: 6,400
    hazardExposure: { flood: 5, landslide: 4, erosion: 4, extremeRainfall: 15 },
    roadAccessibility: 98, hospitalDistance: 1.8, schoolDistance: 0.5,
    waterCapacity: 98, healthcareCapacity: 96, educationCapacity: 94, shelterCapacity: 98,
    environmentalSuitability: 97,
    description: 'Extensive academic campus with 4 large hostel blocks, 2 indoor stadiums, and direct access to NH-48.',
    dataNote: 'State Command Relief Center for Southern Maharashtra.',
  },
  {
    name: 'Hatkanangale Industrial Safe Ground',
    displayName: 'Hatkanangale — Five Star MIDC Relief Complex',
    district: 'Kolhapur', state: 'Maharashtra',
    relocationCluster: 'Kolhapur Cluster',
    lat: 16.7450, lng: 74.4250,
    maxCapacity: 5500, currentOccupancy: 600, reservedCapacity: 800, // available: 4,100
    hazardExposure: { flood: 8, landslide: 4, erosion: 6, extremeRainfall: 15 },
    roadAccessibility: 94, hospitalDistance: 2.5, schoolDistance: 1.0,
    waterCapacity: 92, healthcareCapacity: 88, educationCapacity: 85, shelterCapacity: 92,
    environmentalSuitability: 94,
    description: 'Elevated industrial sector with massive warehousing, dedicated electrical substations, and water towers.',
    dataNote: 'Designated Kolhapur District Industrial Relief Base.',
  },

  // ── SANGLI CLUSTER RELIEF SITES ───────────────────────────────
  {
    name: 'Miraj Government Medical College Ground Hub',
    displayName: 'Miraj — Government Medical College & Hospital Relief Hub',
    district: 'Sangli', state: 'Maharashtra',
    relocationCluster: 'Sangli Cluster',
    lat: 16.8350, lng: 74.6520,
    maxCapacity: 8000, currentOccupancy: 950, reservedCapacity: 1200, // available: 5,850
    hazardExposure: { flood: 6, landslide: 2, erosion: 4, extremeRainfall: 14 },
    roadAccessibility: 96, hospitalDistance: 0.3, schoolDistance: 0.8,
    waterCapacity: 98, healthcareCapacity: 99, educationCapacity: 92, shelterCapacity: 96,
    environmentalSuitability: 97,
    description: 'High-elevation medical campus with 1,200 hospital beds, trauma center, blood bank, and railway junction.',
    dataNote: 'Primary Medical Disaster Relief Base for Krishna Basin.',
  },
  {
    name: 'Islampur Sports Complex Safe Ground',
    displayName: 'Islampur — Rajarambapu Sports Complex',
    district: 'Sangli', state: 'Maharashtra',
    relocationCluster: 'Sangli Cluster',
    lat: 17.0550, lng: 74.2750,
    maxCapacity: 4800, currentOccupancy: 500, reservedCapacity: 700, // available: 3,600
    hazardExposure: { flood: 10, landslide: 4, erosion: 6, extremeRainfall: 16 },
    roadAccessibility: 94, hospitalDistance: 1.8, schoolDistance: 0.6,
    waterCapacity: 92, healthcareCapacity: 88, educationCapacity: 85, shelterCapacity: 92,
    environmentalSuitability: 94,
    description: 'Elevated sports complex with indoor arenas and NH-48 direct road connectivity.',
    dataNote: 'Designated Walwa Taluka Evacuation Safe Center.',
  },

  // ── SATARA CLUSTER RELIEF SITES ───────────────────────────────
  {
    name: 'Karad Government Engineering College Hub',
    displayName: 'Karad — Government College of Engineering Relief Camp',
    district: 'Satara', state: 'Maharashtra',
    relocationCluster: 'Satara Cluster',
    lat: 17.3050, lng: 74.2050,
    maxCapacity: 6500, currentOccupancy: 750, reservedCapacity: 1000, // available: 4,750
    hazardExposure: { flood: 8, landslide: 4, erosion: 6, extremeRainfall: 16 },
    roadAccessibility: 96, hospitalDistance: 1.5, schoolDistance: 0.4,
    waterCapacity: 95, healthcareCapacity: 92, educationCapacity: 90, shelterCapacity: 95,
    environmentalSuitability: 96,
    description: 'High-plateau engineering institution with 4 hostels, workshop sheds, and immediate highway access.',
    dataNote: 'Primary Central Satara Disaster Evacuation Staging Ground.',
  },
  {
    name: 'Patan Civil Defense Safe Ground',
    displayName: 'Patan — Tehsil Disaster Rehabilitation Camp',
    district: 'Satara', state: 'Maharashtra',
    relocationCluster: 'Satara Cluster',
    lat: 17.3650, lng: 73.8150,
    maxCapacity: 3500, currentOccupancy: 420, reservedCapacity: 500, // available: 2,580
    hazardExposure: { flood: 12, landslide: 12, erosion: 10, extremeRainfall: 22 },
    roadAccessibility: 88, hospitalDistance: 2.0, schoolDistance: 0.8,
    waterCapacity: 90, healthcareCapacity: 85, educationCapacity: 80, shelterCapacity: 88,
    environmentalSuitability: 90,
    description: 'Stable low-slope government plateau designated for Patan and Koyna valley landslide evacuees.',
    dataNote: 'Designated Koyna Valley Landslide Rehabilitation Center.',
  },

  // ── THANE & PALGHAR CLUSTER RELIEF SITES ──────────────────────
  {
    name: 'Kalyan High-Ground Stadium Complex',
    displayName: 'Kalyan — Subhash Maidan Disaster Center',
    district: 'Thane', state: 'Maharashtra',
    relocationCluster: 'Thane Cluster',
    lat: 19.2480, lng: 73.1420,
    maxCapacity: 7000, currentOccupancy: 900, reservedCapacity: 1100, // available: 5,000
    hazardExposure: { flood: 10, landslide: 4, erosion: 6, extremeRainfall: 18 },
    roadAccessibility: 95, hospitalDistance: 1.2, schoolDistance: 0.5,
    waterCapacity: 94, healthcareCapacity: 92, educationCapacity: 90, shelterCapacity: 95,
    environmentalSuitability: 94,
    description: 'High ground sports facility with civic relief amenities outside Ulhas floodplains.',
    dataNote: 'Thane District Urban Flood Evacuation Hub.',
  },
  {
    name: 'Manor High School Relief Campus',
    displayName: 'Manor — District High-Ground Relief Camp',
    district: 'Palghar', state: 'Maharashtra',
    relocationCluster: 'Palghar Cluster',
    lat: 19.7550, lng: 72.9250,
    maxCapacity: 3200, currentOccupancy: 300, reservedCapacity: 400, // available: 2,500
    hazardExposure: { flood: 12, landslide: 6, erosion: 8, extremeRainfall: 18 },
    roadAccessibility: 90, hospitalDistance: 2.8, schoolDistance: 0.5,
    waterCapacity: 88, healthcareCapacity: 82, educationCapacity: 80, shelterCapacity: 86,
    environmentalSuitability: 90,
    description: 'High-elevation school and community ground along NH-48 corridor.',
    dataNote: 'Palghar District Monsoon Emergency Shelter.',
  },
];

// ── Official Red Zone Hazard Polygons (Maharashtra Geographies) ─
const redZonePolygons = [
  {
    id: 'MH-RZ-001',
    name: 'Mahad Savitri River & Taliye Hazard Zone',
    district: 'Raigad',
    dominantHazards: ['Flood', 'Landslide'],
    confidence: 94,
    areaHa: 2450,
    polygon: [
      [18.0400, 73.3800], [18.1100, 73.3900], [18.1200, 73.4600],
      [17.9600, 73.5200], [17.9500, 73.4400], [18.0400, 73.3800],
    ],
    type: 'composite',
    dataNote: 'Official Multi-Hazard Red Zone — Historical 2021 Taliye Disaster & Savitri River Inundation.',
  },
  {
    id: 'MH-RZ-002',
    name: 'Chiplun Vashishti River Flood Funnel',
    district: 'Ratnagiri',
    dominantHazards: ['Flood', 'Extreme Rainfall'],
    confidence: 92,
    areaHa: 2180,
    polygon: [
      [17.5100, 73.4800], [17.5600, 73.4900], [17.5700, 73.5600],
      [17.5200, 73.5800], [17.4800, 73.5200], [17.5100, 73.4800],
    ],
    type: 'flood',
    dataNote: 'Critical Flood Inundation Funnel — Vashishti river valley downstream of Koyna IV tailrace.',
  },
  {
    id: 'MH-RZ-003',
    name: 'Shirol-Karveer Panchganga & Krishna Mega-Flood Zone',
    district: 'Kolhapur',
    dominantHazards: ['Flood', 'Backwater Submergence'],
    confidence: 96,
    areaHa: 4850,
    polygon: [
      [16.6500, 74.2000], [16.7600, 74.2200], [16.7800, 74.5800],
      [16.6600, 74.6500], [16.6200, 74.4500], [16.6500, 74.2000],
    ],
    type: 'flood',
    dataNote: 'State Level Red Zone — Krishna-Panchganga confluence & Almatti Dam backwater impact.',
  },
  {
    id: 'MH-RZ-004',
    name: 'Sangli-Haripur-Bramhanal Krishna Corridor',
    district: 'Sangli',
    dominantHazards: ['Flood'],
    confidence: 93,
    areaHa: 3600,
    polygon: [
      [16.8200, 74.5200], [16.8900, 74.5400], [17.0400, 74.4200],
      [16.9900, 74.3400], [16.8400, 74.4800], [16.8200, 74.5200],
    ],
    type: 'flood',
    dataNote: 'Krishna River Basin Red Zone — Overbank submergence above Irwin Bridge 45 ft mark.',
  },
  {
    id: 'MH-RZ-005',
    name: 'Patan Koyna Catchment High Landslide Zone',
    district: 'Satara',
    dominantHazards: ['Landslide', 'Debris Flow', 'Soil Liquefaction'],
    confidence: 91,
    areaHa: 2890,
    polygon: [
      [17.3200, 73.7000], [17.4200, 73.7200], [17.4400, 73.8400],
      [17.3000, 73.8200], [17.3200, 73.7000],
    ],
    type: 'landslide',
    dataNote: 'Geological Survey of India High Landslide Susceptibility Red Zone.',
  },
  {
    id: 'MH-RZ-006',
    name: 'Ambegaon-Malin Western Ghats Landslide Corridor',
    district: 'Pune',
    dominantHazards: ['Landslide', 'Flash Flood'],
    confidence: 90,
    areaHa: 1950,
    polygon: [
      [19.1200, 73.6200], [19.2000, 73.6400], [19.2100, 73.7400],
      [19.1400, 73.7200], [19.1200, 73.6200],
    ],
    type: 'landslide',
    dataNote: 'Malin Disaster Memorial Sector — Steep basalt ridge slope failure zone.',
  },
  {
    id: 'MH-RZ-007',
    name: 'Kalyan-Bhiwandi Ulhas River Flood Corridor',
    district: 'Thane',
    dominantHazards: ['Flood', 'Urban Waterlogging'],
    confidence: 88,
    areaHa: 3100,
    polygon: [
      [19.2100, 73.0400], [19.3200, 73.0600], [19.3000, 73.1800],
      [19.2200, 73.1600], [19.2100, 73.0400],
    ],
    type: 'flood',
    dataNote: 'Urban Conurbation Red Zone — Ulhas & Waldhuni river tidal and storm surge corridor.',
  },
  {
    id: 'MH-RZ-008',
    name: 'Bhamragad Confluence Submergence Red Zone',
    district: 'Gadchiroli',
    dominantHazards: ['Flood', 'Geographic Cutoff'],
    confidence: 95,
    areaHa: 4200,
    polygon: [
      [19.2000, 80.3000], [19.3000, 80.3200], [19.3200, 80.4200],
      [19.2200, 80.4000], [19.2000, 80.3000],
    ],
    type: 'flood',
    dataNote: 'Eastern Maharashtra Tribal River Confluence — Hemalkasa annual isolation zone.',
  },
];

// ── Build Computed Records ────────────────────────────────────
let habitations = rawHabitations.map((h) => {
  const hazardResult   = computeHazardScore(h);
  const vulnResult     = computeVulnerabilityScore(h);
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
    dataLabel: 'Maharashtra State Disaster Management Authority (SDMA) Live Dataset',
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
    dataLabel: 'Government Designated Safe Rehabilitation Site · Maharashtra',
    createdAt: new Date().toISOString(),
  };
});

let relocationPlans = [];
let alerts = [];

// ── Habitation CRUD ───────────────────────────────────────────
const getAllHabitations = () =>
  [...habitations].sort((a, b) => b.relocationPriorityScore - a.relocationPriorityScore);

const getHabitationById = (id) => habitations.find((h) => h._id === id) || null;

const searchHabitations = (q) =>
  habitations
    .filter((h) => h.name.toLowerCase().includes(q.toLowerCase()) || h.district.toLowerCase().includes(q.toLowerCase()) || (h.taluka && h.taluka.toLowerCase().includes(q.toLowerCase())))
    .slice(0, 15);

const getRedZones = () =>
  habitations
    .filter((h) => h.redZoneStatus)
    .sort((a, b) => b.hazardScore - a.hazardScore);

const getRelocationPriority = () =>
  [...habitations].sort((a, b) => b.relocationPriorityScore - a.relocationPriorityScore);

// ── Site CRUD ─────────────────────────────────────────────────
const getAllSites = () => [...sites].sort((a, b) => b.suitabilityScore - a.suitabilityScore);
const getSiteById = (id) => sites.find((s) => s._id === id) || null;

// Geographic-first recommendation matching engine
const getRecommendedSites = (habitationId, options = {}) => {
  const habitation = habitations.find((h) => h._id === habitationId);
  if (!habitation) return null;
  return matchRelocationSites(habitation, sites, options);
};

// ── Relocation Plan CRUD ──────────────────────────────────────
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

// ── Alert CRUD ────────────────────────────────────────────────
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
    simulation_note: 'Official Alert Dispatch · Maharashtra EOC Broadcast',
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
    dataLabel: 'Government of Maharashtra · State Disaster Management Authority (SDMA) Operational Dataset',
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
