import { describe, it, expect } from 'vitest'
import { filterFacilities, type FilterParams } from './filterFacilities'
import type { Facility } from '../types/facility'

const base: Partial<Facility> = {
  facilityType: 'Truck',
  locationDescription: '',
  foodItems: '',
  latitude: null,
  longitude: null,
  permit: '',
  expirationDate: '',
}

const fixtures: Facility[] = [
  { ...base, locationId: '1', applicant: 'The Geez Freeze', address: '3750 18TH ST', status: 'APPROVED', facilityType: 'Truck' } as Facility,
  { ...base, locationId: '2', applicant: 'Datam SF LLC', address: '2535 TAYLOR ST', status: 'EXPIRED', facilityType: 'Truck' } as Facility,
  { ...base, locationId: '3', applicant: 'Casita Vegana', address: '200 JOHN MUIR DR', status: 'APPROVED', facilityType: 'Push Cart' } as Facility,
  { ...base, locationId: '4', applicant: 'Truly Food & More', address: '217 SANSOME ST', status: 'REQUESTED', facilityType: 'Truck' } as Facility,
]

const noFilter: FilterParams = { applicant: '', street: '', status: '', facilityType: '' }

describe('filterFacilities', () => {
  it('returns all records when all filters are empty', () => {
    expect(filterFacilities(fixtures, noFilter)).toHaveLength(4)
  })

  it('filters by applicant name (case-insensitive, partial)', () => {
    const result = filterFacilities(fixtures, { ...noFilter, applicant: 'geez' })
    expect(result).toHaveLength(1)
    expect(result[0].locationId).toBe('1')
  })

  it('filters by applicant with mixed case', () => {
    const result = filterFacilities(fixtures, { ...noFilter, applicant: 'CASITA' })
    expect(result).toHaveLength(1)
    expect(result[0].locationId).toBe('3')
  })

  it('filters by street name (case-insensitive, partial)', () => {
    const result = filterFacilities(fixtures, { ...noFilter, street: 'taylor' })
    expect(result).toHaveLength(1)
    expect(result[0].locationId).toBe('2')
  })

  it('filters by street with partial match', () => {
    const result = filterFacilities(fixtures, { ...noFilter, street: 'SANSOME' })
    expect(result).toHaveLength(1)
    expect(result[0].locationId).toBe('4')
  })

  it('filters by exact status', () => {
    const result = filterFacilities(fixtures, { ...noFilter, status: 'APPROVED' })
    expect(result).toHaveLength(2)
    expect(result.map((f) => f.locationId)).toEqual(['1', '3'])
  })

  it('filters by status case-insensitively', () => {
    const result = filterFacilities(fixtures, { ...noFilter, status: 'approved' })
    expect(result).toHaveLength(2)
  })

  it('filters by facility type (exact, case-insensitive)', () => {
    const result = filterFacilities(fixtures, { ...noFilter, facilityType: 'Push Cart' })
    expect(result).toHaveLength(1)
    expect(result[0].locationId).toBe('3')
  })

  it('filters by facility type case-insensitively', () => {
    const result = filterFacilities(fixtures, { ...noFilter, facilityType: 'truck' })
    expect(result).toHaveLength(3)
  })

  it('combines applicant and status filters', () => {
    const result = filterFacilities(fixtures, { ...noFilter, applicant: 'geez', status: 'APPROVED' })
    expect(result).toHaveLength(1)
    expect(result[0].locationId).toBe('1')
  })

  it('combines type and status filters', () => {
    const result = filterFacilities(fixtures, { ...noFilter, facilityType: 'Push Cart', status: 'APPROVED' })
    expect(result).toHaveLength(1)
    expect(result[0].locationId).toBe('3')
  })

  it('returns empty array when no records match', () => {
    const result = filterFacilities(fixtures, { ...noFilter, applicant: 'xyz-no-match' })
    expect(result).toHaveLength(0)
  })

  it('trims whitespace from filter inputs', () => {
    const result = filterFacilities(fixtures, { ...noFilter, applicant: '  geez  ' })
    expect(result).toHaveLength(1)
  })

  it('handles empty dataset', () => {
    expect(filterFacilities([], noFilter)).toEqual([])
  })
})
