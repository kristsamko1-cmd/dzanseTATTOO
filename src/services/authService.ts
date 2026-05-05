import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AuthUser } from '../types/domain'

async function resolveAuthUser(session: Session | null): Promise<AuthUser | null> {
  const user = session?.user
  if (!user || !user.email) return null

  const { data: artist, error } = await supabase
    .from('artists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error

  return {
    id: user.id,
    email: user.email,
    role: artist ? 'tattooer' : 'client',
    artistId: artist?.id ?? null,
  }
}

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  return resolveAuthUser(data.session)
}

export async function signIn(email: string, password: string): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  return resolveAuthUser(data.session)
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * 🔥 SIGN UP (Tattooer)
 * - vytvorí auth usera
 * - DB trigger automaticky vytvorí artist row
 */
export async function signUpTattooer(input: {
  email: string
  password: string
  name: string
  bio: string
}): Promise<AuthUser | null> {

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        artist_name: input.name.trim(),
        bio: input.bio.trim(),
      },
    },
  })

  if (error) throw error

  // ⚠️ ak máš email confirmation zapnutý:
  // session bude null → to je OK
  if (!data.session) return null

  return resolveAuthUser(data.session)
}

export function onAuthStateChanged(callback: () => void) {
  const { data } = supabase.auth.onAuthStateChange(() => callback())
  return () => data.subscription.unsubscribe()
}