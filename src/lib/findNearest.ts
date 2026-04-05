import { haversineKm } from './distance'
import type { Facility, NearestFacility } from '../types/facility'

// Returns the `limit` nearest facilities to (lat, lng).
// Facilities without coordinates are excluded.
// statusFilter: exact match (case-insensitive). Empty string = all statuses.
export function findNearest(
  facilities: Facility[],
  lat: number,
  lng: number,
  limit: number,
  statusFilter: string,
): NearestFacility[] {
  const statusUpper = statusFilter.trim().toUpperCase()

  return facilities
    .filter((f) => f.latitude !== null && f.longitude !== null)
    .filter((f) => !statusUpper || f.status.toUpperCase() === statusUpper)
    .map((f) => ({
      ...f,
      distanceKm: haversineKm(lat, lng, f.latitude!, f.longitude!),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}
