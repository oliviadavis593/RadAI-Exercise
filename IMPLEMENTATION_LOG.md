# Implementation Log

## Step 1 — Dataset analysis and architecture design

**Date:** 2026-04-04
**Task:** Analyze CSV schema, define implementation strategy, scaffold documentation
**Reason:** Establish shared understanding of scope and structure before writing any code.

**Findings:**
- 487–498 rows, 29 columns
- Key columns: `Applicant`, `Address`, `Status`, `FacilityType`, `FoodItems`, `Latitude`, `Longitude`
- Status values: APPROVED, EXPIRED, REQUESTED, SUSPEND, ISSUED
- Dataset fits entirely in memory; client-side filtering is viable

**Architecture decision:** Fully client-side React app. CSV bundled in `public/`, parsed with PapaParse, filtered in memory.

**Files changed:** `README.md`, `IMPLEMENTATION_LOG.md`, `DECISIONS.md`, `CHANGELOG.md`

---

## Step 2 — Project scaffold

**Date:** 2026-04-04
**Task:** Initialize Vite 5 + React + TypeScript project, install and configure all dependencies

**Compatibility issues resolved:**
- create-vite latest requires Node ≥ 20.12 → pinned to v5
- Vitest v4 requires Node ≥ 20.12 → pinned to v2
- jsdom v29 has ESM/CJS interop break on Node 20.11 → replaced with happy-dom
- `vite.config.ts` `test` key causes TS error → added `/// <reference types="vitest" />`

**Files changed:** `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `src/test/setup.ts`

---

## Step 3 — Types and data layer

**Date:** 2026-04-04
**Task:** Define `Facility` type, `parseFacility`, `useFacilityData` hook

**Files changed:** `src/types/facility.ts`, `src/lib/parseFacility.ts`, `src/hooks/useFacilityData.ts`

---

## Step 4 — Filter logic and unit tests

**Date:** 2026-04-04
**Task:** Write `filterFacilities` pure function and 12 unit tests

**Filter behavior:** Case-insensitive substring on applicant/street, case-insensitive exact on status, empty = match all, whitespace trimmed.

**Files changed:** `src/lib/filterFacilities.ts`, `src/lib/filterFacilities.test.ts`

---

## Step 5 — UI components

**Date:** 2026-04-04
**Task:** Build SearchControls, FacilityTable, StatusBadge, EmptyState

**Files changed:** all four component files

---

## Step 6 — App wiring and integration tests

**Date:** 2026-04-04
**Task:** Wire everything in App.tsx; write 8 integration tests

**Files changed:** `src/App.tsx`, `src/App.test.tsx`

---

## Step 7 — Final configuration and documentation

**Date:** 2026-04-04
**Task:** TypeScript build fix, CSV recovery, documentation finalization

**Files changed:** `vite.config.ts`, `public/Mobile_Food_Facility_Permit.csv`, all documentation files

---

## Step 8 — Pagination, type filter, design overhaul, tooltip

**Date:** 2026-04-05
**Task:** Add pagination, facility-type filter, portal tooltip, redesigned UI; extend test suite to 38 tests

**Reason:** Required features for commit readiness: pagination, type filter, polished design, food-items tooltip.

**Changes by area:**

**Types/filter:**
- Added `FACILITY_TYPES` constant and `FacilityType` type to `facility.ts`
- Added `facilityType` param to `FilterParams` — exact match, case-insensitive
- Added 2 new type-filter tests in `filterFacilities.test.ts` (now 14 tests)

**Pagination:**
- `usePagination.ts` — hook accepts `(items, pageSize, resetKey)`. `resetKey` change triggers `useEffect` that resets page to 1. Returns `{ pageItems, page, totalPages, totalItems, startIndex, endIndex, setPage }`.
- `usePagination.test.ts` — 9 unit tests covering first page, totalPages calculation, page 2 slice, partial last page, clamping behavior, resetKey-triggered reset, empty dataset, exact-size dataset.
- `Pagination.tsx` — sliding page-window component (`buildPageWindow` function shows first, last, current ±1, ellipsis elsewhere). `aria-current="page"` on active button, `aria-label` on nav and buttons.

**Tooltip:**
- `Tooltip.tsx` — portal-based. `onMouseEnter` captures `getBoundingClientRect()`, stores as `pos` state, renders `createPortal(...)` to `document.body` with `position: fixed`. Portal node only exists while visible (conditional render). Arrow indicator via absolute-positioned div.
- `FoodItemsCell` in `FacilityTable.tsx` — triggers tooltip for food items longer than 45 chars; shorter text renders normally.

**UI redesign:**
- Header: `bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600` with icon, app name, tagline
- SearchControls: 4-column grid, inline SVG icons in inputs (search, location pin), active filter count badge, "Clear filters" button
- FacilityTable: uppercase tracking headers, indigo row hover, TypeBadge (blue truck/purple cart with SVG icons)
- EmptyState: centered SVG icon + contextual copy
- LoadingState: centered large spinner

**Tests added in App.test.tsx:**
- `filters by facility type` — Push Cart only shows Casita Vegana
- `clear filters button resets all fields` — verifies full restore
- `shows pagination controls when results exceed one page` — with 28-row mock
- `first page shows 25 of 28 results` — range string check via `data-testid="results-count"`... wait, that's the results bar. The pagination shows "Showing 1–25"
- `navigating to page 2 shows remaining results` — next button, Vendor 026 appears
- `does not show pagination when all results fit on one page` — 3-row mock
- `resets to page 1 when a filter changes` — navigate to page 2, type a filter, verify page 1 renders

**Files changed:**
- `src/types/facility.ts` — FACILITY_TYPES added
- `src/lib/filterFacilities.ts` — facilityType param
- `src/lib/filterFacilities.test.ts` — 14 tests (was 12)
- `src/hooks/usePagination.ts` — new
- `src/hooks/usePagination.test.ts` — new, 9 tests
- `src/components/Tooltip.tsx` — new
- `src/components/Pagination.tsx` — new
- `src/components/SearchControls.tsx` — redesigned, 4 filters, clear button
- `src/components/FacilityTable.tsx` — redesigned, TypeBadge, FoodItemsCell tooltip
- `src/components/StatusBadge.tsx` — refined ring style
- `src/components/EmptyState.tsx` — SVG icon
- `src/App.tsx` — redesigned header/layout, pagination wired, `data-testid="results-count"`
- `src/App.test.tsx` — 15 tests (was 8)
- `README.md`, `DECISIONS.md`, `CHANGELOG.md` — updated

**Follow-up / open questions:**
- Tooltip position does not update on scroll while hovering (acceptable edge case; noted in DECISIONS.md D12)
- The `act()` warning on the loading-state test is benign — it's checking the initial synchronous render before the async fetch resolves; suppressing it would require `act` wrapping that obscures what the test is actually doing
