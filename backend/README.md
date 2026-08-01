# GrowthLens Backend

FastAPI backend for GrowthLens — CSV upload, campaign CRUD, analytics engine,
rule-based recommendations, and ML-based campaign outcome prediction.

## Stack
FastAPI · SQLAlchemy (SQLite) · Pandas · scikit-learn · Pydantic Settings

## Local setup
```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```
Verify: `curl http://localhost:8001/api/health` → `{"status":"ok",...}`
Interactive docs: `http://localhost:8001/api/docs`

## Project structure
```
app/
  main.py            FastAPI app, middleware, global exception handler
  config.py           Settings (env-driven, see .env.example)
  database.py          SQLAlchemy engine/session, SQLite WAL mode
  models/campaign.py    Dataset + Campaign ORM models
  schemas/               Pydantic request/response models
  routes/                 API endpoints, one file per resource
  services/                 Business logic (CSV parsing, analytics, recommendations, ML)
data/                          SQLite file lives here (gitignored)
```

## API surface
```
GET    /api/health
POST   /api/upload                          CSV upload (multipart)
GET    /api/datasets
DELETE /api/datasets/{id}                    cascades to its campaigns
GET    /api/campaigns?dataset_id=&skip=&limit=
GET    /api/campaigns/{id}
POST   /api/campaigns
PUT    /api/campaigns/{id}
DELETE /api/campaigns/{id}
GET    /api/analytics/summary?dataset_id=    per-campaign metrics + portfolio summary
GET    /api/analytics/recommendations?dataset_id=
GET    /api/ml/status?dataset_id=            readiness gate (min 8 campaigns)
POST   /api/ml/predict                       { channel, budget, dataset_id? }
```
Full interactive reference at `/api/docs` once running.

## CSV format
Required columns: `campaign, budget, clicks, impressions, conversions, revenue`
Optional (defaulted if absent): `channel` (→"Other"), `status` (→"active"),
`start_date`, `end_date`. Bad individual rows are skipped with a reason, not
a hard failure, unless every row is invalid.

## Key design notes
- **No separate "spend" field** — `budget` is used as the spend proxy
  throughout (ROI, CPC, CPA). Documented in `analytics_service.py`.
- **ML predictions require 8+ campaigns**, confidence is forced to `"low"`
  below 15 (not enough data for cross-validation). See `ml_service.py`.
- **AI recommendations are rule-based**, not an LLM call — explicit
  thresholds in `recommendations_service.py`, one recommendation per
  campaign (highest-severity match) to avoid noise.
- **SQLite + WAL mode**, single file at `data/growthlens.db`.
  ⚠️ **Render's free tier has no persistent disk** — this file can be wiped
  on redeploy/restart. Fine for MVP use (re-upload after a redeploy); for
  real persistence, migrate to a hosted Postgres/Turso free tier.
- **No authentication.** Anyone with the deployed URL can read/write all
  data. Not in scope of any phase so far — add before real customer data
  goes in.

## Linting
```bash
pip install -r requirements-dev.txt
ruff check app/
```
`B008` (Depends-in-default) is intentionally ignored — it's FastAPI's
standard dependency-injection pattern, not a bug.

## Deployment (Render)
- Root directory: `backend/`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env vars: `DEBUG=False`, `CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:4028`
- Set up a free [UptimeRobot](https://uptimerobot.com) HTTP monitor against
  `/api/health` every 5 minutes to prevent cold-start sleep.
