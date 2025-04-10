// src/app/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageShowcase from '@/components/ImageShowcase'
import { VideoBackground } from '@/components/VideoBackground'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Gestão Simplificada',
    description: 'Controle completo do seu negócio em um só lugar',
    icon: '📊',
  },
  {
    title: 'Agendamento Online',
    description: 'Sistema intuitivo para seus clientes agendarem',
    icon: '📅',
  },
  {
    title: 'Marketing Digital',
    description: 'Ferramentas para promover seu negócio',
    icon: '📱',
  },
  {
    title: 'Relatórios Detalhados',
    description: 'Análises completas do seu desempenho',
    icon: '📈',
  },
]

const stats = [
  { number: '1000+', label: 'Profissionais' },
  { number: '50+', label: 'Cidades' },
  { number: '10k+', label: 'Clientes' },
  { number: '98%', label: 'Satisfação' },
]

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('../sejabeatutypro/page.tsx')
  }, [router])

  return (
    <main className='relative min-h-screen bg-[#FDF8F6]'>
      <VideoBackground
        videoUrl='/videos/beauty-salon.mp4'
        overlayOpacity={0.3}
        className='fixed inset-0 -z-10'
      />

      <div className='relative z-10'>
        <div className='bg-pattern opacity-10'></div>
        <div className='bg-pattern-overlay'></div>
        <div className='content-wrapper'>
          <nav className='nav-buttons'>
            <button className='nav-button nav-button-secondary'>Entrar</button>
            <button className='nav-button nav-button-primary'>Agendar</button>
          </nav>

          <section className='hero-section'>
            <div className='hero-background'>
              <Image
                src='/images/hero-bg.jpg'
                alt='BeautyPro Background'
                width={1920}
                height={1080}
                className='absolute inset-0 h-full w-full object-cover'
                priority
              />
            </div>

            <div className='hero-content'>
              <h1 className='app-name'>
                <span className='beauty-text'>Beauty</span>
                <span className='pro-text'>Pro</span>
              </h1>
              <h2 className='hero-title'>Transforme sua beleza em uma experiência única</h2>
              <p className='hero-subtitle'>
                Agende seus serviços de beleza com os melhores profissionais
              </p>
              <div className='hero-buttons'>
                <button className='btn-primary'>Agendar Agora</button>
                <button className='btn-secondary'>Conhecer Mais</button>
              </div>
            </div>
          </section>

          <ImageShowcase />
        </div>
      </div>

      {/* Features Section */}
      <section className='bg-white py-20'>
        <div className='container mx-auto px-4'>
          <h2 className='section-title'>Recursos Exclusivos</h2>
          <p className='section-subtitle'>
            Tudo que você precisa para gerenciar seu negócio de forma eficiente e profissional
          </p>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className='feature-card'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className='mb-4 text-4xl'>{feature.icon}</div>
                <h3 className='mb-2 font-playfair text-xl'>{feature.title}</h3>
                <p className='text-gray-600'>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='bg-[#FDF8F6] py-20'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className='stats-card'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className='stats-number'>{stat.number}</div>
                <div className='stats-label'>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[url('/images/professional-7.jpg')] bg-cover bg-center py-20">
        <div className='absolute inset-0 bg-black/60' />
        <div className='container relative z-10 mx-auto px-4'>
          <div className='mx-auto max-w-3xl text-center'>
            <h2 className='mb-6 font-playfair text-4xl text-white md:text-5xl'>
              Pronto para Transformar seu Negócio?
            </h2>
            <p className='mb-8 text-xl text-white/90'>
              Comece agora mesmo e descubra como o BeautyPro pode ajudar seu negócio a crescer
            </p>
            <Link href='/register' className='btn-primary'>
              Começar minha nova jornada
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
