import { FACILITY_STATUSES, FACILITY_TYPES } from '../types/facility'

export interface SearchState {
  applicant: string
  street: string
  status: string
  facilityType: string
}

export const INITIAL_SEARCH: SearchState = {
  applicant: '',
  street: '',
  status: '',
  facilityType: '',
}

interface SearchControlsProps {
  values: SearchState
  onChange: (next: SearchState) => void
}

export function SearchControls({ values, onChange }: SearchControlsProps) {
  const activeFilterCount = [values.applicant, values.street, values.status, values.facilityType].filter(Boolean).length

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon />
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Search &amp; Filter
          </span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={() => onChange(INITIAL_SEARCH)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Clear all filters"
          >
            <XIcon />
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" role="search">
        <div>
          <label htmlFor="search-applicant" className="mb-1 block text-xs font-medium text-gray-600">
            Applicant name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="search-applicant"
              type="search"
              placeholder="e.g. Geez Freeze"
              value={values.applicant}
              onChange={(e) => onChange({ ...values, applicant: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              aria-label="Search by applicant name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="search-street" className="mb-1 block text-xs font-medium text-gray-600">
            Street name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LocationIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="search-street"
              type="search"
              placeholder="e.g. Market"
              value={values.street}
              onChange={(e) => onChange({ ...values, street: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              aria-label="Search by street name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="filter-status" className="mb-1 block text-xs font-medium text-gray-600">
            Permit status
          </label>
          <select
            id="filter-status"
            value={values.status}
            onChange={(e) => onChange({ ...values, status: e.target.value })}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm text-gray-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            aria-label="Filter by permit status"
          >
            <option value="">All statuses</option>
            {FACILITY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-type" className="mb-1 block text-xs font-medium text-gray-600">
            Facility type
          </label>
          <select
            id="filter-type"
            value={values.facilityType}
            onChange={(e) => onChange({ ...values, facilityType: e.target.value })}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm text-gray-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            aria-label="Filter by facility type"
          >
            <option value="">All types</option>
            {FACILITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
