import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTE_APP_TODAY } from '../lib/appRoutes'
import { signInWithEmail } from '../lib/auth'
import { hasSupabaseEnv } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'

export function Login() {
  const nav = useNavigate()
  const mode = useAuthStore((s) => s.mode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'auth') nav(ROUTE_APP_TODAY, { replace: true })
  }, [mode, nav])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('LOGIN SUBMIT', { email: email.trim(), passwordLength: password?.length })
    setBusy(true)
    setError(null)
    try {
      if (!hasSupabaseEnv()) {
        setError('Supabase ENV missing')
        return
      }
      const cleanEmail = email.trim()
      if (!cleanEmail) {
        setError('Введите email')
        return
      }
      if (!cleanEmail.includes('@')) {
        setError('Введите корректный email')
        return
      }
      if (!password) {
        setError('Введите пароль')
        return
      }
      if (password.length < 6) {
        setError('Пароль должен быть не короче 6 символов')
        return
      }
      const snap = await signInWithEmail({ email: cleanEmail, password })
      if (snap.mode !== 'auth') setError('Не удалось войти. Проверьте email/пароль.')
      else nav(ROUTE_APP_TODAY, { replace: true })
    } catch (error) {
      console.error('LOGIN ERROR', error)
      setError((error as any)?.message || 'Не удалось войти.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-5" style={{ paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))' }}>
      <div className="mx-auto max-w-[520px]">
        <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">Аккаунт</div>
        <div className="mt-1 text-[32px] font-semibold tracking-tightish text-ink-950">Войти</div>
        <div className="mt-2 text-[12px] leading-5 text-ink-700/65">
          Спокойный вход. Без лишних шагов.
        </div>

        <form className="mt-4 space-y-2" onSubmit={handleLogin}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            placeholder="Эл. почта"
            className="w-full lumi-card bg-white/60 px-4 py-3 text-[15px] text-ink-950 outline-none placeholder:text-ink-700/35"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Пароль"
            className="w-full lumi-card bg-white/60 px-4 py-3 text-[15px] text-ink-950 outline-none placeholder:text-ink-700/35"
          />

          {error ? (
            <div className="lumi-card px-4 py-3 text-[12px] text-ink-700/65">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy || !hasSupabaseEnv()}
            onClick={() => console.log('LOGIN CLICKED')}
            className="w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold disabled:opacity-70"
          >
            Войти
          </button>

          {!hasSupabaseEnv() ? (
            <div className="text-[12px] leading-5 text-ink-700/60">
              Облако не подключено — вход временно недоступен. Можно продолжить в демо-режиме.
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => nav('/auth')}
            className="w-full lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
          >
            Назад
          </button>
        </form>
      </div>
    </div>
  )
}

