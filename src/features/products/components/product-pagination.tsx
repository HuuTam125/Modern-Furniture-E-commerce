// src/features/products/components/product-pagination.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '@/types'
import { cn } from '@/lib/utils'

type ProductPaginationProps = {
  meta: PaginationMeta
}
export function ProductPagination({ meta }: ProductPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (meta.totalPages <= 1) return null

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`, { scroll: true })
  }

  // Hiển thị tối đa 5 trang xung quanh trang hiện tại
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 2,
  )
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        disabled={meta.page === 1}
        onClick={() => goToPage(meta.page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) => {
        const prev = pages[index - 1]
        const showEllipsis = prev && page - prev > 1

        return (
          <div key={page} className="flex items-center gap-2">
            {showEllipsis && (
              <span className="text-muted-foreground px-1 text-sm">...</span>
            )}
            <Button
              variant={page === meta.page ? 'default' : 'outline'}
              size="icon"
              onClick={() => goToPage(page)}
              className={cn(
                'h-9 w-9 text-sm',
                page === meta.page && 'pointer-events-none',
              )}
            >
              {page}
            </Button>
          </div>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        disabled={meta.page === meta.totalPages}
        onClick={() => goToPage(meta.page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
