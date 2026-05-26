// src/app/layout.tsx

import './globals.css'
import { Providers } from '@/components/shared/providers'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`, // VD: "Sofa Gỗ Sồi | Luxe Furniture"
  },
  description:
    'Nội thất hiện đại, chất lượng cao — thiết kế tinh tế cho không gian sống của bạn.',
  keywords: [
    'nội thất',
    'furniture',
    'sofa',
    'bàn ghế',
    'tủ kệ',
    'scandinavian',
  ],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: APP_NAME,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={cn('font-sans', inter.variable)}>
      <body>
        <ClerkProvider>
          <header className="flex h-16 items-center justify-end gap-4 p-4">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton>
                <button className="h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 text-sm font-medium text-white sm:h-12 sm:px-5 sm:text-base">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
