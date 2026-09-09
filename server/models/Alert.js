const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    village_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Village', required: true },
    village_name: { type: String, required: true },
    risk_score: { type: Number, required: true },
    risk_category: { type: String, required: true },
    target_agency: { type: String, required: true },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ['info', 'warning', 'high', 'critical'],
      default: 'info',
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
    },
    acknowledged_by: { type: String, default: null },
    acknowledged_at: { type: Date, default: null },
    // All alerts are simulated inside the prototype — no real messages sent
    simulation_note: {
      type: String,
      default: 'SIMULATION ONLY — No real SMS/WhatsApp/calls sent',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', AlertSchema);
