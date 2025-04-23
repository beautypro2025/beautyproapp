'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormData {
  email: string;
  confirmEmail: string;
}

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: '', confirmEmail: '' });
  const [selectedUserType, setSelectedUserType] = useState<'professional' | 'client'>('client');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Carrega a preferência salva do tipo de usuário
  useEffect(() => {
    const savedUserType = localStorage.getItem('forgotPasswordUserType');
    if (savedUserType === 'professional' || savedUserType === 'client') {
      setSelectedUserType(savedUserType);
    }
  }, []);

  // Salva a preferência do tipo de usuário
  const handleUserTypeChange = (value: 'professional' | 'client') => {
    setSelectedUserType(value);
    localStorage.setItem('forgotPasswordUserType', value);
  };

  // Validação de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Validações
    if (!validateEmail(formData.email)) {
      setEmailError('Por favor, insira um email válido');
      return;
    }

    if (formData.email !== formData.confirmEmail) {
      setEmailError('Os emails não correspondem');
      return;
    }

    setLoading(true);

    try {
      // Remove prefixos existentes e adiciona o novo prefixo
      const cleanEmail = formData.email
        .replace('client.', '')
        .replace('professional.', '');
      const prefixedEmail = `${selectedUserType}.${cleanEmail}`;

      // Verifica se o usuário existe
      const collection = selectedUserType === 'professional' ? 'professionals' : 'clients';
      const userDoc = await getDoc(doc(db, collection, prefixedEmail));

      if (!userDoc.exists()) {
        toast({
          title: "Conta não encontrada",
          description: `Não encontramos uma conta ${selectedUserType === 'professional' ? 'profissional' : 'de cliente'} com este email`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Envia o email de recuperação
      await sendPasswordResetEmail(auth, cleanEmail);

      // Feedback de sucesso
      toast({
        title: "Email enviado com sucesso!",
        description: (
          <div className="flex flex-col gap-2">
            <p>Enviamos um link de recuperação para:</p>
            <p className="font-medium">{cleanEmail}</p>
            <p className="text-sm text-gray-500">
              Verifique também sua pasta de spam
            </p>
          </div>
        ),
      });

      // Redireciona após 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error);
      
      // Feedback específico baseado no erro
      let errorMessage = 'Não foi possível enviar o email de recuperação';
      if (error?.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-12">
      <div className="container max-w-md">
        <Card className="border-none bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-6 text-center">
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
              <CardTitle className="text-2xl font-semibold">
                Recuperar Senha
              </CardTitle>
              <CardDescription>
                Enviaremos um link para você redefinir sua senha
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Conta</Label>
                  <Select
                    value={selectedUserType}
                    onValueChange={handleUserTypeChange}
                  >
                    <SelectTrigger className="mt-1.5 h-12">
                      <SelectValue placeholder="Selecione o tipo de conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="professional">Profissional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5 h-12"
                    placeholder="Digite seu email"
                    required
                  />
                </div>

                <div>
                  <Label>Confirme seu Email</Label>
                  <Input
                    type="email"
                    value={formData.confirmEmail}
                    onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                    className="mt-1.5 h-12"
                    placeholder="Digite seu email novamente"
                    required
                  />
                </div>

                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Voltar para o Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 