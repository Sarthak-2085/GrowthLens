import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.routes import analytics, campaigns, health, ml

logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("growthlens")

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url=f"{settings.api_prefix}/docs",
    redoc_url=f"{settings.api_prefix}/redoc",
    openapi_url=f"{settings.api_prefix}/openapi.json",
)

# Compresses JSON/CSV responses over ~500 bytes — meaningful for campaign
# lists and CSV exports, free (built into Starlette, no new dependency).
app.add_middleware(GZipMiddleware, minimum_size=500)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # In production (debug=False) never leak internal tracebacks to the
    # client — log them server-side (Render captures stdout for free) and
    # return a generic message instead.
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    if settings.debug:
        raise exc
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    logger.info(
        "GrowthLens API started — debug=%s, cors_origins=%s", settings.debug, settings.cors_origins_list
    )


app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(campaigns.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)
app.include_router(ml.router, prefix=settings.api_prefix)


if __name__ == "__main__":
    import uvicorn

    # Render (and most hosts) inject PORT — honor it if present, else fall
    # back to the configured port for local runs.
    port = int(os.environ.get("PORT", settings.port))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=settings.debug)
