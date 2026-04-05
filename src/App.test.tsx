import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// 3 rows — all fit on one page (< PAGE_SIZE=25); enough for filter / nearest tests.
const MOCK_CSV_SMALL = `locationid,Applicant,FacilityType,cnn,LocationDescription,Address,blocklot,block,lot,permit,Status,FoodItems,X,Y,Latitude,Longitude,Schedule,dayshours,NOISent,Approved,Received,PriorPermit,ExpirationDate,Location,Fire Prevention Districts,Police Districts,Supervisor Districts,Zip Codes,Neighborhoods (old)
1,The Geez Freeze,Truck,,,3750 18TH ST,,,, ,APPROVED,Snow Cones,,,37.762,-122.427,,,,,,,,"(37.762, -122.427)",,,,
2,Datam SF LLC,Truck,,,2535 TAYLOR ST,,,, ,EXPIRED,Asian Fusion,,,37.805,-122.415,,,,,,,,"(37.805, -122.415)",,,,
3,Casita Vegana,Push Cart,,,200 JOHN MUIR DR,,,, ,APPROVED,Vegan Food,,,37.721,-122.492,,,,,,,,"(37.721, -122.492)",,,,
`

// 28 rows — triggers pagination (PAGE_SIZE=25).
function buildLargeCsv(count: number): string {
  const header = `locationid,Applicant,FacilityType,cnn,LocationDescription,Address,blocklot,block,lot,permit,Status,FoodItems,X,Y,Latitude,Longitude,Schedule,dayshours,NOISent,Approved,Received,PriorPermit,ExpirationDate,Location,Fire Prevention Districts,Police Districts,Supervisor Districts,Zip Codes,Neighborhoods (old)`
  const rows = Array.from(
    { length: count },
    (_, i) =>
      `${i + 1},Vendor ${String(i + 1).padStart(3, '0')},Truck,,,${i + 1} MAIN ST,,,, ,APPROVED,Tacos,,,37.7,-122.4,,,,,,,,"(37.7, -122.4)",,,,`,
  )
  return [header, ...rows].join('\n')
}

function mockFetch(csv: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(csv) }),
  )
}

beforeEach(() => {
  mockFetch(MOCK_CSV_SMALL)
})

describe('App — loading and data', () => {
  it('shows a loading state initially', () => {
    render(<App />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders all facilities after load', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('The Geez Freeze')).toBeInTheDocument())
    expect(screen.getByText('Datam SF LLC')).toBeInTheDocument()
    expect(screen.getByText('Casita Vegana')).toBeInTheDocument()
  })

  it('shows total result count', async () => {
    render(<App />)
    await waitFor(() => {
      const el = screen.getByTestId('results-count')
      expect(el.textContent).toMatch(/3 facilities total/)
    })
  })

  it('shows an error banner when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404, text: () => Promise.resolve('') }),
    )
    render(<App />)
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByRole('alert')).toHaveTextContent(/HTTP 404/)
  })
})

describe('App — search and filter', () => {
  it('filters by applicant name', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByText('The Geez Freeze')).toBeInTheDocument())

    await user.type(screen.getByLabelText(/applicant name/i), 'geez')

    expect(screen.getByText('The Geez Freeze')).toBeInTheDocument()
    expect(screen.queryByText('Datam SF LLC')).not.toBeInTheDocument()
    expect(screen.queryByText('Casita Vegana')).not.toBeInTheDocument()
  })

  it('filters by street name', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByText('Datam SF LLC')).toBeInTheDocument())

    await user.type(screen.getByLabelText(/street name/i), 'taylor')

    expect(screen.getByText('Datam SF LLC')).toBeInTheDocument()
    expect(screen.queryByText('The Geez Freeze')).not.toBeInTheDocument()
  })

  it('filters by permit status', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByText('Datam SF LLC')).toBeInTheDocument())

    await user.selectOptions(screen.getByLabelText(/permit status/i), 'EXPIRED')

    expect(screen.getByText('Datam SF LLC')).toBeInTheDocument()
    expect(screen.queryByText('The Geez Freeze')).not.toBeInTheDocument()
    expect(screen.queryByText('Casita Vegana')).not.toBeInTheDocument()
  })

  it('filters by facility type', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByText('Casita Vegana')).toBeInTheDocument())

    await user.selectOptions(screen.getByLabelText(/facility type/i), 'Push Cart')

    expect(screen.getByText('Casita Vegana')).toBeInTheDocument()
    expect(screen.queryByText('The Geez Freeze')).not.toBeInTheDocument()
    expect(screen.queryByText('Datam SF LLC')).not.toBeInTheDocument()
  })

  it('shows empty state when search has no results', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByText('The Geez Freeze')).toBeInTheDocument())

    await user.type(screen.getByLabelText(/applicant name/i), 'xyz-no-match')

    expect(screen.getByText(/no matching facilities/i)).toBeInTheDocument()
  })

  it('clear filters button resets all fields', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByText('The Geez Freeze')).toBeInTheDocument())

    await user.type(screen.getByLabelText(/applicant name/i), 'geez')
    expect(screen.queryByText('Datam SF LLC')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText(/clear all filters/i))
    await waitFor(() => expect(screen.getByText('Datam SF LLC')).toBeInTheDocument())
  })
})

