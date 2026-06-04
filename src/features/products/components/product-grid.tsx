// src/features/products/components/product-grid.tsx
import { ProductCard } from './product-card'
import type { ProductCard as ProductCardType } from '@/types/product'
import type { PaginationMeta } from '@/types'

interface ProductGridProps {
  products: ProductCardType[]
  meta: PaginationMeta
}

export function ProductGrid({ products, meta }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3 text-center">
        <p className="text-muted-foreground text-lg">
          Không tìm thấy sản phẩm nào
        </p>
        <p className="text-muted-foreground text-sm">
          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
