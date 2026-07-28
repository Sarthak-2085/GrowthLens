from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CampaignBase(BaseModel):
    campaign_name: str = Field(..., min_length=1)
    budget: float = Field(..., ge=0)
    clicks: int = Field(..., ge=0)
    impressions: int = Field(..., ge=0)
    conversions: int = Field(..., ge=0)
    revenue: float = Field(..., ge=0)


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(BaseModel):
    campaign_name: str | None = Field(None, min_length=1)
    budget: float | None = Field(None, ge=0)
    clicks: int | None = Field(None, ge=0)
    impressions: int | None = Field(None, ge=0)
    conversions: int | None = Field(None, ge=0)
    revenue: float | None = Field(None, ge=0)


class CampaignOut(CampaignBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dataset_id: str
    created_at: datetime


class DatasetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    row_count: int
    uploaded_at: datetime


class RowError(BaseModel):
    row: int
    reason: str


class UploadResponse(BaseModel):
    dataset: DatasetOut
    inserted: int
    skipped: int
    errors: list[RowError]