describe('App — pagination', () => {
  it('shows pagination controls when results exceed one page', async () => {
    mockFetch(buildLargeCsv(28))
    render(<App />)
    await waitFor(() => expect(screen.getByText('Vendor 001')).toBeInTheDocument())

    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument()
  })

  it('first page shows 25 of 28 results', async () => {
    mockFetch(buildLargeCsv(28))
    render(<App />)
    await waitFor(() => expect(screen.getByText(/showing/i)).toBeInTheDocument())
    expect(screen.getByText(/showing/i)).toHaveTextContent('1–25')
  })

  it('navigating to page 2 shows remaining results', async () => {
    const user = userEvent.setup()
    mockFetch(buildLargeCsv(28))
    render(<App />)
    await waitFor(() => expect(screen.getByText('Vendor 001')).toBeInTheDocument())

    const nav = screen.getByRole('navigation', { name: /pagination/i })
    await user.click(within(nav).getByRole('button', { name: /next page/i }))

    await waitFor(() => expect(screen.getByText('Vendor 026')).toBeInTheDocument())
    expect(screen.queryByText('Vendor 001')).not.toBeInTheDocument()
  })

  it('does not show pagination when all results fit on one page', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('The Geez Freeze')).toBeInTheDocument())
    expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument()
  })

  it('resets to page 1 when a filter changes', async () => {
    const user = userEvent.setup()
    mockFetch(buildLargeCsv(28))
    render(<App />)
    await waitFor(() => expect(screen.getByText('Vendor 001')).toBeInTheDocument())

    const nav = screen.getByRole('navigation', { name: /pagination/i })
    await user.click(within(nav).getByRole('button', { name: /next page/i }))
    await waitFor(() => expect(screen.getByText('Vendor 026')).toBeInTheDocument())

    await user.type(screen.getByLabelText(/applicant name/i), 'vendor')
    await waitFor(() => expect(screen.getByText('Vendor 001')).toBeInTheDocument())
  })
})

describe('App — Near Me tab', () => {
  beforeEach(() => {
    // Provide a mock geolocation that immediately resolves near 18TH ST
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: vi.fn((success: PositionCallback) => {
          success({
            coords: { latitude: 37.762, longitude: -122.427 },
          } as GeolocationPosition)
        }),
      },
    })
  })

  it('renders Near Me tab button', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByRole('tab', { name: /near me/i })).toBeInTheDocument())
  })

  it('shows the location prompt when Near Me tab is active', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByRole('tab', { name: /near me/i })).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: /near me/i }))
    expect(screen.getByText(/find the 5 nearest/i)).toBeInTheDocument()
  })

  it('shows nearest facilities after clicking Use my location', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByRole('tab', { name: /near me/i })).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: /near me/i }))
    await user.click(screen.getByRole('button', { name: /use my location/i }))

    // The Geez Freeze is at 37.762,-122.427 — same as the mock position, so it's closest
    await waitFor(() =>
      expect(screen.getByText('The Geez Freeze')).toBeInTheDocument(),
    )
  })

  it('shows distance in results', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByRole('tab', { name: /near me/i })).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: /near me/i }))
    await user.click(screen.getByRole('button', { name: /use my location/i }))

    // Distance column should show "X.XX mi"
    await waitFor(() => {
      const distanceCells = screen.getAllByText(/^\d+\.\d{2} mi$/)
      expect(distanceCells.length).toBeGreaterThan(0)
    })
  })
})
