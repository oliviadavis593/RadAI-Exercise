# SF Food Facility Finder

A React application for searching and filtering San Francisco mobile food facility permits.

## Problem

The SF Open Data portal publishes a CSV of ~498 mobile food vendor permits. The goal is to make that dataset searchable: find a vendor by name, find vendors on a given street, filter by permit status, filter by facility type.

## Solution

A fully client-side React app. The CSV is bundled as a static asset, parsed in the browser on load, and filtered in memory. No backend, no API calls, no infrastructure.

This is the correct call for this dataset size. It keeps the architecture simple, the deployment trivial, and the behavior fully testable without mocking network calls.

## Running the app

```bash
npm install
npm run dev
# opens at http://localhost:5173
```

## Running tests

```bash
npm test
# with coverage:
npm run coverage
```

## Features

- **Search by applicant name** — partial, case-insensitive
- **Search by street** — partial match on Address field
- **Filter by permit status** — APPROVED, EXPIRED, REQUESTED, SUSPEND, ISSUED
- **Filter by facility type** — Truck or Push Cart
- **Pagination** — 25 results per page; resets to page 1 on any filter change
- **Food items tooltip** — truncated cells show full text on hover via a portal tooltip (escapes table overflow)
- **Clear all filters** — single button, appears when any filter is active; shows active count badge
- **Loading, empty, and error states** — all covered with accessible roles

## Architecture

```
src/
  types/facility.ts          # Facility interface, status/type constants
  lib/
    filterFacilities.ts      # Pure filter function (4 axes)
    parseFacility.ts         # CSV row → Facility
  hooks/
    useFacilityData.ts       # Fetch + PapaParse, returns { data, loading, error }
    usePagination.ts         # Paginate any array; resets on resetKey change
  components/
    SearchControls.tsx       # 4-field filter UI with icons and clear button
    FacilityTable.tsx        # Table with TypeBadge and FoodItemsCell tooltip
    StatusBadge.tsx          # Color-coded status pill
    Tooltip.tsx              # Portal-based tooltip (escapes overflow clipping)
    Pagination.tsx           # Sliding page window with prev/next
    EmptyState.tsx           # SVG icon + context-aware message
  App.tsx                    # Wires hook → filter → paginate → render
```

## Technical Decisions

**React + TypeScript (Vite)**
Vite starts faster and produces smaller bundles than CRA with no meaningful config overhead. TypeScript catches column-name and type mismatches early — useful when mapping an external CSV schema.

**PapaParse for CSV parsing**
Handles quoted fields correctly (a raw `split(',')` breaks on addresses with embedded commas). Small library with a clean typed API.

**Tailwind CSS v3**
Fast to write in a time-boxed context. Styling is co-located with markup — a reviewer can read a component and understand its appearance without context-switching. Pinned to v3 over v4 because the ecosystem tooling (PostCSS, IntelliSense) is more mature.

**useState + useMemo, no store**
~498 records filtered synchronously is ~1ms. Three to four filter fields driving one derived list is exactly what `useMemo` is for. A Redux store would be pure overhead.

**Pagination via `usePagination` + `resetKey`**
Pagination state lives in a hook that accepts a `resetKey`. When the search state object changes, the hook's `useEffect` fires and resets to page 1. No imperative calls, no scattered `setPage(1)` at each filter change site.

**Portal-based Tooltip**
The table wrapper uses `overflow-x-auto` which clips `position: absolute` children. A React portal renders to `document.body` and positions with `position: fixed` using the trigger element's `getBoundingClientRect()`. This escapes all clipping ancestors without a third-party library.

**Results table, not cards**
A table is the right semantic element for structured comparative data. It supports keyboard navigation out of the box and is screen-reader friendly.

**Status and Type as `<select>` dropdowns**
Both are finite known sets. Dropdowns prevent typos, communicate the available options, and produce exact matches.

## What I'd do with more time

- **Map view** — every row has Latitude/Longitude; a Leaflet/Mapbox layer would be a strong visual addition
- **URL-encoded filter state** — encode search params in the URL so searches are shareable and survive browser refresh
- **Debounced inputs** — filters on every keystroke; fine at 498 rows; important at 50k
- **Column sorting** — click table headers to sort by applicant, status, expiration
- **Accessibility audit** — keyboard focus rings and screen reader labels are present but a full audit would reveal gaps
- **Virtual scrolling** — replace pagination with windowed rendering for very large datasets

## What I left out

- **Backend / API layer** — not needed at this scale; would add latency and infra for no benefit
- **Authentication** — no user data
- **Multi-select filters** — single-select per axis is sufficient for the stated requirements

## Scaling concerns

If this dataset grew to hundreds of thousands of rows:
- Move filtering to a backend with a proper index (PostgreSQL trigram index handles partial-string search well)
- Add cursor-based pagination to the API
- Consider Typesense or Elasticsearch for full-text across FoodItems
- The frontend architecture would not change materially — replace `filterFacilities` + `usePagination` with an API call that returns pre-filtered, pre-paginated results

## Dataset notes

- 498 permit records (SF Open Data, April 2025 snapshot)
- Status values: APPROVED, EXPIRED, REQUESTED, SUSPEND, ISSUED
- FacilityType: Truck (~73%), Push Cart (~7%), remainder unknown/empty
- Latitude/Longitude present on most rows; some are empty
