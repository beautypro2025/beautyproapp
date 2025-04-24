'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { WelcomeModal } from '@/components/WelcomeModal';
import { getCookie, deleteCookie } from 'cookies-next';

interface ClientData extends DocumentData {
  name: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
}

export default function ClientDashboard() {
  const { user, signOut, authInitialized } = useAuth();
  const [userData, setUserData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      console.log('Iniciando carregamento de dados do cliente...');
      
      if (!authInitialized) {
        console.log('Aguardando inicialização da autenticação...');
        return;
      }

      if (!user?.uid) {
        console.log('Usuário não autenticado, redirecionando para login...');
        router.replace('/login');
        return;
      }
      
      try {
        console.log('Verificando token...');
        const token = getCookie('authToken');
        const registrationComplete = getCookie('registrationComplete');
        
        if (!token || !registrationComplete) {
          console.log('Token ou registro não encontrado, redirecionando para login...');
          router.replace('/login');
          return;
        }

        console.log('Buscando dados do cliente...');
        const userDoc = await getDoc(doc(db, 'clients', user.uid));
        
        if (!userDoc.exists()) {
          console.log('Dados do cliente não encontrados, redirecionando para cadastro...');
          router.replace('/cadastro/cliente');
          return;
        }

        console.log('Dados do cliente encontrados:', userDoc.data());
        setUserData(userDoc.data() as ClientData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [user, router, authInitialized]);

  const handleLogout = async () => {
    try {
      setIsLoading(true); // Ativa o loading durante o processo de logout
      await signOut();
      // Limpa os cookies de autenticação
      deleteCookie('authToken');
      deleteCookie('registrationComplete');
      // Força uma pequena espera para garantir que tudo foi limpo
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostra loading enquanto a autenticação está sendo inicializada
  if (!authInitialized || isLoading) {
    return <LoadingSpinner />;
  }

  if (!userData) {
    return null;
  }

  return (
    <>
      <WelcomeModal userType="client" />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center">
                <button className="p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none">
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="ml-4 text-xl font-semibold text-gray-900">
                  Dashboard Cliente
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {userData?.name || user?.displayName}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Informações do Perfil
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                  <p className="mt-1 text-sm text-gray-900">{userData.whatsapp}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Cidade</p>
                  <p className="mt-1 text-sm text-gray-900">{userData.city}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className="mt-1 text-sm text-gray-900">{userData.state}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 