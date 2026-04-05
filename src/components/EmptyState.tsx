interface EmptyStateProps {
  hasFilters: boolean
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center" role="status">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <SearchOffIcon />
      </div>
      <p className="text-base font-semibold text-gray-800">
        {hasFilters ? 'No matching facilities' : 'No facilities found'}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        {hasFilters
          ? 'Try adjusting your search terms or clearing filters.'
          : 'The dataset appears to be empty.'}
      </p>
    </div>
  )
}

function SearchOffIcon() {
  return (
    <svg
      className="h-8 w-8 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
      />
    </svg>
  )
}
