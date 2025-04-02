# ImageMax - Deployment Guide

## 1. Prerequisites

### 1.1 Required Tools
- Node.js 18+
- Git
- Vercel CLI
- Supabase CLI

### 1.2 Required Accounts
- Vercel Account
- Supabase Account
- Paystack Account
- GitHub Account

## 2. Project Setup

### 2.1 Initialize Project
```bash
# Create Next.js project
npx create-next-app@latest imagemax --typescript --tailwind --app --src-dir

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @shadcn/ui zustand @hookform/resolvers zod
npm install @paystack/inline-js
```

### 2.2 Supabase Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase project
supabase init

# Start Supabase locally
supabase start
```

## 3. Environment Configuration

### 3.1 Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Background Remover API
BACKGROUND_REMOVER_API_KEY=your_api_key
```

### 3.2 Supabase Configuration
```sql
-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.images enable row level security;

-- Create policies
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );
```

## 4. Development Deployment

### 4.1 Local Development
```bash
# Start development server
npm run dev

# Start Supabase locally
supabase start

# Run database migrations
supabase db push
```

### 4.2 Preview Deployment
```bash
# Deploy to Vercel
vercel

# Link to project
vercel link

# Deploy with preview
vercel --preview
```

## 5. Production Deployment

### 5.1 Vercel Deployment
```bash
# Deploy to production
vercel --prod

# Configure environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 5.2 Database Deployment
```bash
# Push schema to production
supabase db push --db-url=your_production_db_url

# Generate types
supabase gen types typescript --local > types/supabase.ts
```

## 6. Storage Configuration

### 6.1 Supabase Storage
```sql
-- Create storage buckets
insert into storage.buckets (id, name)
values ('user-uploads', 'user-uploads'),
       ('processed-images', 'processed-images');

-- Set up storage policies
create policy "Users can upload files"
  on storage.objects for insert
  with check ( bucket_id = 'user-uploads' and auth.uid() = owner );
```

### 6.2 CDN Configuration
- Enable Supabase CDN
- Configure CORS policies
- Set up cache headers

## 7. Authentication Setup

### 7.1 Supabase Auth
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 7.2 Auth Configuration
- Configure OAuth providers
- Set up email templates
- Configure security settings

## 8. Payment Integration

### 8.1 Paystack Setup
```typescript
// lib/paystack.ts
import { Paystack } from '@paystack/inline-js'

export const paystack = new Paystack({
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  secretKey: process.env.PAYSTACK_SECRET_KEY!
})
```

### 8.2 Webhook Configuration
```typescript
// app/api/webhooks/paystack/route.ts
import { headers } from 'next/headers'
import { verifyPaystackWebhook } from '@/lib/paystack'

export async function POST(req: Request) {
  const headersList = headers()
  const signature = headersList.get('x-paystack-signature')
  
  if (!verifyPaystackWebhook(signature)) {
    return new Response('Invalid signature', { status: 400 })
  }
  
  // Handle webhook
}
```

## 9. Monitoring Setup

### 9.1 Vercel Analytics
- Enable Analytics
- Configure Error tracking
- Set up Performance monitoring

### 9.2 Supabase Monitoring
- Enable Database monitoring
- Set up Storage monitoring
- Configure Auth monitoring

## 10. Backup & Recovery

### 10.1 Database Backups
```bash
# Create backup
supabase db dump -f backup.sql

# Restore backup
supabase db restore backup.sql
```

### 10.2 Storage Backups
- Configure automatic backups
- Set up retention policies
- Test recovery procedures

## 11. Performance Optimization

### 11.1 Next.js Optimization
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: true,
  },
}
```

### 11.2 Edge Functions
```typescript
// app/api/edge/image-processing/route.ts
export const runtime = 'edge'

export async function POST(req: Request) {
  // Process image using Background Remover API
}
```

## 12. Maintenance

### 12.1 Regular Updates
- Update dependencies
- Monitor performance
- Review security
- Backup data

### 12.2 Emergency Procedures
- Incident response
- Rollback procedures
- Support escalation
- Communication plan 