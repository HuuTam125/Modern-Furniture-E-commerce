// src/lib/validations/product.ts
import { z } from 'zod'
import { FurnitureStyle } from './../generated/prisma/enums'

// ── Variant Schema ──────────────────────────────────────────────

export const variantAttributesSchema = z.object({
  color: z.string().optional(), // "Oak", "Walnut", "White"
  colorHex: z.string().optional(), // "#C4A882" — hex để hiển thị swatch
  material: z.string().optional(), // "Solid Wood", "Fabric", "Leather"
  size: z.string().optional(), // "Small", "120cm", "2-seater"
})

export const productVariantSchema = z.object({
  id: z.string().optional(), // Có id = đang edit, không có = tạo mới
  sku: z
    .string()
    .min(3, 'SKU tối thiểu 3 ký tự')
    .max(50, 'SKU tối đa 50 ký tự')
    .regex(/^[A-Z0-9-]+$/, 'SKU chỉ dùng chữ hoa, số và dấu gạch ngang'),
  price: z.coerce
    .number({ error: 'Giá phải là số' })
    .positive('Giá phải lớn hơn 0')
    .max(999_999_999, 'Giá không hợp lệ'),
  stock: z.coerce
    .number({ error: 'Tồn kho phải là số' })
    .int('Tồn kho phải là số nguyên')
    .min(0, 'Tồn kho không được âm'),
  attributes: variantAttributesSchema,
  isDefault: z.boolean().default(false),
  imageUrl: z.url().optional().or(z.literal('')),
})

// ── Product Spec Schema ──────────────────────────────────────────

export const productSpecSchema = z.object({
  widthCm: z.coerce.number().positive().optional().nullable(),
  depthCm: z.coerce.number().positive().optional().nullable(),
  heightCm: z.coerce.number().positive().optional().nullable(),
  weightKg: z.coerce.number().positive().optional().nullable(),
  primaryMaterial: z.string().max(100).optional().nullable(),
  secondaryMaterial: z.string().max(100).optional().nullable(),
  origin: z.string().max(100).optional().nullable(),
  careInstructions: z.string().max(1000).optional().nullable(),
  warrantyInfo: z.string().max(500).optional().nullable(),
  assemblyRequired: z.boolean().default(true),
  assemblyTime: z.string().max(50).optional().nullable(),
})

// ── Product Image Schema ─────────────────────────────────────────

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.url('URL ảnh không hợp lệ'),
  altText: z.string().max(200).optional().nullable(),
  position: z.number().int().min(0).default(0),
})

// ── Main Product Schema ──────────────────────────────────────────

export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên sản phẩm tối thiểu 3 ký tự')
    .max(255, 'Tên sản phẩm tối đa 255 ký tự'),
  shortDesc: z
    .string()
    .max(500, 'Mô tả ngắn tối đa 500 ký tự')
    .optional()
    .nullable(),
  description: z.string().min(10, 'Mô tả đầy đủ tối thiểu 10 ký tự'),
  basePrice: z.coerce
    .number()
    .positive('Giá cơ bản phải lớn hơn 0')
    .max(999_999_999),
  style: z.enum(FurnitureStyle, {
    error: () => ({ message: 'Vui lòng chọn phong cách' }),
  }),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  categoryIds: z.array(z.cuid2()).nonempty('Chọn ít nhất 1 danh mục'),
  tags: z.array(z.string().max(50)).default([]),
  images: z
    .array(productImageSchema)
    .min(1, 'Sản phẩm phải có ít nhất 1 ảnh')
    .max(10, 'Tối đa 10 ảnh'),
  variants: z
    .array(productVariantSchema)
    .min(1, 'Sản phẩm phải có ít nhất 1 variant'),
  spec: productSpecSchema.optional(),
})

// Validate: đúng 1 variant được đánh dấu isDefault
export const productSchemaWithValidation = productSchema.superRefine(
  (data, ctx) => {
    const defaultVariants = data.variants.filter((v) => v.isDefault)
    if (defaultVariants.length === 0) {
      // Tự động set variant đầu tiên làm default
      if (data.variants.length > 0) {
        data.variants[0].isDefault = true
      }
    }
    if (defaultVariants.length > 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Chỉ được chọn 1 variant làm mặc định',
        path: ['variants'],
      })
    }
  },
)

export type ProductInput = z.infer<typeof productSchemaWithValidation>
export type ProductVariantInput = z.infer<typeof productVariantSchema>
export type ProductSpecInput = z.infer<typeof productSpecSchema>
