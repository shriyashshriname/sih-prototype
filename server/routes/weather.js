// ============================================================
// Aegis Weather Routes — Mock Maharashtra Weather Data
// ⚠️  ALL DATA IS SYNTHETIC/MOCK — Not real IMD data
// ============================================================

const express = require('express');
const router = express.Router();

/**
 * Mock weather profiles for all major Maharashtra districts.
 * Values represent monsoon-season (June–September) conditions
 * typical of Western Ghats / Deccan Plateau geography.
 * Refreshed each request with slight random variation to simulate live data.
 */
const DISTRICT_WEATHER_BASE = {
  Pune: {
    district: 'Pune',
    region: 'Western Maharashtra',
    station: 'Pune IMD Station',
    lat: 18.5204,
    lon: 73.8567,
    rainfall24h: 45,          // mm
    rainfall7day: 312,         // mm
    riverLevel: 'Normal',
    riverLevelM: 2.1,
    riverDangerLevelM: 7.5,
    humidity: 82,              // %
    temperature: 24,           // °C
    windSpeedKmh: 18,
    windDirection: 'SW',
    visibility: 'Moderate',
    alerts: [],
    floodRisk: 'Low',
    landslideRisk: 'Moderate',
    weatherCondition: 'Partly Cloudy with Rain',
    forecast24h: 'Moderate rain expected in Ghats sub-divisions',
  },
  Nashik: {
    district: 'Nashik',
    region: 'North Maharashtra',
    station: 'Nashik IMD Station',
    lat: 19.9975,
    lon: 73.7898,
    rainfall24h: 28,
    rainfall7day: 198,
    riverLevel: 'Normal',
    riverLevelM: 1.8,
    riverDangerLevelM: 6.0,
    humidity: 74,
    temperature: 26,
    windSpeedKmh: 14,
    windDirection: 'W',
    visibility: 'Good',
    alerts: [],
    floodRisk: 'Low',
    landslideRisk: 'Low',
    weatherCondition: 'Overcast',
    forecast24h: 'Light to moderate rain expected',
  },
  Kolhapur: {
    district: 'Kolhapur',
    region: 'Southern Maharashtra',
    station: 'Kolhapur IMD Station',
    lat: 16.7050,
    lon: 74.2433,
    rainfall24h: 112,
    rainfall7day: 628,
    riverLevel: 'Above Normal',
    riverLevelM: 6.2,
    riverDangerLevelM: 7.8,
    humidity: 91,
    temperature: 22,
    windSpeedKmh: 22,
    windDirection: 'SW',
    visibility: 'Poor',
    alerts: ['Heavy Rainfall Warning', 'Panchganga River Advisory'],
    floodRisk: 'High',
    landslideRisk: 'Moderate',
    weatherCondition: 'Heavy Rain',
    forecast24h: 'Extremely heavy rainfall likely in next 24 hours',
  },
  Sangli: {
    district: 'Sangli',
    region: 'Southern Maharashtra',
    station: 'Sangli IMD Station',
    lat: 16.8524,
    lon: 74.5815,
    rainfall24h: 88,
    rainfall7day: 518,
    riverLevel: 'High',
    riverLevelM: 5.4,
    riverDangerLevelM: 6.5,
    humidity: 88,
    temperature: 23,
    windSpeedKmh: 20,
    windDirection: 'SW',
    visibility: 'Poor',
    alerts: ['Flood Watch — Krishna River'],
    floodRisk: 'High',
    landslideRisk: 'Low',
    weatherCondition: 'Heavy Rain',
    forecast24h: 'Heavy to very heavy rain likely, river levels rising',
  },
  Satara: {
    district: 'Satara',
    region: 'Western Maharashtra',
    station: 'Satara IMD Station',
    lat: 17.6805,
    lon: 73.9921,
    rainfall24h: 68,
    rainfall7day: 445,
    riverLevel: 'Normal',
    riverLevelM: 3.2,
    riverDangerLevelM: 8.0,
    humidity: 86,
    temperature: 23,
    windSpeedKmh: 16,
    windDirection: 'SW',
    visibility: 'Moderate',
    alerts: [],
    floodRisk: 'Moderate',
    landslideRisk: 'Moderate',
    weatherCondition: 'Rain',
    forecast24h: 'Moderate to heavy rain in Ghats areas',
  },
  Raigad: {
    district: 'Raigad',
    region: 'Konkan',
    station: 'Mahad IMD Station',
    lat: 18.0520,
    lon: 73.4176,
    rainfall24h: 142,
    rainfall7day: 892,
    riverLevel: 'Very High',
    riverLevelM: 8.4,
    riverDangerLevelM: 9.0,
    humidity: 94,
    temperature: 24,
    windSpeedKmh: 28,
    windDirection: 'W',
    visibility: 'Very Poor',
    alerts: ['Red Alert — Extreme Rainfall', 'Landslide Warning — Western Ghats', 'Savitri/Kal River Flood Warning'],
    floodRisk: 'Extreme',
    landslideRisk: 'High',
    weatherCondition: 'Extremely Heavy Rain',
    forecast24h: 'Red alert — do not venture out. Landslide and flash flood risk active.',
  },
  Ratnagiri: {
    district: 'Ratnagiri',
    region: 'Konkan',
    station: 'Ratnagiri IMD Station',
    lat: 16.9902,
    lon: 73.3120,
    rainfall24h: 98,
    rainfall7day: 658,
    riverLevel: 'Above Normal',
    riverLevelM: 5.8,
    riverDangerLevelM: 8.2,
    humidity: 92,
    temperature: 26,
    windSpeedKmh: 24,
    windDirection: 'SW',
    visibility: 'Poor',
    alerts: ['Heavy Rainfall Warning', 'Vashishti River Advisory'],
    floodRisk: 'High',
    landslideRisk: 'Moderate',
    weatherCondition: 'Heavy Rain',
    forecast24h: 'Very heavy rain likely. Vashishti river level rising.',
  },
  Sindhudurg: {
    district: 'Sindhudurg',
    region: 'Konkan',
    station: 'Sawantwadi IMD Station',
    lat: 15.9082,
    lon: 73.8178,
    rainfall24h: 72,
    rainfall7day: 528,
    riverLevel: 'Normal',
    riverLevelM: 2.8,
    riverDangerLevelM: 6.5,
    humidity: 89,
    temperature: 27,
    windSpeedKmh: 19,
    windDirection: 'SW',
    visibility: 'Moderate',
    alerts: [],
    floodRisk: 'Moderate',
    landslideRisk: 'Low',
    weatherCondition: 'Rain',
    forecast24h: 'Moderate to heavy coastal rainfall',
  },
  Thane: {
    district: 'Thane',
    region: 'Konkan',
    station: 'Thane IMD Station',
    lat: 19.2183,
    lon: 72.9781,
    rainfall24h: 58,
    rainfall7day: 388,
    riverLevel: 'Normal',
    riverLevelM: 1.9,
    riverDangerLevelM: 5.5,
    humidity: 84,
    temperature: 28,
    windSpeedKmh: 15,
    windDirection: 'SW',
    visibility: 'Moderate',
    alerts: [],
    floodRisk: 'Low',
    landslideRisk: 'Low',
    weatherCondition: 'Cloudy with Rain',
    forecast24h: 'Light to moderate rain expected',
  },
  Mumbai: {
    district: 'Mumbai',
    region: 'Konkan',
    station: 'Colaba IMD Observatory',
    lat: 18.9550,
    lon: 72.8235,
    rainfall24h: 65,
    rainfall7day: 412,
    riverLevel: 'N/A',
    riverLevelM: null,
    riverDangerLevelM: null,
    humidity: 85,
    temperature: 29,
    windSpeedKmh: 22,
    windDirection: 'SW',
    visibility: 'Moderate',
    alerts: [],
    floodRisk: 'Low',
    landslideRisk: 'Low',
    weatherCondition: 'Cloudy with Rain',
    forecast24h: 'Moderate rain, possible waterlogging in low-lying areas',
  },
  Aurangabad: {
    district: 'Aurangabad',
    region: 'Marathwada',
    station: 'Aurangabad IMD Station',
    lat: 19.8762,
    lon: 75.3433,
    rainfall24h: 18,
    rainfall7day: 112,
    riverLevel: 'Normal',
    riverLevelM: 0.8,
    riverDangerLevelM: 4.0,
    humidity: 62,
    temperature: 32,
    windSpeedKmh: 10,
    windDirection: 'E',
    visibility: 'Good',
    alerts: [],
    floodRisk: 'Low',
    landslideRisk: 'Low',
    weatherCondition: 'Partly Cloudy',
    forecast24h: 'Light rain possible in evening',
  },
  Ahmednagar: {
    district: 'Ahmednagar',
    region: 'Western Maharashtra',
    station: 'Ahmednagar IMD Station',
    lat: 19.0960,
    lon: 74.7496,
    rainfall24h: 22,
    rainfall7day: 148,
    riverLevel: 'Normal',
    riverLevelM: 1.1,
    riverDangerLevelM: 5.0,
    humidity: 68,
    temperature: 29,
    windSpeedKmh: 12,
    windDirection: 'W',
    visibility: 'Good',
    alerts: [],
    floodRisk: 'Low',
    landslideRisk: 'Low',
    weatherCondition: 'Overcast',
    forecast24h: 'Scattered showers expected',
  },
  Solapur: {
    district: 'Solapur',
    region: 'Eastern Maharashtra',
    station: 'Solapur IMD Station',
    lat: 17.6762,
    lon: 75.9060,
    rainfall24h: 12,
    rainfall7day: 78,
    riverLevel: 'Normal',
    riverLevelM: 0.6,
    riverDangerLevelM: 4.5,
    humidity: 55,
    temperature: 34,
    windSpeedKmh: 9,
    windDirection: 'E',
    visibility: 'Good',
    alerts: [],
    floodRisk: 'Low',
    landslideRisk: 'Low',
    weatherCondition: 'Sunny with Clouds',
    forecast24h: 'No significant rain expected',
  },
  Nagpur: {
    district: 'Nagpur',
    region: 'Vidarbha',
    station: 'Nagpur IMD Station',
    lat: 21.1458,
    lon: 79.0882,
    rainfall24h: 32,
    rainfall7day: 224,
    riverLevel: 'Normal',
    riverLevelM: 1.4,
    riverDangerLevelM: 5.5,
    humidity: 76,
    temperature: 30,
    windSpeedKmh: 13,
    windDirection: 'SE',
    visibility: 'Good',
    alerts: [],
    floodRisk: 'Low',
    landslideRisk: 'Low',
    weatherCondition: 'Cloudy with Showers',
    forecast24h: 'Moderate rain expected in Vidarbha',
  },
};

