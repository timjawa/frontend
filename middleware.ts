import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const role = request.cookies.get('role')?.value;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Only admin_bmkg and super_admin can access /admin
    if (role !== 'admin_bmkg' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect to appropriate page if trying to access login/register while already logged in
  if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
    if (role === 'admin_bmkg' || role === 'super_admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register'],
};
