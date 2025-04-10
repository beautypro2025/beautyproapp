'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { VideoBackground } from '@/components/VideoBackground'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar lógica de login aqui
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center'>
      <VideoBackground
        videoUrl='/videos/beauty-salon-2.mp4'
        overlayOpacity={0.4}
        className='fixed inset-0 -z-10'
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg'
      >
        <h2 className='mb-8 text-center font-playfair text-3xl text-white'>
          Bem-vindo ao BeautyPro
        </h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='email' className='mb-2 block text-sm font-medium text-white/80'>
              Email
            </label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50'
              placeholder='seu@email.com'
            />
          </div>

          <div>
            <label htmlFor='password' className='mb-2 block text-sm font-medium text-white/80'>
              Senha
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50'
              placeholder='••••••••'
            />
          </div>

          <button
            type='submit'
            className='w-full rounded-lg bg-primary px-4 py-3 text-white transition-colors duration-200 hover:bg-primary-dark'
          >
            Entrar
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-white/60'>
          Não tem uma conta?{' '}
          <a href='/register' className='text-primary hover:text-primary-dark'>
            Cadastre-se
          </a>
        </p>
      </motion.div>
    </div>
  )
}
