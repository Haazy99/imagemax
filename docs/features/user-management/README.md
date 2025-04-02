# User Management

## Overview
The User Management system in ImageMax handles user authentication, profile management, and user-related operations. This directory contains detailed documentation for each component of the user management system.

## Features

### 1. Authentication
- [Authentication Implementation](./authentication.md)
  - Email/Password authentication
  - Google Sign-In
  - Session management
  - Security considerations

### 2. User Profile (Coming Soon)
- Profile information management
- Avatar/profile picture handling
- User preferences
- Account settings

### 3. User Data Management (Coming Soon)
- Data privacy settings
- Data export
- Account deletion
- Usage statistics

### 4. Subscription Management (Coming Soon)
- Plan selection
- Billing information
- Usage limits
- Payment history

## Database Schema

### Users Table
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  preferences jsonb default '{}'::jsonb,
  subscription_tier text default 'free',
  subscription_status text default 'active'
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
```

### Function Triggers
```sql
-- Automatically create profile on user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at timestamp
create function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
```

## Implementation Status

### Completed
- [ ] Basic project structure
- [ ] Authentication documentation
- [ ] Database schema design

### In Progress
- [ ] Authentication implementation
- [ ] User profile schema
- [ ] Security policies

### Upcoming
- [ ] Profile management
- [ ] Subscription integration
- [ ] User data management
- [ ] Admin dashboard

## Getting Started
1. Review the [Authentication Implementation](./authentication.md) document
2. Set up Supabase project and configure environment variables
3. Implement authentication context and protected routes
4. Create necessary database tables and policies
5. Implement user interface components

## Contributing
When adding new features or modifying existing ones:
1. Update relevant documentation
2. Follow the established patterns
3. Add appropriate tests
4. Update this README if necessary 