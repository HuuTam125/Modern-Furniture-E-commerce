// src/features/products/components/product-card.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingCart, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/shared/star-rating'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductCard as ProductCardType } from '@/types/product'

interface ProductCardProps {
  product: ProductCardType
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isNew, setIsNew] = useState(false)

  const primaryImage = product.images[0]
  const hoverImage = product.images[1]
  const lowestPriceVariant = product.variants[0]
  const isOutOfStock = product.variants.every((v) => v.stock === 0)
  const flashSale = product.flashSaleItems[0]

  useEffect(() => {
    const checkIsNew =
      Date.now() - new Date(product.createdAt).getTime() <
      7 * 24 * 60 * 60 * 1000
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsNew(checkIsNew)
  }, [product.createdAt])

  // Giá hiển thị: flash sale nếu có, không thì giá thấp nhất của variant
  const displayPrice = flashSale?.salePrice ?? lowestPriceVariant?.price
  const originalPrice = flashSale ? lowestPriceVariant?.price : null

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isNew && !flashSale && (
          <Badge className="bg-zinc-900 text-xs text-white">Mới</Badge>
        )}
        {flashSale && (
          <Badge className="bg-red-500 text-xs text-white">Sale</Badge>
        )}
        {isOutOfStock && (
          <Badge variant="secondary" className="text-xs">
            Hết hàng
          </Badge>
        )}
      </div>

      {/* Wishlist button */}
      <button className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-white">
        <Heart className="h-4 w-4" />
      </button>

      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className="block overflow-hidden rounded-lg bg-gray-100"
      >
        <div className="relative aspect-square">
          {primaryImage && (
            <Image
              src={isHovered && hoverImage ? hoverImage.url : primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-all duration-500',
                isOutOfStock && 'opacity-60',
              )}
              priority={false}
            />
          )}
        </div>
      </Link>

      {/* Quick add button — hiện khi hover */}
      {!isOutOfStock && (
        <div
          className={cn(
            'absolute right-0 bottom-18 left-0 px-2 transition-all duration-200',
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
          <Button
            size="sm"
            className="w-full border bg-white text-xs text-zinc-900 shadow-md hover:bg-zinc-100"
            onClick={(e) => {
              e.preventDefault()
            }}
          >
            <ShoppingCart className="mr-1 h-3 w-3" />
            Thêm vào giỏ
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="mt-3 flex flex-col gap-1">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-medium hover:underline"
        >
          {product.name}
        </Link>

        {/* Rating */}
        {product._count.reviews > 0 && (
          <div className="flex items-center gap-1">
            <StarRating rating={Number(product.averageRating)} size="sm" />
            <span className="text-muted-foreground text-xs">
              ({product._count.reviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span
            className={cn('text-sm font-semibold', flashSale && 'text-red-500')}
          >
            {displayPrice ? formatPrice(Number(displayPrice)) : 'Liên hệ'}
          </span>
          {originalPrice && (
            <span className="text-muted-foreground text-xs line-through">
              {formatPrice(Number(originalPrice))}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
