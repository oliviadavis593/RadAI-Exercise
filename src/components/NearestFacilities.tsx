import { useState } from 'react'
import { findNearest } from '../lib/findNearest'
import { StatusBadge } from './StatusBadge'
import type { Facility, NearestFacility } from '../types/facility'

interface NearestFacilitiesProps {
  facilities: Facility[]
}

type GeoState = 'idle' | 'locating' | 'done' | 'error'

export function NearestFacilities({ facilities }: NearestFacilitiesProps) {
  const [geoState, setGeoState] = useState<GeoState>('idle')
  const [geoError, setGeoError] = useState<string | null>(null)
  const [results, setResults] = useState<NearestFacility[]>([])
  const [onlyApproved, setOnlyApproved] = useState(true)

  function handleFind() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      setGeoState('error')
      return
    }

    setGeoState('locating')
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearest(
          facilities,
          pos.coords.latitude,
          pos.coords.longitude,
          5,
          onlyApproved ? 'APPROVED' : '',
        )
        setResults(nearest)
        setGeoState('done')
      },
      (err) => {
        setGeoError(err.message)
        setGeoState('error')
      },
      { timeout: 10_000 },
    )
  }

  function handleToggleApproved(e: React.ChangeEvent<HTMLInputElement>) {
    setOnlyApproved(e.target.checked)
    // Re-run if we already have a location
    if (geoState === 'done') {
      setGeoState('idle')
      setResults([])
    }
  }

  return (
    <div>
      {/* Controls */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Find the 5 nearest food facilities to your current location.
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Your browser will ask for location permission.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={onlyApproved}
                onChange={handleToggleApproved}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              APPROVED only
            </label>

            <button
              onClick={handleFind}
              disabled={geoState === 'locating'}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {geoState === 'locating' ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Locating…
                </>
              ) : (
                <>
                  <PinIcon />
                  {geoState === 'done' ? 'Refresh' : 'Use my location'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {geoState === 'error' && geoError && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          <p>
            <span className="font-semibold">Location error: </span>
            {geoError}
          </p>
        </div>
      )}

      {/* Results */}
      {geoState === 'done' && (
        <div className="mt-4">
          {results.length === 0 ? (
            <div className="py-12 text-center text-gray-500" role="status">
              <p className="font-medium">No facilities found nearby.</p>
              <p className="mt-1 text-sm">
                Try unchecking "APPROVED only" to include other statuses.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      #
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Applicant
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Address
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Distance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {results.map((f, i) => (
                    <tr key={f.locationId} className="hover:bg-indigo-50/40">
                      <td className="px-5 py-4 text-center font-bold text-indigo-600">
                        {i + 1}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">{f.applicant}</td>
                      <td className="px-5 py-4 text-gray-600">{f.address}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={f.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {`${(f.distanceKm * 0.621371).toFixed(2)} mi`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PinIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
