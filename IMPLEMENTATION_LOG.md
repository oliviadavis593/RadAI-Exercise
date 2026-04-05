# Implementation Log

## Step 1 — Dataset analysis and architecture design
**Date:** 2026-04-04
**Task:** Analyze CSV schema, define implementation strategy, scaffold documentation
**Files changed:** README.md, IMPLEMENTATION_LOG.md, DECISIONS.md, CHANGELOG.md

---

## Step 2 — Project scaffold
**Date:** 2026-04-04
**Task:** Initialize Vite 5 + React + TypeScript; install Tailwind v3, Vitest v2, happy-dom
**Compatibility fixes:** create-vite pinned to v5, Vitest pinned to v2, jsdom → happy-dom (all for Node 20.11.1)
**Files changed:** package.json, vite.config.ts, tailwind.config.js, postcss.config.js, src/index.css, src/test/setup.ts

---

## Step 3 — Types and data layer
**Date:** 2026-04-04
**Task:** Define `Facility` type, `parseFacility`, `useFacilityData` hook
**Files changed:** src/types/facility.ts, src/lib/parseFacility.ts, src/hooks/useFacilityData.ts

---

## Step 4 — Filter logic and unit tests
**Date:** 2026-04-04
**Task:** `filterFacilities` pure function + 12 unit tests
**Files changed:** src/lib/filterFacilities.ts, src/lib/filterFacilities.test.ts

---

## Step 5 — Initial UI components
**Date:** 2026-04-04
**Task:** SearchControls, FacilityTable, StatusBadge, EmptyState
**Files changed:** all four component files

---

## Step 6 — App wiring and integration tests
**Date:** 2026-04-04
**Task:** Wire everything in App.tsx; 8 integration tests
**Files changed:** src/App.tsx, src/App.test.tsx

---

## Step 7 — Pagination, type filter, tooltip, redesign
**Date:** 2026-04-05
**Task:** Add pagination, facility-type filter, portal tooltip, redesigned UI; extend tests to 38
**Files changed:** all component files, src/hooks/usePagination.ts + test, src/components/Tooltip.tsx + Pagination.tsx, src/App.tsx, src/App.test.tsx

---

## Step 8 — Full-stack completion: backend + nearest feature
**Date:** 2026-04-05
**Task:** Build Express API, add nearest-trucks feature to frontend, Docker, cleanup

**Scope:**
1. **Cleanup** — deleted `src/App.css`, `src/assets/react.svg`, `public/vite.svg`
2. **Frontend additions:**
   - `src/types/facility.ts` — added `NearestFacility` interface
   - `src/lib/distance.ts` — Haversine formula (5 tests in `distance.test.ts`)
   - `src/lib/findNearest.ts` — nearest-N pure function (8 tests in `findNearest.test.ts`)
   - `src/components/NearestFacilities.tsx` — geolocation → in-browser distance → ranked results table
   - `src/App.tsx` — tab bar (Search | Near Me), Near Me view wired to NearestFacilities
   - `src/App.test.tsx` — 4 new Near Me tab tests; total 19 frontend integration tests
   - `vite.config.ts` — added `exclude: ['backend/**']` to prevent Vitest scanning Jest tests

3. **Backend (new — `backend/`):**
   - Express + TypeScript, reads CSV at startup
   - `GET /api/facilities` — paginated search (applicant, street, status, facilityType, page, pageSize)
   - `GET /api/facilities/nearest` — nearest-N by lat/lng; defaults APPROVED; `status=` for all
   - `GET /health` — liveness check
   - Swagger UI at `/api-docs`; raw spec at `/api/openapi.json`
   - 21 route tests (supertest) + 5 distance tests = 26 backend tests
   - All tests pass: `jest` in `backend/`

4. **Docker:**
   - `Dockerfile` (root) — multi-stage Vite build → nginx alpine
   - `backend/Dockerfile` — Node 20 alpine, TypeScript compile, serve
   - `docker-compose.yml` — frontend on :80, backend on :3001, CSV mounted as read-only volume
   - `nginx.conf` — SPA fallback + static asset caching

**Final test counts:**
- Frontend (Vitest): 55 tests across 5 suites — all pass
- Backend (Jest): 26 tests across 2 suites — all pass
- Total: 81 tests

**Files changed:**
- src/types/facility.ts, src/lib/distance.ts + test, src/lib/findNearest.ts + test
- src/components/NearestFacilities.tsx
- src/App.tsx, src/App.test.tsx
- vite.config.ts
- backend/ (all new files)
- Dockerfile, nginx.conf, docker-compose.yml
- README.md, DECISIONS.md, CHANGELOG.md, IMPLEMENTATION_LOG.md

**Open questions / follow-up:**
- The `act()` warning on the loading-state test is benign (testing synchronous initial render)
- Backend Dockerfile COPY for CSV uses relative path — works with `docker-compose` context but not standalone `docker build backend/`; mitigated by the volume mount in docker-compose.yml
