import { User as FirebaseUser } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'

export interface User extends FirebaseUser {
  role?: 'admin' | 'user'
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export interface Appointment {
  id: string
  clientId: string
  serviceId: string
  date: Timestamp
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Service {
  id: string
  name: string
  description: string
  duration: number // em minutos
  price: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
