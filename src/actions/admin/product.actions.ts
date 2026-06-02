// src/actions/admin/product.actions.ts
'use server'

import type { ActionResponse } from '@/types'
import type { Product } from '@/generated/prisma/client'
import { requireAdmin } from '@/lib/auth'
import { productSchemaWithValidation } from '@/validations/product'
import { revalidatePath } from 'next/cache'
import { invalidateCache, CACHE_KEYS } from '@/lib/cache'
import slugify from 'slugify'
import z from 'zod'
import prisma from '@/lib/prisma'

// ── Tạo sản phẩm mới ────────────────────────────────────────────

export async function createProduct(
  input: unknown,
): Promise<ActionResponse<Product>> {
  try {
    await requireAdmin()

    const parsed = productSchemaWithValidation.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Dữ liệu không hợp lệ',
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      }
    }

    const { categoryIds, tags, images, variants, spec, ...productData } =
      parsed.data

    // Tạo slug
    let slug = slugify(productData.name, { lower: true, strict: true })
    const existing = await prisma.product.findFirst({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    // Tạo product trong transaction (tất cả hoặc không gì)
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          ...productData,
          slug,
          // Tạo categories relation
          categories: {
            create: categoryIds.map((id) => ({ categoryId: id })),
          },
          // Tạo tags
          tags: {
            create: tags.map((tag) => ({ tag })),
          },
          // Tạo images
          images: {
            create: images.map((img, index) => ({
              url: img.url,
              altText: img.altText ?? productData.name,
              position: index,
            })),
          },
          // Tạo variants
          variants: {
            create: variants.map((v) => ({
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              attributes: v.attributes,
              isDefault: v.isDefault,
              imageUrl: v.imageUrl || null,
            })),
          },
          // Tạo spec nếu có
          ...(spec && {
            spec: { create: spec },
          }),
        },
      })

      return newProduct
    })

    revalidatePath('/dashboard/products')
    revalidatePath('/products')

    return { success: true, data: product }
  } catch (err) {
    console.error('[createProduct]', err)
    return { success: false, error: 'Không thể tạo sản phẩm' }
  }
}

// ── Cập nhật sản phẩm ───────────────────────────────────────────
export async function updateProduct(
  productId: string,
  input: unknown,
): Promise<ActionResponse<Product>> {
  try {
    requireAdmin()
    const parsed = productSchemaWithValidation.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Dữ liệu không hợp lệ',
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      }
    }
    const existing = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })
    if (!existing) {
      return {
        success: false,
        error: 'Sản phẩm không tồn tại',
      }
    }

    const { categoryIds, tags, images, variants, spec, name, ...productData } =
      parsed.data

    // Chỉ tạo slug mới nếu tên thay đổi
    let slug = existing.slug
    if (name === existing.name) {
      slug = slugify(name, { lower: true, strict: true })
      const slugConflict = await prisma.product.findFirst({
        where: { slug, id: { not: productId } },
      })
      if (slugConflict) slug = `${slug}-${Date.now()}`
    }

    const product = await prisma.$transaction(async (tx) => {
      // Xóa quan hệ cũ và tạo lại
      await tx.productCategory.deleteMany({ where: { productId } })
      await tx.productTag.deleteMany({ where: { productId } })
      // Chỉ xóa images không còn trong danh sách mới
      const newImageUrls = images.map((i) => i.url)
      await tx.productImage.deleteMany({
        where: {
          productId,
          url: {
            notIn: newImageUrls,
          },
        },
      })
      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          ...productData,
          name,
          slug,
          categories: {
            create: categoryIds.map((id) => ({ categoryId: id })),
          },
          tags: {
            create: tags.map((tag) => ({ tag })),
          },
          images: {
            upsert: images.map((img, index) => ({
              where: { id: img.id ?? 'new-id' },
              create: { url: img.url, altText: img.altText, position: index },
              update: { altText: img.altText, position: index },
            })),
          },
        },
      })
      // Xử lý variants: upsert existing, create new, delete removed
      for (const variant of variants) {
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
              attributes: variant.attributes,
              isDefault: variant.isDefault,
              imageUrl: variant.imageUrl || null,
            },
          })
        } else {
          await tx.productVariant.create({
            data: {
              productId,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
              attributes: variant.attributes,
              isDefault: variant.isDefault,
              imageUrl: variant.imageUrl || null,
            },
          })
        }
      }

      // Upsert spec
      if (spec) {
        await tx.productSpec.upsert({
          where: { productId },
          create: { ...spec, productId },
          update: spec,
        })
      }

      return updated
    })

    invalidateCache(CACHE_KEYS.PRODUCT(existing.slug))
    if (slug !== existing.slug) await invalidateCache(CACHE_KEYS.PRODUCT(slug))

    revalidatePath('/dashboard/products')
    revalidatePath(`/product/${slug}`)
    revalidatePath('/products')

    return { success: true, data: product }
  } catch (err) {
    console.error('[updateProduct]', err)
    return { success: false, error: 'Không thể cập nhật sản phẩm' }
  }
}

// ── Soft delete sản phẩm ────────────────────────────────────────
export async function deleteProduct(
  productId: string,
): Promise<ActionResponse> {
  try {
    await requireAdmin()

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })
    if (!product) return { success: false, error: 'Sản phẩm không tồn tại' }

    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), isPublished: false },
    })

    invalidateCache(CACHE_KEYS.PRODUCT(product.slug))

    revalidatePath('/dashboard/products')
    revalidatePath('/products')

    return { success: true }
  } catch (err) {
    console.error('[deleteProduct]', err)
    return { success: false, error: 'Không thể xóa sản phẩm' }
  }
}

// ── Toggle publish ───────────────────────────────────────────────
export async function toggleProductPublish(
  productId: string,
  isPublished: boolean,
): Promise<ActionResponse> {
  try {
    await requireAdmin()

    const product = await prisma.product.update({
      where: { id: productId },
      data: { isPublished },
    })

    invalidateCache(CACHE_KEYS.PRODUCT(product.slug))

    revalidatePath('/dashboard/products')
    revalidatePath('/products')

    return { success: true }
  } catch (err) {
    console.error('[toggleProductPublish]', err)
    return { success: false, error: 'Không thể cập nhật trạng thái' }
  }
}

// ── Cập nhật stock nhanh ─────────────────────────────────────────
export async function updateVariantStock(
  variantId: string,
  stock: number,
): Promise<ActionResponse> {
  try {
    await requireAdmin()

    if (stock < 0) return { success: false, error: 'Tồn kho không được âm' }

    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    })

    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (err) {
    console.error('[updateVariantStock]', err)
    return { success: false, error: 'Không thể cập nhật tồn kho' }
  }
}

// ── Lấy danh sách sản phẩm cho Admin ────────────────────────────
export async function getAdminProducts(params: {
  q?: string
  categoryId?: string
  isPublished?: boolean
  page?: number
}) {
  await requireAdmin()

  const page = params.page ?? 1
  const perPage = 20
  const skip = (page - 1) * perPage

  const where = {
    deletedAt: null,
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: 'insensitive' as const } },
        {
          variants: {
            some: { sku: { contains: params.q, mode: 'insensitive' as const } },
          },
        },
      ],
    }),
    ...(params.categoryId && {
      categories: { some: { categoryId: params.categoryId } },
    }),
    ...(params.isPublished !== undefined && {
      isPublished: params.isPublished,
    }),
  }

  const [products, total] = await Promise.all([
    -prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
        categories: { include: { category: { select: { name: true } } } },
        variants: { select: { id: true, sku: true, price: true, stock: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  return { products, total, totalPages: Math.ceil(total / perPage), page }
}
