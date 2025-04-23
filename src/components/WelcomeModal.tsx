'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Users, Settings } from 'lucide-react';

interface WelcomeModalProps {
  userType: 'professional' | 'client';
}

export function WelcomeModal({ userType }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const firstAccess = localStorage.getItem('firstAccess');
    const storedUserType = localStorage.getItem('userType');

    if (firstAccess === 'true' && storedUserType === userType) {
      setIsOpen(true);
      // Remove o sinalizador após mostrar o modal
      localStorage.removeItem('firstAccess');
      localStorage.removeItem('userType');
    }
  }, [userType]);

  const features = userType === 'professional' ? [
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: 'Agenda Inteligente',
      description: 'Gerencie seus horários e compromissos de forma eficiente'
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Gestão de Clientes',
      description: 'Mantenha um histórico completo de seus clientes'
    },
    {
      icon: <Settings className="h-6 w-6 text-primary" />,
      title: 'Personalização',
      description: 'Configure seus serviços e horários de atendimento'
    }
  ] : [
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: 'Agendamentos',
      description: 'Marque seus horários com facilidade'
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Profissionais',
      description: 'Encontre os melhores profissionais da sua região'
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: 'Experiência',
      description: 'Avalie e compartilhe suas experiências'
    }
  ];

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
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="absolute right-4 top-4">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">
                Bem-vindo(a) ao BeautyPro!
              </h3>
              <p className="mt-2 text-gray-500">
                {userType === 'professional'
                  ? 'Estamos felizes em ter você como profissional parceiro. Vamos começar?'
                  : 'Estamos felizes em ter você conosco. Vamos começar sua jornada de beleza?'}
              </p>
            </div>

            <div className="mt-8 space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{feature.title}</h4>
                    <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                Começar agora
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 