import type { Specialty } from '@/lib/types'

interface SpecialtyChipProps {
  specialty: Specialty
  selected?: boolean
  onClick?: () => void
}

export function SpecialtyChip({ specialty, selected, onClick }: SpecialtyChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl min-w-[72px] transition-all active:scale-95 ${
        selected
          ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
          : 'bg-white text-cura-text border border-gray-100 shadow-sm'
      }`}
      aria-pressed={selected}
      aria-label={specialty.name}
    >
      <span className="text-xl leading-none">{specialty.icon}</span>
      <span className={`text-[10px] font-semibold leading-tight text-center ${selected ? 'text-white' : 'text-cura-muted'}`}>
        {specialty.name}
      </span>
    </button>
  )
}
