'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { Toast } from '@/components/Toast';

export type ToastType = 'success' | 'error' | 'info';

interface ToastContextData {
  showToast: (message: string, type: ToastType) => void;
}

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });

    setTimeout(() => {
      setToast(state => ({ ...state, isVisible: false }));
    }, 3000);
  }, []);

  const handleClose = useCallback(() => {
    setToast(state => ({ ...state, isVisible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={handleClose}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
