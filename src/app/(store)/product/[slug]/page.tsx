// src/app/(store)/(routes)/product/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug, getRelatedProducts } from '@/actions/product.actions'
import { ProductGallery } from '@/features/products/components/product-gallery'
import { ProductInfo } from '@/features/products/components/product-info'
import { ProductVariantSelector } from '@/features/products/components/product-variant-selector'
import { ProductSpecTabs } from '@/features/products/components/product-spec-tabs'
import { ProductReviews } from '@/features/products/components/product-reviews'
import { RelatedProducts } from '@/features/products/components/related-products'
import { Separator } from '@/components/ui/separator'

// ISR: revalidate mỗi 5 phút
export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) return { title: 'Sản phẩm không tồn tại' }

  return {
    title: product.name,
    description: product.shortDesc ?? product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDesc ?? '',
      images: product.images[0]
        ? [{ url: product.images[0].url, alt: product.name }]
        : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const categoryIds = product.categories.map((c) => c.categoryId)
  const relatedProducts = await getRelatedProducts(product.id, categoryIds)

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground mb-6 flex items-center gap-2 text-sm">
        <link href="/" className="hover:text-foreground">
          Trang chủ
        </link>
        <span>/</span>
        <a href="/products" className="hover:text-foreground">
          Sản phẩm
        </a>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Main: Gallery + Info */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />
        <div className="space-y-6">
          <ProductInfo product={product} />
          <ProductVariantSelector product={product} />
        </div>
      </div>

      <Separator className="my-12" />

      {/* Spec Tabs */}
      <ProductSpecTabs product={product} />

      <Separator className="my-12" />

      {/* Reviews */}
      <ProductReviews
        productId={product.id}
        initialReviews={product.reviews}
        reviewCount={product._count.reviews}
        averageRating={Number(product.averageRating)}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <>
          <Separator className="my-12" />
          <RelatedProducts products={relatedProducts} />
        </>
      )}
    </div>
  )
}
