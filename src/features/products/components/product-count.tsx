// src/features/products/components/product-count.tsx
interface ProductCountProps {
  total: number
}

export function ProductCount({ total }: ProductCountProps) {
  return (
    <p className="text-muted-foreground mt-1 text-sm">
      {total.toLocaleString('vi-VN')} sản phẩm
    </p>
  )
}
