import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/']
const PROTECTED_PREFIXES = ['/home', '/search', '/doctors', '/booking', '/appointments', '/profile']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value
    || request.headers.get('authorization')?.replace('Bearer ', '')

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isPublic = PUBLIC_PATHS.includes(pathname)

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons).*)'],
}
