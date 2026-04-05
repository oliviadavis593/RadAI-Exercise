# Changelog

## [0.3.0] — 2026-04-05

### Added
- **Backend API** (`backend/`) — standalone Express + TypeScript server
  - `GET /api/facilities` — paginated search by applicant, street, status, facilityType
  - `GET /api/facilities/nearest` — 5 nearest by lat/lng; defaults to APPROVED; `status=` for all
  - `GET /health` — liveness check
  - Swagger UI at `/api-docs`; raw OpenAPI JSON at `/api/openapi.json`
  - 26 tests: 5 unit (distance), 21 route (supertest)
- **Frontend: Near Me tab** — browser geolocation + in-browser Haversine → 5 nearest APPROVED facilities (toggle for all statuses)
- **`src/lib/distance.ts`** — Haversine formula (5 unit tests)
- **`src/lib/findNearest.ts`** — nearest-N pure function (8 unit tests)
- **`src/components/NearestFacilities.tsx`** — location prompt, loading state, ranked results table with formatted distance
- **Tab navigation** in App header — Search | Near Me
- **`docker-compose.yml`** — runs frontend (port 80) and backend (port 3001) together
- **`Dockerfile`** (root) — multi-stage frontend build with nginx
- **`backend/Dockerfile`** — Node 20 Alpine backend image
- **`nginx.conf`** — SPA fallback + asset caching
- **`NearestFacility`** interface in `src/types/facility.ts`

### Changed
- `vite.config.ts` — added `exclude: ['backend/**']` to prevent Vitest scanning Jest tests
- README rewritten to match exercise format (problem/solution, technical decisions, full critique section)
- DECISIONS.md updated with D13 (Haversine), D14 (in-browser nearest)

### Removed
- `src/App.css` — unused after App.tsx rewrite
- `src/assets/react.svg` — unused scaffold file
- `public/vite.svg` — unused scaffold file

## [0.2.0] — 2026-04-05

### Added
- Pagination (`usePagination` hook + `Pagination` component)
- Filter by facility type (Truck / Push Cart)
- Portal-based food-items tooltip (`Tooltip.tsx`)
- "Clear filters" button with active-filter count badge
- Full UI redesign (gradient header, input icons, TypeBadge, EmptyState SVG)

### Changed
- `SearchState` / `FilterParams` extended with `facilityType`
- `FacilityTable` receives only the current page's slice from App

## [0.1.0] — 2026-04-04

### Added
- Vite 5 + React 18 + TypeScript project scaffold
- Tailwind CSS v3, Vitest v2 + happy-dom + React Testing Library
- `Facility` type, `parseFacility`, `useFacilityData` hook
- `filterFacilities` pure function
- `SearchControls`, `FacilityTable`, `StatusBadge`, `EmptyState` components
- Initial test suite (20 tests)
- Documentation: README, DECISIONS, IMPLEMENTATION_LOG, CHANGELOG

---

_Follows [Keep a Changelog](https://keepachangelog.com/) format._
