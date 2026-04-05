export type FacilityStatus = 'APPROVED' | 'EXPIRED' | 'REQUESTED' | 'SUSPEND' | 'ISSUED'

export const FACILITY_STATUSES: FacilityStatus[] = [
  'APPROVED',
  'EXPIRED',
  'REQUESTED',
  'SUSPEND',
  'ISSUED',
]

export const FACILITY_TYPES = ['Truck', 'Push Cart'] as const
export type FacilityType = (typeof FACILITY_TYPES)[number]

export interface Facility {
  locationId: string
  applicant: string
  facilityType: string
  address: string
  locationDescription: string
  status: FacilityStatus | string
  foodItems: string
  latitude: number | null
  longitude: number | null
  permit: string
  expirationDate: string
}
