import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

// Função para formatar o identificador baseado no tipo
export const formatIdentifier = (identifier: string, loginType: string, userType: string) => {
  // Limpa o identificador removendo caracteres não numéricos para CPF e CNPJ
  const cleanIdentifier = identifier.replace(/[^\d]/g, '');
  
  if (loginType === 'email') {
    return userType === 'professional' ? `professional.${identifier}` : `client.${identifier}`;
  } else if (loginType === 'cpf') {
    return `${userType}.cpf.${cleanIdentifier}@beautypro.com`;
  } else if (loginType === 'cnpj') {
    return `${userType}.cnpj.${cleanIdentifier}@beautypro.com`;
  }
  return identifier;
};

// Função para verificar se o identificador já existe
export const checkIdentifierExists = async (
  identifier: string,
  loginType: string,
  userType: string
) => {
  try {
    const formattedEmail = formatIdentifier(identifier, loginType, userType);
    
    // Verifica no Firebase Authentication
    const methods = await fetchSignInMethodsForEmail(auth, formattedEmail);
    if (methods.length > 0) {
      return true;
    }

    // Verifica na coleção de profissionais
    if (userType === 'professional') {
      const professionalRef = collection(db, 'professionals');
      let professionalQuery;

      if (loginType === 'email') {
        professionalQuery = query(professionalRef, where('email', '==', formattedEmail));
      } else if (loginType === 'cpf') {
        professionalQuery = query(professionalRef, where('cpf', '==', identifier.replace(/[^\d]/g, '')));
      } else if (loginType === 'cnpj') {
        professionalQuery = query(professionalRef, where('cnpj', '==', identifier.replace(/[^\d]/g, '')));
      }

      if (professionalQuery) {
        const snapshot = await getDocs(professionalQuery);
        if (!snapshot.empty) {
          return true;
        }
      }
    }

    // Verifica na coleção de clientes
    if (userType === 'client') {
      const clientRef = collection(db, 'clients');
      let clientQuery;

      if (loginType === 'email') {
        clientQuery = query(clientRef, where('email', '==', formattedEmail));
      } else if (loginType === 'cpf') {
        clientQuery = query(clientRef, where('cpf', '==', identifier.replace(/[^\d]/g, '')));
      }

      if (clientQuery) {
        const snapshot = await getDocs(clientQuery);
        if (!snapshot.empty) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar identificador:', error);
    throw error;
  }
};

// Função para validar CPF
export const isValidCPF = (cpf: string) => {
  const numbers = cpf.replace(/[^\d]/g, '');
  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;

  return true;
};

// Função para validar CNPJ
export const isValidCNPJ = (cnpj: string) => {
  const numbers = cnpj.replace(/[^\d]/g, '');
  if (numbers.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(numbers)) return false;

  let size = numbers.length - 2;
  let numbers_array = numbers.substring(0, size);
  let digits = numbers.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers_array.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers_array = numbers.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers_array.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

// Função para validar email
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 