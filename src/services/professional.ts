import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';

export interface Professional {
  userId: string;
  email: string;
  name: string;
  bio: string;
  whatsapp: string;
  specialties: string[];
  schedule: {
    segunda: {
      enabled: boolean;
      start: string;
      end: string;
    };
    terca: {
      enabled: boolean;
      start: string;
      end: string;
    };
    quarta: {
      enabled: boolean;
      start: string;
      end: string;
    };
    quinta: {
      enabled: boolean;
      start: string;
      end: string;
    };
    sexta: {
      enabled: boolean;
      start: string;
      end: string;
    };
    sabado: {
      enabled: boolean;
      start: string;
      end: string;
    };
    domingo: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export async function createProfessional(data: Omit<Professional, 'createdAt' | 'updatedAt'>) {
  try {
    const now = Timestamp.now();
    const professionalData: Professional = {
      ...data,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'professionals'), professionalData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar profissional:', error);
    throw error;
  }
}

export async function getProfessionalByUserId(userId: string) {
  try {
    const q = query(collection(db, 'professionals'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Professional & { id: string };
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    throw error;
  }
}
