'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface RegistrationAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteRegistration: () => void;
}

export function RegistrationAlert({
  isOpen,
  onClose,
  onCompleteRegistration
}: RegistrationAlertProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      toast({
        title: 'Cadastro incompleto',
        description: 'Complete seu cadastro para continuar.'
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Cadastro incompleto</h3>
              <p className="mt-2 text-sm text-gray-500">
                Para continuar usando o BeautyPro, você precisa completar seu cadastro profissional.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={onCompleteRegistration} className="inline-flex justify-center">
                Completar cadastro
              </Button>
              <Button variant="outline" onClick={onClose} className="inline-flex justify-center">
                Fazer depois
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
