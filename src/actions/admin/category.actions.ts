// src/actions/admin/category.actions.ts
'use server'

import { ActionResponse } from '@/types'
import { requireAdmin } from '@/lib/auth'
import { categorySchema } from '@/validations/category'
import { revalidatePath } from 'next/cache'
import { invalidateCache, CACHE_KEYS } from '@/lib/cache'
import slugify from 'slugify'
import z from 'zod'
import prisma from '@/lib/prisma'

export async function createCategory(input: unknown): Promise<ActionResponse> {
  try {
    await requireAdmin()

    const parsed = categorySchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Dữ liệu không hợp lệ',
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      }
    }

    const { name, ...categories } = parsed.data
    const slug = slugify(name, { lower: true, strict: true })
    const exists = await prisma.category.findFirst({
      where: {
        slug,
      },
    })
    if (exists) {
      return {
        success: false,
        error: 'Slug đã tồn tại, hãy đặt tên khác',
      }
    }
    await prisma.category.create({
      data: {
        name,
        slug,
        ...categories,
      },
    })

    await invalidateCache(CACHE_KEYS.CATEGORIES)
    revalidatePath('/dashboard/categories')
    revalidatePath('/')

    return { success: true }
  } catch (err) {
    console.error('[createCategory]', err)
    return { success: false, error: 'Không thể tạo danh mục' }
  }
}

export async function updateCategory(
  id: string,
  input: unknown,
): Promise<ActionResponse> {
  try {
    await requireAdmin()

    const parsed = categorySchema.safeParse(input)
    if (!parsed.success)
      return { success: false, error: 'Dữ liệu không hợp lệ' }

    const { name, ...data } = parsed.data
    const slug = slugify(name, { lower: true, strict: true })

    const conflict = await prisma.category.findFirst({
      where: { slug, id: { not: id } },
    })
    if (conflict) return { success: false, error: 'Slug đã tồn tại' }

    await prisma.category.update({
      where: { id },
      data: { name, slug, ...data },
    })

    await invalidateCache(CACHE_KEYS.CATEGORIES)
    revalidatePath('/dashboard/categories')
    revalidatePath('/')

    return { success: true }
  } catch (err) {
    console.error('[updateCategory]', err)
    return { success: false, error: 'Không thể cập nhật danh mục' }
  }
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin()

    // Check nếu category có sản phẩm
    const productCount = await prisma.productCategory.count({
      where: { categoryId: id },
    })
    if (productCount > 0) {
      return {
        success: false,
        error: `Không thể xóa danh mục đang có ${productCount} sản phẩm`,
      }
    }

    await prisma.category.delete({ where: { id } })

    await invalidateCache(CACHE_KEYS.CATEGORIES)
    revalidatePath('/dashboard/categories')

    return { success: true }
  } catch (err) {
    console.error('[deleteCategory]', err)
    return { success: false, error: 'Không thể xóa danh mục' }
  }
}
