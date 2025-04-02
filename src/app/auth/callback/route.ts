import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      // Handle Google OAuth data
      if (session.user.app_metadata.provider === 'google') {
        try {
          // First, ensure the user_profiles table exists
          const { error: createTableError } = await supabase.rpc('create_user_profiles_if_not_exists')
          if (createTableError) {
            console.error('Error creating table:', createTableError)
          }

          // Then, update the user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              id: session.user.id,
              full_name: session.user.user_metadata.full_name || session.user.user_metadata.name,
              avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture,
              location: session.user.user_metadata.location || '',
              bio: session.user.user_metadata.bio || '',
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id'
            })

          if (profileError) {
            console.error('Error updating profile:', profileError)
          }

          // Update the user's metadata in auth.users
          const { error: updateUserError } = await supabase.auth.updateUser({
            data: {
              full_name: session.user.user_metadata.full_name || session.user.user_metadata.name,
              avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture,
            }
          })

          if (updateUserError) {
            console.error('Error updating user metadata:', updateUserError)
          }
        } catch (error) {
          console.error('Error in Google OAuth handling:', error)
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/auth-error', requestUrl.origin))
} 