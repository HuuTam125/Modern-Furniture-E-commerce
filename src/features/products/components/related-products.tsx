// src/features/products/components/related-products.tsx
import type { ProductCard as ProductCardType } from '@/types/product'
import { ProductCard } from './product-card'

export function RelatedProducts({ products }: { products: ProductCardType[] }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
