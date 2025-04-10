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
      <section className='relative flex min-h-[100vh] items-center justify-center px-4 sm:px-6 lg:px-8'>
        <div className='absolute inset-0'>
          <Image
            src='/images/professional-7.jpg'
            alt='BeautyPro Background'
            fill
            className='object-cover'
            priority
            sizes='100vw'
          />
          <div className='absolute inset-0 bg-black/50' />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='relative z-10 mx-auto max-w-[800px] px-4 text-center sm:px-6 lg:px-8'
        >
          <motion.h1
            className='mb-4 font-playfair text-[32px] leading-tight text-white sm:mb-6 sm:text-[42px] md:text-[56px] lg:text-[64px]'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transforme seu talento em um negócio de sucesso com o{' '}
            <span className='font-semibold'>BeautyPro</span>.
          </motion.h1>

          <motion.div
            className='space-y-4 sm:space-y-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className='text-[18px] font-light leading-relaxed text-white/90 sm:text-[20px] md:text-[24px]'>
              Profissionalize seu atendimento e encante seus clientes.
            </p>
            <div className='mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4'>
              <button
                onClick={() => router.push('/login')}
                className='rounded-lg bg-white/20 px-6 py-2.5 text-[14px] text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30 sm:px-8 sm:py-3 sm:text-[16px]'
              >
                Já sou BeautyPro
              </button>
              <button
                onClick={() => router.push('/register')}
                className='rounded-lg bg-[#b5715f] px-6 py-2.5 text-[14px] text-white transition-all duration-300 hover:bg-[#8b574a] sm:px-8 sm:py-3 sm:text-[16px]'
              >
                Começar Agora
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className='relative bg-white py-12 sm:py-16 md:py-20'>
        <div className='mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8'>
          <motion.h2
            className='mb-8 text-center font-playfair text-3xl text-gray-800 sm:mb-12 md:mb-16 md:text-4xl'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Recursos Exclusivos
          </motion.h2>
          <div className='grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className='group relative'
              >
                <div className='relative mb-4 h-[250px] overflow-hidden rounded-lg sm:mb-6 sm:h-[300px]'>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                  <div className='absolute inset-0 bg-black/40 transition-all duration-300 group-hover:bg-black/50' />
                </div>
                <h3 className='mb-2 font-playfair text-xl text-gray-800 sm:mb-3 sm:text-2xl'>
                  {feature.title}
                </h3>
                <p className='text-sm leading-relaxed text-gray-600 sm:text-base'>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='bg-[#FDF8F6] py-12 sm:py-16'>
        <div className='mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4'>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className='text-center'
              >
                <p className='mb-1 font-playfair text-[32px] text-[#b5715f] sm:text-[42px]'>
                  {stat.value}
                </p>
                <p className='text-[12px] uppercase tracking-wider text-gray-600 sm:text-[14px]'>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='relative py-12 sm:py-16 md:py-20'>
        <div className='absolute inset-0'>
          <Image
            src='/images/professional-4.jpg'
            alt='CTA Background'
            fill
            className='object-cover'
            sizes='100vw'
          />
          <div className='absolute inset-0 bg-black/60' />
        </div>
        <div className='relative z-10 mx-auto max-w-[800px] px-4 text-center sm:px-6 lg:px-8'>
          <motion.h2
            className='mb-4 font-playfair text-3xl text-white sm:mb-6 md:text-4xl lg:text-5xl'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Pronto para Transformar seu Negócio?
          </motion.h2>
          <p className='mb-6 text-lg text-white/90 sm:mb-8 sm:text-xl'>
            Comece agora mesmo e descubra como o BeautyPro pode ajudar seu negócio a crescer
          </p>
          <button
            onClick={() => router.push('/register')}
            className='rounded-lg bg-[#b5715f] px-6 py-2.5 text-[14px] text-white transition-all duration-300 hover:bg-[#8b574a] sm:px-8 sm:py-3 sm:text-[16px]'
          >
            Começar minha nova jornada
          </button>
        </div>
      </section>
    </main>
  )
}
