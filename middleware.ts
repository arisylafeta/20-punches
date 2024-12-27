import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Skip auth check for public routes
  const publicRoutes = ['/', '/login'];
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return;
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - webhook endpoint
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - public routes (/, /login, /signup)
     */
    '/((?!_next/static|_next/image|favicon.ico|pricing/api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/((?!^/$|^/login$|^/signup$).*)'
  ]
};
