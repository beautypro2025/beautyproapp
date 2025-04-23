'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import InputMask from 'react-input-mask';
import { createProfessional, getProfessionalByUserId } from '@/services/professional';
import { useAuth } from '@/context/AuthContext';
import { specialties } from '@/data/specialties';
import { states, stateLabels } from '@/data/states';
import { cities } from '@/data/cities';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, runTransaction, getDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormData {
  name: string;
  specialties: string[];
  customSpecialty: string;
  whatsapp: string;
  city: string;
  state: string;
  bio: string;
  userId?: string;
  schedule: {
    segunda: { enabled: boolean; start: string; end: string };
    terca: { enabled: boolean; start: string; end: string };
    quarta: { enabled: boolean; start: string; end: string };
    quinta: { enabled: boolean; start: string; end: string };
    sexta: { enabled: boolean; start: string; end: string };
    sabado: { enabled: boolean; start: string; end: string };
    domingo: { enabled: boolean; start: string; end: string };
  };
  searchSpecialty: string;
}

const initialFormData: FormData = {
  name: '',
  specialties: [],
  customSpecialty: '',
  whatsapp: '',
  city: '',
  state: '',
  bio: '',
  schedule: {
    segunda: { enabled: false, start: '09:00', end: '18:00' },
    terca: { enabled: false, start: '09:00', end: '18:00' },
    quarta: { enabled: false, start: '09:00', end: '18:00' },
    quinta: { enabled: false, start: '09:00', end: '18:00' },
    sexta: { enabled: false, start: '09:00', end: '18:00' },
    sabado: { enabled: false, start: '09:00', end: '18:00' },
    domingo: { enabled: false, start: '09:00', end: '18:00' }
  },
  searchSpecialty: '',
};

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
    bio: data.bio.trim(),
    whatsapp: data.whatsapp.replace(/\D/g, ''),
    city: data.city.trim(),
    state: data.state.toUpperCase(),
    specialties: Array.from(new Set(data.specialties)),
    customSpecialty: data.customSpecialty?.trim() || '',
    searchSpecialty: data.searchSpecialty?.trim() || ''
  };
};

export default function ProfessionalRegistrationPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [showCustomSpecialty, setShowCustomSpecialty] = useState(false);

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

        // Verifica se o usuário já tem um perfil profissional
        const professionalDoc = await getProfessionalByUserId(user.uid);
        if (professionalDoc) {
          console.log('Perfil profissional já existe, redirecionando para dashboard');
          router.push('/dashboard/professional');
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

      // Sanitiza os dados do formulário
      const sanitizedData = sanitizeFormData(formData);

      // Valida os dados antes de salvar
      const validationErrors = validateFormData(sanitizedData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      // Salva os dados usando uma transação
      await runTransaction(db, async (transaction) => {
        const professionalRef = doc(db, 'professionals', user.uid);
        const professionalDoc = await transaction.get(professionalRef);

        if (professionalDoc.exists()) {
          throw new Error('Profissional já cadastrado');
        }

        const professionalData = {
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

        transaction.set(professionalRef, professionalData);
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
              <span className="text-sm text-gray-600">Sua jornada profissional começa agora.</span>
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
      localStorage.setItem('userType', 'professional');

      // Redireciona após a transição
      setTimeout(() => {
        window.location.href = '/dashboard/professional';
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
                Preencha suas informações para começar a atender
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
                    <InputMask
                      mask="(99) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
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

                {/* Especialidades */}
                <div className="space-y-4">
                  <div className="text-lg font-medium text-gray-900">Especialidades</div>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Digite para buscar especialidades..."
                        value={formData.searchSpecialty}
                        onChange={(e) => 
                          setFormData({ ...formData, searchSpecialty: e.target.value })
                        }
                        className="h-12 text-base"
                      />
                      <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>

                    {formData.searchSpecialty && (
                      <div className="max-h-48 overflow-y-auto rounded-lg border bg-white p-1 shadow-lg">
                        {specialties
                          .filter(specialty => 
                            specialty.toLowerCase().includes(formData.searchSpecialty.toLowerCase())
                          )
                          .map(specialty => (
                            <button
                              key={specialty}
                              type="button"
                              onClick={() => {
                                if (!formData.specialties.includes(specialty)) {
                                  setFormData({
                                    ...formData,
                                    specialties: [...formData.specialties, specialty],
                                    searchSpecialty: ''
                                  });
                                }
                              }}
                              className={cn(
                                "w-full text-left px-4 py-2.5 text-base rounded-md transition-colors",
                                "hover:bg-gray-50",
                                formData.specialties.includes(specialty) 
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-700 cursor-pointer"
                              )}
                            >
                              {specialty}
                            </button>
                          ))}
                      </div>
                    )}

                    {formData.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.specialties.map(specialty => (
                          <div
                            key={specialty}
                            className="group flex items-center gap-1 rounded-full bg-primary/5 px-4 py-2 text-base transition-colors hover:bg-primary/10"
                          >
                            <span className="text-gray-700">{specialty}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  specialties: formData.specialties.filter(s => s !== specialty)
                                });
                              }}
                              className="ml-1.5 rounded-full p-0.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-gray-700"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <path d="M18 6L6 18M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Horários */}
                <div className="space-y-4">
                  <div className="text-lg font-medium text-gray-900">Horários de Atendimento</div>
                  <div className="rounded-lg border bg-gray-50/50 p-4">
                    <div className="grid gap-4">
                      {Object.entries(formData.schedule).map(([day, schedule]) => (
                        <div key={day} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`${day}-enabled`}
                              checked={schedule.enabled}
                              onCheckedChange={(checked) => {
                                setFormData({
                                  ...formData,
                                  schedule: {
                                    ...formData.schedule,
                                    [day]: {
                                      ...schedule,
                                      enabled: checked as boolean
                                    }
                                  }
                                });
                              }}
                            />
                            <Label htmlFor={`${day}-enabled`} className="text-base capitalize text-gray-700">
                              {day}
                            </Label>
                          </div>
                          
                          {schedule.enabled && (
                            <div className="flex items-center space-x-3">
                              <input
                                type="time"
                                value={schedule.start}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    schedule: {
                                      ...formData.schedule,
                                      [day]: {
                                        ...schedule,
                                        start: e.target.value
                                      }
                                    }
                                  });
                                }}
                                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-base shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-gray-500">até</span>
                              <input
                                type="time"
                                value={schedule.end}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    schedule: {
                                      ...formData.schedule,
                                      [day]: {
                                        ...schedule,
                                        end: e.target.value
                                      }
                                    }
                                  });
                                }}
                                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-base shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {error.includes('dia de atendimento') && (
                    <p className="text-sm text-red-500">
                      Selecione pelo menos um dia de atendimento
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-4">
                  <div className="text-lg font-medium text-gray-900">Sobre você</div>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Conte um pouco sobre sua experiência profissional..."
                    className="min-h-[120px] resize-none text-base"
                  />
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
