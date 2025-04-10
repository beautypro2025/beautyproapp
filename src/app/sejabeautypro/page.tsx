'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import React from 'react'

const features = [
  {
    title: 'Agendamento Online',
    description: 'Sistema intuitivo para seus clientes agendarem 24h por dia',
    image: '/images/professional-1.jpg',
  },
  {
    title: 'Gestão Financeira',
    description: 'Controle completo do seu negócio em um só lugar',
    image: '/images/professional-2.jpg',
  },
  {
    title: 'Marketing Digital',
    description: 'Ferramentas poderosas para promover seu negócio',
    image: '/images/professional-3.jpg',
  },
]

const stats = [
  { value: '40mil+', label: 'PROFISSIONAIS' },
  { value: '325mil+', label: 'AGENDAMENTOS' },
  { value: '1.4k+', label: 'CIDADES' },
  { value: '2.8mi+', label: 'CLIENTES' },
]

export default function SplashPage() {
  const router = useRouter()

  return (
    <main className='relative min-h-screen w-full overflow-hidden bg-[#FDF8F6]'>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/texture-pattern.svg')] bg-[length:200px_200px] bg-repeat opacity-[0.03]" />
      <div className='absolute inset-0 bg-gradient-to-b from-[#f8e9e4]/30 via-transparent to-[#f8e9e4]/20' />

      {/* Hero Section */}
      <section className='relative flex h-screen items-center justify-center'>
        <div className='absolute inset-0'>
          <Image
            src='/images/professional-7.jpg'
            alt='BeautyPro Background'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-black/50' />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='relative z-10 mx-auto max-w-[800px] px-4 text-center'
        >
          <motion.h1
            className='font-theano mb-8 text-[42px] leading-tight text-white md:text-[56px] lg:text-[64px]'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transforme seu talento em um negócio de sucesso com o{' '}
            <span className='font-semibold'>BeautyPro</span>.
          </motion.h1>

          <motion.div
            className='space-y-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className='text-[20px] font-light leading-relaxed text-white/90 md:text-[24px]'>
              Profissionalize seu atendimento e encante seus clientes.
            </p>
            <div className='mt-8 flex justify-center gap-4'>
              <button
                onClick={() => router.push('/login')}
                className='rounded-lg bg-white/20 px-8 py-3 text-[16px] text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30'
              >
                Já sou BeautyPro
              </button>
              <button
                onClick={() => router.push('/register')}
                className='rounded-lg bg-[#b5715f] px-8 py-3 text-[16px] text-white transition-all duration-300 hover:bg-[#8b574a]'
              >
                Começar Agora
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className='relative bg-white py-20'>
        <div className='mx-auto max-w-[1200px] px-4'>
          <motion.h2
            className='font-theano mb-16 text-center text-4xl text-gray-800'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Recursos Exclusivos
          </motion.h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className='group relative'
              >
                <div className='relative mb-6 h-[300px] overflow-hidden rounded-lg'>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                  <div className='absolute inset-0 bg-black/40 transition-all duration-300 group-hover:bg-black/50' />
                </div>
                <h3 className='font-theano mb-3 text-2xl text-gray-800'>{feature.title}</h3>
                <p className='leading-relaxed text-gray-600'>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='bg-[#FDF8F6] py-16'>
        <div className='mx-auto max-w-[1200px] px-4'>
          <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className='text-center'
              >
                <p className='font-theano mb-1 text-[42px] text-[#b5715f]'>{stat.value}</p>
                <p className='text-[14px] uppercase tracking-wider text-gray-600'>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='relative py-20'>
        <div className='absolute inset-0'>
          <Image
            src='/images/professional-4.jpg'
            alt='CTA Background'
            fill
            className='object-cover'
          />
          <div className='absolute inset-0 bg-black/60' />
        </div>
        <div className='relative z-10 mx-auto max-w-[800px] px-4 text-center'>
          <motion.h2
            className='font-theano mb-6 text-4xl text-white md:text-5xl'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Pronto para Transformar seu Negócio?
          </motion.h2>
          <p className='mb-8 text-xl text-white/90'>
            Comece agora mesmo e descubra como o BeautyPro pode ajudar seu negócio a crescer
          </p>
          <button
            onClick={() => router.push('/register')}
            className='rounded-lg bg-[#b5715f] px-8 py-3 text-white transition-all duration-300 hover:bg-[#8b574a]'
          >
            Começar minha nova jornada
          </button>
        </div>
      </section>
    </main>
  )
}
