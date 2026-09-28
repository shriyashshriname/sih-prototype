"""
risk_model.py — XGBoost risk prediction model wrapper for the Aegis AI
Disaster Decision Intelligence Platform.

Responsibilities:
  - Load / auto-train the saved XGBoost pipeline
  - Run predictions and return risk_score (0-100), risk_category, confidence
  - Compute SHAP explanations per prediction
  - Return human-readable risk factors and recommendations
"""

import os
import json
import pickle
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import shap
from sklearn.pipeline import Pipeline

from model.features import (
    FEATURE_NAMES,
    FEATURE_DISPLAY_NAMES,
    FEATURE_BOUNDS,
    LAND_COVER_DECODING,
    CLASS_LABEL_MAP,
    RISK_CATEGORY_ORDER,
    encode_land_cover,
    score_to_category,
)
from model.train import MODEL_PATH, META_PATH, MODEL_VERSION, train

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved")


# ---------------------------------------------------------------------------
# Risk score mapping
#   XGBClassifier returns class probabilities; we map them to a 0-100 score
#   weighted by class severity: Low=0, Moderate=33, High=66, Critical=100
# ---------------------------------------------------------------------------
CLASS_WEIGHTS = np.array([0.0, 33.0, 66.0, 100.0])  # indexed by class label


def _probabilities_to_score(proba: np.ndarray) -> float:
    """
    Convert a 4-class probability vector to a single 0-100 risk score.
    Uses a severity-weighted sum of class probabilities.
    """
    return float(np.dot(proba, CLASS_WEIGHTS))


# ---------------------------------------------------------------------------
# Recommendations by category
# ---------------------------------------------------------------------------
RECOMMENDATIONS: Dict[str, List[str]] = {
    "Low": [
        "Continue standard monitoring via IMD alerts.",
        "Ensure community emergency contact lists are up to date.",
        "Conduct annual disaster preparedness drills.",
    ],
    "Moderate": [
        "Activate district early warning systems.",
        "Pre-position relief materials at block headquarters.",
        "Alert NDRF/SDRF teams for standby deployment.",
        "Communicate evacuation routes to panchayat leaders.",
        "Monitor river gauge levels every 6 hours.",
    ],
    "High": [
        "Initiate voluntary evacuation of flood-prone habitations immediately.",
        "Deploy NDRF teams to the affected zone.",
        "Open relief camps at designated higher-ground sites.",
        "Suspend road traffic on low-lying routes near river banks.",
        "Coordinate with district administration for emergency food/water.",
        "Issue public advisories via All India Radio and SMS.",
    ],
    "Critical": [
        "ORDER MANDATORY EVACUATION — do not delay.",
        "Request aerial support (helicopters) for stranded persons.",
        "Activate State Emergency Operations Centre (SEOC).",
        "Shut down electricity supply to inundation-prone areas.",
        "Deploy Army/Navy/Coast Guard as required.",
        "Establish emergency medical triage centres at safe elevations.",
        "Coordinate with Railways for emergency evacuation trains.",
    ],
}


