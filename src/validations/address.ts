// src/lib/validations/address.ts
import { z } from 'zod'

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  phone: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  street: z.string().min(5, 'Địa chỉ tối thiểu 5 ký tự').max(255),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  province: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
  isDefault: z.boolean(),
})

export type AddressInput = z.infer<typeof addressSchema>
