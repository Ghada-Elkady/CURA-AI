type Status = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'

const config: Record<Status, { label: string; className: string }> = {
  scheduled:   { label: 'Upcoming',    className: 'bg-blue-100 text-blue-700' },
  completed:   { label: 'Completed',   className: 'bg-emerald-100 text-emerald-700' },
  cancelled:   { label: 'Cancelled',   className: 'bg-red-100 text-red-600' },
  rescheduled: { label: 'Rescheduled', className: 'bg-orange-100 text-orange-700' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = config[status as Status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
