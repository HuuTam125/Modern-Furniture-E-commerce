// src/features/auth/components/address-form-dialog.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import type { Address } from '@/generated/prisma/browser'
import { addressSchema, type AddressInput } from '@/validations/address'
import { createAddress, updateAddress } from '@/actions/auth.actions'

interface AddressFormDialogProps {
  open: boolean
  onClose: () => void
  editingAddress: Address | null
  userId: string
}

export function AddressFormDialog({
  open,
  onClose,
  editingAddress,
  userId,
}: AddressFormDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(editingAddress)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      street: '',
      ward: '',
      district: '',
      province: '',
      isDefault: false,
    },
  })

  useEffect(() => {
    if (editingAddress) {
      reset({ ...editingAddress })
    } else {
      reset()
    }
  }, [editingAddress, reset])

  async function onSubmit(values: AddressInput) {
    const result =
      isEditing && editingAddress
        ? await updateAddress({ id: editingAddress.id, ...values })
        : await createAddress(values)

    if (result.success) {
      toast.success(isEditing ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ mới')
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] })
      onClose()
    } else {
      toast.error(result.error)
    }
  }

  const isDefaultChecked = watch('isDefault')

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field aria-invalid={!!errors.fullName}>
                <FieldLabel>Họ và tên</FieldLabel>
                <Input placeholder="Nguyễn Văn A" {...register('fullName')} />
                {errors.fullName && (
                  <span className="text-destructive text-sm">
                    {errors.fullName.message}
                  </span>
                )}
              </Field>

              <Field aria-invalid={!!errors.phone}>
                <FieldLabel>Số điện thoại</FieldLabel>
                <Input placeholder="0901234567" {...register('phone')} />
                {errors.phone && (
                  <span className="text-destructive text-sm">
                    {errors.phone.message}
                  </span>
                )}
              </Field>
            </div>

            <Field aria-invalid={!!errors.province}>
              <FieldLabel>Tỉnh / Thành phố</FieldLabel>
              <Input placeholder="Hồ Chí Minh" {...register('province')} />
              {errors.province && (
                <span className="text-destructive text-sm">
                  {errors.province.message}
                </span>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field aria-invalid={!!errors.district}>
                <FieldLabel>Quận / Huyện</FieldLabel>
                <Input placeholder="Quận 1" {...register('district')} />
                {errors.district && (
                  <span className="text-destructive text-sm">
                    {errors.district.message}
                  </span>
                )}
              </Field>

              <Field aria-invalid={!!errors.ward}>
                <FieldLabel>Phường / Xã</FieldLabel>
                <Input placeholder="Phường Bến Nghé" {...register('ward')} />
                {errors.ward && (
                  <span className="text-destructive text-sm">
                    {errors.ward.message}
                  </span>
                )}
              </Field>
            </div>

            <Field aria-invalid={!!errors.street}>
              <FieldLabel>Địa chỉ chi tiết</FieldLabel>
              <Input
                placeholder="Số nhà, tên đường..."
                {...register('street')}
              />
              {errors.street && (
                <span className="text-destructive text-sm">
                  {errors.street.message}
                </span>
              )}
            </Field>
          </FieldGroup>

          {/* Xử lý Checkbox không dùng register trực tiếp được nên kết hợp setValue/watch */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefaultChecked}
              onCheckedChange={(checked) =>
                setValue('isDefault', checked === true)
              }
            />
            <label
              htmlFor="isDefault"
              className="cursor-pointer text-sm leading-none font-medium"
            >
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Đang lưu...'
                : isEditing
                  ? 'Cập nhật'
                  : 'Thêm địa chỉ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
