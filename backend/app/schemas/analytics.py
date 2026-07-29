from typing import Literal

from pydantic import BaseModel


class CampaignMetrics(BaseModel):
    id: int
    campaign_name: str
    channel: str
    budget: float
    revenue: float
    roi: float          # % — (revenue - budget) / budget. Budget stands in for spend.
    ctr: float           # % — clicks / impressions
    cpc: float            # budget / clicks
    cpa: float             # budget / conversions
    cvr: float              # % — conversions / clicks
    budget_efficiency: float  # revenue / budget (a ratio, e.g. 2.5x)


class AnalyticsSummary(BaseModel):
    total_campaigns: int
    total_budget: float
    total_revenue: float
    overall_roi: float
    overall_ctr: float
    overall_cpc: float
    overall_cpa: float
    overall_cvr: float
    best_campaign: CampaignMetrics | None = None
    worst_campaign: CampaignMetrics | None = None
    most_efficient_campaign: CampaignMetrics | None = None
    campaign_metrics: list[CampaignMetrics]


RecommendationType = Literal["increase", "decrease", "optimize", "alert"]
RecommendationPriority = Literal["high", "medium", "low"]


class Recommendation(BaseModel):
    id: str
    campaign_id: int
    campaign_name: str
    channel: str
    type: RecommendationType
    priority: RecommendationPriority
    headline: str
    detail: str
    potential_impact: str
    action: str
