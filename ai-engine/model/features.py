"""
features.py — Feature definitions, encoding maps, and normalization bounds
for the Aegis AI Disaster Decision Intelligence Platform.
"""

from dataclasses import dataclass, field
from typing import Dict, List

# ---------------------------------------------------------------------------
# Ordered list of feature names (must match training column order)
# ---------------------------------------------------------------------------
FEATURE_NAMES: List[str] = [
    "rainfall_24h",
    "river_level_above_normal",
    "elevation_asl",
    "slope_degrees",
    "soil_saturation_pct",
    "historical_flood_events",
    "historical_landslide_events",
    "population_density",
    "distance_to_river_km",
    "land_cover_encoded",
]

# ---------------------------------------------------------------------------
# Land-cover type → integer encoding
# ---------------------------------------------------------------------------
LAND_COVER_ENCODING: Dict[str, int] = {
    "Forest": 0,
    "Agricultural": 1,
    "Settlement": 2,
    "Urban": 3,
}

# Reverse map for display
LAND_COVER_DECODING: Dict[int, str] = {v: k for k, v in LAND_COVER_ENCODING.items()}

# ---------------------------------------------------------------------------
# Normalisation bounds (min / max) for each feature
# Used for input validation and optional scaling display.
# ---------------------------------------------------------------------------
@dataclass
class FeatureBounds:
    min_val: float
    max_val: float
    unit: str
    description: str


FEATURE_BOUNDS: Dict[str, FeatureBounds] = {
    "rainfall_24h": FeatureBounds(
        min_val=0.0,
        max_val=500.0,
        unit="mm",
        description="Cumulative rainfall in the last 24 hours",
    ),
    "river_level_above_normal": FeatureBounds(
        min_val=-2.0,
        max_val=15.0,
        unit="m",
        description="River level relative to normal (positive = above normal)",
    ),
    "elevation_asl": FeatureBounds(
        min_val=0.0,
        max_val=4000.0,
        unit="m",
        description="Elevation above sea level",
    ),
    "slope_degrees": FeatureBounds(
        min_val=0.0,
        max_val=60.0,
        unit="°",
        description="Average slope of the terrain in degrees",
    ),
    "soil_saturation_pct": FeatureBounds(
        min_val=0.0,
        max_val=100.0,
        unit="%",
        description="Soil moisture saturation percentage",
    ),
    "historical_flood_events": FeatureBounds(
        min_val=0.0,
        max_val=20.0,
        unit="events",
        description="Number of flood events recorded in the last 10 years",
    ),
    "historical_landslide_events": FeatureBounds(
        min_val=0.0,
        max_val=10.0,
        unit="events",
        description="Number of landslide events recorded in the last 10 years",
    ),
    "population_density": FeatureBounds(
        min_val=0.0,
        max_val=50000.0,
        unit="people/km²",
        description="Population density of the habitation",
    ),
    "distance_to_river_km": FeatureBounds(
        min_val=0.0,
        max_val=50.0,
        unit="km",
        description="Straight-line distance to nearest river",
    ),
    "land_cover_encoded": FeatureBounds(
        min_val=0.0,
        max_val=3.0,
        unit="category",
        description="Land cover type (encoded): 0=Forest, 1=Agricultural, 2=Settlement, 3=Urban",
    ),
}

# ---------------------------------------------------------------------------
# Risk category thresholds (applied to continuous risk_score 0-100)
# ---------------------------------------------------------------------------
RISK_THRESHOLDS = {
    "Low": (0.0, 30.0),
    "Moderate": (30.0, 55.0),
    "High": (55.0, 75.0),
    "Critical": (75.0, 100.0),
}

RISK_CATEGORY_ORDER = ["Low", "Moderate", "High", "Critical"]

# Map integer class label (from XGBClassifier) → category name
CLASS_LABEL_MAP: Dict[int, str] = {
    0: "Low",
    1: "Moderate",
    2: "High",
    3: "Critical",
}

# ---------------------------------------------------------------------------
# Human-readable feature display names
# ---------------------------------------------------------------------------
FEATURE_DISPLAY_NAMES: Dict[str, str] = {
    "rainfall_24h": "24-Hour Rainfall",
    "river_level_above_normal": "River Level (above normal)",
    "elevation_asl": "Elevation (ASL)",
    "slope_degrees": "Terrain Slope",
    "soil_saturation_pct": "Soil Saturation",
    "historical_flood_events": "Historical Flood Events",
    "historical_landslide_events": "Historical Landslide Events",
    "population_density": "Population Density",
    "distance_to_river_km": "Distance to River",
    "land_cover_encoded": "Land Cover Type",
}


def encode_land_cover(land_cover_type: str) -> int:
    """Convert land cover type string to integer encoding."""
    normalised = land_cover_type.strip().title()
    if normalised not in LAND_COVER_ENCODING:
        raise ValueError(
            f"Unknown land_cover_type '{land_cover_type}'. "
            f"Valid values: {list(LAND_COVER_ENCODING.keys())}"
        )
    return LAND_COVER_ENCODING[normalised]


def score_to_category(score: float) -> str:
    """Map a continuous risk score (0-100) to a named category."""
    for category, (low, high) in RISK_THRESHOLDS.items():
        if low <= score < high:
            return category
    return "Critical"  # catch-all for score == 100


def label_to_category(label: int) -> str:
    """Map integer XGBClassifier output label to risk category string."""
    return CLASS_LABEL_MAP.get(label, "Unknown")
