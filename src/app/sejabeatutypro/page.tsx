'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import React from 'react'

const features = [
  {
    title: "Agendamento Online",
    description: "Sistema intuitivo para seus clientes agendarem 24h por dia",
    image: "/images/professional-1.jpg"
  },
  {
    title: "Gestão Financeira",
    description: "Controle completo do seu negócio em um só lugar",
    image: "/images/professional-2.jpg"
  },
  {
    title: "Marketing Digital",
    description: "Ferramentas poderosas para promover seu negócio",
    image: "/images/professional-3.jpg"
  }
]

const stats = [
  { value: "40mil+", label: "PROFISSIONAIS" },
  { value: "325mil+", label: "AGENDAMENTOS" },
  { value: "1.4k+", label: "CIDADES" },
  { value: "2.8mi+", label: "CLIENTES" }
]

export default function SplashPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen w-full bg-[#FDF8F6] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/texture-pattern.svg')] opacity-[0.03] bg-repeat bg-[length:200px_200px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8e9e4]/30 via-transparent to-[#f8e9e4]/20" />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/professional-7.jpg"
            alt="BeautyPro Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-[800px] mx-auto px-4"
        >
          <motion.h1 
            className="text-[42px] md:text-[56px] lg:text-[64px] font-theano text-white mb-8 leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transforme seu talento em um negócio de sucesso com o{' '}
            <span className="font-semibold">BeautyPro</span>.
          </motion.h1>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-[20px] md:text-[24px] text-white/90 font-light leading-relaxed">
              Profissionalize seu atendimento e encante seus clientes.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-3 text-[16px] bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-lg transition-all duration-300"
              >
                Já sou BeautyPro
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-8 py-3 text-[16px] bg-[#b5715f] hover:bg-[#8b574a] text-white rounded-lg transition-all duration-300"
              >
                Começar Agora
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.h2
            className="text-4xl font-theano text-center mb-16 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Recursos Exclusivos
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="relative h-[300px] overflow-hidden rounded-lg mb-6">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />
                </div>
                <h3 className="text-2xl font-theano mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#FDF8F6]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-[42px] font-theano text-[#b5715f] mb-1">{stat.value}</p>
                <p className="text-[14px] text-gray-600 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0">
          <Image
            src="/images/professional-4.jpg"
            alt="CTA Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-[800px] mx-auto px-4 text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-theano text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Pronto para Transformar seu Negócio?
          </motion.h2>
          <p className="text-xl text-white/90 mb-8">
            Comece agora mesmo e descubra como o BeautyPro pode ajudar seu negócio a crescer
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-8 py-3 bg-[#b5715f] hover:bg-[#8b574a] text-white rounded-lg transition-all duration-300"
          >
            Começar minha nova jornada
          </button>
        </div>
      </section>
    </main>
  )
}
