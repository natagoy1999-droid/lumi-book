import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'

import { onAuthStateChange, restoreSession } from '../lib/auth'
import { hasSupabaseEnv } from '../lib/supabaseClient'

type AuthState = {
  mode: 'demo' | 'auth'
  initializing: boolean
  user: User | null
  session: Session | null
  setSnapshot: (snap: { mode: 'demo' | 'auth'; user: User | null; session: Session | null }) => void
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  mode: 'demo',
  initializing: true,
  user: null,
  session: null,

  setSnapshot: (snap) =>
    set(() => {
      console.log('AUTH STORE MODE', snap.mode)
      return { ...snap }
    }),

  bootstrap: async () => {
    set({ initializing: true })
    try {
      const snap = await restoreSession()
      set({ ...snap, initializing: false })
    } catch (e) {
      console.error('[auth] bootstrap restoreSession failed', e)
      set({ mode: 'demo', user: null, session: null, initializing: false })
    }

    // Listen only if Supabase is configured.
    if (!hasSupabaseEnv()) return
    try {
      const unsub = onAuthStateChange((_event, session) => {
        const mode = session?.user ? 'auth' : 'demo'
        console.log('AUTH STORE MODE', mode)
        set({ mode, user: session?.user ?? null, session: session ?? null })
      })

      // Ensure unsubscribe on hot reload scenarios.
      ;(window as any).__lumi_auth_unsub?.()
      ;(window as any).__lumi_auth_unsub = unsub
    } catch (e) {
      console.error('[auth] onAuthStateChange failed', e)
    }
  },
}))

