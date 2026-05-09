import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { useAuthStore } from '../store/authStore'
import { useStore } from '../state/store'

export function AuthEntry() {
  const nav = useNavigate()
  const { dispatch } = useStore()
  const mode = useAuthStore((s) => s.mode)

  useEffect(() => {
    if (mode === 'auth') nav('/today', { replace: true })
  }, [mode, nav])

  return (
    <div className="px-5" style={{ paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))' }}>
      <div className="mx-auto max-w-[520px]">
        <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">Добро пожаловать</div>
        <div className="mt-1 text-[32px] font-semibold tracking-tightish text-ink-950">Вход</div>
        <div className="mt-2 text-[12px] leading-5 text-ink-700/65">
          Можно продолжить в demo‑режиме или подключить аккаунт — без лишнего шума.
        </div>

        <div className="mt-4 space-y-3">
          <GlassCard className="p-5">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'finishOnboarding' })
                nav('/today', { replace: true })
              }}
              className="w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold"
            >
              Продолжить как demo
            </button>
            <div className="mt-2 text-[12px] leading-5 text-ink-700/60">
              Локальный режим. Можно создать аккаунт позже.
            </div>
          </GlassCard>

          <button
            type="button"
            onClick={() => nav('/login')}
            className="w-full rounded-3xl border border-white/60 bg-white/60 px-5 py-4 text-[15px] font-semibold text-ink-950 shadow-soft"
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => nav('/signup')}
            className="w-full rounded-3xl border border-white/60 bg-white/55 px-5 py-4 text-[15px] font-semibold text-ink-950 shadow-soft"
          >
            Создать аккаунт
          </button>
        </div>
      </div>
    </div>
  )
}

