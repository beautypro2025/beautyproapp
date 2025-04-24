'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { toast } from 'sonner'
import { setCookie, getCookie, deleteCookie } from 'cookies-next'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const formatIdentifier = (identifier: string, userType: string): string => {
  if (identifier.includes('@')) {
    let cleanEmail = identifier;
    if (cleanEmail.startsWith('professional.') || cleanEmail.startsWith('client.')) {
      cleanEmail = cleanEmail.split('.').slice(1).join('.');
    }
    return `${userType}.${cleanEmail}`;
  }
  return identifier;
};

const signIn = async (identifier: string, password: string, rememberMe: boolean) => {
  try {
    console.log('Tentando login com:', { identifier, rememberMe });
    const auth = getAuth();

    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence);
    } else {
      await setPersistence(auth, browserSessionPersistence);
    }

    const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
    console.log('Login bem sucedido:', userCredential.user.email);

    const userType = getCookie('userType');
    if (!userType || (userType !== 'professional' && userType !== 'client')) {
      throw new Error('Tipo de usuário inválido');
    }

    const hasProfile = await checkUserProfile(userCredential.user.uid, userType);

    return {
      success: true,
      uid: userCredential.user.uid,
      hasProfile
    };
  } catch (error: any) {
    console.error('Erro detalhado no signIn:', error);
    let errorMessage = 'Erro ao fazer login';

    switch (error.code) {
      case 'auth/invalid-credential':
        errorMessage = 'Email ou senha inválidos';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Usuário desativado';
        break;
      case 'auth/user-not-found':
        errorMessage = 'Usuário não encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Senha incorreta';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Erro de conexão. Verifique sua internet.';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'Por favor, faça login novamente para continuar';
        break;
      case 'auth/configuration-not-found':
        errorMessage = 'Erro de configuração. Entre em contato com o suporte.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Operação não permitida. Entre em contato com o suporte.';
        break;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

const checkUserProfile = async (uid: string, userType: 'professional' | 'client' | string): Promise<boolean> => {
  try {
    const db = getFirestore();
    const collectionName = userType === 'professional' ? 'professionals' : 'clients';
    const userDoc = await getDoc(doc(db, collectionName, uid));
    return userDoc.exists();
  } catch (error) {
    console.error('Erro ao verificar perfil:', error);
    return false;
  }
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [selectedUserType, setSelectedUserType] = useState<'professional' | 'client' | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const router = useRouter()
  const { signInWithGoogle } = useAuth()

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIdentifier(value)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingMessage('Verificando suas credenciais...');

    try {
      if (!selectedUserType) {
        toast.error('Selecione o tipo de usuário');
        return;
      }

      if (!identifier) {
        toast.error('Digite seu identificador');
        return;
      }

      if (password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      // Remove o cookie anterior e define o novo
      deleteCookie('userType');
      setCookie('userType', selectedUserType, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/'
      });

      // Verifica se o cookie foi definido corretamente
      const userTypeCookie = getCookie('userType');
      if (!userTypeCookie) {
        toast.error('Erro ao definir tipo de usuário. Por favor, tente novamente.');
        throw new Error('Erro ao definir tipo de usuário. Por favor, tente novamente.');
      }

      const formattedIdentifier = formatIdentifier(identifier, selectedUserType);
      console.log('Email formatado:', formattedIdentifier); // Debug
      
      const result = await signIn(formattedIdentifier, password, rememberMe);

      if (result.success) {
        toast.success('Login realizado com sucesso!', {
          duration: 2000
        });
        
        // Adiciona um pequeno delay para mostrar o feedback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (result.hasProfile) {
          setLoadingMessage('Redirecionando para seu dashboard...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          console.log('Redirecionando para dashboard');
          window.location.replace(`/dashboard/${selectedUserType}`);
        } else {
          setLoadingMessage('Redirecionando para completar seu cadastro...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          console.log('Redirecionando para cadastro específico');
          window.location.replace(`/cadastro/${selectedUserType}`);
        }
      } else {
        setError(result.error || 'Erro ao fazer login');
        toast.error(result.error || 'Erro ao fazer login');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      const errorMessage = error.message || 'Erro ao fazer login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Validação do tipo de usuário
      if (!selectedUserType || (selectedUserType !== 'professional' && selectedUserType !== 'client')) {
        toast.error('Por favor, selecione o tipo de usuário primeiro');
        return;
      }
      const userType: 'professional' | 'client' = selectedUserType;
      
      setLoading(true);
      setLoadingMessage('Conectando com Google...');

      // Salva o tipo de usuário no cookie antes do login
      setCookie('userType', userType);

      const result = await signInWithGoogle(rememberMe);
      
      if (!result || !result.email || !result.uid) {
        toast.error('Dados do usuário Google incompletos');
        throw new Error('Dados do usuário Google incompletos');
      }

      setLoadingMessage('Verificando seu cadastro...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verifica se tem perfil completo na coleção específica
      const hasProfile = await checkUserProfile(result.uid, userType);

      toast.success('Login realizado com sucesso!', {
        duration: 2000
      });

      // Adiciona um pequeno delay para mostrar o feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (hasProfile) {
        setLoadingMessage('Redirecionando para seu dashboard...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Redirecionando para dashboard - Google');
        window.location.replace(`/dashboard/${userType}`);
      } else {
        setLoadingMessage('Redirecionando para completar seu cadastro...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Redirecionando para cadastro específico - Google');
        window.location.replace(`/cadastro/${userType}`);
      }
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      toast.error(error.message || 'Erro ao conectar com Google', { duration: 3000 });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('loading');
    
    try {
      if (!selectedUserType) {
        throw new Error('Por favor, selecione o tipo de usuário primeiro');
      }

      const formattedEmail = formatIdentifier(resetEmail, selectedUserType);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, formattedEmail);
      setResetStatus('success');
      toast.success("Email enviado! Verifique sua caixa de entrada para redefinir sua senha.", { duration: 2000 });
      setTimeout(() => setIsResetModalOpen(false), 3000);
    } catch (error) {
      setResetStatus('error');
      toast.error("Não foi possível enviar o email de recuperação. Tente novamente.", { duration: 3000 });
    }
  };

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

  // Se ainda não selecionou o tipo de usuário, mostrar a seleção
  if (!selectedUserType) {
    return (
      <div className="relative min-h-[100vh] w-full overflow-auto bg-gradient-to-br from-primary to-secondary">
        <div className="container mx-auto min-h-[100vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='w-full max-w-md rounded-2xl bg-white shadow-xl p-4 sm:p-6 md:p-8'
          >
            <motion.div variants={itemVariants} className='flex flex-col gap-6'>
              <motion.div variants={itemVariants} className='text-center'>
                <div className="relative mx-auto h-16 w-40 sm:h-20 sm:w-48">
                  <Image
                    src="/images/logo.png"
                    alt="BeautyPro Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <h2 className='mt-6 text-2xl font-semibold text-gray-900'>
                  Seu talento transforma vidas. O{' '}
                  <span className='text-primary'>BeautyPro</span>{' '}
                  impulsiona sua jornada!
                </h2>
                <p className='mt-2 text-sm text-gray-600'>Como você deseja acessar?</p>
              </motion.div>

              <motion.div variants={itemVariants} className='flex flex-col gap-4'>
                <button
                  onClick={() => setSelectedUserType('professional')}
                  className='flex items-center justify-between rounded-lg border-2 border-primary p-4 transition-colors hover:bg-primary/5'
                >
                  <div className='flex flex-col items-start'>
                    <span className='text-lg font-medium text-gray-900'>Profissional/Empresa</span>
                    <span className='text-sm text-gray-500'>Acesse sua área de serviços</span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedUserType('client')}
                  className='flex items-center justify-between rounded-lg border-2 border-primary p-4 transition-colors hover:bg-primary/5'
                >
                  <div className='flex flex-col items-start'>
                    <span className='text-lg font-medium text-gray-900'>Cliente/Paciente</span>
                    <span className='text-sm text-gray-500'>Acesse seus agendamentos</span>
                  </div>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Resto do código do formulário de login
  return (
    <div className="relative min-h-[100vh] w-full overflow-auto bg-gradient-to-br from-primary to-secondary">
      <div className="container mx-auto min-h-[100vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='w-full max-w-md rounded-2xl bg-white shadow-xl p-4 sm:p-6 md:p-8'
        >
          {/* Indicador do tipo de usuário selecionado */}
          <motion.div
            variants={itemVariants}
            className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-primary/5 p-2 text-sm"
          >
            <span className="font-medium text-gray-700">
              Acessando como:{' '}
              <span className="text-primary">
                {selectedUserType === 'professional' ? 'Profissional/Empresa' : 'Cliente/Paciente'}
              </span>
            </span>
            <button
              onClick={() => setSelectedUserType(null)}
              className="text-xs text-primary hover:text-primary/90"
            >
              Alterar
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className='text-center'>
            <div className='relative mx-auto h-12 w-32 sm:h-16 sm:w-40'>
              <Image
                src='/images/logo.png'
                alt='BeautyPro Logo'
                fill
                className='object-contain'
                priority
              />
            </div>
            <h2 className='mt-4 text-xl sm:text-2xl font-semibold text-gray-900'>
              Bem-vindo(a) ao <span className='text-primary'>BeautyPro</span>
            </h2>
            <p className='mt-1 text-sm text-gray-600'>Faça login para acessar sua conta</p>
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

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <motion.div variants={itemVariants}>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <input
                id='email'
                type='email'
                value={identifier}
                onChange={handleIdentifierChange}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                placeholder='seu@email.com'
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
                Senha
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                placeholder='••••••••'
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                />
                <label htmlFor='remember-me' className='ml-2 block text-sm text-gray-700'>
                  Lembrar-me
                </label>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type='submit'
                disabled={loading}
                className='w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70'
              >
                {loading ? (
                  <div className='flex items-center justify-center'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    <span className='ml-2'>{loadingMessage || 'Entrando...'}</span>
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </motion.div>
          </motion.form>

          <motion.div variants={itemVariants} className='mt-4'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-xs'>
                <span className='bg-white px-2 text-gray-500'>ou continue com</span>
              </div>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            type='button'
            onClick={handleGoogleSignIn}
            disabled={loading}
            className='mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50'
          >
            <div className='relative h-4 w-4'>
              <Image src='/images/google-icon.png' alt='Google' fill className='object-contain' />
            </div>
            Entrar com Google
          </motion.button>

          <motion.p
            variants={itemVariants}
            className='mt-4 text-center text-xs text-gray-600'
          >
            Não tem uma conta?{' '}
            <a href='/cadastro' className='text-primary hover:text-primary-dark'>
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

          {/* Link para recuperação de senha */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center justify-center gap-2 mx-auto group transition-all duration-300 ease-in-out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <span className="group-hover:underline">Esqueceu sua senha?</span>
            </button>
          </div>

          {/* Modal de recuperação de senha */}
          <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
            <DialogContent className="sm:max-w-md mx-4 sm:mx-auto rounded-xl">
              <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4 p-1 sm:p-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary sm:h-8 sm:w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Recuperar Senha
                  </h2>
                  <p className="text-sm text-gray-500 sm:text-base">
                    Não se preocupe! Digite seu email abaixo e enviaremos instruções para recuperar sua senha.
                  </p>
                </div>
              </div>
              
              <form onSubmit={handlePasswordReset} className="space-y-4 p-1 sm:p-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10 w-full"
                      required
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={resetStatus === 'loading'}
                    className="w-full h-11 text-base font-medium transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {resetStatus === 'loading' ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span>Redefinir Senha</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className="px-1 sm:px-4 pb-4">
                <p className="text-xs text-center text-gray-500">
                  Lembre-se de verificar sua caixa de spam caso não encontre o email na caixa de entrada.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {loading && loadingMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            >
              <div className="rounded-lg bg-white p-6 text-center shadow-xl">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="text-gray-700">{loadingMessage}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
