// src/components/shared/star-rating.tsx
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number // 0–5
  size?: 'sm' | 'md'
  interactive?: boolean
  onRate?: (rating: number) => void
}

export function StarRating({
  rating,
  size = 'md',
  interactive = false,
  onRate,
}: StarRatingProps) {
  const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(rating)
        const half = !filled && i < rating

        return (
          <button
            key={i}
            onClick={() => interactive && onRate?.(i + 1)}
            className={cn(
              interactive &&
                'cursor-pointer transition-transform hover:scale-110',
              !interactive && 'cursor-default',
            )}
            disabled={!interactive}
          >
            <Star
              className={cn(
                starSize,
                filled || half
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-gray-300',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
