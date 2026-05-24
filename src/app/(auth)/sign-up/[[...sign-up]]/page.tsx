import { SignUp } from '@clerk/nextjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng ký',
}

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Tạo tài khoản</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Đăng ký để nhận ưu đãi đặc biệt từ Luxe
        </p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none border border-border rounded-xl p-6',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            formButtonPrimary: 'bg-zinc-900 hover:bg-zinc-700 text-white',
            footerActionLink: 'text-zinc-900 hover:text-zinc-700 font-medium',
          },
        }}
      />
    </div>
  )
}
