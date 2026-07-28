from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check() -> dict:
    return {
        "status": "ok",
        "service": "GrowthLens API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
