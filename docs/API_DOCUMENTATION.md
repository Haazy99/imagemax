# ImageMax - API Documentation

## 1. Authentication

### 1.1 Supabase Auth
```typescript
// Client-side authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure_password'
})

// Server-side authentication
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabase = createServerComponentClient({ cookies })
const { data: { session } } = await supabase.auth.getSession()
```

### 1.2 Protected Routes
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}
```

## 2. User Management

### 2.1 User Profile
```typescript
// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

// Update user profile
const { data, error } = await supabase
  .from('profiles')
  .update({ name: 'New Name' })
  .eq('id', user.id)
```

## 3. Project Management

### 3.1 Create Project
```typescript
// app/api/projects/route.ts
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { name, description } = await req.json()
  
  const { data, error } = await supabase
    .from('projects')
    .insert([
      { 
        user_id: session.user.id,
        name,
        description
      }
    ])
    .select()
    .single()

  return Response.json(data)
}
```

### 3.2 List Projects
```typescript
// app/api/projects/route.ts
export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', session.user.id)

  return Response.json(data)
}
```

## 4. Image Processing

### 4.1 Upload Image
```typescript
// app/api/images/upload/route.ts
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .upload(`${session.user.id}/${file.name}`, file)

  return Response.json(data)
}
```

### 4.2 Background Removal
```typescript
// app/api/processing/remove-background/route.ts
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { image_id, options } = await req.json()
  
  // Get image URL from Supabase
  const { data: image } = await supabase
    .from('images')
    .select('original_url')
    .eq('id', image_id)
    .single()

  // Process with Background Remover API
  const response = await fetch('https://api.backgroundremover.com/v1/remove', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BACKGROUND_REMOVER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: image.original_url,
      ...options
    })
  })

  const result = await response.json()

  // Save processed image
  const { data, error } = await supabase
    .from('images')
    .update({ processed_url: result.processed_url })
    .eq('id', image_id)
    .select()
    .single()

  return Response.json(data)
}
```

## 5. Subscription Management

### 5.1 Initialize Payment
```typescript
// app/api/subscriptions/initialize/route.ts
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { plan_id } = await req.json()
  
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: session.user.email,
      amount: getPlanAmount(plan_id),
      reference: generateReference(),
      metadata: {
        user_id: session.user.id,
        plan_id
      }
    })
  })

  const data = await response.json()
  return Response.json(data)
}
```

### 5.2 Verify Payment
```typescript
// app/api/webhooks/paystack/route.ts
export async function POST(req: Request) {
  const signature = headers().get('x-paystack-signature')
  
  if (!verifyPaystackWebhook(signature)) {
    return new Response('Invalid signature', { status: 400 })
  }

  const event = await req.json()
  
  if (event.event === 'charge.success') {
    const { data: { reference, metadata } } = event
    
    // Update user subscription
    const { error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: metadata.user_id,
          plan_id: metadata.plan_id,
          status: 'active',
          payment_reference: reference
        }
      ])
  }

  return new Response('OK', { status: 200 })
}
```

## 6. Error Handling

### 6.1 Error Format
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Example error response
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": {
      "reason": "Invalid or expired token"
    }
  }
}
```

### 6.2 Common Error Codes
- UNAUTHORIZED: Authentication required
- FORBIDDEN: Insufficient permissions
- NOT_FOUND: Resource not found
- VALIDATION_ERROR: Invalid input data
- PROCESSING_ERROR: Image processing failed
- PAYMENT_ERROR: Payment processing failed

## 7. Rate Limiting

### 7.1 Rate Limit Implementation
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '10 s'),
})

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    })
  }
  
  return NextResponse.next()
}
```

## 8. Real-time Updates

### 8.1 Supabase Realtime
```typescript
// Subscribe to project updates
const subscription = supabase
  .channel('projects')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### 8.2 WebSocket Events
```typescript
// Processing status updates
const channel = supabase.channel('processing_status')
  .on(
    'broadcast',
    { event: 'status' },
    ({ payload }) => {
      console.log('Processing status:', payload)
    }
  )
  .subscribe()
``` 