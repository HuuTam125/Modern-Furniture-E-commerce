// src/actions/auth.actions.ts
'use server'

import { requireUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ActionResponse, Address } from '@/types'
import { addressSchema } from '@/validations/address'
import { revalidatePath } from 'next/cache'
import z from 'zod'

// ── Get Addresses ──────────────────────────────────────────────
export async function getMyAddresses(): Promise<ActionResponse<Address[]>> {
  try {
    const user = await requireUser()
    const addresses = await prisma.address.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
    return {
      success: true,
      data: addresses,
    }
  } catch {
    return { success: false, error: 'Không thể tải địa chỉ' }
  }
}

// ── Create Address ─────────────────────────────────────────────
export async function createAddress(
  input: unknown,
): Promise<ActionResponse<Address>> {
  try {
    const user = await requireUser()
    // Validate
    const parsed = addressSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Dữ liệu không hợp lệ',
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      }
    }
    const { isDefault, ...data } = parsed.data

    // Nếu set làm mặc định → unset các địa chỉ mặc định khác
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          isDefault: false,
        },
        data: {
          isDefault: true,
        },
      })
    }

    // Nếu chưa có địa chỉ nào hoặc địa chỉ đã được set mặc định
    const existingCount = await prisma.address.count({
      where: { userId: user.id },
    })
    const shouldBeDefault = isDefault || existingCount === 0

    const address = await prisma.address.create({
      data: {
        ...data,
        isDefault: shouldBeDefault,
        userId: user.id,
      },
    })

    revalidatePath('/account')
    return { success: true, data: address }
  } catch {
    return { success: false, error: 'Không thể thêm địa chỉ' }
  }
}

// ── Update Address ─────────────────────────────────────────────
export async function updateAddress(
  input: unknown,
): Promise<ActionResponse<Address>> {
  try {
    const user = await requireUser()

    // Validate (Có thêm id)
    const schema = addressSchema.extend({
      id: z.cuid2(),
    })
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: 'Địa chỉ không hợp lệ' }
    }
    const { id, isDefault, ...data } = parsed.data

    // Verify address thuộc về user hiện tại
    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    })
    if (!existing) {
      return { success: false, error: 'Địa chỉ không tồn tại' }
    }
    if (isDefault && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }
    const address = await prisma.address.update({
      where: { id },
      data: { ...data, isDefault },
    })

    revalidatePath('/account')
    return { success: true, data: address }
  } catch {
    return { success: false, error: 'Không thể cập nhật địa chỉ' }
  }
}

// ── Delete Address ─────────────────────────────────────────────
export async function deleteAddress(
  id: string,
): Promise<ActionResponse<Address>> {
  try {
    const user = await requireUser()

    // Verify address thuộc về user hiện tại
    const address = await prisma.address.findFirst({
      where: { id, userId: user.id },
    })
    if (!address) {
      return { success: false, error: 'Địa chỉ không tồn tại' }
    }

    // Không cho xóa địa chỉ mặc định nếu còn địa chỉ khác
    if (address.isDefault) {
      const count = await prisma.address.count({ where: { userId: user.id } })
      if (count > 1) {
        return {
          success: false,
          error:
            'Không thể xóa địa chỉ mặc định. Hãy đặt địa chỉ khác làm mặc định trước.',
        }
      }
    }

    await prisma.address.delete({ where: { id } })

    revalidatePath('/account')
    return { success: true }
  } catch {
    return { success: false, error: 'Không thể xóa địa chỉ' }
  }
}

// ── Set Default Address ────────────────────────────────────────
export async function setDefaultAddress(
  id: string,
): Promise<ActionResponse<Address>> {
  try {
    const user = await requireUser()
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })
    if (!address) {
      return { success: false, error: 'Địa chỉ không tồn tại' }
    }

    await prisma.address.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        isDefault: false,
      },
    })

    // Transaction: unset tất cả + set cái mới
    await prisma.$transaction([
      prisma.address.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          isDefault: false,
        },
      }),
      prisma.address.update({
        where: {
          id,
        },
        data: {
          isDefault: true,
        },
      }),
    ])
    revalidatePath('/account')
    return { success: true }
  } catch {
    return { success: false, error: 'Không đặt mặt định địa chỉ này' }
  }
}
