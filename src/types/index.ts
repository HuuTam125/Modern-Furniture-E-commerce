import { User, Address } from '@/generated/prisma/client'

export type { User, Address }

// Action response type — dùng cho tất cả Server Actions
export type ActionResponse<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
