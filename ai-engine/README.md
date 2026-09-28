# Aegis AI Engine — Disaster Decision Intelligence Microservice

> **Project:** Smart India Hackathon 2026 — SIH26191  
> **Component:** AI/ML Risk Prediction Engine  
> **Stack:** Python 3.11 · FastAPI · XGBoost · SHAP · Uvicorn

---

## Overview

This microservice exposes a REST API that accepts real-time environmental
sensor data for an Indian habitation and returns:

- A **risk score** (0–100) and **risk category** (Low / Moderate / High / Critical)
- **SHAP-based explanations** of the top contributing features
- **Human-readable risk factors** and **actionable recommendations**

The model is an **XGBoost multi-class classifier** trained on synthetic
Indian disaster scenario data (flood & landslide events) with domain-rule
labelling.

---

## Directory Structure

```
ai-engine/
├── main.py                  ← FastAPI application (port 8000)
├── model/
│   ├── __init__.py
│   ├── features.py          ← Feature definitions, encodings, thresholds
│   ├── risk_model.py        ← XGBoost model class + SHAP explainer
│   └── train.py             ← Training pipeline
├── data/
│   ├── __init__.py
│   └── training_data.py     ← Synthetic data generator
├── model/saved/             ← Auto-created on first run
│   ├── risk_model.pkl
│   └── model_meta.json
├── requirements.txt
└── README.md
```

---

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the API server

```bash
python main.py
```

The server will:
1. Check for a saved model at `model/saved/risk_model.pkl`
2. **Auto-train** on 625 synthetic records if no model exists (~10–30 seconds)
3. Start Uvicorn on **http://0.0.0.0:8000**

### 3. Interactive API docs

Open **http://localhost:8000/docs** in your browser (Swagger UI).

---

## Re-train the model

```bash
python -m model.train
```

This regenerates the dataset, retrains, evaluates, and overwrites the saved model.

---

## API Endpoints

### `GET /health`
Service health check.

```json
{
  "status": "ok",
  "model_ready": true,
  "model_version": "1.0.0"
}
```

---

### `GET /model-info`
Returns model metadata, training accuracy, and feature importances.

---

### `POST /predict`
Main prediction endpoint.

**Request body:**
```json
{
  "habitation_id": "HAB-KL-001",
  "rainfall_24h": 185.0,
  "river_level_above_normal": 3.8,
  "elevation_asl": 45.0,
  "slope_degrees": 12.0,
  "soil_saturation_pct": 78.0,
  "historical_flood_events": 6,
  "historical_landslide_events": 1,
  "population_density": 4200.0,
  "distance_to_river_km": 0.6,
  "land_cover_type": "Settlement"
}
```

**Response:**
```json
{
  "habitation_id": "HAB-KL-001",
  "risk_score": 82.4,
  "risk_category": "Critical",
  "confidence": 0.8923,
  "class_probabilities": {
    "Low": 0.012, "Moderate": 0.031, "High": 0.248, "Critical": 0.709
  },
  "shap_explanations": [
    {
      "feature": "rainfall_24h",
      "display_name": "24-Hour Rainfall",
      "value": 185.0,
      "value_label": "185.0 mm",
      "shap_value": 1.243,
      "impact_direction": "increases",
      "label": "24-Hour Rainfall (185.0 mm) increases risk"
    }
  ],
  "top_risk_factors": [
    "Heavy 24-hour rainfall of 185 mm significantly elevates flood risk.",
    "River level is 3.8 m above normal — flood inundation risk is high.",
    "High soil saturation (78%) accelerates surface runoff."
  ],
  "recommendations": [
    "Initiate voluntary evacuation of flood-prone habitations immediately.",
    "Deploy NDRF teams to the affected zone."
  ],
  "model_version": "1.0.0",
  "timestamp": "2026-09-28T08:00:00+00:00"
}
```

---

### `POST /explain`
Returns all 10 feature SHAP values in addition to the standard top-5,
for dashboard waterfall charts or detailed analysis.

---

## Features Used by the Model

| Feature | Unit | Description |
|---|---|---|
| `rainfall_24h` | mm | 24-hour cumulative rainfall |
| `river_level_above_normal` | m | River level above normal stage |
| `elevation_asl` | m | Elevation above sea level |
| `slope_degrees` | ° | Average terrain slope |
| `soil_saturation_pct` | % | Soil moisture saturation |
| `historical_flood_events` | count | Floods in last 10 years |
| `historical_landslide_events` | count | Landslides in last 10 years |
| `population_density` | /km² | Population per sq km |
| `distance_to_river_km` | km | Distance to nearest river |
| `land_cover_type` | category | Agricultural / Forest / Urban / Settlement |

---

## Risk Categories

| Category | Score Range | Action |
|---|---|---|
| **Low** | 0–30 | Standard monitoring |
| **Moderate** | 30–55 | Early warning activation |
| **High** | 55–75 | Voluntary evacuation |
| **Critical** | 75–100 | Mandatory evacuation |

---

## Notes

- The model auto-trains on startup if no saved model exists.
- CORS is pre-configured for `localhost:5173` (Vite) and `localhost:5000` (Express).
- All endpoints return proper HTTP status codes and JSON error bodies.
