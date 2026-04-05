# Changelog

## [0.2.0] — 2026-04-05

### Added
- **Pagination** — results paginate at 25 per page; page resets to 1 on any filter change
  - `usePagination` hook with `resetKey` pattern for declarative reset
  - `Pagination` component with sliding page-window, prev/next controls, "Showing X–Y of Z" label
  - `aria-current="page"` on active page button; all controls are keyboard-accessible
- **Filter by facility type** — new dropdown for Truck / Push Cart (added to `FilterParams` and `SearchState`)
- **TypeBadge** in table — color-coded pill (blue for Truck, purple for Push Cart) with inline SVG icon
- **Custom food-items tooltip** — portal-based `Tooltip` component renders to `document.body` to escape `overflow-x-auto` table wrapper; triggers on hover of truncated food-items cells (> 45 chars); shows full text with dark floating panel and arrow indicator
- **"Clear filters" button** — appears when any filter is active; shows active filter count badge
- **Redesigned UI**:
  - Header: indigo→violet gradient with icon and tagline
  - Search card: input icons (search icon, location pin), 4-column responsive grid
  - Table: uppercase tracking column headers, indigo row hover, type badge column
  - Empty state: SVG icon + helpful contextual copy
  - Loading state: centered spinner replacing inline layout
  - Error banner: icon + structured error details

### Changed
- `SearchState` extended with `facilityType` field (previously 3 fields, now 4)
- `FilterParams` extended with `facilityType` — exact match, case-insensitive
- `INITIAL_SEARCH` moved from `App.tsx` to `SearchControls.tsx` (single source of truth for reset)
- `FacilityTable` no longer owns all facilities — receives only the current page's slice from App
- `App.tsx` wires `usePagination` between filtered results and table render

### Tests added
- `usePagination.test.ts` — 9 unit tests (first page, totalPages, page 2, last page, clamping, reset on key change, empty, exact-size)
- `filterFacilities.test.ts` — 2 new tests for facilityType filter (exact match, case-insensitive)
- `App.test.tsx` — 7 new integration tests: filter by type, clear filters, pagination visible, first-page range, next-page navigation, no pagination for single page, page-reset on filter change

---

## [0.1.0] — 2026-04-04

### Added
- Project scaffold: Vite 5 + React 18 + TypeScript (`react-ts` template)
- Tailwind CSS v3 with PostCSS configuration
- Vitest v2 + happy-dom + React Testing Library test setup
- `Facility` TypeScript interface and `FACILITY_STATUSES` constant (`src/types/facility.ts`)
- `parseFacility` — maps PapaParse CSV row to typed `Facility` (`src/lib/parseFacility.ts`)
- `filterFacilities` — pure function filtering by applicant, street, status (`src/lib/filterFacilities.ts`)
- 12 unit tests for `filterFacilities`
- `useFacilityData` hook — fetches and parses CSV, returns `{ data, loading, error }`
- `StatusBadge`, `EmptyState`, `SearchControls`, `FacilityTable` components
- `App.tsx` — full wiring with loading spinner and error banner
- 8 integration tests for App
- `Mobile_Food_Facility_Permit.csv` served from `public/`
- Documentation: `README.md`, `DECISIONS.md`, `IMPLEMENTATION_LOG.md`, `CHANGELOG.md`

### Fixed
- Downgraded Vite scaffold to v5, Vitest to v2, replaced jsdom with happy-dom for Node 20.11.1 compatibility
- Restored `README.md` after Vite scaffold overwrote it

---

_This changelog follows a simplified [Keep a Changelog](https://keepachangelog.com/) format._
