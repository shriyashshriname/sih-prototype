const express = require('express');
const router = express.Router();
const db = require('../store/db');

// GET /api/risk/summary
router.get('/summary', (_req, res) => {
  const s = db.summaryStats();
  res.json({ success: true, data: s });
});

module.exports = router;
