'use client'

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebaseConfig'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Salva o usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        createdAt: new Date(),
      })

      alert(`Bem-vinda, ${user.displayName}!`)
      router.push('/') // Redireciona para home ou dashboard
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      alert('Falha no login. Tente novamente.')
    }
  }

  return (
    <main className="flex flex-col h-screen items-center justify-center bg-[#F7E8E3] gap-6 px-4">
      <h1 className="text-2xl font-bold text-[#C27BA0]">Entrar com Google</h1>
      <button
        onClick={handleLogin}
        className="bg-[#C27BA0] text-white px-6 py-3 rounded-lg hover:bg-[#a05e85] transition"
      >
        Login com Gmail
      </button>
    </main>
  )
}
