import { useMemo, useState } from 'react'
import { useFacilityData } from './hooks/useFacilityData'
import { usePagination, PAGE_SIZE } from './hooks/usePagination'
import { filterFacilities } from './lib/filterFacilities'
import { SearchControls, INITIAL_SEARCH, type SearchState } from './components/SearchControls'
import { FacilityTable } from './components/FacilityTable'
import { Pagination } from './components/Pagination'

export default function App() {
  const { data, loading, error } = useFacilityData()
  const [search, setSearch] = useState<SearchState>(INITIAL_SEARCH)

  const filtered = useMemo(
    () => filterFacilities(data, search),
    [data, search],
  )

  // Pass `search` as resetKey so pagination resets to page 1 on any filter change.
  const pagination = usePagination(filtered, PAGE_SIZE, search)

  const hasFilters =
    search.applicant !== '' ||
    search.street !== '' ||
    search.status !== '' ||
    search.facilityType !== ''

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-6 py-8 shadow-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <FoodIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                SF Food Facility Finder
              </h1>
              <p className="text-sm text-indigo-200">
                San Francisco mobile food vendor permits
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Search card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <SearchControls values={search} onChange={setSearch} />
        </div>

        {/* Results area */}
        <div className="mt-5">
          {loading && <LoadingState />}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
            >
              <AlertIcon />
              <div>
                <p className="font-semibold">Failed to load data</p>
                <p className="mt-0.5 text-red-600">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              <ResultsBar
                total={filtered.length}
                hasFilters={hasFilters}
              />
              <FacilityTable
                facilities={pagination.pageItems}
                hasFilters={hasFilters}
              />
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                startIndex={pagination.startIndex}
                endIndex={pagination.endIndex}
                onPageChange={pagination.setPage}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function ResultsBar({ total, hasFilters }: { total: number; hasFilters: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p data-testid="results-count" className="text-sm text-gray-500">
        <span className="font-semibold text-gray-800">{total}</span>{' '}
        {total === 1 ? 'facility' : 'facilities'}
        {hasFilters ? ' matching your search' : ' total'}
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400" role="status" aria-label="Loading">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-500"
        aria-hidden="true"
      />
      <p className="mt-4 text-sm font-medium">Loading facilities…</p>
    </div>
  )
}

function FoodIcon() {
  return (
    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  )
}
