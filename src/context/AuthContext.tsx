'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatIdentifier, checkIdentifierExists } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { getProfessionalByUserId } from '@/services/professional';
import { getClientByUserId } from '@/services/client';

// Verifica se estamos no ambiente do navegador
const isBrowser = typeof window !== 'undefined';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  authInitialized: boolean;
  signInWithGoogle: (rememberMe?: boolean) => Promise<FirebaseUser | null>;
  signOut: () => Promise<void>;
  createUser: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<SignInResult>;
  checkUserProfile: (userId: string, type: 'professional' | 'client') => Promise<boolean>;
  formatIdentifier: (identifier: string, loginType: string, userType: string) => string;
  checkIdentifierExists: (identifier: string, loginType: string, userType: string) => Promise<boolean>;
}

interface SignInResult {
  user: FirebaseUser;
  success: boolean;
  profileComplete: boolean;
  error?: string;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  authInitialized: false,
  signInWithGoogle: async () => {
    throw new Error('AuthContext não foi inicializado');
  },
  signOut: async () => {
    throw new Error('AuthContext não foi inicializado');
  },
  createUser: async () => {
    throw new Error('AuthContext não foi inicializado');
  },
  signIn: async () => {
    throw new Error('AuthContext não foi inicializado');
  },
  checkUserProfile: async () => {
    throw new Error('AuthContext não foi inicializado');
  },
  formatIdentifier: () => {
    throw new Error('AuthContext não foi inicializado');
  },
  checkIdentifierExists: async () => {
    throw new Error('AuthContext não foi inicializado');
  }
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const router = useRouter();
  const googleProvider = new GoogleAuthProvider();

  // Prefetch important routes
  useEffect(() => {
    router.prefetch('/login');
    router.prefetch('/cadastro/professional');
    router.prefetch('/cadastro/cliente');
    router.prefetch('/dashboard/professional');
    router.prefetch('/dashboard/client');
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);
      
      if (user) {
        // Verifica se o usuário tem cadastro completo
        try {
          const isProfessional = await getProfessionalByUserId(user.uid);
          const isClient = await getClientByUserId(user.uid);
          
          if (isProfessional) {
            setCookie('userType', 'professional');
            setCookie('registrationComplete', 'true');
          } else if (isClient) {
            setCookie('userType', 'client');
            setCookie('registrationComplete', 'true');
          } else {
            // Se não tem cadastro completo, remove o cookie de registrationComplete
            deleteCookie('registrationComplete');
          }
          
          // Salva o token
          const token = await user.getIdToken();
          setCookie('authToken', token);
        } catch (error) {
          console.error('Erro ao verificar cadastro:', error);
          deleteCookie('registrationComplete');
        }
      } else {
        // Limpa todos os cookies quando o usuário faz logout
        deleteCookie('authToken');
        deleteCookie('userType');
        deleteCookie('registrationComplete');
      }
      
      setLoading(false);
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (rememberMe: boolean = false): Promise<FirebaseUser> => {
    try {
      // Configura o provider do Google
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      // Tenta fazer o login com popup
      console.log('Iniciando login com Google...');
      const result = await signInWithPopup(auth, googleProvider).catch((error) => {
        console.error('Erro no popup:', error);
        if (error.code === 'auth/popup-blocked') {
          throw new Error('O popup foi bloqueado. Por favor, permita popups para este site.');
        }
        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('O processo de login foi cancelado.');
        }
        throw error;
      });

      if (!result) {
        throw new Error('Não foi possível conectar com o Google.');
      }

      // Pega o tipo de usuário do cookie
      const userType = getCookie('userType');
      if (!userType) {
        throw new Error('Tipo de usuário não definido');
      }

      console.log('Login Google bem sucedido:', result.user.email);
      
      // Formata o email com o prefixo correto
      const [localPart, domain] = result.user.email?.split('@') || [];
      const formattedEmail = `${userType}.${localPart}@${domain}`;

      // Salva o token
      const token = await result.user.getIdToken();
      setCookie('authToken', token);

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Salva os dados de registro
      const registrationData = {
        loginType: 'google',
        identifier: result.user.email,
        email: formattedEmail,
        uid: result.user.uid,
        userType: userType,
        displayName: result.user.displayName || null,
        photoURL: result.user.photoURL || null,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('registrationData', JSON.stringify(registrationData));
      console.log('Dados de registro salvos:', registrationData);

      await new Promise(resolve => setTimeout(resolve, 1500));

      return result.user;
    } catch (error: any) {
      console.error('Erro detalhado no login com Google:', error);
      // Converte o erro para uma mensagem mais amigável
      const errorMessage = error.message || 'Erro ao conectar com Google';
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    await auth.signOut();
      setUser(null);
    deleteCookie('authToken');
    deleteCookie('userType');
    deleteCookie('registrationComplete');
  };

  const createUser = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false): Promise<SignInResult> => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      const userType = getCookie('userType');
      if (!userType) {
        throw new Error('Tipo de usuário não definido');
      }
      
      // Verifica se tem cadastro completo
      const isProfessional = await getProfessionalByUserId(result.user.uid);
      const isClient = await getClientByUserId(result.user.uid);
      
      const profileComplete = Boolean(
        (userType === 'professional' && isProfessional) || 
        (userType === 'client' && isClient)
      );
      
      if (profileComplete) {
        setCookie('registrationComplete', 'true');
      } else {
        deleteCookie('registrationComplete');
      }
      
      const token = await result.user.getIdToken();
      setCookie('authToken', token);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Login bem sucedido:', result.user.email);
      return {
        user: result.user,
        success: true,
        profileComplete
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        user: null as any,
        success: false,
        profileComplete: false,
        error: 'Email ou senha inválidos'
      };
    } finally {
      setLoading(false);
    }
  };

  const checkUserProfile = async (userId: string, type: 'professional' | 'client') => {
    try {
      // Criar referência do documento uma única vez
      const userRef = doc(db, type, userId);
      
      // Usar cache do Firestore
      const userDoc = await getDoc(userRef);
      return userDoc.exists();
    } catch (error) {
      console.error('Erro ao verificar perfil:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    authInitialized,
    signInWithGoogle,
    signOut,
    createUser,
    signIn,
    checkUserProfile,
    formatIdentifier,
    checkIdentifierExists
  };

  // Loading progressivo com feedback visual
  if (!authInitialized) {
  return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
