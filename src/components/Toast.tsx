'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, LucideIcon } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

const toastConfig: Record<ToastType, { icon: LucideIcon; bgColor: string }> = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-green-100 text-green-600'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-100 text-red-600'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-100 text-blue-600'
  }
};

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const Icon = toastConfig[type].icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div
            className={`flex items-center gap-2 rounded-lg ${toastConfig[type].bgColor} p-4 shadow-lg`}
          >
            <Icon className="h-5 w-5" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
