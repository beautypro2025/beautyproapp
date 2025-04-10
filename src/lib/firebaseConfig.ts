// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCLuQzKQaJ6wmUp_GXPKOt4tg2yFPVYoE8',
  authDomain: 'beautypro-12aae.firebaseapp.com',
  projectId: 'beautypro-12aae',
  storageBucket: 'beautypro-12aae.firebasestorage.app',
  messagingSenderId: '483425856172',
  appId: '1:483425856172:web:2ee7af0350502333cd0d09',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Exporta as instâncias de auth e firestore
export const auth = getAuth(app)
export const db = getFirestore(app)
