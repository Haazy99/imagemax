# ImageMax - Technical Architecture

## 1. System Overview

### 1.1 Architecture Components
- Frontend Application (Next.js)
- Backend API (Next.js API Routes)
- Authentication (Supabase Auth)
- Database (Supabase PostgreSQL)
- Storage (Supabase Storage)
- Edge Functions (Supabase Edge Functions)
- Image Processing Service (Background Remover API)
- Payment Processing (Paystack)

### 1.2 Technology Stack
- Frontend: Next.js 14 with App Router
- UI Components: Shadcn/ui
- Styling: Tailwind CSS
- State Management: Zustand
- Database & Auth: Supabase
- Storage: Supabase Storage
- Image Processing: Background Remover API
- Payment: Paystack
- Hosting: Vercel
- CI/CD: Vercel Git Integration

## 2. Frontend Architecture

### 2.1 Application Structure
```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── tools/
│       ├── background-removal/
│       ├── upscaling/
│       └── object-removal/
├── api/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   └── Card.tsx
│   └── tools/
│       ├── ImageUploader.tsx
│       ├── ToolControls.tsx
│       └── Preview.tsx
└── lib/
    ├── supabase/
    ├── utils/
    └── hooks/
```

### 2.2 Key Technologies
- **Next.js App Router**: For routing and server components
- **Shadcn/ui**: For consistent UI components
- **Tailwind CSS**: For styling and responsive design
- **Zustand**: For state management
- **Supabase Client**: For real-time updates and auth
- **React Query**: For data fetching and caching

### 2.3 Authentication Flow
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  // Handle dashboard access
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      // Redirect to dashboard with auth dialog
      return NextResponse.redirect(new URL('/dashboard?auth=required', req.url))
    }
  }
  
  return res
}

// Dashboard layout with auth dialog
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const showAuthDialog = searchParams.get('auth') === 'required'
  
  return (
    <div className="relative">
      {showAuthDialog && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50">
          <AuthDialog />
        </div>
      )}
      <div className="flex">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
```

### 2.4 Dashboard Components
```typescript
// components/layout/Sidebar.tsx
export function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r">
      <nav>
        <ToolCategory title="Basic Tools">
          <ToolItem icon="image" name="Background Removal" />
          <ToolItem icon="zoom" name="Upscale" />
        </ToolCategory>
        <ToolCategory title="Advanced Tools">
          <ToolItem icon="eraser" name="Object Removal" />
          <ToolItem icon="wand" name="Smart Edit" />
        </ToolCategory>
      </nav>
    </aside>
  )
}

// components/tools/ToolInterface.tsx
export function ToolInterface() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-4">
        <ImageUploader />
        <ToolControls />
      </div>
      <Preview />
    </div>
  )
}
```

### 2.5 State Management
```typescript
// store/toolStore.ts
interface ToolState {
  selectedTool: string | null
  currentImage: File | null
  processingStatus: 'idle' | 'processing' | 'complete' | 'error'
  toolSettings: Record<string, any>
}

export const useToolStore = create<ToolState>((set) => ({
  selectedTool: null,
  currentImage: null,
  processingStatus: 'idle',
  toolSettings: {},
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setCurrentImage: (image) => set({ currentImage: image }),
  setProcessingStatus: (status) => set({ processingStatus: status }),
  updateToolSettings: (settings) => 
    set((state) => ({ 
      toolSettings: { ...state.toolSettings, ...settings } 
    }))
}))
```

## 3. Backend Architecture

### 3.1 API Structure
```
app/
├── api/
│   ├── auth/
│   │   └── route.ts
│   ├── images/
│   │   └── route.ts
│   ├── projects/
│   │   └── route.ts
│   └── webhooks/
│       └── paystack/
│           └── route.ts
└── edge/
    └── image-processing/
        └── route.ts
```

### 3.2 API Design
- Next.js API Routes
- Edge Functions
- RESTful endpoints
- Rate limiting
- Request validation

### 3.3 Security Measures
- Supabase Auth
- JWT tokens
- API key management
- Rate limiting
- Input validation

## 4. Database Design

### 4.1 Supabase Schema
```sql
-- Users (managed by Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Projects
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Images
create table public.images (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id),
  original_url text not null,
  processed_url text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 4.2 Database Features
- Row Level Security (RLS)
- Real-time subscriptions
- Database backups
- Automatic migrations

## 5. Storage Architecture

### 5.1 Supabase Storage
- User uploads bucket
- Processed images bucket
- Public assets bucket
- Access control policies

### 5.2 File Management
- Direct upload to Supabase
- Image optimization
- CDN integration
- Access control

## 6. Image Processing

### 6.1 Processing Pipeline
1. Image upload to Supabase Storage
2. Background Remover API processing
3. Result storage
4. CDN delivery

### 6.2 Processing Features
- Background removal
- Image optimization
- Format conversion
- Quality control

## 7. Payment Integration

### 7.1 Paystack Integration
- Payment initialization
- Webhook handling
- Subscription management
- Transaction tracking

### 7.2 Subscription Features
- Plan management
- Usage tracking
- Billing history
- Payment notifications

## 8. Deployment Architecture

### 8.1 Vercel Deployment
- Automatic deployments
- Preview deployments
- Edge functions
- Analytics

### 8.2 Environment Management
- Development
- Preview
- Production
- Testing

## 9. Monitoring & Logging

### 9.1 Application Monitoring
- Vercel Analytics
- Error tracking
- Performance metrics
- User analytics

### 9.2 Infrastructure Monitoring
- Supabase Dashboard
- Vercel Dashboard
- Error tracking
- Performance monitoring

## 10. Security Architecture

### 10.1 Authentication
- Supabase Auth
- JWT tokens
- OAuth providers
- Session management

### 10.2 Data Protection
- Row Level Security
- Storage policies
- API security
- Input validation

## 11. Performance Optimization

### 11.1 Frontend
- Next.js App Router
- Server Components
- Edge Runtime
- Image optimization
- PWA support

### 11.2 Backend
- Edge Functions
- Caching
- Database optimization
- Query performance

## 12. Development Workflow

### 12.1 Version Control
- Git workflow
- Branch strategy
- Code review
- CI/CD pipeline

### 12.2 Development Tools
- TypeScript
- ESLint
- Prettier
- Husky
- Commitlint 