from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.campaign import Campaign
from app.schemas.ml import MLStatus, PredictionRequest, PredictionResponse
from app.services.ml_service import (
    MIN_ROWS_FOR_CV,
    MIN_ROWS_FOR_PREDICTION,
    InsufficientDataError,
    predict_campaign_outcome,
)

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


def _fetch_campaigns(dataset_id: str | None, db: Session) -> list[Campaign]:
    stmt = select(Campaign)
    if dataset_id:
        stmt = stmt.where(Campaign.dataset_id == dataset_id)
    return list(db.execute(stmt).scalars().all())


@router.get("/status", response_model=MLStatus)
def ml_status(dataset_id: str | None = Query(None), db: Session = Depends(get_db)):
    n = len(_fetch_campaigns(dataset_id, db))
    ready = n >= MIN_ROWS_FOR_PREDICTION

    if not ready:
        message = f"Upload at least {MIN_ROWS_FOR_PREDICTION} campaigns to unlock predictions (currently {n})."
    elif n < MIN_ROWS_FOR_CV:
        message = f"{n} campaigns available — predictions will be low-confidence until you have {MIN_ROWS_FOR_CV}+."
    else:
        message = f"{n} campaigns available — enough data for a reliable prediction."

    return MLStatus(ready=ready, sample_size=n, min_required=MIN_ROWS_FOR_PREDICTION, message=message)


@router.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest, db: Session = Depends(get_db)):
    campaigns = _fetch_campaigns(payload.dataset_id, db)
    try:
        result = predict_campaign_outcome(campaigns, payload.channel, payload.budget)
    except InsufficientDataError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return PredictionResponse(**result)
