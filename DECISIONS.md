# Architecture Decisions

## D1 — Client-side only data handling (frontend)

**Decision:** All search and filter operations in the frontend run in-browser against the in-memory parsed CSV. No API call for search.

**Why:** 498 rows filtered in JavaScript takes under 1ms. A network round-trip to a backend would add 50–200ms with zero user-facing benefit. The frontend is independently deployable with no backend dependency.

**Alternatives considered:** Backend API for all queries — correct choice at 50k+ rows, overkill here.

**Tradeoff:** Client-side filtering does not scale to large datasets. Documented in README scaling section with the correct migration path (PostgreSQL trigram index + paginated API).


## D2 — CSV bundled as static asset

**Decision:** CSV served from `public/` and fetched at app load.

**Why:** Self-contained demo. No external URL dependency that could 404 during a review. Works offline.

**Tradeoff:** Data is a static snapshot. Production would need periodic ETL or a live API connection.

## D3 — PapaParse for CSV parsing

**Decision:** PapaParse over a hand-rolled CSV split.

**Why:** SF address fields contain commas inside quoted fields. `row.split(',')` produces wrong column counts. PapaParse handles RFC 4180 quoting correctly in both frontend and backend.

**Tradeoff:** ~30KB bundle addition. Correct by default.

## D4 — Vite over Create React App

**Decision:** `npm create vite` with React + TypeScript template.

**Why:** CRA is unmaintained. Vite starts in ~300ms; Vitest integrates natively.

**Tradeoff:** None meaningful.

## D5 — Tailwind CSS v3

**Decision:** Tailwind utility classes. Pinned to v3.

**Why:** Fast to write. Styles are co-located with markup. Pinned to v3 because v4 has a different config model and less mature ecosystem tooling.

**Tradeoff:** Class strings can be long. Mitigated by keeping components small.

## D6 — useState + useMemo, no state library

**Decision:** Filter state in `App.tsx` as `useState`, results derived via `useMemo`.

**Why:** Four filter fields → one derived list. This is exactly the pattern `useMemo` was designed for.

**Tradeoff:** If the app gains cross-page state or many more filter axes, `useReducer` or a store would be the right upgrade.

## D7 — Semantic `<table>` for results

**Decision:** HTML table, not a card grid.

**Why:** Correct semantic element for structured comparative data. Supports keyboard navigation and screen readers out of the box.

**Tradeoff:** Requires `overflow-x-auto` for mobile. Applied on the wrapper div.

## D8 — Status and Type as `<select>` dropdowns

**Decision:** Dropdowns with predefined options, not free-text.

**Why:** Both are finite known sets. Dropdowns prevent typos and make options discoverable.

**Tradeoff:** Single-select only. Multi-select would require a checkbox group — not in scope.

## D9 — happy-dom over jsdom

**Decision:** `happy-dom` as the Vitest DOM environment.

**Why:** jsdom v29 has a transitive ESM-only dependency that breaks under Node 20.11.1's CJS loader. happy-dom has no such issue.

**Tradeoff:** happy-dom has subtle behavioral differences from a real browser — none that affect these tests.

## D10 — Vitest v2, Jest for backend

**Decision:** Vitest v2 for frontend (Node 20.11.1 compatibility); standard Jest for backend (no DOM environment needed).

**Why:** Vitest v4 requires `node:util.styleText` added in Node 20.12.0. Jest runs fine under Node 20.x. Using different test runners per concern is appropriate — frontend needs DOM emulation, backend tests are pure Node.

**Tradeoff:** Two test commands (`npm test` at root, `npm test` in `backend/`). Documented clearly in README.

## D11 — Pagination with `resetKey` pattern

**Decision:** `usePagination(items, pageSize, resetKey)` resets to page 1 when `resetKey` changes.

**Why:** The alternative — calling `setPage(1)` at each filter change site — is imperative and easy to miss. The `resetKey` pattern is declarative: pass the search state object, hook handles the reset.

**Tradeoff:** `useEffect` for the reset fires one tick after the filter change. Invisible at this dataset size.

## D12 — Portal-based Tooltip

**Decision:** Food-items tooltip renders via `createPortal` to `document.body`, positioned with `position: fixed` + `getBoundingClientRect()`.

**Why:** The table wrapper uses `overflow-x-auto`, which clips `position: absolute` children. A portal escapes all ancestor overflow constraints.

**Alternatives considered:** Native `title` attribute (no style control, 1s delay), third-party tooltip library (dependency for ~40 lines of code).

**Tradeoff:** Tooltip position is captured on `mouseenter` and does not update on scroll — acceptable edge case for a data table.

## D13 — Haversine formula for distance, no external mapping API

**Decision:** Implement Haversine in-house as a pure function in both frontend and backend.

**Why:** Haversine is accurate to ~0.5% at city scale — well within the precision needed for "nearest 5 trucks." No API key, no network call, no third-party SDK. The formula is 10 lines and trivially unit-testable.

**Alternatives considered:** Google Maps Distance Matrix API — introduces cost, rate limits, and network dependency. Overkill for a point-to-point distance sort.

**Tradeoff:** Haversine does not account for roads or walking paths. A routing API would give "nearest by walking distance" rather than "nearest as the crow flies." For finding the closest food truck, straight-line distance is a reasonable proxy.

## D14 — Nearest trucks computed in-browser (frontend)

**Decision:** The frontend computes nearest trucks using in-memory data + Haversine, rather than calling the backend API.

**Why:** The frontend already has all 498 rows in memory from the CSV load. Computing distances in-browser is ~0ms and keeps the frontend independently deployable. The backend provides the same feature as a standalone API — both demonstrate the capability through different interfaces.

**Alternatives considered:** Frontend calls `GET /api/facilities/nearest` — shows full-stack integration but creates a runtime dependency on the backend being available.

**Tradeoff:** The two implementations are similar code duplicated across the boundary. This is intentional: each service is self-contained and can be used independently. A shared npm package would eliminate the duplication but adds build infrastructure not warranted for this project.

## D15 — Express for backend API

**Decision:** Express v4 + TypeScript.

**Why:** Minimal, well-understood, widely documented. No database needed — CSV loaded into memory at startup. All endpoints are stateless.

**Alternatives considered:**
- Fastify — faster, but Express is more familiar to more reviewers
- NestJS — appropriate for large teams; adds significant framework overhead
- Next.js API routes — couples frontend and backend into one process; harder to deploy independently

**Tradeoff:** Express has no built-in request validation. Query params are cast manually in the route handler. At this scale, that is acceptable; for a production API, `zod` or `joi` would be added.

## D16 — Swagger JSDoc for API documentation

**Decision:** `swagger-jsdoc` annotations in route files, served via `swagger-ui-express`.

**Why:** Documentation is co-located with the code it describes, which reduces drift. Generates both an interactive UI (`/api-docs`) and a machine-readable spec (`/api/openapi.json`).

**Alternatives considered:** Separate YAML spec file — correct for large APIs; tends to drift from implementation without tooling to enforce consistency.

**Tradeoff:** JSDoc annotations in route files add visual noise. Acceptable for the number of endpoints here.
