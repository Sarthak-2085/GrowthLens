"""Campaign outcome prediction.

Models are trained on-the-fly from the user's own uploaded campaigns each
request — there's no persistent model file. With SMB-scale data (tens to a
few hundred rows) this is instant and always reflects the latest upload,
which matters more here than squeezing out extra accuracy from a cached
model. Ridge regression (not a tree ensemble) is used deliberately: it's
stable and non-overfitting on small n, and its behavior is easy to reason
about, which matters for a "how much can I trust this" tool.
"""

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import Ridge
from sklearn.model_selection import KFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from app.models.campaign import Campaign

MIN_ROWS_FOR_PREDICTION = 8   # below this, refuse — too little signal to say anything
MIN_ROWS_FOR_CV = 15          # below this, skip cross-validation, confidence forced to "low"
CV_FOLDS = 3


class InsufficientDataError(Exception):
    pass


def _build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[("channel", OneHotEncoder(handle_unknown="ignore"), ["channel"])],
        remainder="passthrough",
    )
    return Pipeline([
        ("preprocess", preprocessor),
        ("model", Ridge(alpha=1.0)),
    ])


def _campaigns_to_frame(campaigns: list[Campaign]) -> pd.DataFrame:
    return pd.DataFrame([
        {
            "channel": c.channel,
            "budget": c.budget,
            "clicks": c.clicks,
            "conversions": c.conversions,
            "revenue": c.revenue,
        }
        for c in campaigns
    ])


def _fit_and_score(X: pd.DataFrame, y: pd.Series, n: int) -> tuple[Pipeline, float | None]:
    pipeline = _build_pipeline()
    r2: float | None = None

    if n >= MIN_ROWS_FOR_CV:
        folds = min(CV_FOLDS, n)
        try:
            scores = cross_val_score(
                pipeline, X, y, cv=KFold(n_splits=folds, shuffle=True, random_state=42), scoring="r2"
            )
            r2 = round(float(np.mean(scores)), 2)
        except Exception:
            r2 = None  # degrade gracefully — still return a prediction, just no r2

    pipeline.fit(X, y)
    return pipeline, r2


def _confidence_label(n: int, avg_r2: float | None) -> str:
    if n < MIN_ROWS_FOR_CV or avg_r2 is None:
        return "low"
    if avg_r2 >= 0.6:
        return "high"
    if avg_r2 >= 0.3:
        return "medium"
    return "low"


def _percentile_rank(historical: list[float], value: float) -> float:
    if not historical:
        return 50.0
    below_or_equal = sum(1 for h in historical if h <= value)
    return round(below_or_equal / len(historical) * 100, 1)


def predict_campaign_outcome(campaigns: list[Campaign], channel: str, budget: float) -> dict:
    n = len(campaigns)
    if n < MIN_ROWS_FOR_PREDICTION:
        raise InsufficientDataError(
            f"Need at least {MIN_ROWS_FOR_PREDICTION} campaigns to generate a prediction "
            f"— currently have {n}."
        )

    df = _campaigns_to_frame(campaigns)
    X = df[["channel", "budget"]]

    revenue_model, revenue_r2 = _fit_and_score(X, df["revenue"], n)
    conversions_model, conversions_r2 = _fit_and_score(X, df["conversions"], n)
    clicks_model, clicks_r2 = _fit_and_score(X, df["clicks"], n)

    input_df = pd.DataFrame([{"channel": channel, "budget": budget}])
    predicted_revenue = max(0.0, float(revenue_model.predict(input_df)[0]))
    predicted_conversions = max(0.0, float(conversions_model.predict(input_df)[0]))
    predicted_clicks = max(0.0, float(clicks_model.predict(input_df)[0]))

    predicted_roi = ((predicted_revenue - budget) / budget * 100) if budget > 0 else 0.0
    predicted_cvr = (predicted_conversions / predicted_clicks * 100) if predicted_clicks > 0 else 0.0

    # Success score: where the prediction would rank against this user's own campaign history.
    hist_roi = [((c.revenue - c.budget) / c.budget * 100) if c.budget else 0.0 for c in campaigns]
    hist_cvr = [((c.conversions / c.clicks) * 100) if c.clicks else 0.0 for c in campaigns]
    roi_percentile = _percentile_rank(hist_roi, predicted_roi)
    cvr_percentile = _percentile_rank(hist_cvr, predicted_cvr)
    success_score = round(0.6 * roi_percentile + 0.4 * cvr_percentile, 1)

    r2_values = [r for r in (revenue_r2, conversions_r2, clicks_r2) if r is not None]
    avg_r2 = round(float(np.mean(r2_values)), 2) if r2_values else None
    confidence = _confidence_label(n, avg_r2)

    return {
        "predicted_revenue": round(predicted_revenue, 2),
        "predicted_conversions": round(predicted_conversions, 1),
        "predicted_clicks": round(predicted_clicks, 1),
        "predicted_roi": round(predicted_roi, 1),
        "predicted_cvr": round(predicted_cvr, 2),
        "success_score": success_score,
        "confidence": confidence,
        "r2_score": avg_r2,
        "sample_size": n,
    }
