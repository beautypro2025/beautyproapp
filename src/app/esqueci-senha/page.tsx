'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Email enviado com sucesso!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.'
      });
      router.push('/login');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Email não encontrado. Verifique se o email está correto.');
      } else {
        setError('Erro ao enviar email. Tente novamente.');
      }
      console.error('Erro ao enviar email de redefinição:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary to-secondary px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Esqueceu sua senha?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Digite seu email abaixo e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar link de redefinição'
            )}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Lembrou sua senha?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/90">
              Faça login
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
