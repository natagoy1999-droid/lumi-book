import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'

import { onAuthStateChange, restoreSession } from '../lib/auth'
import { buildLocalMasterUser, getLocalMasterName, isLocalMasterAuthed } from '../lib/localMasterAuth'
import { withTimeout } from '../lib/withTimeout'
import { hasSupabaseEnv } from '../lib/supabaseClient'

const RESTORE_SESSION_MS = 4000

type AuthState = {
  mode: 'guest' | 'auth'
  initializing: boolean
  user: User | null
  session: Session | null
  setSnapshot: (snap: { mode: 'guest' | 'auth'; user: User | null; session: Session | null }) => void
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  mode: 'guest',
  initializing: true,
  user: null,
  session: null,

  setSnapshot: (snap) =>
    set(() => {
      console.log('AUTH STORE MODE', snap.mode)
      return { ...snap }
    }),

  bootstrap: async () => {
    console.log('AUTH INIT')
    set({ initializing: true })
    try {
      if (typeof window !== 'undefined' && isLocalMasterAuthed()) {
        const name = getLocalMasterName()
        const user = buildLocalMasterUser(undefined, name)
        console.log('LOCAL AUTH RESTORED')
        set({ mode: 'auth', user, session: null, initializing: false })
      } else {
        const snap = await withTimeout(
          restoreSession(),
          RESTORE_SESSION_MS,
          { mode: 'guest' as const, user: null, session: null },
        )
        if (snap.session?.user) console.log('SUPABASE SESSION RESTORED')
        set({ ...snap, initializing: false })
      }
    } catch (e) {
      console.error('[auth] bootstrap restoreSession failed', e)
      set({ mode: 'guest', user: null, session: null, initializing: false })
    }

    // Listen only if Supabase is configured.
    if (!hasSupabaseEnv()) return
    try {
      const unsub = onAuthStateChange((_event, session) => {
        if (typeof window !== 'undefined' && isLocalMasterAuthed()) {
          const user = buildLocalMasterUser(undefined, getLocalMasterName())
          console.log('AUTH STORE MODE', 'auth')
          set({ mode: 'auth', user, session: null })
          return
        }
        const mode = session?.user ? 'auth' : 'guest'
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

