// ============================================================
// Aegis Enterprise Live Weather Engine
// Fetches real-time precipitation data from Open-Meteo API
// ============================================================
const db = require('../store/db');

/**
 * Fetches live weather for all habitations and updates the DB.
 */
async function syncLiveWeather() {
  console.log('[Aegis-Weather] Synchronizing live Open-Meteo satellite data...');
  const habitations = db.getAllHabitations();
  
  if (!habitations || habitations.length === 0) return;

  // We batch requests to avoid overwhelming the API, or just do a single loop with delay
  for (const hab of habitations) {
    try {
      // Fetch past 24h precipitation from Open-Meteo
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${hab.lat}&longitude=${hab.lng}&daily=precipitation_sum&timezone=Asia%2FKolkata&past_days=1&forecast_days=1`;
      
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      
      // Data format: { daily: { time: [...], precipitation_sum: [past24h, today] } }
      const past24hRainfall = data.daily?.precipitation_sum?.[0] || 0;
      
      // Update habitation in database
      if (!hab.liveWeather) hab.liveWeather = {};
      hab.liveWeather.rainfall24h = past24hRainfall;
      
      // Dynamically adjust river levels based on rainfall anomaly (mock correlation)
      // If it rained more than 50mm, river level spikes by 1m per 50mm
      const baseRiver = (hab.hazardExposure?.flood / 12) || 0;
      hab.liveWeather.riverLevel = baseRiver + (past24hRainfall / 50);

    } catch (err) {
      console.error(`[Aegis-Weather] Failed to fetch weather for ${hab.name}: ${err.message}`);
    }
  }
  console.log('[Aegis-Weather] Live weather synchronization complete.');
}

module.exports = { syncLiveWeather };
