'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactInputMask from 'react-input-mask';
import { useAuth } from '@/context/AuthContext';
import { states, stateLabels } from '@/data/states';
import { cities } from '@/data/cities';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, runTransaction, getDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FormData {
  name: string;
  whatsapp: string;
  city: string;
  state: string;
  userId?: string;
}

const initialFormData: FormData = {
  name: '',
  whatsapp: '',
  city: '',
  state: ''
};

interface InputMaskEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    value: string;
  };
}

// Função de validação dos dados do formulário
const validateFormData = (data: FormData) => {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Nome é obrigatório');
  }

  if (!data.whatsapp?.replace(/\D/g, '').match(/^\d{11}$/)) {
    errors.push('WhatsApp inválido');
  }

  return errors;
};

// Função para sanitizar os dados
const sanitizeFormData = (data: FormData) => {
  return {
    ...data,
    name: data.name.trim(),
    whatsapp: data.whatsapp.replace(/\D/g, ''),
    city: data.city.trim(),
    state: data.state.toUpperCase()
  };
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

        if (!user?.uid) {
          console.log('Usuário não autenticado ou UID não disponível, tentando novamente...');
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            checkAuthAndRegistration();
            return;
          }
          console.log('Máximo de tentativas excedido para autenticação');
          router.push('/cadastro');
          return;
        }

        console.log('Usuário autenticado:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });

        const registrationData = localStorage.getItem('registrationData');
        console.log('Dados de registro encontrados:', registrationData);

        if (!registrationData && retryCount < MAX_RETRIES) {
          console.log('Dados de registro não encontrados, tentando novamente...');
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          checkAuthAndRegistration();
          return;
        }

        if (!registrationData) {
          console.log('Dados de registro não encontrados após tentativas');
          router.push('/cadastro');
          return;
        }

        let parsedData;
        try {
          parsedData = JSON.parse(registrationData);
          console.log('Dados de registro parseados:', parsedData);

          if (!parsedData.uid || !parsedData.userType || !parsedData.identifier || parsedData.userType !== 'client') {
            console.log('Dados de registro inválidos:', parsedData);
            router.push('/cadastro');
            return;
          }

          if (user.uid !== parsedData.uid) {
            console.log('UID do usuário não corresponde aos dados de registro');
            router.push('/cadastro');
            return;
          }
        } catch (e) {
          console.error('Erro ao fazer parse dos dados de registro:', e);
          router.push('/cadastro');
          return;
        }

        try {
          const clientRef = doc(db, 'clients', user.uid);
          const clientDoc = await getDoc(clientRef);

          if (clientDoc.exists()) {
            console.log('Cliente já cadastrado, redirecionando para dashboard');
            router.push('/dashboard/client');
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar existência do cliente:', error);
        }

        const token = localStorage.getItem('authToken');
        if (!token && retryCount < MAX_RETRIES) {
          console.log('Token não encontrado, tentando novamente...');
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          checkAuthAndRegistration();
          return;
        }

        if (!token) {
          console.log('Token não encontrado após tentativas');
          router.push('/cadastro');
          return;
        }

        console.log('Permitindo acesso ao formulário');

        if (user.displayName) {
          setFormData(prev => ({
            ...prev,
            name: user.displayName || ''
          }));
        }

        if (parsedData.loginType === 'cpf') {
          setFormData(prev => ({
            ...prev,
            whatsapp: parsedData.identifier.replace(/\D/g, '')
          }));
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        if (retryCount < MAX_RETRIES) {
          console.log('Tentando novamente após erro...');
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          checkAuthAndRegistration();
          return;
        }
        if (isMounted) {
          router.push('/cadastro');
        }
      }
    };

    if (user || retryCount < MAX_RETRIES) {
      checkAuthAndRegistration();
    }

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

      // Sanitiza e valida os dados
      const sanitizedData = {
        ...formData,
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
      };

      // Validações
      const validationErrors = validateFormData(sanitizedData);
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
          ...sanitizedData,
          userId: user.uid,
          email: user.email,
          photoURL: user.photoURL,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active',
          settings: {
            notifications: true,
            emailAlerts: true
          }
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

      // Prepara a transição suave e adiciona sinalizador de primeiro acesso
      const container = document.querySelector('.transition-container');
      if (container) {
        container.classList.add('fade-out');
      }

      // Salva informações de primeiro acesso
      localStorage.setItem('firstAccess', 'true');
      localStorage.setItem('userType', 'client');

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

  const LoadingSpinner = () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg text-gray-600">Verificando seus dados...</p>
      </div>
    </div>
  );

  if (!user || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-2xl border-none bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-6 text-center pb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Image
                src="/images/logo.png"
                alt="BeautyPro Logo"
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold text-gray-900">
                Complete seu Cadastro
              </CardTitle>
              <CardDescription className="text-base text-gray-500">
                Personalize seu perfil para uma melhor experiência
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-medium text-gray-900">Informações Básicas</div>
                    <div className="text-sm text-gray-500">* Campos obrigatórios</div>
                  </div>
                  
                  <Input
                    label="Nome completo"
                    labelExtra={<span className="text-red-500 ml-1">*</span>}
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite seu nome completo"
                    required
                    error={error.includes('Nome')}
                    helperText={error.includes('Nome') ? 'Nome é obrigatório' : ''}
                  />

                  <div>
                    <div className="flex items-center mb-1.5">
                      <Label className="text-gray-700">WhatsApp</Label>
                      <span className="text-red-500 ml-1">*</span>
                    </div>
                    <ReactInputMask
                      mask="(99) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      className={cn(
                        'flex h-12 w-full rounded-lg border bg-white px-4 py-2 text-base text-gray-900 shadow-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                        error.includes('WhatsApp') && 'border-red-500 focus-visible:ring-red-500'
                      )}
                      placeholder="(00) 00000-0000"
                      required
                    />
                    {error.includes('WhatsApp') && (
                      <p className="mt-2 text-sm text-red-500">
                        WhatsApp inválido
                      </p>
                    )}
                  </div>
                </div>

                {/* Localização */}
                <div className="space-y-4">
                  <div className="text-lg font-medium text-gray-900">Localização</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <Label className="text-gray-700">Estado</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => {
                          setFormData({ 
                            ...formData, 
                            state: value,
                            city: ''
                          });
                        }}
                      >
                        <SelectTrigger className="mt-1.5 h-12 bg-white">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] bg-white shadow-lg border-none">
                          <div className="max-h-[300px] overflow-y-auto">
                            {states.map((state) => (
                              <SelectItem 
                                key={state} 
                                value={state}
                                className="cursor-pointer py-2.5 text-base hover:bg-gray-50 focus:bg-gray-50"
                              >
                                {stateLabels[state]}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative">
                      <Label className="text-gray-700">Cidade</Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => 
                          setFormData({ ...formData, city: value })
                        }
                        disabled={!formData.state}
                      >
                        <SelectTrigger className="mt-1.5 h-12 bg-white">
                          <SelectValue placeholder="Selecione a cidade" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] bg-white shadow-lg border-none">
                          <div className="max-h-[300px] overflow-y-auto">
                            {formData.state &&
                              cities[formData.state]?.map((city) => (
                                <SelectItem 
                                  key={city} 
                                  value={city}
                                  className="cursor-pointer py-2.5 text-base hover:bg-gray-50 focus:bg-gray-50"
                                >
                                  {city}
                                </SelectItem>
                              ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
