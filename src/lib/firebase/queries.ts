import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const getProfessionalByUserId = async (userId: string) => {
  try {
    const docRef = doc(db, 'professionals', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } : null;
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    return null;
  }
};

export const getClientByUserId = async (userId: string) => {
  try {
    const docRef = doc(db, 'clients', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } : null;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return null;
  }
}; 