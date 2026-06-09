// src/features/products/components/product-filters.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { CategoryWithChildren } from '@/actions/category.actions'
import { FurnitureStyle } from '@/generated/prisma/enums'
import { formatPrice } from '@/lib/utils'

const STYLE_LABELS: Record<FurnitureStyle, string> = {
  SCANDINAVIAN: 'Scandinavian',
  INDUSTRIAL: 'Industrial',
  MINIMALIST: 'Minimalist',
  JAPANDI: 'Japandi',
  BOHEMIAN: 'Bohemian',
  CONTEMPORARY: 'Contemporary',
}

const COLORS = [
  { label: 'Oak', hex: '#C4A882' },
  { label: 'Walnut', hex: '#5C4033' },
  { label: 'White', hex: '#F5F5F5' },
  { label: 'Black', hex: '#1A1A1A' },
  { label: 'Grey', hex: '#9E9E9E' },
]

const MATERIALS = ['Wood', 'Metal', 'Fabric', 'Leather', 'Glass', 'Rattan']

interface ProductFiltersProps {
  categories: CategoryWithChildren[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Cập nhật một param, reset page về 1
  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else params.delete(key)
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  // Cập nhật một param dạng mảng, reset page về 1
  const toggleListParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const current = params.get(key)?.split(',').filter(Boolean) ?? []
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      if (newValues.length > 0) {
        params.set(key, newValues.join(','))
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  // Current filter values
  const activeCategories = searchParams.get('categories')?.split(',') ?? []
  const activeStyles = searchParams.get('styles')?.split(',') ?? []
  const activeColors = searchParams.get('colors')?.split(',') ?? []
  const activeMaterials = searchParams.get('materials')?.split(',') ?? []
  const minPrice = Number(searchParams.get('minPrice') ?? 0)
  const maxPrice = Number(searchParams.get('maxPrice') ?? 50_000_000)
  const inStock = searchParams.get('inStock') === 'true'

  // Đếm số filter đang active
  const activeCount = [
    activeCategories.length > 0,
    activeStyles.length > 0,
    activeColors.length > 0,
    activeMaterials.length > 0,
    searchParams.has('minPrice') || searchParams.has('maxPrice'),
    inStock,
  ].filter(Boolean).length

  function clearAllFilters() {
    const params = new URLSearchParams()
    const sort = searchParams.get('sort')
    if (sort) params.set('sort', sort)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-medium">
          Bộ lọc
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {activeCount}
            </Badge>
          )}
        </span>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Xóa tất cả
          </Button>
        )}
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Danh mục</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={activeCategories.includes(cat.slug)}
                  onCheckedChange={() =>
                    toggleListParam('categories', cat.slug)
                  }
                />
                <Label
                  htmlFor={`cat-${cat.id}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {cat.name}
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({cat._count.products})
                  </span>
                </Label>
              </div>
              {/* Sub-categories */}
              {cat.children.length > 0 && (
                <div className="mt-1 ml-6 space-y-1">
                  {cat.children.map((child) => (
                    <div key={child.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`cat-${child.id}`}
                        checked={activeCategories.includes(child.slug)}
                        onCheckedChange={() =>
                          toggleListParam('categories', child.slug)
                        }
                      />
                      <Label
                        htmlFor={`cat-${child.id}`}
                        className="cursor-pointer text-xs font-normal"
                      >
                        {child.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Khoảng giá</h3>
        <Slider
          min={0}
          max={50_000_000}
          step={500_000}
          value={[minPrice, maxPrice]}
          onValueCommit={([min, max]) => {
            const params = new URLSearchParams(searchParams.toString())
            if (min > 0) params.set('minPrice', String(min))
            else params.delete('minPrice')
            if (max < 50_000_000) params.set('maxPrice', String(max))
            else params.delete('maxPrice')
            params.delete('page')
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
          }}
          className="mt-2"
        />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>{formatPrice(minPrice)}</span>
          <span>{formatPrice(maxPrice)}</span>
        </div>
      </div>

      <Separator />

      {/* Style */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Phong cách</h3>
        <div className="space-y-2">
          {Object.entries(STYLE_LABELS).map(([value, label]) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox
                id={`style-${value}`}
                checked={activeStyles.includes(value)}
                onCheckedChange={() => toggleListParam('styles', value)}
              />
              <Label
                htmlFor={`style-${value}`}
                className="cursor-pointer text-sm font-normal"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Color */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Màu sắc</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(({ label, hex }) => (
            <button
              key={label}
              onClick={() => toggleListParam('colors', label)}
              title={label}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all ${
                activeColors.includes(label)
                  ? 'border-zinc-900 bg-zinc-50 font-medium'
                  : 'border-border hover:border-zinc-400'
              }`}
            >
              <span
                className="h-3 w-3 rounded-full border border-black/10"
                style={{ backgroundColor: hex }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Material */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Chất liệu</h3>
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map((material) => (
            <button
              key={material}
              onClick={() => toggleListParam('materials', material)}
              className={`rounded-md border px-3 py-1 text-xs transition-all ${
                activeMaterials.includes(material)
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-border hover:border-zinc-400'
              }`}
            >
              {material}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Còn hàng */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={inStock}
          onCheckedChange={(checked) =>
            updateParam('inStock', checked ? 'true' : null)
          }
        />
        <Label
          htmlFor="in-stock"
          className="cursor-pointer text-sm font-normal"
        >
          Chỉ hiện hàng còn
        </Label>
      </div>
    </div>
  )
}
