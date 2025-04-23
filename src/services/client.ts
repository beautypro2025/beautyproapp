import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface Client {
  userId: string;
  email: string;
  name: string;
  whatsapp: string;
  city: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getClientByUserId(userId: string) {
  try {
    const q = query(collection(db, 'clients'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Client & { id: string };
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    throw error;
  }
} 