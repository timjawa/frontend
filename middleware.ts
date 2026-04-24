import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/data-banjir', '/pengguna', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Protect all /admin routes
  // if (pathname.startsWith('/admin')) {
  //   if (!token) {
  //     // Redirect to /login (clean URL)
  //     return NextResponse.redirect(new URL('/login', request.url));
  //   }
  // }

  // Redirect to dashboard if trying to access login while already logged in
  if (pathname.startsWith('/login') && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
