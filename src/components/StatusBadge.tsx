interface StatusBadgeProps {
  status: string
}

const STATUS_STYLES: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  ISSUED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  REQUESTED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  EXPIRED: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  SUSPEND: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = STATUS_STYLES[status.toUpperCase()] ?? 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  )
}
