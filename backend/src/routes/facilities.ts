import { Router, Request, Response } from 'express'
import { loadFacilities } from '../lib/csvLoader'
import { findNearest } from '../lib/findNearest'

const router = Router()

/**
 * @openapi
 * components:
 *   schemas:
 *     Facility:
 *       type: object
 *       properties:
 *         locationId:  { type: string }
 *         applicant:   { type: string }
 *         facilityType: { type: string, enum: [Truck, Push Cart] }
 *         address:     { type: string }
 *         status:      { type: string, enum: [APPROVED, EXPIRED, REQUESTED, SUSPEND, ISSUED] }
 *         foodItems:   { type: string }
 *         latitude:    { type: number, nullable: true }
 *         longitude:   { type: number, nullable: true }
 *         permit:      { type: string }
 *         expirationDate: { type: string }
 *     NearestFacility:
 *       allOf:
 *         - $ref: '#/components/schemas/Facility'
 *         - type: object
 *           properties:
 *             distanceKm: { type: number, description: Distance in kilometres }
 *     FacilitiesPage:
 *       type: object
 *       properties:
 *         items:       { type: array, items: { $ref: '#/components/schemas/Facility' } }
 *         total:       { type: integer }
 *         page:        { type: integer }
 *         pageSize:    { type: integer }
 *         totalPages:  { type: integer }
 *     NearestResult:
 *       type: object
 *       properties:
 *         items: { type: array, items: { $ref: '#/components/schemas/NearestFacility' } }
 *         count: { type: integer }
 *     Error:
 *       type: object
 *       properties:
 *         error: { type: string }
 */

/**
 * @openapi
 * /api/facilities:
 *   get:
 *     summary: Search food facilities
 *     description: >
 *       Returns a paginated list of facilities filtered by any combination of
 *       applicant name (partial, case-insensitive), street name (partial),
 *       permit status (exact), and facility type (exact).
 *     parameters:
 *       - in: query
 *         name: applicant
 *         schema: { type: string }
 *         description: Partial, case-insensitive match on applicant name
 *       - in: query
 *         name: street
 *         schema: { type: string }
 *         description: Partial, case-insensitive match on address field
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [APPROVED, EXPIRED, REQUESTED, SUSPEND, ISSUED] }
 *         description: Exact status filter (case-insensitive). Omit for all statuses.
 *       - in: query
 *         name: facilityType
 *         schema: { type: string, enum: [Truck, Push Cart] }
 *         description: Exact facility type (case-insensitive). Omit for all types.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 25, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated facility list
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/FacilitiesPage' }
 */
router.get('/', (req: Request, res: Response) => {
  const {
    applicant = '',
    street = '',
    status = '',
    facilityType = '',
    page = '1',
    pageSize = '25',
  } = req.query as Record<string, string>

  const applicantLower = applicant.trim().toLowerCase()
  const streetLower = street.trim().toLowerCase()
  const statusUpper = status.trim().toUpperCase()
  const typeLower = facilityType.trim().toLowerCase()

  const filtered = loadFacilities().filter((f) => {
    if (applicantLower && !f.applicant.toLowerCase().includes(applicantLower)) return false
    if (streetLower && !f.address.toLowerCase().includes(streetLower)) return false
    if (statusUpper && f.status.toUpperCase() !== statusUpper) return false
    if (typeLower && f.facilityType.toLowerCase() !== typeLower) return false
    return true
  })

  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25))
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const start = (pageNum - 1) * size

  res.json({
    items: filtered.slice(start, start + size),
    total,
    page: pageNum,
    pageSize: size,
    totalPages,
  })
})

/**
 * @openapi
 * /api/facilities/nearest:
 *   get:
 *     summary: Find nearest food facilities
 *     description: >
 *       Returns up to `limit` facilities nearest to the given coordinates,
 *       sorted by ascending distance. By default only APPROVED facilities are
 *       returned; pass an empty string for `status` to include all statuses.
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *         description: Latitude of the query point
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *         description: Longitude of the query point
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5, maximum: 20 }
 *         description: Maximum number of results to return
 *       - in: query
 *         name: status
 *         schema: { type: string, default: APPROVED }
 *         description: >
 *           Status filter. Defaults to APPROVED. Pass empty string to return
 *           all statuses.
 *     responses:
 *       200:
 *         description: Nearest facilities with distance
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NearestResult' }
 *       400:
 *         description: Missing or invalid lat/lng
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/nearest', (req: Request, res: Response) => {
  const { lat, lng, limit = '5', status = 'APPROVED' } = req.query as Record<string, string>

  if (!lat || !lng) {
    res.status(400).json({ error: 'lat and lng query parameters are required' })
    return
  }

  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)

  if (isNaN(latNum) || isNaN(lngNum)) {
    res.status(400).json({ error: 'lat and lng must be valid numbers' })
    return
  }

  const limitNum = Math.min(20, Math.max(1, parseInt(limit, 10) || 5))
  const nearest = findNearest(loadFacilities(), latNum, lngNum, limitNum, status)

  res.json({ items: nearest, count: nearest.length })
})

export default router
