# SF Food Facility Finder

A full-stack application for searching San Francisco mobile food facility permits.

## Frontend
| Search Page | Near Me Page |
| :---: | :---: |
| <img width="1728" height="946" alt="Screenshot 2026-04-05 at 12 50 49 PM" src="https://github.com/user-attachments/assets/99d65238-c848-4149-a172-c371d67c8178" /> | <img width="1728" height="737" alt="Screenshot 2026-04-05 at 12 53 48 PM" src="https://github.com/user-attachments/assets/ffafbe58-1e38-4944-8ef3-6d99e0d41a4e" /> |

## Backend

<img width="1728" height="957" alt="Screenshot 2026-04-05 at 1 04 40 PM" src="https://github.com/user-attachments/assets/d5b10f18-006c-49a1-adf8-fce0483690b3" />



## Problem and Solution

The [SF Open Data portal](https://data.sfgov.org/Economy-and-Community/Mobile-Food-Facility-Permit/rqzj-sfat/data) publishes a dataset of ~498 mobile food vendor permits. The goal is to build a searchable application with the following features:

- Search by applicant name (partial match)
- Search by street name (partial match — e.g. "SAN" returns vendors on "SANSOME ST")
- Filter by permit status
- Filter by facility type
- Given a latitude and longitude, find the 5 nearest facilities (default: APPROVED only)

### Solution Architecture

**Frontend** (React + TypeScript): A fully client-side app. The CSV is bundled as a static asset, parsed in the browser with PapaParse, and filtered in memory. No backend call is needed for search or filtering. The "Near Me" feature computes distances in-browser using the Haversine formula on the already-loaded dataset.

**Backend** (Express + TypeScript): A standalone REST API that provides the same operations plus the nearest-facilities endpoint. It reads the CSV at startup and serves filtered, paginated results over HTTP. The frontend and backend are fully independent — neither depends on the other at runtime.

## Technical Decisions

**Client-side data handling (frontend)**
498 rows filtered in JavaScript takes under 1ms. Keeping all data operations in the browser eliminates network latency for the search experience, makes the app deployable without a backend, and simplifies testing (no HTTP mocks needed for filter logic).

**PapaParse for CSV parsing**
SF address fields contain commas inside quoted fields. A naive `split(',')` produces wrong column counts on those rows. PapaParse handles RFC 4180 quoting correctly in both frontend and backend.

**Haversine formula for distance**
Computes great-circle distance with ~0.5% accuracy at city scale — sufficient for "nearest 5 trucks." No external mapping API needed, no API key, no network call. The formula is a pure function that's trivial to unit test.

**React + TypeScript (Vite)**
CRA is unmaintained. Vite starts in ~300ms and integrates with Vitest natively. TypeScript catches column-name mismatches early when mapping an external CSV schema.

**Express + TypeScript (backend)**
Minimal, well-understood framework. No database needed — the dataset is small enough to hold in memory. All endpoints are stateless and idempotent.

**useState + useMemo, no state library**
Four filter fields driving one derived list. `useMemo` handles this exactly. A Redux store would add ~200 lines of boilerplate for no benefit.

**Pagination via `usePagination` with `resetKey`**
Rather than calling `setPage(1)` at every filter change site, the hook accepts a `resetKey`. When that value changes (a new `search` object reference), the hook resets automatically via `useEffect`. This is declarative and keeps the reset logic in one place.

**Portal-based Tooltip**
The table uses `overflow-x-auto`, which clips `position: absolute` children. The tooltip renders to `document.body` via `createPortal` and positions with `position: fixed` + `getBoundingClientRect()`, escaping all ancestor overflow constraints without a third-party library.

**Swagger / OpenAPI documentation**
`swagger-jsdoc` scans JSDoc annotations in the routes file and generates a spec served at `/api-docs` (Swagger UI) and `/api/openapi.json` (raw JSON). API documentation is co-located with the route code, which keeps it from drifting.

## Running the Application

### Frontend only (no backend required)

```bash
npm install
npm run dev
# → http://localhost:5173
```

### Backend only

```bash
cd backend
npm install
npm run dev
# → API docs: http://localhost:3001/api-docs
```

### Both with Docker Compose

```bash
docker-compose up --build
# Frontend → http://localhost:80
# Backend  → http://localhost:3001
# API docs → http://localhost:3001/api-docs
```

---

## Running Tests

### Frontend tests (Vitest + React Testing Library)

```bash
npm test          # run once
npm run coverage  # with coverage report
```

### Backend tests (Jest + supertest)

```bash
cd backend
npm test
```

### Test summary

| Suite | Tool | Tests |
|---|---|---|
| `src/lib/filterFacilities` | Vitest | 14 |
| `src/lib/findNearest` | Vitest | 8 |
| `src/lib/distance` | Vitest | 5 |
| `src/hooks/usePagination` | Vitest | 9 |
| `src/App` (integration) | Vitest + RTL | 19 |
| `backend/tests/facilities` | Jest + supertest | 21 |
| `backend/tests/distance` | Jest | 5 |
| **Total** | | **81** |

## Backend API Reference

Full interactive docs at `http://localhost:3001/api-docs` when the backend is running.

### `GET /api/facilities`

Search and paginate facilities.

| Param | Type | Default | Description |
|---|---|---|---|
| `applicant` | string | — | Partial, case-insensitive match on applicant name |
| `street` | string | — | Partial, case-insensitive match on address |
| `status` | string | — | Exact status (APPROVED, EXPIRED, etc.) |
| `facilityType` | string | — | Exact type (Truck, Push Cart) |
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 25 | Results per page (max 100) |

**Response:** `{ items, total, page, pageSize, totalPages }`

### `GET /api/facilities/nearest`

Find the N nearest facilities to a coordinate.

| Param | Type | Default | Description |
|---|---|---|---|
| `lat` | number | required | Latitude |
| `lng` | number | required | Longitude |
| `limit` | integer | 5 | Max results (max 20) |
| `status` | string | APPROVED | Status filter. Pass empty string for all statuses. |

**Response:** `{ items: [...facility + distanceKm], count }`

## Critique

### What I would have done differently with more time

- **URL-encoded filter state** — encode search params in the query string so searches are shareable and survive browser refresh. This is the single highest-value missing UX feature.
- **Debounced inputs** — filtering fires on every keystroke. At 498 rows this is instant; at 50k rows it would require debouncing.
- **Column sorting** — clicking table headers to sort by applicant name, status, or expiration date is a natural next step.
- **Map view** — every row has latitude/longitude; a Leaflet layer showing permit locations as pins would make the nearest-trucks feature significantly more useful.
- **Backend integration in the frontend** — the frontend currently computes nearest trucks in-browser. Calling the backend API instead would demonstrate the full stack integration, but at 498 rows the in-browser approach is faster and avoids requiring the backend to be running.

### Trade-offs made

- **Client-side vs server-side filtering**: Chose client-side for the search features. This is strictly correct at this dataset size and makes the frontend independently deployable. The trade-off is that it doesn't scale to large datasets — documented under Scaling.
- **No database**: The CSV is loaded into memory at startup. This is correct at ~500 rows but would not work for a dataset that changes frequently or grows large.
- **happy-dom over jsdom**: jsdom v29 has an ESM/CJS interop issue with Node 20.11.1. happy-dom is a lighter alternative with slightly different browser-fidelity characteristics, but nothing that affects these component tests.
- **Vitest v2 over v4**: Vitest v4 requires `node:util.styleText` added in Node 20.12.0. Pinned to v2 for compatibility with Node 20.11.1.

### What I left out

- **Authentication / authorization** — no user data is involved
- **Rate limiting** — the backend has no rate limiting; acceptable for a local demo
- **Request logging** — no access log middleware; would add morgan in production
- **Input sanitization beyond trim** — the filter params are never interpolated into shell commands or SQL, so the only concern is denial of service from very long strings; not addressed
- **Multi-select status/type filters** — single-select per axis is sufficient for the stated requirements
- **Accessibility audit** — `aria-label` and `role` attributes are present but a full WCAG audit would surface gaps

### Scaling concerns

If this dataset grew to hundreds of thousands of rows:

**Frontend**: Replace in-browser filtering with API calls. The component structure doesn't change — swap `filterFacilities` + `usePagination` for a `useSearchAPI` hook that calls the backend with debounced params and handles loading/pagination from the response.

**Backend filtering**: A PostgreSQL `pg_trgm` trigram index handles partial-string search on applicant and address with sub-millisecond response times at millions of rows. Add `EXPLAIN ANALYZE` to verify index usage.

**Nearest-facility search**: PostGIS `ST_DWithin` with a geography column replaces the in-memory Haversine scan. At 500k rows the linear scan is ~50ms; PostGIS reduces this to ~1ms via an R-tree spatial index.

**API layer**: Add cursor-based pagination (keyset pagination) instead of offset pagination. Offset pagination degrades at large page numbers because the database must count and skip rows.

**Caching**: The dataset changes infrequently (permit approvals happen on a bureaucratic schedule). A Redis cache keyed on query params with a 5-minute TTL would handle read-heavy traffic with a trivially small cache.

**Infrastructure**: The current architecture — a single Node process holding data in memory — does not survive restarts gracefully. Move to a stateless API (data in Postgres) behind a load balancer, with the CSV → database ETL running on a schedule.
