import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Middleware executando para:', request.nextUrl.pathname);
  
  const token = request.cookies.get('authToken')?.value;
  const userType = request.cookies.get('userType')?.value;
  const registrationComplete = request.cookies.get('registrationComplete')?.value;
  
  console.log('Token encontrado:', !!token);
  console.log('Tipo de usuário:', userType);
  console.log('Cadastro completo:', registrationComplete);

  // Se não tem token e tenta acessar rota protegida
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('Sem token, redirecionando para login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se tem token mas não tem cadastro completo
  if (token && !registrationComplete) {
    // Se não está em uma página de cadastro, redireciona para a página apropriada
    if (!request.nextUrl.pathname.includes('/cadastro')) {
      const redirectUrl = userType === 'professional' 
        ? '/cadastro/professional'
        : '/cadastro/cliente';
      console.log(`Redirecionando para completar cadastro: ${redirectUrl}`);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // Se tem token mas tenta acessar rotas públicas
  if (token && registrationComplete && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/cadastro')) {
    console.log('Com token tentando acessar rota pública, redirecionando para dashboard');
    const dashboardUrl = userType === 'professional' 
      ? '/dashboard/professional'
      : '/dashboard/client';
    const response = NextResponse.redirect(new URL(dashboardUrl, request.url));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/cadastro',
    '/cadastro/professional',
    '/cadastro/cliente'
  ]
};
