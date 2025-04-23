'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import { useState } from 'react';
import { RegistrationAlert } from '@/components/RegistrationAlert';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <ToastViewport />
        <RegistrationAlert
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onCompleteRegistration={() => {
            setIsOpen(false);
            // Adicione aqui a lógica para redirecionar para a página de cadastro profissional
          }}
        />
      </ToastProvider>
    </AuthProvider>
  );
}
