# GrowthLens — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind CSS dashboard for GrowthLens,
an AI-powered marketing decision intelligence platform. Talks to the
[FastAPI backend](../backend/README.md) over a REST API — no data lives in
this app itself.

## Local setup
```bash
npm install
cp .env .env.local        # or edit .env directly for local dev
npm run dev
```
Open [http://localhost:4028](http://localhost:4028). Requires the backend
running at the URL set in `NEXT_PUBLIC_API_URL` (defaults to
`http://localhost:8001`) — most pages will show an error/empty state without it.

## Environment variables
| Variable | Local dev | Production (Vercel) |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8001` | Your deployed Render backend URL |

`NEXT_PUBLIC_*` vars are public by Next.js convention (bundled into client
JS) — fine here since it's just a URL, not a secret.

## Project structure
```
src/
  app/
    page.tsx                  Dashboard (KPIs, charts, recommendations, simulator)
    analytics/                 Full campaign table: search/filter/sort/pagination
    upload-data/                 CSV upload + validation UI
    reports/                      PDF (browser print) + CSV export
    campaign-insights/              ⚠️ still mock data, not yet wired to the backend
    components/                       Shared dashboard components + data providers
      CampaignsProvider.tsx            Fetches /api/campaigns once, shares via context
      AnalyticsProvider.tsx             Fetches analytics summary + recommendations once
    error.tsx                             App-wide error boundary
    not-found.tsx                          404 page
  lib/
    api.ts                                    Typed fetch client for every backend endpoint
    metrics.ts                                 ROI/CTR/CVR/CPC/CPA calculations, formatting
  components/ui/                                Design system primitives (MetricCard, EmptyState, etc.)
```

## Data flow
Each page that needs live data wraps itself in `CampaignsProvider` (and
`AnalyticsProvider` where relevant) in its own `page.tsx` — there's no global
provider in the root layout. This means each page fetches fresh on
navigation rather than sharing stale state, which matters more than the
extra request at this data scale.

## Known gaps
- **`campaign-insights` page is still 100% mock data** — never wired to the
  real backend. Every other page (`/`, `/analytics`, `/upload-data`,
  `/reports`) is real.
- **No authentication** — anything deployed here is publicly readable.
  `robots: noindex` is set so it won't be search-indexed, but that's not
  security.
- **CSV column matching is exact** (case-insensitive) — a file with `Cost`
  instead of `budget` won't be recognized. A column-mapping UI would fix
  this; not yet built.

## Scripts
- `npm run dev` — dev server, port 4028
- `npm run build` — production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)

## Deployment (Vercel)
- Root directory: `GrowthLens/`
- Env var: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
- Framework preset: Next.js (auto-detected)