# ---------------------------------------------------------------------------
# RiskModel class
# ---------------------------------------------------------------------------
class RiskModel:
    """
    Singleton-style wrapper for the Aegis XGBoost risk prediction pipeline.
    """

    def __init__(self):
        self._pipeline: Optional[Pipeline] = None
        self._explainer: Optional[shap.TreeExplainer] = None
        self._meta: Dict[str, Any] = {}
        self._model_version: str = MODEL_VERSION

    # ------------------------------------------------------------------
    # Loading / training
    # ------------------------------------------------------------------
    def load_or_train(self) -> None:
        """Load model from disk; auto-train if no saved model exists."""
        if os.path.exists(MODEL_PATH):
            log.info(f"Loading saved model from {MODEL_PATH}")
            with open(MODEL_PATH, "rb") as f:
                self._pipeline = pickle.load(f)

            if os.path.exists(META_PATH):
                with open(META_PATH) as f:
                    self._meta = json.load(f)
                self._model_version = self._meta.get("model_version", MODEL_VERSION)
        else:
            log.info("No saved model found — training from scratch …")
            self._pipeline = train(save=True)
            if os.path.exists(META_PATH):
                with open(META_PATH) as f:
                    self._meta = json.load(f)

        self._init_explainer()
        log.info(f"Model ready | version={self._model_version}")

    def _init_explainer(self) -> None:
        """Initialise the SHAP TreeExplainer on the underlying XGB model."""
        xgb_model = self._pipeline.named_steps["xgb"]
        # Use the raw XGBoost booster for SHAP (faster + more accurate)
        self._explainer = shap.TreeExplainer(
            xgb_model,
            feature_names=FEATURE_NAMES,
        )
        log.info("SHAP TreeExplainer initialised.")

    @property
    def is_ready(self) -> bool:
        return self._pipeline is not None and self._explainer is not None

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------
    def predict(
        self,
        features: Dict[str, float],
        land_cover_type: str,
    ) -> Dict[str, Any]:
        """
        Run a full prediction including SHAP explanations.

        Parameters
        ----------
        features : dict with all FEATURE_NAMES except land_cover_encoded
        land_cover_type : str, e.g. "Urban"

        Returns
        -------
        dict with keys: risk_score, risk_category, confidence,
                        shap_explanations, top_risk_factors, recommendations
        """
        if not self.is_ready:
            raise RuntimeError("Model not loaded. Call load_or_train() first.")

        # ---- Build feature vector ----------------------------------------
        land_cover_encoded = encode_land_cover(land_cover_type)
        feature_row = {k: features[k] for k in FEATURE_NAMES if k != "land_cover_encoded"}
        feature_row["land_cover_encoded"] = float(land_cover_encoded)

        X = pd.DataFrame([feature_row], columns=FEATURE_NAMES)

        # ---- XGBoost predict_proba ---------------------------------------
        proba: np.ndarray = self._pipeline.predict_proba(X)[0]  # shape (4,)
        predicted_label: int = int(np.argmax(proba))
        risk_score = _probabilities_to_score(proba)
        risk_category = score_to_category(risk_score)
        confidence = float(proba[predicted_label])

        # ---- SHAP explanations -------------------------------------------
        # Transform features through scaler before passing to SHAP
        X_scaled = self._pipeline.named_steps["scaler"].transform(X)
        shap_values = self._explainer.shap_values(X_scaled)  # list of 4 arrays

        # Use the SHAP values for the predicted class
        shap_for_class = shap_values[predicted_label][0]  # shape (n_features,)

        shap_explanations = self._build_shap_explanations(
            feature_row, shap_for_class, top_k=5
        )

        top_risk_factors = self._build_top_risk_factors(
            feature_row, shap_for_class, land_cover_type
        )

        recs = RECOMMENDATIONS.get(risk_category, RECOMMENDATIONS["Moderate"])

        return {
            "risk_score": round(risk_score, 2),
            "risk_category": risk_category,
            "confidence": round(confidence, 4),
            "class_probabilities": {
                CLASS_LABEL_MAP[i]: round(float(p), 4) for i, p in enumerate(proba)
            },
            "shap_explanations": shap_explanations,
            "top_risk_factors": top_risk_factors,
            "recommendations": recs,
            "model_version": self._model_version,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # ------------------------------------------------------------------
    # SHAP explanation builder
    # ------------------------------------------------------------------
    def _build_shap_explanations(
        self,
        feature_row: Dict[str, float],
        shap_values: np.ndarray,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Build top-k SHAP explanation objects sorted by absolute impact.

        Returns list of:
        {
            feature, value, shap_value, impact_direction, label
        }
        """
        pairs = list(zip(FEATURE_NAMES, shap_values))
        sorted_pairs = sorted(pairs, key=lambda t: abs(t[1]), reverse=True)[:top_k]

        explanations = []
        for feat, sv in sorted_pairs:
            raw_value = feature_row[feat]
            bounds = FEATURE_BOUNDS.get(feat)

            # Human-readable value label
            if feat == "land_cover_encoded":
                value_label = LAND_COVER_DECODING.get(int(raw_value), str(raw_value))
            else:
                unit = bounds.unit if bounds else ""
                value_label = f"{raw_value:.1f} {unit}".strip()

            impact_dir = "increases" if sv > 0 else "decreases"

            explanations.append({
                "feature": feat,
                "display_name": FEATURE_DISPLAY_NAMES.get(feat, feat),
                "value": raw_value,
                "value_label": value_label,
                "shap_value": round(float(sv), 4),
                "impact_direction": impact_dir,
                "label": (
                    f"{FEATURE_DISPLAY_NAMES.get(feat, feat)} ({value_label}) "
                    f"{impact_dir} risk"
                ),
            })

        return explanations

    # ------------------------------------------------------------------
    # Human-readable risk factors
    # ------------------------------------------------------------------
    def _build_top_risk_factors(
        self,
        feature_row: Dict[str, float],
        shap_values: np.ndarray,
        land_cover_type: str,
    ) -> List[str]:
        """
        Generate 3-5 human-readable sentences describing the dominant risk drivers.
        """
        factors = []

        rf = feature_row["rainfall_24h"]
        rv = feature_row["river_level_above_normal"]
        el = feature_row["elevation_asl"]
        sl = feature_row["slope_degrees"]
        ss = feature_row["soil_saturation_pct"]
        hf = feature_row["historical_flood_events"]
        hl = feature_row["historical_landslide_events"]
        dr = feature_row["distance_to_river_km"]
        pd_ = feature_row["population_density"]

        if rf >= 200:
            factors.append(
                f"Extreme 24-hour rainfall of {rf:.0f} mm presents imminent flood threat."
            )
        elif rf >= 100:
            factors.append(
                f"Heavy 24-hour rainfall of {rf:.0f} mm significantly elevates flood risk."
            )
        elif rf >= 30:
            factors.append(
                f"Moderate rainfall of {rf:.0f} mm is contributing to elevated risk."
            )

        if rv >= 5.0:
            factors.append(
                f"River level is {rv:.1f} m above normal — severe overflow likely."
            )
        elif rv >= 2.0:
            factors.append(
                f"River level is {rv:.1f} m above normal — flood inundation risk is high."
            )
        elif rv >= 0.5:
            factors.append(
                f"River level is {rv:.1f} m above normal — monitor closely."
            )

        if ss >= 85:
            factors.append(
                f"Soil saturation at {ss:.0f}% means the ground cannot absorb more water."
            )
        elif ss >= 65:
            factors.append(
                f"High soil saturation ({ss:.0f}%) accelerates surface runoff."
            )

        if sl >= 25 and ss >= 60:
            factors.append(
                f"Steep terrain ({sl:.0f}°) combined with saturated soil creates high "
                f"landslide susceptibility."
            )
        elif sl >= 15:
            factors.append(
                f"Slope of {sl:.0f}° increases landslide risk in wet conditions."
            )

        if el <= 50 and dr <= 1.0:
            factors.append(
                f"Location is at low elevation ({el:.0f} m ASL) only {dr:.2f} km from the river."
            )
        elif el <= 100:
            factors.append(
                f"Low elevation of {el:.0f} m ASL makes this area susceptible to inundation."
            )

        if hf >= 10:
            factors.append(
                f"Area has recorded {int(hf)} flood events in the last decade — chronically vulnerable."
            )
        elif hf >= 5:
            factors.append(
                f"Area has {int(hf)} historical flood events indicating recurring risk."
            )

        if hl >= 4:
            factors.append(
                f"Area has recorded {int(hl)} landslide events — slope stability is compromised."
            )

        if pd_ >= 10000:
            factors.append(
                f"Dense population ({pd_:.0f}/km²) significantly increases potential impact."
            )

        # Ensure at least one factor
        if not factors:
            factors.append("Current conditions show low risk; standard vigilance recommended.")

        return factors[:5]  # cap at 5 sentences

    # ------------------------------------------------------------------
    # Model metadata
    # ------------------------------------------------------------------
    def get_model_info(self) -> Dict[str, Any]:
        """Return model metadata for the /model-info endpoint."""
        info = {
            "model_version": self._model_version,
            "model_type": "XGBoost Multi-class Classifier (4-class)",
            "features": FEATURE_NAMES,
            "risk_categories": RISK_CATEGORY_ORDER,
            "is_loaded": self.is_ready,
        }
        info.update(self._meta)
        return info


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------
risk_model = RiskModel()
