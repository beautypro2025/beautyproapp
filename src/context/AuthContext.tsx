'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebaseConfig'

// Verifica se estamos no ambiente do navegador
const isBrowser = typeof window !== 'undefined'

interface AuthContextType {
  user: User | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isBrowser) return

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(firebaseUser)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    if (!isBrowser) return

    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>
}
