import type { Facility } from '../types/facility'
import { StatusBadge } from './StatusBadge'
import { EmptyState } from './EmptyState'
import { Tooltip } from './Tooltip'

const FOOD_ITEMS_THRESHOLD = 45 // characters before we truncate and add tooltip

interface FacilityTableProps {
  facilities: Facility[]
  hasFilters: boolean
}

export function FacilityTable({ facilities, hasFilters }: FacilityTableProps) {
  if (facilities.length === 0) {
    return <EmptyState hasFilters={hasFilters} />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="sticky top-0 z-10 bg-gray-50 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Applicant
            </th>
            <th scope="col" className="sticky top-0 z-10 bg-gray-50 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Address
            </th>
            <th scope="col" className="sticky top-0 z-10 bg-gray-50 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </th>
            <th scope="col" className="sticky top-0 z-10 bg-gray-50 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Type
            </th>
            <th scope="col" className="sticky top-0 z-10 bg-gray-50 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Food Items
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {facilities.map((f) => (
            <tr key={f.locationId} className="group transition-colors hover:bg-indigo-50/40">
              <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                {f.applicant}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                {f.address}
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <StatusBadge status={f.status} />
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <TypeBadge type={f.facilityType} />
              </td>
              <td className="px-5 py-4">
                <FoodItemsCell foodItems={f.foodItems} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FoodItemsCell({ foodItems }: { foodItems: string }) {
  if (!foodItems) {
    return <span className="text-gray-400 italic">—</span>
  }

  if (foodItems.length <= FOOD_ITEMS_THRESHOLD) {
    return <span className="text-gray-600">{foodItems}</span>
  }

  return (
    <Tooltip content={foodItems}>
      <span className="block max-w-[260px] truncate text-gray-600">
        {foodItems}
      </span>
    </Tooltip>
  )
}

function TypeBadge({ type }: { type: string }) {
  const isTruck = type.toLowerCase() === 'truck'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isTruck
          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
          : 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
      }`}
    >
      {isTruck ? <TruckIcon /> : <CartIcon />}
      {type}
    </span>
  )
}

function TruckIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h11a1 1 0 011 1v11H1V2a1 1 0 011-1zM13 6h4l3 4v4h-7V6z" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
