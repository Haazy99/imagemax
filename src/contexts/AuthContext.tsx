'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  error: string | null
  updateProfile: (data: { full_name?: string; location?: string; bio?: string; avatar_url?: string }) => Promise<void>
  updateSettings: (data: {
    email_notifications?: boolean
    theme?: string
    language?: string
    max_upload_size?: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Check active sessions and set up auth state listener
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Error checking user session:', error)
      setError('Failed to check user session')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      success("Successfully signed in", "Welcome back!")
      router.push("/dashboard")
    } catch (error: any) {
      toastError("Sign in failed", error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      success("Account created", "Please check your email to verify your account.")
      router.push("/auth/verify-email")
    } catch (error: any) {
      toastError("Sign up failed", error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      success("Signed out successfully", "Come back soon!")
      router.push("/")
    } catch (error: any) {
      toastError("Sign out failed", error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      toastError("Google sign in failed", error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: { full_name?: string; location?: string; bio?: string; avatar_url?: string }) => {
    try {
      // Start a transaction
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user?.id,
          full_name: data.full_name,
          location: data.location,
          bio: data.bio,
          avatar_url: data.avatar_url,
        })

      if (profileError) throw profileError

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          avatar_url: data.avatar_url,
        },
      })

      if (authError) throw authError

      // Refresh user data
      const { data: { user: updatedUser }, error: refreshError } = await supabase.auth.getUser()
      if (refreshError) throw refreshError
      setUser(updatedUser)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const updateSettings = async (data: {
    email_notifications?: boolean
    theme?: string
    language?: string
    max_upload_size?: string
  }) => {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user?.id,
        ...data,
      })
    if (error) throw error
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
    updateSettings,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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