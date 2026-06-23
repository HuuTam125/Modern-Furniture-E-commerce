// src/types/product.ts
import type {
  Product,
  ProductImage,
  ProductVariant,
  ProductCategory,
  Category,
  ProductSpec,
  ProductTag,
  Review,
  User,
  FlashSaleItem,
  FlashSale,
} from '@/generated/prisma/client'

// ── Product với đầy đủ relations dùng ở PDP ─────────────────────
export type ProductWithDetails = Product & {
  images: ProductImage[]
  variants: ProductVariant[]
  categories: (ProductCategory & { category: Category })[]
  tags: ProductTag[]
  spec: ProductSpec | null
  reviews: (Review & { user: Pick<User, 'name' | 'imageUrl'> })[]
  flashSaleItems: (FlashSaleItem & { flashSale: FlashSale })[]
  _count: { reviews: number }
}

// ── Product card dùng ở PLP (dữ liệu tối thiểu) ─────────────────
export type ProductCard = Product & {
  images: Pick<ProductImage, 'url' | 'altText' | 'position'>[]
  variants: Pick<
    ProductVariant,
    'id' | 'price' | 'stock' | 'attributes' | 'isDefault'
  >[]
  _count: { reviews: number }
  flashSaleItems: (FlashSaleItem & {
    flashSale: Pick<FlashSale, 'endAt' | 'isActive'>
  })[]
}

// ── Variant attributes (JSON field) ─────────────────────────────
export interface VariantAttributes {
  color?: string
  colorHex?: string
  material?: string
  size?: string
}

// ── Admin product list item ──────────────────────────────────────
export type AdminProductListItem = Product & {
  images: Pick<ProductImage, 'url'>[]
  categories: (ProductCategory & { category: Pick<Category, 'name'> })[]
  variants: Pick<ProductVariant, 'id' | 'sku' | 'price' | 'stock'>[]
  _count: { reviews: number }
}
