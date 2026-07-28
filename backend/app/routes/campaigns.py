import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.campaign import Campaign, Dataset
from app.schemas.campaign import (
    CampaignCreate,
    CampaignOut,
    CampaignUpdate,
    DatasetOut,
    RowError,
    UploadResponse,
)
from app.services.csv_service import CsvValidationError, parse_campaign_csv

router = APIRouter(tags=["Campaigns"])

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5MB — plenty for SMB-scale campaign CSVs


# ---------- Upload ----------

@router.post("/upload", response_model=UploadResponse)
async def upload_campaigns(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 5MB).")
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        valid_rows, row_errors = parse_campaign_csv(contents)
    except CsvValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    dataset = Dataset(id=uuid.uuid4().hex, filename=file.filename, row_count=len(valid_rows))
    db.add(dataset)
    db.flush()  # get dataset.id populated before attaching campaigns

    db.add_all(Campaign(dataset_id=dataset.id, **row) for row in valid_rows)
    db.commit()
    db.refresh(dataset)

    return UploadResponse(
        dataset=DatasetOut.model_validate(dataset),
        inserted=len(valid_rows),
        skipped=len(row_errors),
        errors=[RowError(**e) for e in row_errors],
    )


# ---------- Datasets ----------

@router.get("/datasets", response_model=list[DatasetOut])
def list_datasets(db: Session = Depends(get_db)):
    stmt = select(Dataset).order_by(Dataset.uploaded_at.desc())
    return db.execute(stmt).scalars().all()


@router.delete("/datasets/{dataset_id}", status_code=204)
def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    db.delete(dataset)  # cascades to its campaigns
    db.commit()


# ---------- Campaign CRUD ----------

@router.get("/campaigns", response_model=list[CampaignOut])
def list_campaigns(
    dataset_id: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    stmt = select(Campaign)
    if dataset_id:
        stmt = stmt.where(Campaign.dataset_id == dataset_id)
    stmt = stmt.order_by(Campaign.created_at.desc()).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


@router.get("/campaigns/{campaign_id}", response_model=CampaignOut)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    return campaign


@router.post("/campaigns", response_model=CampaignOut, status_code=201)
def create_campaign(
    payload: CampaignCreate,
    dataset_id: str | None = Query(None, description="Attach to an existing dataset; omit to create a manual entry"),
    db: Session = Depends(get_db),
):
    if dataset_id:
        dataset = db.get(Dataset, dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found.")
    else:
        dataset = Dataset(id=uuid.uuid4().hex, filename="manual-entry", row_count=0)
        db.add(dataset)
        db.flush()

    campaign = Campaign(dataset_id=dataset.id, **payload.model_dump())
    dataset.row_count += 1
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.put("/campaigns/{campaign_id}", response_model=CampaignOut)
def update_campaign(campaign_id: int, payload: CampaignUpdate, db: Session = Depends(get_db)):
    campaign = db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(campaign, key, value)

    db.commit()
    db.refresh(campaign)
    return campaign


@router.delete("/campaigns/{campaign_id}", status_code=204)
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    db.delete(campaign)
    db.commit()
