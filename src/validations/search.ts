// src/lib/validations/search.ts
import { z } from 'zod'

export const productFilterSchema = z.object({
  q: z.string().optional(),
  categories: z.string().optional(), // "cat1,cat2" — comma separated slugs
  styles: z.string().optional(), // "SCANDINAVIAN,MINIMALIST"
  colors: z.string().optional(), // "Oak,Walnut"
  materials: z.string().optional(), // "Wood,Metal"
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z
    .enum(['newest', 'price_asc', 'price_desc', 'best_selling', 'top_rated'])
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
})

export type ProductFilter = z.infer<typeof productFilterSchema>
