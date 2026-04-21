import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('admin_token');
  const { pathname } = request.nextUrl;

  // Protect dashboard routes (e.g., /users, /, /admin)
  // For this project, let's protect /users and the root / if it's the dashboard
  const protectedRoutes = ['/users', '/'];
  
  // If accessing a protected route without a token, redirect to login
  if (protectedRoutes.some(route => pathname === route || pathname.startsWith('/users'))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If already logged in and trying to access /login, redirect to /users
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/users', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
