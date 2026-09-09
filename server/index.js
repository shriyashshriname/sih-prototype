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

// Init in-memory store (auto-loads Maharashtra dataset)
require('./store/db');

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

// Legacy compatibility — /api/villages → /api/habitations
app.use('/api/villages', habitationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok', service: 'Aegis API v2',
    geography: 'Maharashtra Demonstration',
    mode: 'in-memory', timestamp: new Date().toISOString(),
    note: 'PROTOTYPE — Synthetic demo data. Not for operational decision-making.',
  });
});

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
  console.log('  ║  ⚠️   SYNTHETIC DEMO DATA — Not for operations   ║');
  console.log('  ╚══════════════════════════════════════════════════╝');
  console.log('');
});