/**
 * Adds slight random variation to numeric values to simulate live data refresh.
 * ±10% variation on rainfall, ±2% on humidity/temp.
 */
function liveVariation(base) {
  const jitter = (val, pct) => {
    if (typeof val !== 'number') return val;
    const delta = val * (pct / 100) * (Math.random() * 2 - 1);
    return parseFloat((val + delta).toFixed(1));
  };

  return {
    ...base,
    rainfall24h: Math.max(0, jitter(base.rainfall24h, 10)),
    rainfall7day: Math.max(0, jitter(base.rainfall7day, 5)),
    humidity: Math.min(100, Math.max(30, jitter(base.humidity, 2))),
    temperature: jitter(base.temperature, 2),
    windSpeedKmh: Math.max(0, jitter(base.windSpeedKmh, 8)),
    riverLevelM: base.riverLevelM ? Math.max(0, jitter(base.riverLevelM, 5)) : null,
    observedAt: new Date().toISOString(),
    dataNote: 'SYNTHETIC MOCK DATA — Not real IMD data. For demonstration only.',
  };
}

/**
 * GET /api/weather
 * Returns mock weather data for all Maharashtra districts.
 */
router.get('/', (_req, res) => {
  const districts = Object.values(DISTRICT_WEATHER_BASE).map(liveVariation);

  // Summary stats
  const redAlertCount = districts.filter(d => d.floodRisk === 'Extreme' || d.alerts.some(a => a.includes('Red'))).length;
  const highRiskCount = districts.filter(d => d.floodRisk === 'High').length;
  const avgRainfall = parseFloat(
    (districts.reduce((s, d) => s + d.rainfall24h, 0) / districts.length).toFixed(1)
  );

  res.json({
    success: true,
    count: districts.length,
    summary: {
      redAlertDistricts: redAlertCount,
      highRiskDistricts: highRiskCount,
      avgRainfall24h: avgRainfall,
      lastUpdated: new Date().toISOString(),
    },
    data: districts,
  });
});

/**
 * GET /api/weather/:district
 * Returns weather for a specific district (case-insensitive).
 */
router.get('/:district', (req, res) => {
  const key = Object.keys(DISTRICT_WEATHER_BASE).find(
    (k) => k.toLowerCase() === req.params.district.toLowerCase()
  );

  if (!key) {
    return res.status(404).json({
      success: false,
      message: `Weather data not found for district: "${req.params.district}"`,
      availableDistricts: Object.keys(DISTRICT_WEATHER_BASE),
    });
  }

  const weather = liveVariation(DISTRICT_WEATHER_BASE[key]);

  res.json({
    success: true,
    data: weather,
  });
});

module.exports = router;
