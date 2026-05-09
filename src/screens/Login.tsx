import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
    if (mode === 'auth') nav('/today', { replace: true })
  }, [mode, nav])

  return (
    <div className="px-5" style={{ paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))' }}>
      <div className="mx-auto max-w-[520px]">
        <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">Аккаунт</div>
        <div className="mt-1 text-[32px] font-semibold tracking-tightish text-ink-950">Войти</div>
        <div className="mt-2 text-[12px] leading-5 text-ink-700/65">
          Спокойный вход. Без лишних шагов.
        </div>

        <div className="mt-4 space-y-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            placeholder="Email"
            className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[15px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Пароль"
            className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[15px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
          />

          {error ? (
            <div className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[12px] text-ink-700/65 shadow-soft">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            disabled={busy || !hasSupabaseEnv()}
            onClick={async () => {
              setBusy(true)
              setError(null)
              try {
                const snap = await signInWithEmail({ email: email.trim(), password })
                if (snap.mode !== 'auth') setError('Не удалось войти. Проверьте email/пароль.')
                else nav('/today', { replace: true })
              } finally {
                setBusy(false)
              }
            }}
            className="w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold disabled:opacity-70"
          >
            Войти
          </button>

          {!hasSupabaseEnv() ? (
            <div className="text-[12px] leading-5 text-ink-700/60">
              Supabase env не настроен — вход временно недоступен. Можно продолжить как demo.
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => nav('/auth')}
            className="w-full rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  )
}

