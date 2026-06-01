// src/actions/product.actions.ts
'use server'

import { productFilterSchema } from '@/validations/search'
import { PRODUCTS_PER_PAGE } from './../lib/constants'
import { FurnitureStyle, Prisma } from '@/generated/prisma/client'
import { ProductCard, ProductWithDetails } from '@/types/product'
import { withCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import prisma from '@/lib/prisma'

// ── Lấy danh sách sản phẩm (PLP) ──────────────────────────────
export async function getProducts(
  rawParams: Record<string, string | string[] | undefined>,
) {
  const params = productFilterSchema.parse({
    q: rawParams.q,
    categories: rawParams.categories,
    styles: rawParams.styles,
    colors: rawParams.colors,
    materials: rawParams.materials,
    minPrice: rawParams.minPrice,
    maxPrice: rawParams.maxPrice,
    rating: rawParams.rating,
    inStock: rawParams.inStock,
    sort: rawParams.sort ?? 'newest',
    page: rawParams.page ?? 1,
  })

  const page = params.page
  const skip = (page - 1) * PRODUCTS_PER_PAGE

  // Build WHERE clause
  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    deletedAt: null,

    // Full-text search
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: 'insensitive' } },
        { shortDesc: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
        {
          tags: { some: { tag: { contains: params.q, mode: 'insensitive' } } },
        },
      ],
    }),

    // Filter theo category (slugs)
    ...(params.categories && {
      categories: {
        some: {
          category: {
            slug: { in: params.categories.split(',').filter(Boolean) },
          },
        },
      },
    }),

    // Filter theo style
    ...(params.styles && {
      style: {
        in: params.styles.split(',').filter(Boolean) as FurnitureStyle[],
      },
    }),

    // Filter theo giá
    ...((params.minPrice !== undefined || params.maxPrice !== undefined) && {
      basePrice: {
        ...(params.minPrice !== undefined && { gte: params.minPrice }),
        ...(params.maxPrice !== undefined && { lte: params.maxPrice }),
      },
    }),

    // Filter theo rating
    ...(params.rating !== undefined && {
      averageRating: { gte: params.rating },
    }),

    // Filter theo color/material (từ variant attributes)
    ...((params.colors || params.materials) && {
      variants: {
        some: {
          stock: { gt: 0 },
          AND: [
            ...(params.colors
              ? [
                  {
                    attributes: {
                      path: ['color'],
                      string_contains: params.colors.split(',')[0],
                    },
                  },
                ]
              : []),
          ],
        },
      },
    }),

    // Filter hàng còn
    ...(params.inStock && {
      variants: { some: { stock: { gt: 0 } } },
    }),
  }

  // Build ORDER BY
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === 'price_asc'
      ? { basePrice: 'asc' }
      : params.sort === 'price_desc'
        ? { basePrice: 'desc' }
        : params.sort === 'best_selling'
          ? { totalSold: 'desc' }
          : params.sort === 'top_rated'
            ? { averageRating: 'desc' }
            : { createdAt: 'desc' } // newest (default)

  // Chạy 2 queries song song: data + total count
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: PRODUCTS_PER_PAGE,
      include: {
        images: {
          orderBy: { position: 'asc' },
          take: 2, // Chỉ lấy 2 ảnh đầu cho card (hover effect)
        },
        variants: {
          where: { stock: { gte: 0 } },
          orderBy: { price: 'asc' },
          select: {
            id: true,
            price: true,
            stock: true,
            attributes: true,
            isDefault: true,
          },
        },
        _count: { select: { reviews: true } },
        flashSaleItems: {
          where: {
            flashSale: {
              isActive: true,
              startAt: { lte: new Date() },
              endAt: { gte: new Date() },
            },
          },
          include: {
            flashSale: {
              select: { endAt: true, isActive: true },
            },
          },
          take: 1,
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  return {
    items: products as ProductCard[],
    meta: {
      total,
      page,
      perPage: PRODUCTS_PER_PAGE,
      totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
    },
  }
}

// ── Lấy chi tiết sản phẩm theo slug (PDP) ──────────────────────
export async function getProductBySlug(
  slug: string,
): Promise<ProductWithDetails | null> {
  return withCache(CACHE_KEYS.PRODUCT(slug), CACHE_TTL.PRODUCT, async () => {
    const product = await prisma.product.findFirst({
      where: { slug, isPublished: true, deletedAt: null },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: { orderBy: [{ isDefault: 'desc' }, { price: 'asc' }] },
        categories: { include: { category: true } },
        tags: true,
        spec: true,
        _count: { select: { reviews: true } },
        flashSaleItems: {
          where: {
            flashSale: {
              isActive: true,
              startAt: { lte: new Date() },
              endAt: { gte: new Date() },
            },
          },
          include: { flashSale: true },
        },
        reviews: {
          where: { verifiedPurchase: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: { select: { name: true, imageUrl: true } },
          },
        },
      },
    })
    return product as ProductWithDetails | null
  })
}

// ── Sản phẩm liên quan ──────────────────────────────────────────

export async function getRelatedProducts(
  productId: string,
  categoryIds: string[],
  limit = 4,
): Promise<ProductCard[]> {
  const products = await prisma.product.findMany({
    where: {
      id: { not: productId },
      isPublished: true,
      deletedAt: null,
      categories: { some: { categoryId: { in: categoryIds } } },
    },
    orderBy: { totalSold: 'desc' },
    take: limit,
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
      variants: {
        orderBy: { price: 'asc' },
        take: 1,
        select: {
          id: true,
          price: true,
          stock: true,
          attributes: true,
          isDefault: true,
        },
      },
      _count: { select: { reviews: true } },
      flashSaleItems: {
        where: {
          flashSale: {
            isActive: true,
            startAt: { lte: new Date() },
            endAt: { gte: new Date() },
          },
        },
        include: { flashSale: { select: { endAt: true, isActive: true } } },
        take: 1,
      },
    },
  })

  return products as ProductCard[]
}
