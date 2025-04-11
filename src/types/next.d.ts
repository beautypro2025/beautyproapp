import type { ReactNode } from 'react'
import { ClientLayout } from '../app/ClientLayout'

declare module 'next' {
  export interface Metadata {
    title?: string
    description?: string
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}
