import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

import { hasSupabaseEnv, getSupabaseClient } from './supabaseClient'

export type SignUpThrownError = Error & {
  status?: number | string
  code?: string
}

function isWebviewNetworkFailure(err: unknown): boolean {
  const anyE = err as any
  const status = anyE?.status ?? anyE?.statusCode
  if (status === 0 || status === '0') return true
  const msg = String(anyE?.message ?? anyE?.error_description ?? '').toLowerCase()
  return (
    msg.includes('load failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('fetch failed') ||
    msg.includes('network request failed') ||
    msg.includes('networkerror') ||
    msg.includes('typeerror: failed to fetch')
  )
}

function webviewNetworkUserMessage(): string {
  return 'Не удалось подключиться к серверу регистрации. Проверьте интернет или откройте сайт в другом браузере.'
}

function logSupabaseNetworkError(error: unknown) {
  const anyE = error as any
  console.error('SUPABASE NETWORK ERROR', {
    message: anyE?.message,
    status: anyE?.status ?? anyE?.statusCode,
    code: anyE?.code,
    supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL,
    hasAnonKey: Boolean((import.meta as any).env?.VITE_SUPABASE_ANON_KEY),
  })
}

/** Reads display name from Supabase Auth `user_metadata` (signup / dashboard). */
export function getAuthDisplayName(user: User | null | undefined): string | null {
  if (!user?.user_metadata || typeof user.user_metadata !== 'object') return null
  const m = user.user_metadata as Record<string, unknown>
  for (const key of ['full_name', 'display_name', 'name'] as const) {
    const v = m[key]
    if (typeof v === 'string') {
      const t = v.trim()
      if (t) return t
    }
  }
  return null
}

/** Today hero: «Привет, {имя}» or «Привет». */
export function getHomeGreetingTitle(user: User | null | undefined): string {
  const name = getAuthDisplayName(user ?? null)
  return name ? `Привет, ${name}` : 'Привет'
}

export type AuthSnapshot = {
  mode: 'demo' | 'auth'
  user: User | null
  session: Session | null
}

function snapFromSession(session: Session | null | undefined): AuthSnapshot {
  const s = session ?? null
  const u = s?.user ?? null
  return { mode: u ? 'auth' : 'demo', user: u, session: s }
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
  if (!hasSupabaseEnv()) {
    throw new Error('Supabase ENV missing')
  }
  try {
    const sb = getSupabaseClient()
    const { data, error } = await sb.auth.signInWithPassword({
      email: args.email,
      password: args.password,
    })
    if (error) {
      if (isWebviewNetworkFailure(error)) {
        logSupabaseNetworkError(error)
        const wrapped = Object.assign(new Error(webviewNetworkUserMessage()), {
          status: 0,
          code: 'network_webview',
        }) as SignUpThrownError
        throw wrapped
      }
      throw error
    }
    console.log('AUTH SESSION AFTER LOGIN', data.session)
    return snapFromSession(data.session)
  } catch (error: unknown) {
    if (isWebviewNetworkFailure(error)) {
      logSupabaseNetworkError(error)
      const wrapped = Object.assign(new Error(webviewNetworkUserMessage()), {
        status: 0,
        code: 'network_webview',
      }) as SignUpThrownError
      throw wrapped
    }
    const anyE = error as any
    const msg =
      (typeof anyE?.message === 'string' && anyE.message.trim()) ||
      (typeof anyE?.error_description === 'string' && anyE.error_description.trim()) ||
      'Не удалось войти'
    const status = anyE?.status ?? anyE?.statusCode
    const code = anyE?.code != null ? String(anyE.code) : undefined
    const wrapped = Object.assign(new Error(msg), { status, code }) as SignUpThrownError
    throw wrapped
  }
}

export async function signUpWithEmail(args: {
  email: string
  password: string
  /** Saved as `user_metadata.full_name` and `user_metadata.display_name` when non-empty. */
  displayName?: string
}): Promise<AuthSnapshot> {
  if (!hasSupabaseEnv()) {
    throw new Error('Supabase ENV missing')
  }
  const email = (args.email ?? '').trim()
  const password = args.password ?? ''
  const displayName = (args.displayName ?? '').trim()

  // Guardrails: Supabase returns 422 on invalid payloads; fail early with a readable message.
  if (!email) throw new Error('Введите email')
  if (!email.includes('@')) throw new Error('Введите корректный email')
  if (!password) throw new Error('Введите пароль')
  if (password.length < 6) throw new Error('Пароль должен быть не короче 6 символов')

  console.log('SIGNUP PAYLOAD', {
    email,
    passwordLength: password?.length,
    displayNameLength: displayName.length,
  })

  try {
    const sb = getSupabaseClient()
    const { data, error } = await sb.auth.signUp(
      displayName
        ? {
            email,
            password,
            options: {
              data: {
                full_name: displayName,
                display_name: displayName,
              },
            },
          }
        : { email, password },
    )
    if (error) throw error
    console.log('AUTH SESSION AFTER SIGNUP', data.session)
    return snapFromSession(data.session)
  } catch (error: unknown) {
    console.error('SIGNUP FULL ERROR', JSON.stringify(error, null, 2))
    console.error('SIGNUP RAW ERROR', error)

    if (isWebviewNetworkFailure(error)) {
      logSupabaseNetworkError(error)
      const wrapped = Object.assign(new Error(webviewNetworkUserMessage()), {
        status: 0,
        code: 'network_webview',
      }) as SignUpThrownError
      throw wrapped
    }

    const anyE = error as any
    const msg =
      (typeof anyE?.message === 'string' && anyE.message.trim()) ||
      (typeof anyE?.error_description === 'string' && anyE.error_description.trim()) ||
      'Не удалось создать аккаунт'
    const status = anyE?.status ?? anyE?.statusCode
    const code = anyE?.code != null ? String(anyE.code) : undefined

    const wrapped = Object.assign(new Error(msg), {
      status,
      code,
    }) as SignUpThrownError
    throw wrapped
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
    return snapFromSession(data.session)
  } catch {
    return { mode: 'demo', user: null, session: null }
  }
}

