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
    <div className="min-h-screen relative flex items-center justify-center">
      <VideoBackground
        videoUrl="/videos/beauty-salon-2.mp4"
        overlayOpacity={0.4}
        className="fixed inset-0 -z-10"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl"
      >
        <h2 className="text-3xl font-playfair text-white text-center mb-8">
          Bem-vindo ao BeautyPro
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200"
          >
            Entrar
          </button>
        </form>
        
        <p className="mt-6 text-center text-white/60 text-sm">
          Não tem uma conta?{' '}
          <a href="/register" className="text-primary hover:text-primary-dark">
            Cadastre-se
          </a>
        </p>
      </motion.div>
    </div>
  )
}