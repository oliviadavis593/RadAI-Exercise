import path from 'path'
import fs from 'fs'
import Papa from 'papaparse'
import type { Facility } from '../types/facility'

function parseFacility(row: Record<string, string>): Facility {
  const lat = parseFloat(row['Latitude'])
  const lng = parseFloat(row['Longitude'])
  return {
    locationId: row['locationid'] ?? '',
    applicant: row['Applicant'] ?? '',
    facilityType: row['FacilityType'] ?? '',
    address: row['Address'] ?? '',
    locationDescription: row['LocationDescription'] ?? '',
    status: row['Status'] ?? '',
    foodItems: row['FoodItems'] ?? '',
    latitude: isNaN(lat) ? null : lat,
    longitude: isNaN(lng) ? null : lng,
    permit: row['permit'] ?? '',
    expirationDate: row['ExpirationDate'] ?? '',
  }
}

// Module-level cache — CSV is read once at first call, then reused.
// Reset via _resetCache() in tests.
let _facilities: Facility[] | null = null

function defaultCsvPath(): string {
  // In dev (ts-node): __dirname = backend/src/lib → resolve to frontend public/
  // In prod (compiled): __dirname = backend/dist/lib → same relative steps
  // Override with CSV_PATH env var for Docker or custom paths.
  return (
    process.env.CSV_PATH ??
    path.join(__dirname, '../../../public/Mobile_Food_Facility_Permit.csv')
  )
}

export function loadFacilities(csvPath?: string): Facility[] {
  if (_facilities) return _facilities

  const filePath = csvPath ?? defaultCsvPath()
  const csv = fs.readFileSync(filePath, 'utf-8')
  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  })
  _facilities = result.data.map(parseFacility)
  return _facilities
}

// Exposed for tests so each suite gets a clean slate.
export function _resetCache(): void {
  _facilities = null
}
