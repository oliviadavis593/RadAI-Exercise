import request from 'supertest'
import app from '../src/app'
import * as csvLoader from '../src/lib/csvLoader'
import type { Facility } from '../src/types/facility'

const mockFacilities: Facility[] = [
  {
    locationId: '1', applicant: 'The Geez Freeze', facilityType: 'Truck',
    address: '3750 18TH ST', locationDescription: '', status: 'APPROVED',
    foodItems: 'Snow Cones', latitude: 37.762, longitude: -122.427,
    permit: '21MFF-00015', expirationDate: '',
  },
  {
    locationId: '2', applicant: 'Datam SF LLC', facilityType: 'Truck',
    address: '2535 TAYLOR ST', locationDescription: '', status: 'EXPIRED',
    foodItems: 'Asian Fusion', latitude: 37.805, longitude: -122.415,
    permit: '21MFF-00106', expirationDate: '',
  },
  {
    locationId: '3', applicant: 'Casita Vegana', facilityType: 'Push Cart',
    address: '200 JOHN MUIR DR', locationDescription: '', status: 'APPROVED',
    foodItems: 'Vegan Food', latitude: 37.721, longitude: -122.492,
    permit: '21MFF-00105', expirationDate: '',
  },
  {
    locationId: '4', applicant: 'No Coords Vendor', facilityType: 'Truck',
    address: '100 MARKET ST', locationDescription: '', status: 'APPROVED',
    foodItems: 'Tacos', latitude: null, longitude: null,
    permit: '22MFF-00001', expirationDate: '',
  },
]

beforeEach(() => {
  jest.spyOn(csvLoader, 'loadFacilities').mockReturnValue(mockFacilities)
})

afterEach(() => {
  jest.restoreAllMocks()
})

// ── GET /api/facilities ───────────────────────────────────────────────────────

describe('GET /api/facilities', () => {
  it('returns all facilities when no filters are applied', async () => {
    const res = await request(app).get('/api/facilities')
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(4)
    expect(res.body.total).toBe(4)
  })

  it('returns pagination metadata', async () => {
    const res = await request(app).get('/api/facilities')
    expect(res.body).toMatchObject({ page: 1, pageSize: 25, totalPages: 1 })
  })

  it('filters by applicant name (partial, case-insensitive)', async () => {
    const res = await request(app).get('/api/facilities?applicant=geez')
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(1)
    expect(res.body.items[0].applicant).toBe('The Geez Freeze')
  })

  it('filters by street name (partial, case-insensitive)', async () => {
    const res = await request(app).get('/api/facilities?street=taylor')
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(1)
    expect(res.body.items[0].address).toMatch(/TAYLOR/)
  })

  it('filters by status (exact, case-insensitive)', async () => {
    const res = await request(app).get('/api/facilities?status=APPROVED')
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(3) // includes no-coords vendor
    expect(res.body.items.every((f: Facility) => f.status === 'APPROVED')).toBe(true)
  })

  it('filters by facilityType (exact, case-insensitive)', async () => {
    const res = await request(app).get('/api/facilities?facilityType=Push+Cart')
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(1)
    expect(res.body.items[0].facilityType).toBe('Push Cart')
  })

  it('paginates results', async () => {
    const res = await request(app).get('/api/facilities?page=1&pageSize=2')
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(2)
    expect(res.body.total).toBe(4)
    expect(res.body.totalPages).toBe(2)
  })

  it('returns second page correctly', async () => {
    const res = await request(app).get('/api/facilities?page=2&pageSize=2')
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(2)
    expect(res.body.page).toBe(2)
  })

  it('caps pageSize at 100', async () => {
    const res = await request(app).get('/api/facilities?pageSize=999')
    expect(res.status).toBe(200)
    expect(res.body.pageSize).toBe(100)
  })

  it('returns empty items when no facilities match', async () => {
    const res = await request(app).get('/api/facilities?applicant=xyz-no-match')
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(0)
    expect(res.body.total).toBe(0)
  })
})

// ── GET /api/facilities/nearest ───────────────────────────────────────────────

describe('GET /api/facilities/nearest', () => {
  it('returns 400 when lat is missing', async () => {
    const res = await request(app).get('/api/facilities/nearest?lng=-122.43')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/lat/)
  })

  it('returns 400 when lng is missing', async () => {
    const res = await request(app).get('/api/facilities/nearest?lat=37.76')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/lng/)
  })

  it('returns 400 for non-numeric lat', async () => {
    const res = await request(app).get('/api/facilities/nearest?lat=abc&lng=-122.43')
    expect(res.status).toBe(400)
  })

  it('defaults to APPROVED-only', async () => {
    // Query from 18TH ST — default status should exclude EXPIRED (Datam)
    const res = await request(app).get('/api/facilities/nearest?lat=37.76&lng=-122.43')
    expect(res.status).toBe(200)
    expect(res.body.items.every((f: Facility) => f.status === 'APPROVED')).toBe(true)
    expect(res.body.items.find((f: Facility) => f.applicant === 'Datam SF LLC')).toBeUndefined()
  })

  it('includes all statuses when status is empty string', async () => {
    const res = await request(app).get('/api/facilities/nearest?lat=37.76&lng=-122.43&status=')
    expect(res.status).toBe(200)
    expect(res.body.items.some((f: Facility) => f.status === 'EXPIRED')).toBe(true)
  })

  it('excludes facilities without coordinates', async () => {
    const res = await request(app).get('/api/facilities/nearest?lat=37.76&lng=-122.43&status=')
    expect(res.status).toBe(200)
    // locationId 4 has null lat/lng — should not appear
    expect(res.body.items.find((f: Facility) => f.locationId === '4')).toBeUndefined()
  })

  it('results are sorted nearest-first', async () => {
    const res = await request(app).get('/api/facilities/nearest?lat=37.76&lng=-122.43&status=')
    expect(res.status).toBe(200)
    const distances: number[] = res.body.items.map((f: { distanceKm: number }) => f.distanceKm)
    expect(distances[0]).toBeLessThanOrEqual(distances[1])
  })

  it('attaches distanceKm to each result', async () => {
    const res = await request(app).get('/api/facilities/nearest?lat=37.76&lng=-122.43')
    expect(res.status).toBe(200)
    res.body.items.forEach((f: { distanceKm: unknown }) => {
      expect(typeof f.distanceKm).toBe('number')
    })
  })

  it('respects the limit parameter', async () => {
    const res = await request(app).get('/api/facilities/nearest?lat=37.76&lng=-122.43&status=&limit=2')
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(2)
    expect(res.body.count).toBe(2)
  })

  it('caps limit at 20', async () => {
    const res = await request(app).get('/api/facilities/nearest?lat=37.76&lng=-122.43&status=&limit=999')
    expect(res.status).toBe(200)
    // Only 3 facilities with coordinates in mock, so result ≤ 3
    expect(res.body.items.length).toBeLessThanOrEqual(3)
  })
})

// ── Health check ──────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns 200 ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
