'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import * as auth from 'firebase/auth'
import { auth as firebaseAuth } from '@/lib/firebaseConfig'

interface AuthContextType {
  user: auth.User | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<auth.User | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await auth.signOut(firebaseAuth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}