// src/features/products/components/product-variant-selector.tsx
'use client'

import { useState } from 'react'
import { ShoppingCart, Heart, Minus, Plus, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductWithDetails, VariantAttributes } from '@/types/product'
import type { ProductVariant } from '@/generated/prisma/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProductVariantSelectorProps {
  product: ProductWithDetails
}

export function ProductVariantSelector({
  product,
}: ProductVariantSelectorProps) {
  const router = useRouter()

  // Tìm variant mặc định
  const defaultVariant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0]
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant>(defaultVariant)
  const [quantity, setQuantity] = useState(1)

  const attrs = selectedVariant?.attributes as VariantAttributes
  const isOutOfStock = selectedVariant.stock === 0

  // Lấy tất cả unique values cho từng attribute
  const allColors = [
    ...new Map(
      product.variants
        .map((v) => {
          const a = v.attributes as VariantAttributes
          return a.color ? [a.color, a.colorHex] : null
        })
        .filter(Boolean)
        .map((pair) => [pair![0], pair] as [string, (string | undefined)[]]),
    ).values(),
  ]

  const allMaterials = [
    ...new Set(
      product.variants
        .map((v) => (v.attributes as VariantAttributes).material)
        .filter(Boolean),
    ),
  ]

  const allSizes = [
    ...new Set(
      product.variants
        .map((v) => (v.attributes as VariantAttributes).size)
        .filter(Boolean),
    ),
  ]

  // Tìm variant phù hợp khi chọn attribute
  function selectByAttribute(key: keyof VariantAttributes, value: string) {
    const current = selectedVariant.attributes as VariantAttributes
    const newAttrs = { ...current, [key]: value }

    const match = product.variants.find((v) => {
      const a = v.attributes as VariantAttributes
      return Object.entries(newAttrs).every(
        ([k, val]) => !val || a[k as keyof VariantAttributes] === val,
      )
    })

    if (match) {
      setSelectedVariant(match)
      setQuantity(1) // Reset quantity khi đổi variant
    }
  }

  function handleAddToCart() {
    if (isOutOfStock) return
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
  }

  function handleBuyNow() {
    handleAddToCart()
    router.push('/cart')
  }

  return (
    <div className="space-y-6">
      {/* Color Swatch */}
      {allColors.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Màu sắc</span>
            {attrs.color && (
              <span className="text-muted-foreground text-sm">
                {attrs.color}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allColors.map(([color, hex]) => {
              const isSelected = attrs.color === color
              const variantWithColor = product.variants.find(
                (v) => (v.attributes as VariantAttributes).color === color,
              )
              const isUnavailable = variantWithColor?.stock === 0

              return (
                <button
                  key={color}
                  onClick={() => selectByAttribute('color', color!)}
                  title={color}
                  disabled={isUnavailable}
                  className={cn(
                    'relative h-8 w-8 rounded-full border-2 transition-all',
                    isSelected
                      ? 'scale-110 border-zinc-900'
                      : 'border-transparent hover:border-zinc-400',
                    isUnavailable && 'cursor-not-allowed opacity-40',
                  )}
                  style={{ backgroundColor: hex ?? color }}
                >
                  {isUnavailable && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-px w-full rotate-45 bg-zinc-400" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Material */}
      {allMaterials.length > 1 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">Chất liệu</span>
          <div className="flex flex-wrap gap-2">
            {allMaterials.map((material) => {
              const isSelected = attrs.material === material
              const variantWithMaterial = product.variants.find(
                (v) =>
                  (v.attributes as VariantAttributes).material === material,
              )
              const isUnavailable = variantWithMaterial?.stock === 0

              return (
                <button
                  key={material}
                  onClick={() => selectByAttribute('material', material!)}
                  disabled={isUnavailable}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm transition-all',
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-border hover:border-zinc-400',
                    isUnavailable &&
                      'cursor-not-allowed line-through opacity-40',
                  )}
                >
                  {material}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size */}
      {allSizes.length > 1 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">Kích thước</span>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => {
              const isSelected = attrs.size === size
              const variantWithSize = product.variants.find(
                (v) => (v.attributes as VariantAttributes).size === size,
              )
              const isUnavailable = variantWithSize?.stock === 0

              return (
                <button
                  key={size}
                  onClick={() => selectByAttribute('size', size!)}
                  disabled={isUnavailable}
                  className={cn(
                    'rounded-md border px-4 py-1.5 text-sm transition-all',
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-border hover:border-zinc-400',
                    isUnavailable &&
                      'cursor-not-allowed line-through opacity-40',
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected variant price */}
      {selectedVariant &&
        Number(selectedVariant.price) !== Number(product.basePrice) && (
          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <span className="text-muted-foreground">Giá variant đã chọn: </span>
            <span className="font-semibold">
              {formatPrice(Number(selectedVariant.price))}
            </span>
          </div>
        )}

      {/* Stock status */}
      <div className="text-sm">
        {isOutOfStock ? (
          <span className="font-medium text-red-500">Hết hàng</span>
        ) : selectedVariant.stock <= 5 ? (
          <span className="text-orange-500">
            Chỉ còn {selectedVariant.stock} sản phẩm
          </span>
        ) : (
          <span className="text-green-600">
            Còn hàng ({selectedVariant.stock})
          </span>
        )}
      </div>

      {/* Quantity + Add to cart */}
      {!isOutOfStock && (
        <div className="space-y-3">
          {/* Quantity selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Số lượng</span>
            <div className="flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="min-w-[2.5rem] text-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={() =>
                  setQuantity((q) => Math.min(q + 1, selectedVariant.stock))
                }
                disabled={quantity >= selectedVariant.stock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 bg-zinc-900 hover:bg-zinc-700"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ hàng
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={handleBuyNow}
            >
              <Zap className="mr-2 h-4 w-4" />
              Mua ngay
            </Button>
          </div>

          {/* Wishlist */}
          <Button variant="ghost" size="sm" className="w-full">
            <Heart className="mr-2 h-4 w-4" />
            Thêm vào Wishlist
          </Button>
        </div>
      )}

      {/* Shipping note */}
      <div className="text-muted-foreground space-y-1 rounded-lg border border-dashed p-3 text-xs">
        <p>🚚 Miễn phí vận chuyển cho đơn từ 5.000.000đ</p>
        <p>📦 Giao hàng tiêu chuẩn: 3–5 ngày</p>
        <p>⚡ Giao hàng nhanh: 1–2 ngày (+150.000đ)</p>
      </div>
    </div>
  )
}
