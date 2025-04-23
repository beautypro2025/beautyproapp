import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const getClientByUserId = async (userId: string) => {
  try {
    const clientRef = doc(db, 'clients', userId);
    const clientDoc = await getDoc(clientRef);
    return clientDoc.exists() ? clientDoc.data() : null;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return null;
  }
};

export const createClient = async (userId: string, data: any) => {
  try {
    const clientRef = doc(db, 'clients', userId);
    await setDoc(clientRef, {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active'
    });
    return true;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
}; 