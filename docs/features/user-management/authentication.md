# User Authentication Implementation Plan

## Overview
This document outlines the implementation plan for user authentication in ImageMax using Supabase as the authentication provider. The system will support both email/password authentication and Google Sign-In.

## Table of Contents
1. [Authentication Methods](#authentication-methods)
2. [Technical Implementation](#technical-implementation)
3. [User Flow](#user-flow)
4. [Security Considerations](#security-considerations)
5. [Testing Strategy](#testing-strategy)
6. [Implementation Timeline](#implementation-timeline)

## Authentication Methods

### Email/Password Authentication
- Standard email and password registration
- Email verification required
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Password reset functionality via email

### Google Sign-In
- OAuth 2.0 integration with Google
- Required user data from Google:
  - Email address
  - Display name
  - Profile picture (optional)

## Technical Implementation

### 1. Supabase Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. Authentication Context

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and set up auth state listener
    checkUser()
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Error checking user session:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    },
    signInWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    },
    signUp: async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 3. Protected Routes

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes pattern
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

## User Flow

### Registration Flow
1. User visits `/auth/signup`
2. Chooses email/password or Google Sign-In
3. For email/password:
   - Enters email and password
   - Receives verification email
   - Clicks verification link
   - Redirected to onboarding
4. For Google Sign-In:
   - Clicks Google Sign-In button
   - Authorizes application
   - Redirected to onboarding

### Login Flow
1. User visits `/auth/login`
2. Enters credentials or clicks Google Sign-In
3. On success, redirected to dashboard
4. On failure, shown error message

### Password Reset Flow
1. User clicks "Forgot Password"
2. Enters email address
3. Receives reset link
4. Sets new password
5. Redirected to login

## Security Considerations

### 1. Session Management
- JWT tokens stored securely
- Session refresh handling
- Automatic session cleanup

### 2. Rate Limiting
- Login attempts limited
- Password reset requests limited
- API endpoint protection

### 3. Security Headers
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- XSS Protection
- Frame Options

## Testing Strategy

### Unit Tests
- Authentication context functions
- Form validation
- Error handling

### Integration Tests
- Sign-up flow
- Login flow
- Password reset flow
- Google Sign-In flow

### E2E Tests
- Complete user journeys
- Error scenarios
- Session management

## Implementation Timeline

### Week 1: Basic Setup
- [x] Supabase project setup
- [ ] Environment configuration
- [ ] Authentication context implementation

### Week 2: Core Authentication
- [ ] Email/password authentication
- [ ] Google Sign-In integration
- [ ] Protected routes middleware

### Week 3: Additional Features
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session management

### Week 4: Testing & Security
- [ ] Unit tests
- [ ] Integration tests
- [ ] Security headers
- [ ] Rate limiting

## Dependencies
```json
{
  "@supabase/supabase-js": "^2.x.x",
  "@supabase/auth-helpers-nextjs": "^0.8.x",
  "@supabase/auth-ui-react": "^0.4.x",
  "@supabase/auth-ui-shared": "^0.1.x"
}
``` 