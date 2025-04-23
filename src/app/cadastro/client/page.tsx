'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getClientByUserId, createClient } from '@/services/clientService';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';

interface FormData {
  name: string;
  whatsapp: string;
  birthDate: string;
  gender: string;
}

const initialFormData: FormData = {
  name: '',
  whatsapp: '',
  birthDate: '',
  gender: ''
};

// Função de validação dos dados do formulário
const validateFormData = (data: FormData) => {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Nome é obrigatório');
  }

  if (!data.birthDate) {
    errors.push('Data de nascimento é obrigatória');
  }

  if (!data.gender) {
    errors.push('Gênero é obrigatório');
  }

  if (data.whatsapp && !data.whatsapp.replace(/\D/g, '').match(/^\d{11}$/)) {
    errors.push('WhatsApp inválido');
  }

  return errors;
};

export default function ClientRegistrationPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 1500;

    const checkAuthAndRegistration = async () => {
      try {
        console.log('Iniciando verificação de autenticação...', { retryCount });

        // Verifica se há usuário autenticado
        if (!user?.uid) {
          console.log('Usuário não autenticado ou UID não disponível, tentando novamente...');
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            checkAuthAndRegistration();
            return;
          }
          console.log('Máximo de tentativas excedido para autenticação');
          router.push('/login');
          return;
        }

        console.log('Usuário autenticado:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });

        // Verifica se o usuário já tem um perfil de cliente
        const clientDoc = await getClientByUserId(user.uid);
        if (clientDoc) {
          console.log('Perfil de cliente já existe, redirecionando para dashboard');
          router.push('/dashboard/client');
          return;
        }

        // Se chegou aqui, o usuário está autenticado mas não tem perfil
        // Então pode continuar na página de cadastro
        if (isMounted) {
          setIsLoading(false);
        }

      } catch (error) {
        console.error('Erro na verificação:', error);
        if (isMounted) {
          setError('Erro ao verificar registro');
          setIsLoading(false);
        }
      }
    };

    checkAuthAndRegistration();

    return () => {
      isMounted = false;
    };
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Mostra feedback de carregamento
    const loadingToast = toast({
      title: "Processando...",
      description: (
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Salvando seus dados...</p>
        </div>
      ),
      duration: Infinity,
    });
    
    try {
      // Verifica se usuário está autenticado
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Valida os dados antes de salvar
      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      // Salva os dados usando uma transação
      await runTransaction(db, async (transaction) => {
        const clientRef = doc(db, 'clients', user.uid);
        const clientDoc = await transaction.get(clientRef);

        if (clientDoc.exists()) {
          throw new Error('Cliente já cadastrado');
        }

        const clientData = {
          ...formData,
          userId: user.uid,
          email: user.email,
          photoURL: user.photoURL,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active'
        };

        transaction.set(clientRef, clientData);
      });

      // Atualiza o toast de carregamento para mostrar sucesso
      loadingToast.dismiss();
      
      // Mostra o toast de sucesso
      const successToast = toast({
        title: "🎉 Cadastro realizado com sucesso!",
        description: (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-center">
              Bem-vindo(a) ao BeautyPro!<br/>
              <span className="text-sm text-gray-600">Agora você pode começar a agendar seus serviços.</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Redirecionando para seu dashboard...
            </div>
          </div>
        ),
        duration: 3000
      });

      // Aguarda o toast de sucesso ser exibido
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Prepara a transição suave
      const container = document.querySelector('.transition-container');
      if (container) {
        container.classList.add('fade-out');
      }

      // Redireciona após a transição
      setTimeout(() => {
        window.location.href = '/dashboard/client';
      }, 500);

    } catch (err) {
      console.error('Erro ao salvar dados:', err);
      
      // Fecha o toast de carregamento
      loadingToast.dismiss();

      // Mostra mensagem de erro apropriada com ícone
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar os dados';
      toast({
        title: "❌ Ops! Algo deu errado",
        description: (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p>{errorMessage}</p>
          </div>
        ),
        variant: "destructive",
        duration: 4000
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Componente de loading personalizado
  const LoadingSpinner = () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg text-gray-600">Verificando seus dados...</p>
      </div>
    </div>
  );

  // Mostra loading enquanto verifica autenticação
  if (!user || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="transition-container">
      <style jsx global>{`
        .transition-container {
          opacity: 1;
          transition: opacity 0.5s ease;
        }
        .fade-out {
          opacity: 0;
        }
      `}</style>
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary to-secondary px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        >
          <div className="flex flex-col gap-4">
            <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6 md:px-8">
              <p className="text-center font-playfair text-xl leading-relaxed tracking-wide text-gray-800 sm:text-2xl md:text-3xl lg:text-4xl">
                Complete seu cadastro
              </p>
              <p className="mt-2 text-center text-lg text-gray-600">
                Personalize seu perfil para começar a agendar serviços
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="mt-1"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 