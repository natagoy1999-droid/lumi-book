import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTE_APP_TODAY } from '../lib/appRoutes'
import { signUpWithEmail } from '../lib/auth'
import { hasSupabaseEnv } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'

export function Signup() {
  const nav = useNavigate()
  const mode = useAuthStore((s) => s.mode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'auth') nav(ROUTE_APP_TODAY, { replace: true })
  }, [mode, nav])

  return (
    <div className="px-5" style={{ paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))' }}>
      <div className="mx-auto max-w-[520px]">
        <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">Аккаунт</div>
        <div className="mt-1 text-[32px] font-semibold tracking-tightish text-ink-950">Создать аккаунт</div>
        <div className="mt-2 text-[12px] leading-5 text-ink-700/65">
          Начните спокойно — аккаунт отделяет ваши данные в облаке от учебного режима на устройстве.
        </div>

        <div className="mt-4 space-y-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            placeholder="Email"
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
            type="button"
            disabled={busy || !hasSupabaseEnv()}
            onClick={async () => {
              setBusy(true)
              setError(null)
              try {
                const snap = await signUpWithEmail({ email: email.trim(), password })
                if (snap.mode !== 'auth') {
                  setError('Не удалось создать аккаунт. Попробуйте другой email или пароль.')
                } else {
                  nav(ROUTE_APP_TODAY, { replace: true })
                }
              } finally {
                setBusy(false)
              }
            }}
            className="w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold disabled:opacity-70"
          >
            Создать аккаунт
          </button>

          {!hasSupabaseEnv() ? (
            <div className="text-[12px] leading-5 text-ink-700/60">
              Облако не подключено — регистрация временно недоступна. Можно продолжить в демо-режиме.
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => nav('/auth')}
            className="w-full lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  )
}

