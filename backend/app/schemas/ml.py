from typing import Literal

from pydantic import BaseModel, Field

Confidence = Literal["low", "medium", "high"]


class PredictionRequest(BaseModel):
    channel: str = Field(..., min_length=1)
    budget: float = Field(..., gt=0)
    dataset_id: str | None = None


class PredictionResponse(BaseModel):
    predicted_revenue: float
    predicted_conversions: float
    predicted_clicks: float
    predicted_roi: float
    predicted_cvr: float
    success_score: float  # 0-100, percentile of predicted ROI/CVR vs. historical campaigns
    confidence: Confidence
    r2_score: float | None  # cross-validated R², null when sample too small to compute
    sample_size: int


class MLStatus(BaseModel):
    ready: bool
    sample_size: int
    min_required: int
    message: str
