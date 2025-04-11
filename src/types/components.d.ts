import type { ReactNode } from 'react'

declare module '@/app/ClientLayout' {
  interface ClientLayoutProps {
    children: ReactNode
  }

  const ClientLayout: React.FC<ClientLayoutProps>
  export default ClientLayout
}
