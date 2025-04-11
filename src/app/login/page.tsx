'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import InputMask from 'react-input-mask'

// Função para remover caracteres não numéricos
const onlyNumbers = (str: string) => str.replace(/[^\d]/g, '')

// Função para validar CPF
const isValidCPF = (cpf: string) => {
  const numbers = onlyNumbers(cpf)
  if (numbers.length !== 11) return false
  if (/^(\d)\1{10}$/.test(numbers)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (digit !== parseInt(numbers.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (digit !== parseInt(numbers.charAt(10))) return false

  return true
}

// Função para validar CNPJ
const isValidCNPJ = (cnpj: string) => {
  const numbers = onlyNumbers(cnpj)
  if (numbers.length !== 14) return false
  if (/^(\d)\1{13}$/.test(numbers)) return false

  let size = numbers.length - 2
  let numbers_array = numbers.substring(0, size)
  let digits = numbers.substring(size)
  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers_array.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false

  size = size + 1
  numbers_array = numbers.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers_array.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false

  return true
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState<'email' | 'cpf' | 'cnpj'>('email')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { signInWithGoogle } = useAuth()

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIdentifier(value)

    // Validação em tempo real
    if (value) {
      if (loginType === 'cpf' && !isValidCPF(value)) {
        setError('CPF inválido')
      } else if (loginType === 'cnpj' && !isValidCNPJ(value)) {
        setError('CNPJ inválido')
      } else {
        setError('')
      }
    } else {
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação antes do envio
    if (loginType === 'cpf' && !isValidCPF(identifier)) {
      setError('CPF inválido')
      return
    }
    if (loginType === 'cnpj' && !isValidCNPJ(identifier)) {
      setError('CNPJ inválido')
      return
    }

    try {
      setError('')
      setLoading(true)
      // Aqui você implementará a lógica de login com email/cpf/cnpj
      const cleanIdentifier = loginType === 'email' ? identifier : onlyNumbers(identifier)
      console.log('Login com:', { loginType, identifier: cleanIdentifier, password })
      // Após o login bem-sucedido:
      router.push('/dashboard')
    } catch (error) {
      setError('Credenciais inválidas. Verifique seus dados e tente novamente.')
      console.error('Erro ao fazer login:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError('')
      setLoading(true)
      const user = await signInWithGoogle()
      if (user) {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('Ocorreu um erro ao fazer login. Tente novamente.')
      console.error('Erro ao fazer login:', error)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary to-secondary px-4 py-8 sm:px-6 lg:px-8'>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerVariants}
        className='w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl sm:p-8'
      >
        <motion.div variants={itemVariants} className='text-center'>
          <div className='relative mx-auto h-16 w-40 sm:h-20 sm:w-48'>
            <a href='/sejabeautypro' className='block'>
              <Image
                src='/images/logo.png'
                alt='BeautyPro Logo'
                fill
                className='object-contain transition-transform duration-200 hover:scale-105'
                priority
              />
            </a>
          </div>
          <motion.h1
            variants={itemVariants}
            className='mt-6 font-playfair text-2xl text-gray-900 sm:text-3xl'
          >
            Seu talento transforma vidas. O BeautyPro impulsiona sua jornada!
          </motion.h1>
          <motion.div variants={itemVariants} className='mt-4 space-y-2'>
            <p className='text-sm text-gray-600 sm:text-base'>
              Bem-vindo(a) ao <span className='font-bold text-primary'>BeautyPro</span>
            </p>
            <p className='text-sm text-gray-600 sm:text-base'>Faça login para acessar sua conta</p>
          </motion.div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-500'
          >
            {error}
          </motion.div>
        )}

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className='mt-8 space-y-4'>
          <motion.div variants={itemVariants} className='grid grid-cols-3 gap-2 sm:gap-4'>
            <button
              type='button'
              onClick={() => setLoginType('email')}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 sm:px-4 sm:text-sm ${
                loginType === 'email'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Email
            </button>
            <button
              type='button'
              onClick={() => setLoginType('cpf')}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 sm:px-4 sm:text-sm ${
                loginType === 'cpf'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              CPF
            </button>
            <button
              type='button'
              onClick={() => setLoginType('cnpj')}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 sm:px-4 sm:text-sm ${
                loginType === 'cnpj'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              CNPJ
            </button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor='identifier' className='mb-1.5 block text-sm font-medium text-gray-700'>
              {loginType === 'email' ? 'Email' : loginType === 'cpf' ? 'CPF' : 'CNPJ'}
            </label>
            {loginType === 'email' ? (
              <input
                type='email'
                id='identifier'
                value={identifier}
                onChange={handleIdentifierChange}
                className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-base'
                placeholder='seu@email.com'
                required
              />
            ) : (
              <InputMask
                mask={loginType === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99'}
                value={identifier}
                onChange={handleIdentifierChange}
                className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-base'
                placeholder={loginType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                required
              />
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor='password' className='mb-1.5 block text-sm font-medium text-gray-700'>
              Senha
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-base'
              placeholder='••••••••'
              required
            />
          </motion.div>

          <motion.button
            variants={itemVariants}
            type='submit'
            disabled={loading}
            className='mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dark disabled:opacity-50 sm:py-3 sm:text-base'
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </motion.button>

          <motion.div variants={itemVariants} className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-xs sm:text-sm'>
                <span className='bg-white px-2 text-gray-500'>ou continue com</span>
              </div>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            type='button'
            onClick={handleGoogleLogin}
            disabled={loading}
            className='mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50 sm:px-6 sm:py-3 sm:text-base'
          >
            <div className='relative h-4 w-4 sm:h-5 sm:w-5'>
              <Image src='/images/google-icon.png' alt='Google' fill className='object-contain' />
            </div>
            Entrar com Google
          </motion.button>
        </motion.form>

        <motion.p
          variants={itemVariants}
          className='mt-6 text-center text-xs text-gray-600 sm:text-sm'
        >
          Não tem uma conta?{' '}
          <a href='/register' className='text-primary hover:text-primary-dark'>
            Cadastre-se
          </a>
        </motion.p>

        <motion.div variants={itemVariants} className='mt-4 flex justify-center'>
          <a
            href='/sejabeautypro'
            className='inline-flex items-center gap-2 text-xs text-gray-500 transition-colors duration-200 hover:text-primary sm:text-sm'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-4 w-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
              />
            </svg>
            Voltar para página inicial
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}
