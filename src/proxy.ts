import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const adminSessionCookie = process.env.ADMIN_SESSION_COOKIE ?? 'cnc_admin_session';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === '/admin/login') return NextResponse.next();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!request.cookies.has(adminSessionCookie)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
