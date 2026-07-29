"""Analytics engine.

Computes performance metrics from raw campaign rows. Budget is used as the
spend proxy throughout since a separate "actual spend" field isn't tracked
yet (see api.ts / metrics.ts note on the frontend for the same assumption).
"""

from app.models.campaign import Campaign
from app.schemas.analytics import AnalyticsSummary, CampaignMetrics


def _safe_div(numerator: float, denominator: float) -> float:
    return numerator / denominator if denominator else 0.0


def compute_campaign_metrics(campaign: Campaign) -> CampaignMetrics:
    roi = _safe_div(campaign.revenue - campaign.budget, campaign.budget) * 100
    ctr = _safe_div(campaign.clicks, campaign.impressions) * 100
    cpc = _safe_div(campaign.budget, campaign.clicks)
    cpa = _safe_div(campaign.budget, campaign.conversions)
    cvr = _safe_div(campaign.conversions, campaign.clicks) * 100
    efficiency = _safe_div(campaign.revenue, campaign.budget)

    return CampaignMetrics(
        id=campaign.id,
        campaign_name=campaign.campaign_name,
        channel=campaign.channel,
        budget=campaign.budget,
        revenue=campaign.revenue,
        roi=round(roi, 1),
        ctr=round(ctr, 2),
        cpc=round(cpc, 2),
        cpa=round(cpa, 2),
        cvr=round(cvr, 2),
        budget_efficiency=round(efficiency, 2),
    )


def compute_analytics_summary(campaigns: list[Campaign]) -> AnalyticsSummary:
    if not campaigns:
        return AnalyticsSummary(
            total_campaigns=0,
            total_budget=0,
            total_revenue=0,
            overall_roi=0,
            overall_ctr=0,
            overall_cpc=0,
            overall_cpa=0,
            overall_cvr=0,
            campaign_metrics=[],
        )

    metrics = [compute_campaign_metrics(c) for c in campaigns]

    total_budget = sum(c.budget for c in campaigns)
    total_revenue = sum(c.revenue for c in campaigns)
    total_clicks = sum(c.clicks for c in campaigns)
    total_impressions = sum(c.impressions for c in campaigns)
    total_conversions = sum(c.conversions for c in campaigns)

    overall_roi = round(_safe_div(total_revenue - total_budget, total_budget) * 100, 1)
    overall_ctr = round(_safe_div(total_clicks, total_impressions) * 100, 2)
    overall_cpc = round(_safe_div(total_budget, total_clicks), 2)
    overall_cpa = round(_safe_div(total_budget, total_conversions), 2)
    overall_cvr = round(_safe_div(total_conversions, total_clicks) * 100, 2)

    best_campaign = max(metrics, key=lambda m: m.roi)
    worst_campaign = min(metrics, key=lambda m: m.roi)
    most_efficient_campaign = max(metrics, key=lambda m: m.budget_efficiency)

    return AnalyticsSummary(
        total_campaigns=len(campaigns),
        total_budget=round(total_budget, 2),
        total_revenue=round(total_revenue, 2),
        overall_roi=overall_roi,
        overall_ctr=overall_ctr,
        overall_cpc=overall_cpc,
        overall_cpa=overall_cpa,
        overall_cvr=overall_cvr,
        best_campaign=best_campaign,
        worst_campaign=worst_campaign,
        most_efficient_campaign=most_efficient_campaign,
        campaign_metrics=metrics,
    )
