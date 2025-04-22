import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Rate limiting configuration
const RATE_LIMIT = {
  window: 60 * 1000, // 1 minute
  max: 10 // 10 requests per minute
}

const ipRequests = new Map<string, { count: number; resetTime: number }>()

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/features',
    '/pricing',
    '/contact',
    '/blog',
    '/careers',
    '/api',
    '/tools'
  ]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/auth')
  )

  // If user is not signed in and trying to access a protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and trying to access auth pages
  if (session && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Rate limiting
  if (request.method === 'POST') {
    const ip = request.ip ?? 'anonymous'
    const now = Date.now()
    const requestData = ipRequests.get(ip)

    if (requestData) {
      if (now > requestData.resetTime) {
        ipRequests.set(ip, { count: 1, resetTime: now + RATE_LIMIT.window })
      } else if (requestData.count >= RATE_LIMIT.max) {
        return NextResponse.json(
          { error: 'Too many requests', message: 'Please try again later' },
          { status: 429 }
        )
      } else {
        requestData.count++
      }
    } else {
      ipRequests.set(ip, { count: 1, resetTime: now + RATE_LIMIT.window })
    }
  }

  // Only apply to POST requests with file uploads
  if (request.method === 'POST' && request.headers.get('content-type')?.includes('multipart/form-data')) {
    try {
      const contentLength = request.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File too large', message: 'Please upload a file smaller than 10MB' },
          { status: 413 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Failed to process file upload' },
        { status: 400 }
      )
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 