import type { Facility } from '../types/facility'

// Maps a raw PapaParse row (header: value object) to a typed Facility.
// Uses nullish coalescing so missing columns degrade gracefully to empty strings.
export function parseFacility(row: Record<string, string>): Facility {
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
