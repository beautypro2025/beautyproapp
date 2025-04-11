'use client'

import { AuthProvider } from '@/context/AuthContext'

type Props = {
  children: React.ReactNode
}

export function ClientLayout({ children }: Props) {
  return <AuthProvider>{children}</AuthProvider>
}
