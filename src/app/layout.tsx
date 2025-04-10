import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-theano',
})

const poppins = Poppins({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FDF8F6',
}

export const metadata: Metadata = {
  title: 'BeautyPro - Sistema Completo para Profissionais da Beleza',
  description:
    'Gerencie seu studio, barbearia ou clínica de estética com agendamento online, gestão financeira e muito mais.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='pt-BR' className={`${playfair.variable} ${poppins.variable}`}>
      <head>
        <link rel='icon' href='/favicon.svg' sizes='any' />
        <link rel='apple-touch-icon' href='/logo.svg' />
      </head>
      <body className={poppins.className}>
        <AuthProvider>
          <div className='min-h-screen'>{children}</div>
        </AuthProvider>
      </body>
    </html>
  )
}
