"""Rule-based recommendation engine.

Generates one recommendation per campaign (the single most salient issue,
to avoid noise) based on fixed thresholds. This is intentionally simple and
explainable — a later phase can swap the rule evaluation for an LLM call
without touching the schema or the frontend.
"""

from app.models.campaign import Campaign
from app.schemas.analytics import Recommendation
from app.services.analytics_service import compute_campaign_metrics

# Thresholds — tuned for small-business ad spend, adjust as real data comes in.
MIN_IMPRESSIONS_FOR_CTR_SIGNAL = 500
MIN_CLICKS_FOR_CVR_SIGNAL = 50
LOW_CTR_THRESHOLD = 1.0        # %
LOW_CVR_THRESHOLD = 2.0        # %
STRONG_ROI_THRESHOLD = 100.0   # %
MAX_RECOMMENDATIONS = 8

PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}


def _fmt_currency(value: float) -> str:
    if value >= 100000:
        return f"₹{value / 100000:.1f}L"
    if value >= 1000:
        return f"₹{value / 1000:.0f}K"
    return f"₹{value:.0f}"


def _build_recommendation(campaign: Campaign) -> Recommendation | None:
    m = compute_campaign_metrics(campaign)

    # No meaningful spend/traffic yet — not enough signal to recommend anything.
    if campaign.budget <= 0 or campaign.impressions == 0:
        return None

    # 1. Losing money outright — highest priority.
    if m.roi < 0:
        loss = campaign.budget - campaign.revenue
        return Recommendation(
            id=f"{campaign.id}-decrease",
            campaign_id=campaign.id,
            campaign_name=campaign.campaign_name,
            channel=campaign.channel,
            type="decrease",
            priority="high",
            headline=f"{campaign.campaign_name} is losing money",
            detail=(
                f"This campaign has spent {_fmt_currency(campaign.budget)} but only returned "
                f"{_fmt_currency(campaign.revenue)} in revenue ({m.roi}% ROI). Consider pausing "
                "it or cutting the budget until targeting or creative improves."
            ),
            potential_impact=f"Stop {_fmt_currency(loss)} of unprofitable spend",
            action="Reduce or pause budget",
        )

    # 2. Weak click-through — creative/targeting issue.
    if campaign.impressions >= MIN_IMPRESSIONS_FOR_CTR_SIGNAL and m.ctr < LOW_CTR_THRESHOLD:
        return Recommendation(
            id=f"{campaign.id}-alert",
            campaign_id=campaign.id,
            campaign_name=campaign.campaign_name,
            channel=campaign.channel,
            type="alert",
            priority="medium",
            headline=f"Low click-through rate on {campaign.campaign_name}",
            detail=(
                f"CTR is {m.ctr}% across {campaign.impressions:,} impressions — below a healthy "
                "1% benchmark. The ad creative or audience targeting likely needs a refresh."
            ),
            potential_impact="Even a 1pt CTR lift meaningfully cuts cost per click",
            action="Refresh ad creative or targeting",
        )

    # 3. Getting clicks but not converting — landing page / offer issue.
    if campaign.clicks >= MIN_CLICKS_FOR_CVR_SIGNAL and m.cvr < LOW_CVR_THRESHOLD:
        return Recommendation(
            id=f"{campaign.id}-optimize",
            campaign_id=campaign.id,
            campaign_name=campaign.campaign_name,
            channel=campaign.channel,
            type="optimize",
            priority="medium",
            headline=f"{campaign.campaign_name} traffic isn't converting",
            detail=(
                f"{campaign.clicks:,} clicks are only converting at {m.cvr}%. Traffic quality "
                "looks fine — check the landing page experience, offer clarity, or checkout flow."
            ),
            potential_impact="Even a 1pt CVR lift adds meaningful conversions at no extra spend",
            action="Review landing page & offer",
        )

    # 4. Strong performer — worth scaling.
    if m.roi >= STRONG_ROI_THRESHOLD:
        upside = campaign.revenue * 0.25
        return Recommendation(
            id=f"{campaign.id}-increase",
            campaign_id=campaign.id,
            campaign_name=campaign.campaign_name,
            channel=campaign.channel,
            type="increase",
            priority="high",
            headline=f"{campaign.campaign_name} is a top performer — scale it up",
            detail=(
                f"This campaign is returning {m.roi}% ROI ({m.budget_efficiency}x revenue on "
                f"spend). Increasing its budget is likely to bring more profitable revenue."
            ),
            potential_impact=f"Could add ~{_fmt_currency(upside)} at a similar ROI",
            action="Increase budget by ~20%",
        )

    return None  # healthy, no strong signal either way — nothing actionable to surface


def generate_recommendations(campaigns: list[Campaign]) -> list[Recommendation]:
    recommendations = [r for r in (_build_recommendation(c) for c in campaigns) if r is not None]
    recommendations.sort(key=lambda r: (PRIORITY_ORDER[r.priority], -r.campaign_id))
    return recommendations[:MAX_RECOMMENDATIONS]
