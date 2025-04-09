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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FDF8F6] to-white">
      <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl max-w-lg mx-4">
        <h1 className="text-8xl font-bold mb-6 flex justify-center items-center gap-2">
          <span style={{ color: 'var(--beauty-color)' }}>4</span>
          <span style={{ color: 'var(--pro-color)' }}>0</span>
          <span style={{ color: 'var(--beauty-color)' }}>4</span>
        </h1>
        <h2 className="text-3xl font-playfair text-gray-800 mb-4">
          Página não encontrada
        </h2>
        <p className="text-gray-600 mb-8 font-poppins">
          Redirecionando para a página inicial...
        </p>
        <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto"
             style={{ 
               borderTopColor: 'var(--beauty-color)',
               borderRightColor: 'var(--pro-color)',
               borderBottomColor: 'var(--beauty-color)',
               borderLeftColor: 'var(--pro-color)'
             }}></div>
      </div>
    </div>
  )
} 