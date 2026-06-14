// src/features/products/components/product-info.tsx
'use client'

import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/shared/star-rating'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ProductWithDetails } from '@/types/product'

interface ProductInfoProps {
  product: ProductWithDetails
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [copied, setCopied] = useState(false)
  const activeFlashSale = product.flashSaleItems[0]
  const lowestVariantPrice = Math.min(
    ...product.variants.map((v) => Number(v.price)),
  )
  const hasMultiplePrices = product.variants.some(
    (v) => Number(v.price) !== lowestVariantPrice,
  )

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Category badges */}
      <div className="flex flex-wrap gap-1">
        {product.categories.map(({ category }) => (
          <Badge key={category.id} variant="secondary" className="text-xs">
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Name */}
      <h1 className="text-2xl leading-tight font-semibold md:text-3xl">
        {product.name}
      </h1>

      {/* Rating */}
      {product._count.reviews > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={Number(product.averageRating)} />
          <span className="text-muted-foreground text-sm">
            {Number(product.averageRating).toFixed(1)} ({product._count.reviews}{' '}
            đánh giá)
          </span>
        </div>
      )}

      {/* Price */}
      <div className="space-y-1">
        {activeFlashSale ? (
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-red-500">
              {formatPrice(Number(activeFlashSale.salePrice))}
            </span>
            <span className="text-muted-foreground text-base line-through">
              {formatPrice(lowestVariantPrice)}
            </span>
            <Badge className="bg-red-500 text-xs text-white">
              -
              {Math.round(
                (1 - Number(activeFlashSale.salePrice) / lowestVariantPrice) *
                  100,
              )}
              %
            </Badge>
          </div>
        ) : (
          <span className="text-2xl font-bold">
            {hasMultiplePrices ? 'Từ ' : ''}
            {formatPrice(lowestVariantPrice)}
          </span>
        )}
      </div>

      {/* Short description */}
      {product.shortDesc && (
        <p className="text-muted-foreground text-sm leading-relaxed">
          {product.shortDesc}
        </p>
      )}

      {/* Share */}
      <Button
        variant="ghost"
        size="sm"
        onClick={copyLink}
        className="h-8 text-xs"
      >
        {copied ? (
          <>
            <Check className="mr-1 h-3 w-3 text-green-500" />
            Đã sao chép link
          </>
        ) : (
          <>
            <Share2 className="mr-1 h-3 w-3" />
            Chia sẻ
          </>
        )}
      </Button>
    </div>
  )
}
