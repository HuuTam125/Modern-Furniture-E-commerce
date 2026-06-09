// src/app/(store)/products/page.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getProducts } from '@/actions/product.actions'
import { getAllCategories } from '@/actions/category.actions'
import { ProductGrid } from '@/features/products/components/product-grid'
import { ProductFilters } from '@/features/products/components/product-filters'
import { ProductSort } from '@/features/products/components/product-sort'
import { ProductGridSkeleton } from '@/features/products/components/product-grid-skeleton'
import { ProductCount } from '@/features/products/components/product-count'

export const metadata: Metadata = { title: 'Tất cả sản phẩm' }

// Không cache trang này
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams

  const [categoriesResult, productsResult] = await Promise.all([
    getAllCategories(),
    getProducts(params),
  ])

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Tất cả sản phẩm</h1>
        <ProductCount total={productsResult.meta.total} />
      </div>

      <div className="flex gap-8">
        {/* Sidebar filter — Desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <ProductFilters categories={categoriesResult} />
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Toolbar: sort filter toggle */}
          <div className="mb-4 flex items-center justify-between">
            <ProductSort />
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              products={productsResult.items}
              meta={productsResult.meta}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
