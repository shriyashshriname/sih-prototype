"""
train.py — Training pipeline for the Aegis AI risk prediction model.

Usage:
    python -m model.train

Outputs:
    model/saved/risk_model.pkl     — serialised XGBoost pipeline
    model/saved/model_meta.json    — metadata (version, feature importances, etc.)
"""

import os
import json
import pickle
import logging
from datetime import datetime, timezone

import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
from xgboost import XGBClassifier

# Allow running as a standalone script from the ai-engine root
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from model.features import FEATURE_NAMES, CLASS_LABEL_MAP
from data.training_data import generate_training_data

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved")
MODEL_PATH = os.path.join(SAVE_DIR, "risk_model.pkl")
META_PATH = os.path.join(SAVE_DIR, "model_meta.json")

MODEL_VERSION = "1.0.0"


# ---------------------------------------------------------------------------
# XGBoost hyper-parameters (tuned for small synthetic dataset)
# ---------------------------------------------------------------------------
XGBOOST_PARAMS = {
    "n_estimators": 300,
    "max_depth": 5,
    "learning_rate": 0.08,
    "subsample": 0.85,
    "colsample_bytree": 0.85,
    "min_child_weight": 3,
    "gamma": 0.1,
    "reg_alpha": 0.05,
    "reg_lambda": 1.0,
    "objective": "multi:softprob",
    "num_class": 4,
    "eval_metric": "mlogloss",
    "random_state": 42,
    "n_jobs": -1,
    "verbosity": 0,
}


def build_pipeline() -> Pipeline:
    """Construct the sklearn Pipeline wrapping XGBClassifier."""
    return Pipeline([
        ("scaler", StandardScaler()),
        (
            "xgb",
            XGBClassifier(**XGBOOST_PARAMS),
        ),
    ])


def train(
    n_low: int = 175,
    n_moderate: int = 175,
    n_high: int = 150,
    n_critical: int = 125,
    save: bool = True,
) -> Pipeline:
    """
    Full training pipeline.

    Parameters
    ----------
    n_* : sample counts per class
    save : whether to persist the model to disk

    Returns
    -------
    Fitted sklearn Pipeline
    """
    # ---- 1. Generate data ------------------------------------------------
    log.info("Generating synthetic training data …")
    X, y = generate_training_data(n_low, n_moderate, n_high, n_critical)
    log.info(
        f"Dataset: {len(X)} records | classes: {y.value_counts().sort_index().to_dict()}"
    )

    # ---- 2. Train/test split ---------------------------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # ---- 3. Build & train pipeline ---------------------------------------
    log.info("Training XGBoost pipeline …")
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    # ---- 4. Evaluate -----------------------------------------------------
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    log.info(f"Test accuracy: {acc:.4f}")
    log.info(
        "\n"
        + classification_report(
            y_test,
            y_pred,
            target_names=[CLASS_LABEL_MAP[i] for i in range(4)],
        )
    )

    # ---- 5. Cross-validation ---------------------------------------------
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, X, y, cv=cv, scoring="accuracy")
    log.info(f"5-Fold CV accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # ---- 6. Feature importances ------------------------------------------
    xgb_model: XGBClassifier = pipeline.named_steps["xgb"]
    importances = xgb_model.feature_importances_
    fi_dict = dict(sorted(
        zip(FEATURE_NAMES, importances.tolist()),
        key=lambda t: t[1],
        reverse=True,
    ))
    log.info("Feature importances (descending):")
    for feat, imp in fi_dict.items():
        log.info(f"  {feat:35s} {imp:.4f}")

    # ---- 7. Persist ------------------------------------------------------
    if save:
        os.makedirs(SAVE_DIR, exist_ok=True)

        with open(MODEL_PATH, "wb") as f:
            pickle.dump(pipeline, f)
        log.info(f"Model saved → {MODEL_PATH}")

        meta = {
            "model_version": MODEL_VERSION,
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "n_training_samples": len(X_train),
            "n_test_samples": len(X_test),
            "test_accuracy": round(acc, 4),
            "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
            "cv_accuracy_std": round(float(cv_scores.std()), 4),
            "feature_importances": {k: round(v, 6) for k, v in fi_dict.items()},
            "xgboost_params": XGBOOST_PARAMS,
        }
        with open(META_PATH, "w") as f:
            json.dump(meta, f, indent=2)
        log.info(f"Metadata saved → {META_PATH}")

    return pipeline


if __name__ == "__main__":
    train()
