// src/features/products/components/product-reviews.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/shared/star-rating'
import { formatDate } from '@/lib/utils'
import { getProductReviews } from '@/actions/product.actions'

type ProductReviewsResponse = Awaited<
  ReturnType<typeof getProductReviews>
>['reviews'][number]

interface ProductReviewsProps {
  productId: string
  initialReviews: ProductReviewsResponse[]
  reviewCount: number
  averageRating: number
}

export function ProductReviews({
  productId,
  initialReviews,
  reviewCount,
  averageRating,
}: ProductReviewsProps) {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: () => getProductReviews(productId, page),
    placeholderData:
      page === 1
        ? {
            reviews: initialReviews,
            total: reviewCount,
            totalPages: Math.ceil(reviewCount / 5),
            ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          }
        : undefined,
  })

  // Che tên: "Nguyễn Văn A" → "Nguyễn V*** A"
  function maskName(name: string): string {
    const parts = name.split(' ')
    if (parts.length <= 1) return name
    const masked = parts.map((p, i) => {
      if (i === 0 || i === parts.length - 1) return p
      return p[0] + '***'
    })
    return masked.join(' ')
  }

  function Star() {
    return <span className="text-xs text-amber-400">★</span>
  }

  return (
    <div className="space-y-8" id="reviews">
      <h2 className="text-xl font-semibold">Đánh giá sản phẩm</h2>

      {reviewCount > 0 ? (
        <>
          {/* Rating overview */}
          <div className="flex gap-8">
            <div className="flex flex-col items-center justify-center">
              <span className="text-5xl font-bold">
                {averageRating.toFixed(1)}
              </span>
              <StarRating rating={averageRating} />
              <span className="text-muted-foreground mt-1 text-sm">
                {reviewCount} đánh giá
              </span>
            </div>
            {/* Breakdown */}
            {data && (
              <div className="flex-1 space-y-1.5">
                {([5, 4, 3, 2, 1] as const).map((star) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-4 shrink-0">{star}</span>
                    <Star />
                    <Progress
                      value={
                        reviewCount > 0
                          ? (data.ratingBreakdown[star] / reviewCount) * 100
                          : 0
                      }
                      className="h-2 flex-1"
                    />
                    <span className="text-muted-foreground w-6 shrink-0 text-right text-xs">
                      {data.ratingBreakdown[star]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review list */}
          <div className="space-y-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              : data?.reviews.map((review: ProductReviewsResponse) => (
                  <div key={review.id} className="flex gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={review.user.imageUrl ?? undefined} />
                      <AvatarFallback>
                        {review.user.name?.[0]?.toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {maskName(review.user.name ?? 'Ẩn danh')}
                          </span>
                          {review.verifiedPurchase && (
                            <span className="rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-xs text-green-600">
                              Đã mua hàng
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      {review.title && (
                        <p className="text-sm font-medium">{review.title}</p>
                      )}
                      {review.content && (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {review.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ),
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
        </p>
      )}
    </div>
  )
}
