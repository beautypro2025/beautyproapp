'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-primary/10'>
      <div className='text-center'>
        <h1 className='mb-4 text-6xl font-bold text-primary'>404</h1>
        <h2 className='mb-8 text-2xl font-semibold text-gray-800'>Página não encontrada</h2>
        <p className='mb-8 text-gray-600'>
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href='/'
          className='rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-dark'
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  )
}
