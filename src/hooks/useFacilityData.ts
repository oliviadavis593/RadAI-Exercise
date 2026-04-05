import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { parseFacility } from '../lib/parseFacility'
import type { Facility } from '../types/facility'

interface UseFacilityDataResult {
  data: Facility[]
  loading: boolean
  error: string | null
}

// Fetches the CSV from /Mobile_Food_Facility_Permit.csv (served from public/).
// Parses it with PapaParse (handles quoted fields with embedded commas).
// Returns a stable { data, loading, error } shape.
export function useFacilityData(): UseFacilityDataResult {
  const [data, setData] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/Mobile_Food_Facility_Permit.csv')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load data (HTTP ${res.status})`)
        return res.text()
      })
      .then((text) => {
        const result = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
        })

        if (!cancelled) {
          setData(result.data.map(parseFacility))
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error loading data')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
