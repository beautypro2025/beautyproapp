'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Mostra o alerta
    alert('Página não encontrada! Você será redirecionado para a página inicial.')

    // Redireciona para a página inicial após o alerta
    router.push('/sejabeatutypro')
  }, [router])

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FDF8F6] to-white'>
      <div className='mx-4 max-w-lg rounded-lg bg-white/80 p-8 text-center shadow-xl backdrop-blur-sm'>
        <h1 className='mb-6 flex items-center justify-center gap-2 text-8xl font-bold'>
          <span style={{ color: 'var(--beauty-color)' }}>4</span>
          <span style={{ color: 'var(--pro-color)' }}>0</span>
          <span style={{ color: 'var(--beauty-color)' }}>4</span>
        </h1>
        <h2 className='mb-4 font-playfair text-3xl text-gray-800'>Página não encontrada</h2>
        <p className='mb-8 font-poppins text-gray-600'>Redirecionando para a página inicial...</p>
        <div
          className='mx-auto h-16 w-16 animate-spin rounded-full border-4'
          style={{
            borderTopColor: 'var(--beauty-color)',
            borderRightColor: 'var(--pro-color)',
            borderBottomColor: 'var(--beauty-color)',
            borderLeftColor: 'var(--pro-color)',
          }}
        ></div>
      </div>
    </div>
  )
}
