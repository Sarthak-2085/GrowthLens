from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.campaign import Campaign
from app.schemas.analytics import AnalyticsSummary, Recommendation
from app.services.analytics_service import compute_analytics_summary
from app.services.recommendations_service import generate_recommendations

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _fetch_campaigns(dataset_id: str | None, db: Session) -> list[Campaign]:
    stmt = select(Campaign)
    if dataset_id:
        stmt = stmt.where(Campaign.dataset_id == dataset_id)
    return list(db.execute(stmt).scalars().all())


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(dataset_id: str | None = Query(None), db: Session = Depends(get_db)):
    campaigns = _fetch_campaigns(dataset_id, db)
    return compute_analytics_summary(campaigns)


@router.get("/recommendations", response_model=list[Recommendation])
def get_recommendations(dataset_id: str | None = Query(None), db: Session = Depends(get_db)):
    campaigns = _fetch_campaigns(dataset_id, db)
    return generate_recommendations(campaigns)
