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
    <main className='flex min-h-screen flex-col items-center justify-center bg-[#F7E8E3] px-4 py-10'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-lg'>
        <h1 className='mb-6 text-center text-2xl font-bold text-[#C27BA0]'>Criar Conta</h1>
        <form onSubmit={handleRegister} className='flex flex-col gap-4'>
          <input
            type='text'
            placeholder='Nome completo'
            value={name}
            onChange={e => setName(e.target.value)}
            className='rounded border border-gray-300 p-3'
            required
          />
          <input
            type='email'
            placeholder='Seu melhor e-mail'
            value={email}
            onChange={e => setEmail(e.target.value)}
            className='rounded border border-gray-300 p-3'
            required
          />
          <input
            type='password'
            placeholder='Senha'
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='rounded border border-gray-300 p-3'
            required
          />
          <button
            type='submit'
            className='rounded bg-[#C27BA0] py-3 text-white transition hover:bg-[#a05e85]'
          >
            Criar Conta
          </button>
          <button
            type='button'
            onClick={() => router.push('/login')}
            className='mt-2 text-sm text-[#C27BA0] hover:underline'
          >
            Já tenho uma conta
          </button>
        </form>
      </div>
    </main>
  )
}
