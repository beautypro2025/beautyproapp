'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulação de cadastro
    alert(`Usuário ${name} cadastrado com o email ${email}`)
    router.push('/login')
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F7E8E3] px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[#C27BA0] mb-6 text-center">Criar Conta</h1>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 border border-gray-300 rounded"
            required
          />
          <input
            type="email"
            placeholder="Seu melhor e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            className="bg-[#C27BA0] text-white py-3 rounded hover:bg-[#a05e85] transition"
          >
            Criar Conta
          </button>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-[#C27BA0] hover:underline text-sm mt-2"
          >
            Já tenho uma conta
          </button>
        </form>
      </div>
    </main>
  )
}
