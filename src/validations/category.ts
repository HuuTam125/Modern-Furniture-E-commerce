// src/lib/validations/category.ts
import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục tối thiểu 2 ký tự').max(100),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.url().optional().nullable().or(z.literal('')),
  parentId: z.cuid2().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
})

export type CategoryInput = z.infer<typeof categorySchema>
