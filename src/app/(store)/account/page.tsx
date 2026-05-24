// src/app/(store)/account/page.tsx
import { requireUser } from '@/lib/auth'
import { UserProfileContent } from '@/features/auth/components/user-profile-content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tài khoản của tôi',
}

export default async function AccountPage() {
  const user = await requireUser()
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-semibold">Tài khoản của tôi</h1>
      <UserProfileContent user={user} />
    </div>
  )
}
