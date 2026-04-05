# Architecture Decisions

## D1 — Client-side only, no backend

**Decision:** All data loading and filtering happens in the browser. No API server.

**Why:** The dataset is ~498 rows (~80KB CSV). Filtering in JavaScript takes under 1ms. A backend would add network latency, deployment complexity, and zero user-facing benefit at this scale.

**Alternatives considered:**
- Express/Node API serving filtered data — overhead without benefit; harder to test
- Next.js with server components — framework complexity not justified for a single data view

**Tradeoff:** If the dataset grows to tens of thousands of rows, client-side filtering degrades. The fix is an indexed API, but that's a real scaling problem, not a speculative one.

---

## D2 — CSV bundled as a static asset

**Decision:** Copy the CSV into `public/` and fetch it from the local server.

**Why:** Keeps the demo self-contained. No dependency on an external URL that could 404 during a review. Works offline.

**Alternatives considered:**
- Fetch from SF Open Data API — CORS uncertainty and network dependency during review
- Import CSV as JSON via Vite plugin — adds build complexity; PapaParse streaming is cleaner

**Tradeoff:** Data is a static snapshot. Production would need periodic re-fetches or a live API connection.

---

## D3 — PapaParse for CSV parsing

**Decision:** Use PapaParse over a hand-rolled split.

**Why:** SF address fields contain commas. A naive `row.split(',')` produces wrong column counts. PapaParse handles RFC 4180 quoting correctly and has a typed TypeScript API.

**Alternatives considered:** `csv-parse` (server-side focused, larger bundle), hand-rolled (fragile on quoted fields).

**Tradeoff:** ~30KB bundle addition. Correct by default.

---

## D4 — Vite instead of Create React App

**Decision:** Use `npm create vite` with React + TypeScript template.

**Why:** CRA is unmaintained. Vite's dev server starts in ~300ms vs CRA's 5-10s. Vitest integrates natively.

**Alternatives considered:** CRA (legacy), Next.js (SSR not needed for a single-page app).

**Tradeoff:** None meaningful for this scope.

---

## D5 — Tailwind CSS v3 for styling

**Decision:** Use Tailwind utility classes, no custom CSS files. Pinned to v3.

**Why:** Fast to write in a time-boxed context. Pinned to v3 over v4 because v4 has a different config model and less mature ecosystem tooling.

**Alternatives considered:** CSS Modules (clean but slower to write), Emotion/styled-components (runtime cost).

**Tradeoff:** Class strings can get long. Mitigated by keeping components small.

---

## D6 — useState + useMemo, no state library

**Decision:** Filter state in `App.tsx` as `useState`. Filtered results derived via `useMemo`.

**Why:** Four filter fields driving one derived list. `useMemo` was designed for this. A store adds ~200 lines of boilerplate for no benefit.

**Alternatives considered:** Zustand (for cross-component state without a clear owner), useReducer (adds indirection without gain for 4 fields).

**Tradeoff:** If the app gains significantly more filter dimensions or cross-page state, `useReducer` or a store would be the right upgrade.

---

## D7 — Results displayed in a table, not cards

**Decision:** Use `<table>` for results.

**Why:** Semantic element for structured comparative data. Supports keyboard navigation out of the box. Screen-reader friendly.

**Alternatives considered:** Card grid (better for image-heavy heterogeneous data), virtualized list (only needed at render-count large enough to cause frame drops; ~498 rows doesn't qualify).

**Tradeoff:** Tables require care on mobile. Handled with `overflow-x-auto`.

---

## D8 — Status and Type as `<select>` dropdowns

**Decision:** Both status and type filters are dropdowns with predefined options.

**Why:** Both are finite known sets. Dropdowns prevent invalid input, make options discoverable, and produce exact matches.

**Tradeoff:** Single-select only. Multi-select is a reasonable feature request (e.g., APPROVED + ISSUED). Not in scope.

---

## D9 — happy-dom instead of jsdom as test environment

**Decision:** Use `happy-dom` as the Vitest DOM environment.

**Why:** jsdom v29 has a transitive ESM-only dependency that breaks under Node 20.11.1's CJS loader. happy-dom has no such issue and is fully compatible with React Testing Library.

**Alternatives considered:** Downgrade jsdom (creates ecosystem drift), upgrade Node (can't control reviewer's environment).

**Tradeoff:** happy-dom has subtle behavioral differences from a real browser, but none that affect these component tests.

---

## D10 — Vitest v2 instead of v4

**Decision:** Pin Vitest to `^2.1.9`.

**Why:** Vitest v4 requires `node:util.styleText` added in Node 20.12.0. The target machine has Node 20.11.1.

**Alternatives considered:** Upgrade Node (not controllable), Jest (requires extra config for ESM/TS).

**Tradeoff:** Missing some v4 improvements (faster worker model) that are irrelevant for this project.

---

## D11 — Pagination via `usePagination` with `resetKey`

**Decision:** Pagination state lives in a custom hook that accepts a `resetKey`. When `resetKey` changes, the hook resets to page 1 via `useEffect`.

**Why:** The alternative — calling `setPage(1)` every time a filter changes — scatters imperative calls across the app. The `resetKey` pattern is declarative: pass the search state as the key, and the hook handles the reset automatically.

**Alternatives considered:**
- Derived page from URL params — good for shareability, adds routing complexity (YAGNI here)
- `useReducer` combining search + page — couples concerns that are better separated

**Tradeoff:** `useEffect` for page reset fires one tick after the filter change, which means there's a brief frame where page 2 of the old filtered set renders before resetting. In practice this is invisible at this dataset size.

---

## D12 — Portal-based Tooltip

**Decision:** The food-items tooltip renders to `document.body` via `ReactDOM.createPortal`, positioned with `position: fixed` using `getBoundingClientRect()` captured on `mouseenter`.

**Why:** The table wrapper uses `overflow-x-auto`, which creates a clipping stacking context. Any `position: absolute` child of the table would be clipped. A portal escapes all ancestor overflow constraints.

**Alternatives considered:**
- Native `title` attribute — already had this; browsers render it with an ugly native tooltip, no styling control, and a 1-second delay
- CSS-only tooltip with `position: absolute` — clipped by `overflow-x-auto`
- Third-party tooltip library (Floating UI, Tippy.js) — adds a dependency for a feature I can implement in ~40 lines

**Tradeoff:** The tooltip position is calculated once on `mouseenter`. If the user scrolls while hovering, the tooltip won't follow. For a data table, this is an acceptable edge case.
