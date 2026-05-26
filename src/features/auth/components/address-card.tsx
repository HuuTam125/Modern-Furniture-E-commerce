// src/features/auth/components/address-card.tsx
'use client'

import type { Address } from '@/generated/prisma/client'
import { MapPin, Pencil, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AddressCardProps {
  address: Address
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
  isDeleting: boolean
  isSettingDefault: boolean
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}: AddressCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 transition-colors',
        address.isDefault ? 'border-zinc-900 bg-zinc-50' : 'border-border',
      )}
    >
      {address.isDefault && (
        <Badge className="absolute top-3 right-3 bg-zinc-900 text-xs text-white">
          Mặc định
        </Badge>
      )}

      <div className="flex items-start gap-3">
        <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{address.fullName}</span>
            <span className="text-muted-foreground text-sm">|</span>
            <span className="text-muted-foreground text-sm">
              {address.phone}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            {address.street}, {address.ward}, {address.district},{' '}
            {address.province}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="h-7 text-xs"
        >
          <Pencil className="mr-1 h-3 w-3" />
          Sửa
        </Button>
        {!address.isDefault && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onSetDefault}
              disabled={isSettingDefault}
              className="h-7 text-xs"
            >
              <Star className="mr-1 h-3 w-3" />
              Đặt mặc định
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive h-7 text-xs"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Xóa
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
