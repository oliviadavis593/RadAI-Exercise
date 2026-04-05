import { haversineKm } from '../src/lib/distance'

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(37.76, -122.43, 37.76, -122.43)).toBe(0)
  })

  it('is symmetric', () => {
    const d1 = haversineKm(37.76, -122.43, 37.78, -122.41)
    const d2 = haversineKm(37.78, -122.41, 37.76, -122.43)
    expect(d1).toBeCloseTo(d2, 10)
  })

  it('returns a positive distance for different coordinates', () => {
    expect(haversineKm(37.76, -122.43, 37.78, -122.41)).toBeGreaterThan(0)
  })

  it('returns distance in kilometres (not miles or metres)', () => {
    // Golden Gate Bridge to City Hall is ~8km, not 8 miles (13km) or 8000m
    const d = haversineKm(37.8199, -122.4783, 37.7793, -122.4193)
    expect(d).toBeGreaterThan(4)
    expect(d).toBeLessThan(10)
  })

  it('increases monotonically as points move further apart', () => {
    const d1 = haversineKm(37.76, -122.43, 37.761, -122.43)
    const d2 = haversineKm(37.76, -122.43, 37.762, -122.43)
    const d3 = haversineKm(37.76, -122.43, 37.770, -122.43)
    expect(d1).toBeLessThan(d2)
    expect(d2).toBeLessThan(d3)
  })
})
