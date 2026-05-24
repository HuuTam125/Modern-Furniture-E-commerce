import { auth } from '@clerk/nextjs/server'
import { User } from '@/generated/prisma/client'
import prisma from './prisma'

/**
 * Lấy user hiện tại từ DB (dựa theo clerkId từ session)
 * Trả về null nếu chưa đăng nhập hoặc user không tồn tại trong DB
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth()
  if (!userId) return null
  return prisma.user.findUnique({
    where: {
      clerkId: userId,
      deletedAt: null,
    },
  })
}

/**
 * Yêu cầu phải đăng nhập — throw error nếu chưa đăng nhập
 * Dùng trong Server Actions cần auth
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized: Vui lòng đăng nhập')
  return user
}
