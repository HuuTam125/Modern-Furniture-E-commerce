// src/features/auth/components/address-list.tsx
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AddressCard } from './address-card'
import { AddressFormDialog } from './address-form-dialog'
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from '../hooks/use-addresses'
import type { Address } from '@/types'

interface AddressListProps {
  userId: string
}

export function AddressList({ userId }: AddressListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const { data: addresses, isLoading } = useAddresses(userId)
  const deleteMutation = useDeleteAddress(userId)
  const setDefaultMutation = useSetDefaultAddress(userId)

  function handleEdit(address: Address) {
    setEditingAddress(address)
    setIsDialogOpen(true)
  }

  function handleDialogClose() {
    setIsDialogOpen(false)
    setEditingAddress(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Địa chỉ giao hàng</CardTitle>
        <Button
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm địa chỉ
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : addresses && addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => handleEdit(address)}
                onDelete={() => deleteMutation.mutate(address.id)}
                onSetDefault={() => setDefaultMutation.mutate(address.id)}
                isDeleting={deleteMutation.isPending}
                isSettingDefault={setDefaultMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center text-sm">
            Bạn chưa có địa chỉ nào. Thêm địa chỉ để thanh toán nhanh hơn.
          </div>
        )}
      </CardContent>

      <AddressFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        editingAddress={editingAddress}
        userId={userId}
      />
    </Card>
  )
}
