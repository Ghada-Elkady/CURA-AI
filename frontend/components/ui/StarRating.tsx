import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  max?: number
  interactive?: boolean
  onChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export function StarRating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = 'sm',
  showValue = true,
}: StarRatingProps) {
  const sizeMap = { sm: 14, md: 18, lg: 24 }
  const px = sizeMap[size]

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={px}
          className={`${
            i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
      {showValue && (
        <span className="text-xs text-cura-muted ml-1 font-medium">{value.toFixed(1)}</span>
      )}
    </div>
  )
}
