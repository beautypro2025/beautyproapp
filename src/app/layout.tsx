import type { Metadata } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import './globals.css';
import { ClientLayout } from './ClientLayout';
import { Toaster } from 'react-hot-toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'BeautyPro',
  description: 'Transforme seu talento em um negócio de sucesso com o BeautyPro'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col m-0 p-0 overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
        <Toaster
          position="top-right"
          toastOptions={{ duration: 3000 }}
          containerStyle={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
        />
      </body>
    </html>
  );
}