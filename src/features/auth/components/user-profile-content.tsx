'use client'

import { User } from '@/generated/prisma/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { AddressList } from './address-list'

interface UserProfileContentProps {
  user: User
}

export function UserProfileContent({ user }: UserProfileContentProps) {
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Sidebar: thông tin cơ bản */}
      <div className="space-y-4 md:col-span-1">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={user.imageUrl ?? undefined}
                alt={user.name ?? ''}
              />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold">{user.name}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              {user.role === 'ADMIN' && (
                <Badge variant="secondary" className="mt-2">
                  Admin
                </Badge>
              )}
            </div>
            <Separator />
            <div className="w-full space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số điện thoại</span>
                <span>{user.phone ?? 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thành viên từ</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Link đến Clerk UserProfile để update avatar, password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bảo mật tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Quản lý mật khẩu và các phương thức đăng nhập tại trang cài đặt tài
            khoản Clerk.
          </CardContent>
        </Card>
      </div>

      {/* Main: địa chỉ giao hàng */}
      <div className="md:col-span-2">
        <AddressList userId={user.id} />
      </div>
    </div>
  )
}
