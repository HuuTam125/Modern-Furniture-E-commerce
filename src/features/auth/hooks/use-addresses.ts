// src/features/auth/hooks/use-addresses.ts
import {
  getMyAddresses,
  deleteAddress,
  setDefaultAddress,
} from '@/actions/auth.actions'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useAddresses(userId: string) {
  return useQuery({
    queryKey: ['addresses', userId],
    queryFn: async () => {
      const result = await getMyAddresses()
      if (!result.success) throw new Error(result.error)
      return result.data ?? []
    },
  })
}

export function useDeleteAddress(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Đã xóa địa chỉ')
        queryClient.invalidateQueries({ queryKey: ['addresses', userId] })
      } else {
        toast.error(result.error)
      }
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa địa chỉ')
    },
  })
}

export function useSetDefaultAddress(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Đã cập nhật địa chỉ mặc định')
        queryClient.invalidateQueries({ queryKey: ['addresses', userId] })
      } else {
        toast.error(result.error)
      }
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật')
    },
  })
}
