require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routes
const habitationRoutes  = require('./routes/habitations');
const redZoneRoutes     = require('./routes/redZones');
const relocationSiteRoutes = require('./routes/relocationSites');
const relocationRoutes  = require('./routes/relocation');
const riskRoutes        = require('./routes/risk');
const alertRoutes       = require('./routes/alerts');
const gisRoutes         = require('./routes/gis');
const weatherRoutes     = require('./routes/weather');
const evacuationRoutes  = require('./routes/evacuation');

// Init in-memory store (auto-loads Maharashtra dataset)
require('./store/db');
const { syncLiveWeather } = require('./utils/weatherEngine');
syncLiveWeather();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ── API Routes ───────────────────────────────────────────────
app.use('/api/habitations', habitationRoutes);
app.use('/api/red-zones',   redZoneRoutes);
app.use('/api/relocation-sites', relocationSiteRoutes);
app.use('/api/relocation',  relocationRoutes);
app.use('/api/risk',        riskRoutes);
app.use('/api/alerts',      alertRoutes);
app.use('/api/gis',         gisRoutes);
app.use('/api/weather',     weatherRoutes);
app.use('/api/evacuation',  evacuationRoutes);

// Legacy compatibility — /api/villages → /api/habitations
app.use('/api/villages', habitationRoutes);

const healthHandler = (_req, res) => {
  res.json({
    status: 'ok', service: 'Aegis API v2',
    geography: 'Maharashtra Demonstration',
    mode: 'in-memory', timestamp: new Date().toISOString(),
    note: 'PROTOTYPE — Connected to Open-Meteo & OSRM Real Data APIs.',
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════════╗');
  console.log('  ║  🚀  AEGIS API v2 — Maharashtra Demo             ║');
  console.log(`  ║  http://localhost:${PORT}                           ║`);
  console.log('  ║  Multi-Hazard Relocation Intelligence Platform   ║');
  console.log('  ║  🌐   REAL DATA ACTIVE — OSRM & Open-Meteo      ║');
  console.log('  ╚══════════════════════════════════════════════════╝');
  console.log('');
});
