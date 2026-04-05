export interface Facility {
  locationId: string
  applicant: string
  facilityType: string
  address: string
  locationDescription: string
  status: string
  foodItems: string
  latitude: number | null
  longitude: number | null
  permit: string
  expirationDate: string
}

export interface NearestFacility extends Facility {
  distanceKm: number
}
