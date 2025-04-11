'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'

export function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
