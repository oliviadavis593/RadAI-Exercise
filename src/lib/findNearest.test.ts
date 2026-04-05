import { describe, it, expect } from 'vitest'
import { findNearest } from './findNearest'
import type { Facility } from '../types/facility'

const base: Partial<Facility> = {
  facilityType: 'Truck',
  locationDescription: '',
  foodItems: '',
  permit: '',
  expirationDate: '',
  address: '',
}

// City Hall (~37.779, -122.419) is closest to our query point
const fixtures: Facility[] = [
  { ...base, locationId: '1', applicant: 'Near Truck',  status: 'APPROVED', latitude: 37.779, longitude: -122.419 } as Facility,
  { ...base, locationId: '2', applicant: 'Far Truck',   status: 'APPROVED', latitude: 37.720, longitude: -122.480 } as Facility,
  { ...base, locationId: '3', applicant: 'Mid Truck',   status: 'APPROVED', latitude: 37.760, longitude: -122.440 } as Facility,
  { ...base, locationId: '4', applicant: 'Expired One', status: 'EXPIRED',  latitude: 37.778, longitude: -122.418 } as Facility,
  { ...base, locationId: '5', applicant: 'No Coords',   status: 'APPROVED', latitude: null,   longitude: null     } as Facility,
]

// Query from roughly Union Square (37.788, -122.408)
const LAT = 37.788
const LNG = -122.408

describe('findNearest', () => {
  it('returns results sorted nearest-first', () => {
    const results = findNearest(fixtures, LAT, LNG, 5, '')
    const distances = results.map((r) => r.distanceKm)
    expect(distances[0]).toBeLessThanOrEqual(distances[1])
    expect(distances[1]).toBeLessThanOrEqual(distances[2])
  })

  it('excludes facilities without coordinates', () => {
    const results = findNearest(fixtures, LAT, LNG, 10, '')
    expect(results.find((r) => r.locationId === '5')).toBeUndefined()
  })

  it('filters by status when provided', () => {
    const results = findNearest(fixtures, LAT, LNG, 10, 'APPROVED')
    expect(results.every((r) => r.status === 'APPROVED')).toBe(true)
    expect(results.find((r) => r.locationId === '4')).toBeUndefined()
  })

  it('returns all statuses when statusFilter is empty', () => {
    const results = findNearest(fixtures, LAT, LNG, 10, '')
    expect(results.some((r) => r.status === 'EXPIRED')).toBe(true)
  })

  it('respects the limit', () => {
    const results = findNearest(fixtures, LAT, LNG, 2, '')
    expect(results).toHaveLength(2)
  })

  it('attaches distanceKm to each result', () => {
    const results = findNearest(fixtures, LAT, LNG, 5, '')
    results.forEach((r) => {
      expect(typeof r.distanceKm).toBe('number')
      expect(r.distanceKm).toBeGreaterThanOrEqual(0)
    })
  })

  it('handles empty input', () => {
    expect(findNearest([], LAT, LNG, 5, 'APPROVED')).toEqual([])
  })

  it('status filter is case-insensitive', () => {
    const upper = findNearest(fixtures, LAT, LNG, 10, 'APPROVED')
    const lower = findNearest(fixtures, LAT, LNG, 10, 'approved')
    expect(upper).toHaveLength(lower.length)
  })
})
