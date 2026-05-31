// src/lib/uploadthing.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

const f = createUploadthing()

export const uploadRouter = {
  // Upload ảnh sản phẩm — chỉ Admin
  productImage: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 10,
    },
  })
    .middleware(async () => {
      const { userId } = await auth()
      if (!userId) throw new Error('Unauthorized')

      const user = await prisma.user.findUnique({ where: { clerkId: userId } })
      if (!user || user.role !== 'ADMIN') throw new Error('Forbidden')

      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Trả về url để frontend dùng
      return { url: file.url, uploadedBy: metadata.userId }
    }),

  // Upload ảnh category
  categoryImage: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth()
      if (!userId) throw new Error('Unauthorized')

      const user = await prisma.user.findUnique({ where: { clerkId: userId } })
      if (!user || user.role !== 'ADMIN') throw new Error('Forbidden')

      return { userId: user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url }
    }),

  // Upload ảnh review — Customer
  reviewImage: f({ image: { maxFileSize: '2MB', maxFileCount: 3 } })
    .middleware(async () => {
      const { userId } = await auth()
      if (!userId) throw new Error('Unauthorized')
      return { userId }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
