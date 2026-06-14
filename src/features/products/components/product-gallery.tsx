// src/features/products/components/product-gallery.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/generated/prisma/client'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-xl bg-gray-100" />
  }

  const activeImage = images[activeIndex]

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={activeImage.url}
          alt={activeImage.altText ?? productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-2 transition-all',
                index === activeIndex
                  ? 'ring-zinc-900'
                  : 'ring-transparent hover:ring-zinc-300',
              )}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `${productName} ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
