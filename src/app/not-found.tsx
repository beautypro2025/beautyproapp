'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    toast({
      title: 'Página não encontrada',
      description: 'Você será redirecionado para a página inicial.'
    });
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary to-secondary px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl sm:p-8"
      >
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">Página não encontrada</h2>
        <p className="mt-2 text-gray-600">
          Desculpe, a página que você está procurando não existe.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
