import type { Facility } from '../types/facility'

export interface FilterParams {
  applicant: string
  street: string
  status: string
  facilityType: string
}

// Pure function — takes the full dataset and filter params, returns matching rows.
// All string comparisons are case-insensitive and trimmed.
// Empty filter strings are treated as "match all" for that axis.
export function filterFacilities(
  facilities: Facility[],
  { applicant, street, status, facilityType }: FilterParams,
): Facility[] {
  const applicantLower = applicant.trim().toLowerCase()
  const streetLower = street.trim().toLowerCase()
  const statusUpper = status.trim().toUpperCase()
  const typeLower = facilityType.trim().toLowerCase()

  return facilities.filter((f) => {
    if (applicantLower && !f.applicant.toLowerCase().includes(applicantLower)) {
      return false
    }
    if (streetLower && !f.address.toLowerCase().includes(streetLower)) {
      return false
    }
    if (statusUpper && f.status.toUpperCase() !== statusUpper) {
      return false
    }
    if (typeLower && f.facilityType.toLowerCase() !== typeLower) {
      return false
    }
    return true
  })
}
