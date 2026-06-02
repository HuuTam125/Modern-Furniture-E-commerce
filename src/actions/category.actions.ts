// src/actions/category.actions.ts
'use server'

import prisma from '@/lib/prisma'
import type { Category } from '@/generated/prisma/client'
import { withCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

// ── Lấy tất cả categories (dùng cho filter, menu) ───────────────
export type CategoryWithChildren = Category & {
  children: Category[]
  _count: { products: number }
}
export async function getAllCategories(): Promise<CategoryWithChildren[]> {
  return withCache(CACHE_KEYS.CATEGORIES, CACHE_TTL.CATEGORIES, async () => {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: {
              where: { product: { isPublished: true, deletedAt: null } },
            },
          },
        },
      },
    })

    return categories as CategoryWithChildren[]
  })
}

// ── Lấy category theo slug ───────────────────────────────────────
export async function getCategoryBySlug(slug: string) {
  return await prisma.category.findFirst({
    where: {
      slug,
    },
    include: {
      children: true,
      parent: true,
    },
  })
}

// ── Best sellers (dùng ở Homepage) ──────────────────────────────
export async function getBestSellers(limit = 8) {
  return withCache(
    CACHE_KEYS.BEST_SELLERS,
    CACHE_TTL.BEST_SELLERS,
    async () => {
      return prisma.product.findMany({
        where: { isPublished: true, deletedAt: null, totalSold: { gt: 0 } },
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
    },
  )
}

// ──  Featured products (dùng ở Homepage) ─────────────────────────
export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isPublished: true, isFeatured: true, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      images: { orderBy: { position: 'asc' }, take: 2 },
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
}
