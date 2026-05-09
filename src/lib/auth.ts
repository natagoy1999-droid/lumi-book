import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

import { hasSupabaseEnv, getSupabaseClient } from './supabaseClient'

export type AuthSnapshot = {
  mode: 'demo' | 'auth'
  user: User | null
  session: Session | null
}

export async function getCurrentUser(): Promise<User | null> {
  if (!hasSupabaseEnv()) return null
  try {
    const sb = getSupabaseClient()
    const { data, error } = await sb.auth.getUser()
    if (error) return null
    return data.user ?? null
  } catch {
    return null
  }
}

export async function signInAnonymously(): Promise<AuthSnapshot> {
  // Temporary demo-safe mode: anonymous auth if Supabase is available,
  // otherwise remain in demo/local mode.
  if (!hasSupabaseEnv()) return { mode: 'demo', user: null, session: null }
  try {
    const sb = getSupabaseClient()
    const { data, error } = await sb.auth.signInAnonymously()
    if (error) return { mode: 'demo', user: null, session: null }
    return { mode: data.user ? 'auth' : 'demo', user: data.user ?? null, session: data.session ?? null }
  } catch {
    return { mode: 'demo', user: null, session: null }
  }
}

export async function signInWithEmail(args: {
  email: string
  password: string
}): Promise<AuthSnapshot> {
  if (!hasSupabaseEnv()) return { mode: 'demo', user: null, session: null }
  try {
    const sb = getSupabaseClient()
    const { data, error } = await sb.auth.signInWithPassword({
      email: args.email,
      password: args.password,
    })
    if (error) return { mode: 'demo', user: null, session: null }
    return { mode: data.user ? 'auth' : 'demo', user: data.user ?? null, session: data.session ?? null }
  } catch {
    return { mode: 'demo', user: null, session: null }
  }
}

export async function signUpWithEmail(args: {
  email: string
  password: string
}): Promise<AuthSnapshot> {
  if (!hasSupabaseEnv()) return { mode: 'demo', user: null, session: null }
  try {
    const sb = getSupabaseClient()
    const { data, error } = await sb.auth.signUp({
      email: args.email,
      password: args.password,
    })
    if (error) return { mode: 'demo', user: null, session: null }
    return { mode: data.user ? 'auth' : 'demo', user: data.user ?? null, session: data.session ?? null }
  } catch {
    return { mode: 'demo', user: null, session: null }
  }
}

export async function signOut(): Promise<void> {
  if (!hasSupabaseEnv()) return
  try {
    const sb = getSupabaseClient()
    await sb.auth.signOut()
  } catch {
    // ignore
  }
}

export function onAuthStateChange(
  cb: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  if (!hasSupabaseEnv()) return () => {}
  try {
    const sb = getSupabaseClient()
    const { data } = sb.auth.onAuthStateChange((event, session) => cb(event, session))
    return () => data.subscription.unsubscribe()
  } catch {
    return () => {}
  }
}

export async function restoreSession(): Promise<AuthSnapshot> {
  if (!hasSupabaseEnv()) return { mode: 'demo', user: null, session: null }
  try {
    const sb = getSupabaseClient()
    const { data } = await sb.auth.getSession()
    const session = data.session ?? null
    const user = session?.user ?? null
    return { mode: user ? 'auth' : 'demo', user, session }
  } catch {
    return { mode: 'demo', user: null, session: null }
  }
}

