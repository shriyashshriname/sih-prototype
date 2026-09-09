const mongoose = require('mongoose');

const VillageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, default: 'Narmadanagar' },
    state: { type: String, default: 'Madhya Pradesh' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    population: { type: Number, required: true },

    // Environmental / sensor readings (synthetic demo data)
    rainfall: { type: Number, default: 0 },          // mm/24h
    river_level: { type: Number, default: 0 },       // metres above normal
    elevation: { type: Number, default: 100 },       // metres ASL
    historical_flood_incidents: { type: Number, default: 0 },
    slope: { type: Number, default: 5 },             // degrees
    soil_saturation: { type: Number, default: 50 },  // %

    // Infrastructure
    hospital_count: { type: Number, default: 0 },
    school_count: { type: Number, default: 0 },
    shelter_name: { type: String, default: '' },
    shelter_capacity: { type: Number, default: 0 },
    shelter_lat: { type: Number },
    shelter_lng: { type: Number },

    // Computed by risk engine (stored for fast retrieval)
    risk_score: { type: Number, default: 0 },
    risk_category: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Very High'],
      default: 'Low',
    },

    // Data provenance label — always shown in UI
    data_label: {
      type: String,
      default: '⚠️ SYNTHETIC/DEMO DATA — Not live government data',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Village', VillageSchema);
