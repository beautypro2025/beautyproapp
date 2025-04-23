'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfessionalByUserId } from '@/services/professional';

export function useRegistrationStatus() {
  const { user } = useAuth();
  const [needsCompletion, setNeedsCompletion] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRegistration() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const professionalData = await getProfessionalByUserId(user.uid);
        setNeedsCompletion(!professionalData);
      } catch (error) {
        console.error('Erro ao verificar cadastro:', error);
        setNeedsCompletion(true);
      } finally {
        setLoading(false);
      }
    }

    checkRegistration();
  }, [user]);

  return { needsCompletion, loading };
}
