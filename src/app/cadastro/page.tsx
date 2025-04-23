'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import InputMask from 'react-input-mask';
import { useAuth } from '@/context/AuthContext';
import { onlyNumbers } from '@/utils/format';
import { auth } from '@/lib/firebase';
import { fetchSignInMethodsForEmail, UserCredential } from 'firebase/auth';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { setCookie } from 'cookies-next';
import { 
  isValidEmail, 
  isValidCPF, 
  isValidCNPJ, 
  formatIdentifier, 
  checkIdentifierExists 
} from '@/services/auth';
import { toast } from 'react-hot-toast';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FormData {
  loginType: 'email' | 'cpf' | 'cnpj';
  identifier: string;
  password: string;
  confirmPassword: string;
  userType?: 'professional' | 'client';
}

const initialFormData: FormData = {
  loginType: 'email',
  identifier: '',
  password: '',
  confirmPassword: '',
  userType: undefined
};

const loginTypes = [
  { id: 'email', label: 'Email' },
  { id: 'cpf', label: 'CPF' },
  { id: 'cnpj', label: 'CNPJ' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [identifierError, setIdentifierError] = useState<React.ReactNode>('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    actionButton: ''
  });
  const router = useRouter();
  const { signInWithGoogle, createUser } = useAuth();

  const isValidIdentifier = () => {
    const { loginType, identifier } = formData;
    if (!identifier) return false;

    switch (loginType) {
      case 'email':
        return isValidEmail(identifier);
      case 'cpf':
        return isValidCPF(identifier);
      case 'cnpj':
        return isValidCNPJ(identifier);
      default:
        return false;
    }
  };

  const handleIdentifierExists = (loginType: 'email' | 'cpf' | 'cnpj', userType: 'professional' | 'client') => {
    const isProfessional = userType === 'professional';
    const identifier = loginType.toUpperCase();
    
    setModalContent({
      title: 'Bem-vindo de volta! 🎉',
      message: isProfessional
        ? `Identificamos que este ${identifier} já está registrado como profissional/empresa no BeautyPro.`
        : `Identificamos que este ${identifier} já está registrado como cliente/paciente no BeautyPro.`,
      actionButton: isProfessional ? 'Acessar Área do Profissional' : 'Acessar Área do Cliente'
    });
    setShowModal(true);

    setIdentifierError(
      <div className='mt-4 flex flex-col items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20'>
        <div className='rounded-full bg-primary/10 p-3'>
          <AlertCircle className='h-6 w-6 text-primary' />
        </div>
        <p className='text-center text-gray-700'>
          {isProfessional ? (
            <>
              Que bom ter você de volta! 🎉
              <br />
              <span className='text-primary font-medium'>
                Entre na sua conta para continuar gerenciando seus serviços e agendamentos.
              </span>
            </>
          ) : (
            <>
              Que bom ter você de volta! 🎉
              <br />
              <span className='text-primary font-medium'>
                Entre na sua conta para continuar agendando seus serviços.
              </span>
            </>
          )}
        </p>
        <div className='flex w-full gap-2'>
          <button
            onClick={() => {
              window.location.href = '/login';
            }}
            className='flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90'
          >
            {isProfessional ? 'Acessar Área do Profissional' : 'Acessar Área do Cliente'}
          </button>
          <button
            onClick={() => {
              setShowModal(false);
              setIdentifierError('');
              setError('');
              setFormData(prev => ({ ...prev, identifier: '' }));
            }}
            className='flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200'
          >
            Usar Outro {loginType.toUpperCase()}
          </button>
        </div>
      </div>
    );
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Se o campo for identifier, valida o formato
    if (name === 'identifier') {
      const isValid = formData.loginType === 'cpf'
        ? isValidCPF(value)
        : formData.loginType === 'cnpj'
          ? isValidCNPJ(value)
          : isValidEmail(value);

      // Se o formato for válido, verifica se já existe
      if (isValid && formData.userType) {
        try {
          const exists = await checkIdentifierExists(value, formData.loginType, formData.userType);
          if (exists) {
            handleIdentifierExists(formData.loginType, formData.userType);
          }
        } catch (error) {
          console.error('Erro ao verificar identificador:', error);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setIdentifierError('');

    try {
      if (!formData.userType) {
        setError('Selecione um tipo de usuário');
        return;
      }

      if (!isValidIdentifier()) {
        setError('Identificador inválido');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      // Mostra feedback de carregamento centralizado
      toast.loading('Criando sua conta...', { 
        id: 'createAccount',
        position: 'bottom-center'
      });

      const emailToRegister = formatIdentifier(
        formData.identifier,
        formData.loginType,
        formData.userType
      );

      const userCredential = await createUser(emailToRegister, formData.password);
      
      if (userCredential && userCredential.user) {
        // Define o caminho baseado no tipo de usuário
        const nextPath = formData.userType === 'professional' 
          ? '/cadastro/professional'
          : '/cadastro/cliente';

        // Armazena dados importantes no localStorage
        localStorage.setItem('registrationData', JSON.stringify({
          loginType: formData.loginType,
          identifier: formData.identifier,
          userType: formData.userType,
          email: emailToRegister,
          uid: userCredential.user.uid,
          displayName: userCredential.user.displayName || null,
          photoURL: userCredential.user.photoURL || null,
          createdAt: new Date().toISOString()
        }));

        // Também armazena o token de autenticação
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('authToken', token);

        // Atualiza o feedback e redireciona
        toast.success('Conta criada com sucesso!', {
          id: 'createAccount',
          duration: 1000
        });

        // Usa window.location.href para garantir que a página seja carregada completamente
        window.location.href = nextPath;
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.dismiss('createAccount');
      
      if (error?.code === 'auth/email-already-in-use') {
        const isProfessional = formData.userType === 'professional';
        setModalContent({
          title: 'Bem-vindo de volta! 🎉',
          message: isProfessional
            ? 'Identificamos que você já possui uma conta profissional no BeautyPro.'
            : 'Identificamos que você já possui uma conta de cliente no BeautyPro.',
          actionButton: isProfessional ? 'Acessar Área do Profissional' : 'Acessar Área do Cliente'
        });
        setShowModal(true);
      } else if (error?.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else if (error?.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (!formData.userType) {
        toast.error('Por favor, selecione o tipo de usuário primeiro');
        return;
      }

      setLoading(true);
      setError('');

      // Mostra feedback de carregamento
      const loadingToast = toast.loading('Conectando com Google...', { 
        id: 'googleSignIn',
        position: 'bottom-center'
      });

      try {
        // Salva o tipo de usuário no cookie antes do login
        setCookie('userType', formData.userType);
        
        const result = await signInWithGoogle();
        
        if (!result || !result.email) {
          toast.error('Erro ao conectar com Google', { id: 'googleSignIn' });
          return;
        }

        // Verifica se já existe um cadastro para este usuário
        const collectionName = formData.userType === 'professional' ? 'professionals' : 'clients';
        const userDoc = await getDoc(doc(db, collectionName, result.uid));

        if (userDoc.exists()) {
          toast.error(`Esta conta já está cadastrada como ${formData.userType}`, { id: 'googleSignIn' });
          router.push('/login');
          return;
        }

        // Atualiza o feedback e redireciona
        toast.success('Conta Google conectada com sucesso!', {
          id: 'googleSignIn',
          duration: 1500
        });

        // Aguarda um momento para garantir que os dados foram salvos
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Redireciona para a página de cadastro específica
        const cadastroUrl = formData.userType === 'professional' ? '/cadastro/professional' : '/cadastro/cliente';
        window.location.replace(cadastroUrl);
      } catch (error: any) {
        console.error('Erro específico:', error);
        toast.error(error.message || 'Erro ao conectar com Google', { id: 'googleSignIn' });
      }
    } catch (error: any) {
      console.error('Erro geral:', error);
      toast.error('Erro ao processar cadastro. Tente novamente.', { id: 'googleSignIn' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginTypeChange = (type: 'email' | 'cpf' | 'cnpj') => {
    setFormData(prev => ({
      ...prev,
      loginType: type,
      identifier: ''
    }));
    setIdentifierError('');
    setError('');
  };

  // Função para limpar todos os campos do formulário
  const clearFormFields = () => {
    setFormData(prev => ({
      ...prev,
      identifier: '',
      password: '',
      confirmPassword: ''
    }));
    setShowModal(false);
    setIdentifierError('');
    setError('');
  };

  // Se ainda não selecionou o tipo de usuário, mostrar a seleção
  if (!formData.userType) {
    return (
      <div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary to-secondary px-4 py-8 sm:px-6 lg:px-8'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8'
        >
          <motion.div variants={itemVariants} className='flex flex-col gap-6'>
            <motion.div variants={itemVariants} className='text-center'>
              <h2 className='text-2xl font-semibold text-gray-900'>
                Seu talento transforma vidas. O{' '}
                <span className='text-primary'>BeautyPro</span>{' '}
                impulsiona sua jornada!
              </h2>
              <p className='mt-2 text-sm text-gray-600'>Como você deseja se cadastrar?</p>
            </motion.div>

            <motion.div variants={itemVariants} className='flex flex-col gap-4'>
              <button
                onClick={() => setFormData(prev => ({ ...prev, userType: 'professional' }))}
                className='flex items-center justify-between rounded-lg border-2 border-primary p-4 transition-colors hover:bg-primary/5'
              >
                <div className='flex flex-col items-start'>
                  <span className='text-lg font-medium text-gray-900'>Profissional/Empresa</span>
                  <span className='text-sm text-gray-500'>Quero oferecer meus serviços</span>
                </div>
              </button>

              <button
                onClick={() => setFormData(prev => ({ ...prev, userType: 'client' }))}
                className='flex items-center justify-between rounded-lg border-2 border-primary p-4 transition-colors hover:bg-primary/5'
              >
                <div className='flex flex-col items-start'>
                  <span className='text-lg font-medium text-gray-900'>Cliente/Paciente</span>
                  <span className='text-sm text-gray-500'>Quero agendar serviços</span>
                </div>
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Renderizar o formulário de cadastro normal
  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary to-secondary px-4 py-8 sm:px-6 lg:px-8'>
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8'
      >
        <motion.div variants={itemVariants} className='flex flex-col gap-4'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
              Crie sua conta no BeautyPro
            </h1>
          </div>

          <motion.div variants={itemVariants} className='flex flex-col gap-4'>
            <motion.div variants={itemVariants} className='flex items-center justify-center gap-4'>
              <motion.button
                variants={itemVariants}
                onClick={handleGoogleSignIn}
                className='flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              >
                <Image src='/images/google-icon.png' alt='Google' width={20} height={20} className='h-5 w-5' />
                <span>Continuar com Google</span>
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className='relative my-4'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-white px-2 text-gray-500'>ou</span>
              </div>
            </motion.div>

             <motion.div variants={itemVariants} className='flex flex-col gap-4'>

              <div>
                <label
                  htmlFor='identifier'
                  className='mb-1.5 block text-sm font-medium text-gray-700'
                >
                  {formData.loginType === 'email'
                    ? 'Email'
                    : formData.loginType === 'cpf'
                      ? 'CPF'
                      : 'CNPJ'}
                </label>
                {formData.loginType === 'email' ? (
                  <input
                    type='email'
                    id='identifier'
                    name='identifier'
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border ${
                      error ? 'border-red-300' : 'border-gray-300'
                    } px-4 py-2.5 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-base`}
                    placeholder='seu@email.com'
                    required
                  />
                ) : (
                  <InputMask
                    mask={formData.loginType === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99'}
                    id='identifier'
                    name='identifier'
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border ${
                      error ? 'border-red-300' : 'border-gray-300'
                    } px-4 py-2.5 text-sm transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-base`}
                    placeholder={
                      formData.loginType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'
                    }
                    required
                    alwaysShowMask={true}
                    maskChar='_'
                  />
                )}
                {identifierError && <p className='mt-1 text-sm text-red-600'>{identifierError}</p>}
                {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
              </div>

              <div>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                  Senha
                </label>
                <div className='mt-1'>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                    className='block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm'
                    placeholder='Digite sua senha'
                  />
                </div>
              </div>

              <div>
                <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                  Confirmar Senha
                </label>
                <div className='mt-1'>
                  <input
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className='block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm'
                    placeholder='Confirme sua senha'
                  />
                </div>
                {error && error.includes('senhas') && (
                  <p className='mt-1 text-sm text-red-600'>{error}</p>
                )}
              </div>

              <motion.div variants={itemVariants}>
                <motion.button
                  variants={itemVariants}
                  type='submit'
                  onClick={handleSubmit}
                  className='flex w-full justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                >
                  Criar Conta
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.p variants={itemVariants} className='mt-4 text-center text-sm text-gray-600'>
            Já tem uma conta?{' '}
            <Link href='/login' className='font-medium text-primary hover:text-primary/90'>
              Faça login
            </Link>
          </motion.p>
        </motion.div>

        {loading && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20'>
            <div className='rounded-lg bg-white p-4 shadow-xl'>
              <div className='flex items-center gap-3'>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                <span className='text-sm font-medium text-gray-700'>Processando...</span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className='w-full max-w-md rounded-2xl bg-white p-6 shadow-xl'
              >
                <div className='flex flex-col items-center gap-4'>
                  <div className='rounded-full bg-primary/10 p-3'>
                    <AlertCircle className='h-6 w-6 text-primary' />
                  </div>
                  <h3 className='text-lg font-medium text-gray-900'>
                    {modalContent.title}
                  </h3>
                  <p className='text-center text-sm text-gray-500'>
                    {modalContent.message}
                    <br />
                    {formData.userType === 'professional' 
                      ? 'Acesse sua conta para gerenciar seus serviços.'
                      : 'Acesse sua conta para visualizar e agendar serviços.'}
                  </p>
                  <div className='mt-4 flex w-full gap-4'>
                    <button
                      onClick={() => {
                        window.location.href = '/login';
                      }}
                      className='flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90'
                    >
                      {modalContent.actionButton}
                    </button>
                    <button
                      onClick={clearFormFields}
                      className='flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200'
                    >
                      Usar Outro {formData.loginType.toUpperCase()}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
