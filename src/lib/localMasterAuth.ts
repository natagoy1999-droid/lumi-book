import type { User } from '@supabase/supabase-js'

export const LOCAL_MASTER_AUTH_KEY = 'lumi_master_local_auth'
export const LOCAL_MASTER_NAME_KEY = 'lumi_master_name'

export function isLocalMasterAuthed(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(LOCAL_MASTER_AUTH_KEY) === 'true'
  } catch {
    return false
  }
}

export function getLocalMasterName(): string {
  try {
    const n = localStorage.getItem(LOCAL_MASTER_NAME_KEY)?.trim()
    return n || 'Мастер'
  } catch {
    return 'Мастер'
  }
}

export function clearLocalMasterAuth(): void {
  try {
    localStorage.removeItem(LOCAL_MASTER_AUTH_KEY)
    localStorage.removeItem(LOCAL_MASTER_NAME_KEY)
  } catch {
    /* ignore */
  }
}

export function persistLocalMasterAuth(displayName: string): void {
  const name = displayName.trim() || 'Мастер'
  localStorage.setItem(LOCAL_MASTER_AUTH_KEY, 'true')
  localStorage.setItem(LOCAL_MASTER_NAME_KEY, name)
}

/** Minimal User shape for greeting / Settings; not a real Supabase JWT user. */
export function buildLocalMasterUser(email: string | undefined, name: string): User {
  const displayName = name.trim() || 'Мастер'
  const em = email?.trim() || 'local@lumi.book'
  // We only use a small subset of User fields in UI.
  // Cast through unknown to avoid TS structural mismatch with Supabase's full User shape.
  return ({
    id: 'local-master',
    email: em,
    user_metadata: {
      full_name: displayName,
      display_name: displayName,
    },
  } as unknown) as User
}

export function localMasterSnapshot(
  email: string | undefined,
  name: string,
): { mode: 'auth'; user: User; session: null } {
  persistLocalMasterAuth(name)
  const user = buildLocalMasterUser(email, name)
  return { mode: 'auth', user, session: null }
}

/** True when Supabase auth failed due to webview / network (show local fallback UI). */
export function isSupabaseNetworkFallbackError(err: unknown): boolean {
  const anyE = err as any
  const status = anyE?.status ?? anyE?.statusCode
  if (status === 0 || status === '0') return true
  const code = String(anyE?.code || '')
  if (code === 'network_webview') return true
  const msg = String(anyE?.message ?? '').toLowerCase()
  return (
    msg.includes('load failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('fetch failed') ||
    msg.includes('network request failed')
  )
}
