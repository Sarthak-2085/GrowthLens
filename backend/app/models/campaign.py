from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Dataset(Base):
    """One CSV upload. Groups the campaign rows it produced."""

    __tablename__ = "datasets"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    filename: Mapped[str] = mapped_column(String)
    row_count: Mapped[int] = mapped_column(Integer, default=0)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    campaigns: Mapped[list["Campaign"]] = relationship(
        back_populates="dataset",
        cascade="all, delete-orphan",
    )


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dataset_id: Mapped[str] = mapped_column(ForeignKey("datasets.id"), index=True)

    campaign_name: Mapped[str] = mapped_column(String, index=True)
    budget: Mapped[float] = mapped_column(Float)
    clicks: Mapped[int] = mapped_column(Integer)
    impressions: Mapped[int] = mapped_column(Integer)
    conversions: Mapped[int] = mapped_column(Integer)
    revenue: Mapped[float] = mapped_column(Float)

    channel: Mapped[str] = mapped_column(String, default="Other", server_default="Other")
    status: Mapped[str] = mapped_column(String, default="active", server_default="active", index=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    dataset: Mapped["Dataset"] = relationship(back_populates="campaigns")
