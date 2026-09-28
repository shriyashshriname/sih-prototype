"""
main.py — FastAPI application entry point for the Aegis AI Disaster
Decision Intelligence Platform (SIH26191).

Endpoints:
  POST /predict       — XGBoost risk prediction + SHAP explanations
  POST /explain       — Detailed SHAP explanation for a given input
  GET  /model-info    — Model metadata and feature importances
  GET  /health        — Service health check

Run:
    python main.py
    # or
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("aegis.api")

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Aegis AI — Disaster Decision Intelligence Engine",
    description=(
        "XGBoost-based risk prediction microservice for Indian disaster scenarios. "
        "Returns flood/landslide risk scores, SHAP explanations, and recommended actions."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server (React frontend)
        "http://localhost:5000",  # Express backend
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5000",
        "http://localhost:3000",  # optional fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Startup — load / train model
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    log.info("=== Aegis AI Engine starting up ===")
    from model.risk_model import risk_model
    risk_model.load_or_train()
    log.info("=== Model ready — API is live on port 8000 ===")


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

VALID_LAND_COVER_TYPES = ["Agricultural", "Forest", "Urban", "Settlement"]


class RiskPredictionRequest(BaseModel):
    """Input payload for the /predict endpoint."""

    habitation_id: str = Field(
        ...,
        description="Unique identifier for the habitation/village",
        examples=["HAB-KL-001"],
    )
    rainfall_24h: float = Field(
        ...,
        ge=0.0,
        le=500.0,
        description="Cumulative rainfall in the last 24 hours (mm)",
    )
    river_level_above_normal: float = Field(
        ...,
        ge=-2.0,
        le=15.0,
        description="River level relative to normal (metres; positive = above normal)",
    )
    elevation_asl: float = Field(
        ...,
        ge=0.0,
        le=4000.0,
        description="Elevation above sea level (metres)",
    )
    slope_degrees: float = Field(
        ...,
        ge=0.0,
        le=60.0,
        description="Average terrain slope (degrees)",
    )
    soil_saturation_pct: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Soil moisture saturation percentage (0-100)",
    )
    historical_flood_events: int = Field(
        ...,
        ge=0,
        le=20,
        description="Number of flood events in the last 10 years",
    )
    historical_landslide_events: int = Field(
        ...,
        ge=0,
        le=10,
        description="Number of landslide events in the last 10 years",
    )
    population_density: float = Field(
        ...,
        ge=0.0,
        le=50000.0,
        description="Population density (persons per sq km)",
    )
    distance_to_river_km: float = Field(
        ...,
        ge=0.0,
        le=50.0,
        description="Straight-line distance to nearest river (km)",
    )
    land_cover_type: str = Field(
        ...,
        description="Land cover classification: Agricultural / Forest / Urban / Settlement",
    )

    @field_validator("land_cover_type")
    @classmethod
    def validate_land_cover(cls, v: str) -> str:
        normalised = v.strip().title()
        if normalised not in VALID_LAND_COVER_TYPES:
            raise ValueError(
                f"land_cover_type must be one of {VALID_LAND_COVER_TYPES}; got '{v}'"
            )
        return normalised

    model_config = {
        "json_schema_extra": {
            "example": {
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
                "land_cover_type": "Settlement",
            }
        }
    }


class SHAPEntry(BaseModel):
    feature: str
    display_name: str
    value: float
    value_label: str
    shap_value: float
    impact_direction: str
    label: str


class RiskPredictionResponse(BaseModel):
    """Response payload from the /predict endpoint."""

    habitation_id: str
    risk_score: float = Field(..., description="Risk score 0-100")
    risk_category: str = Field(..., description="Low / Moderate / High / Critical")
    confidence: float = Field(..., description="Classifier confidence (0-1)")
    class_probabilities: Dict[str, float]
    shap_explanations: List[SHAPEntry]
    top_risk_factors: List[str]
    recommendations: List[str]
    model_version: str
    timestamp: str


class ExplainRequest(BaseModel):
    """Input payload for the /explain endpoint (same fields as /predict)."""

    habitation_id: str
    rainfall_24h: float = Field(..., ge=0.0, le=500.0)
    river_level_above_normal: float = Field(..., ge=-2.0, le=15.0)
    elevation_asl: float = Field(..., ge=0.0, le=4000.0)
    slope_degrees: float = Field(..., ge=0.0, le=60.0)
    soil_saturation_pct: float = Field(..., ge=0.0, le=100.0)
    historical_flood_events: int = Field(..., ge=0, le=20)
    historical_landslide_events: int = Field(..., ge=0, le=10)
    population_density: float = Field(..., ge=0.0, le=50000.0)
    distance_to_river_km: float = Field(..., ge=0.0, le=50.0)
    land_cover_type: str

    @field_validator("land_cover_type")
    @classmethod
    def validate_land_cover(cls, v: str) -> str:
        normalised = v.strip().title()
        if normalised not in VALID_LAND_COVER_TYPES:
            raise ValueError(
                f"land_cover_type must be one of {VALID_LAND_COVER_TYPES}; got '{v}'"
            )
        return normalised


class ExplainResponse(BaseModel):
    habitation_id: str
    risk_score: float
    risk_category: str
    confidence: float
    shap_explanations: List[SHAPEntry]
    all_feature_shap: List[Dict[str, Any]]
    model_version: str
    timestamp: str


# ---------------------------------------------------------------------------
# Helper — extract feature dict from request
# ---------------------------------------------------------------------------
def _request_to_features(req) -> Dict[str, float]:
    return {
        "rainfall_24h": req.rainfall_24h,
        "river_level_above_normal": req.river_level_above_normal,
        "elevation_asl": req.elevation_asl,
        "slope_degrees": req.slope_degrees,
        "soil_saturation_pct": req.soil_saturation_pct,
        "historical_flood_events": float(req.historical_flood_events),
        "historical_landslide_events": float(req.historical_landslide_events),
        "population_density": req.population_density,
        "distance_to_river_km": req.distance_to_river_km,
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System"])
async def health_check():
    """Service health check — returns status and model readiness."""
    from model.risk_model import risk_model

    return {
        "status": "ok",
        "service": "Aegis AI Engine",
        "model_ready": risk_model.is_ready,
        "model_version": risk_model._model_version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/model-info", tags=["System"])
async def model_info():
    """
    Return model metadata including version, training accuracy,
    and feature importances.
    """
    from model.risk_model import risk_model

    if not risk_model.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not yet loaded.",
        )
    return risk_model.get_model_info()


@app.post(
    "/predict",
    response_model=RiskPredictionResponse,
    tags=["Prediction"],
    summary="Predict disaster risk for a habitation",
)
async def predict_risk(req: RiskPredictionRequest):
    """
    Run the XGBoost risk prediction pipeline for a given habitation.

    Returns:
    - **risk_score** (0-100): continuous severity score
    - **risk_category**: Low / Moderate / High / Critical
    - **confidence**: model confidence in the predicted category
    - **shap_explanations**: top-5 SHAP feature contributions
    - **top_risk_factors**: human-readable sentences
    - **recommendations**: actionable steps for the risk level
    """
    from model.risk_model import risk_model

    if not risk_model.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is initialising, please retry in a few seconds.",
        )

    try:
        features = _request_to_features(req)
        result = risk_model.predict(features, req.land_cover_type)

        return RiskPredictionResponse(
            habitation_id=req.habitation_id,
            **result,
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        log.exception("Prediction failed for habitation_id=%s", req.habitation_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}",
        )


@app.post(
    "/explain",
    response_model=ExplainResponse,
    tags=["Prediction"],
    summary="Detailed SHAP explanation for a risk prediction",
)
async def explain_risk(req: ExplainRequest):
    """
    Returns the full SHAP explanation for all features in addition to the
    standard top-5 explanations, useful for debugging and dashboard display.
    """
    from model.risk_model import risk_model
    from model.features import FEATURE_NAMES, FEATURE_DISPLAY_NAMES, FEATURE_BOUNDS, LAND_COVER_DECODING
    import numpy as np
    import pandas as pd

    if not risk_model.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is initialising, please retry in a few seconds.",
        )

    try:
        features = _request_to_features(req)
        result = risk_model.predict(features, req.land_cover_type)

        # Build all-feature SHAP detail
        from model.features import encode_land_cover
        land_cover_encoded = encode_land_cover(req.land_cover_type)
        feature_row = {k: features[k] for k in FEATURE_NAMES if k != "land_cover_encoded"}
        feature_row["land_cover_encoded"] = float(land_cover_encoded)
        X = pd.DataFrame([feature_row], columns=FEATURE_NAMES)
        X_scaled = risk_model._pipeline.named_steps["scaler"].transform(X)
        shap_values = risk_model._explainer.shap_values(X_scaled)
        predicted_label = int(np.argmax(
            risk_model._pipeline.predict_proba(X)[0]
        ))
        shap_for_class = shap_values[predicted_label][0]

        all_feature_shap = []
        for feat, sv in zip(FEATURE_NAMES, shap_for_class):
            raw_value = feature_row[feat]
            bounds = FEATURE_BOUNDS.get(feat)
            if feat == "land_cover_encoded":
                value_label = LAND_COVER_DECODING.get(int(raw_value), str(raw_value))
            else:
                unit = bounds.unit if bounds else ""
                value_label = f"{raw_value:.1f} {unit}".strip()

            all_feature_shap.append({
                "feature": feat,
                "display_name": FEATURE_DISPLAY_NAMES.get(feat, feat),
                "value": raw_value,
                "value_label": value_label,
                "shap_value": round(float(sv), 4),
                "impact_direction": "increases" if sv > 0 else "decreases",
            })

        return ExplainResponse(
            habitation_id=req.habitation_id,
            risk_score=result["risk_score"],
            risk_category=result["risk_category"],
            confidence=result["confidence"],
            shap_explanations=result["shap_explanations"],
            all_feature_shap=all_feature_shap,
            model_version=result["model_version"],
            timestamp=result["timestamp"],
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        log.exception("Explain failed for habitation_id=%s", req.habitation_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Explanation error: {str(e)}",
        )


# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled exception at %s", request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )
