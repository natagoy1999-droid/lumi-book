import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { ROUTE_APP_TODAY } from '../lib/appRoutes'
import { localMasterSnapshot } from '../lib/localMasterAuth'
import { useAuthStore } from '../store/authStore'
import { useStore } from '../state/store'

export function AuthEntry() {
  const nav = useNavigate()
  const { dispatch } = useStore()
  const mode = useAuthStore((s) => s.mode)
  const [localEntryName, setLocalEntryName] = useState('')

  useEffect(() => {
    if (mode === 'auth') nav(ROUTE_APP_TODAY, { replace: true })
  }, [mode, nav])

  return (
    <div className="px-5" style={{ paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))' }}>
      <div className="mx-auto max-w-[520px]">
        <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">Добро пожаловать</div>
        <div className="mt-1 text-[32px] font-semibold tracking-tightish text-ink-950">Вход</div>
        <div className="mt-2 text-[12px] leading-5 text-ink-700/65">
          Можно продолжить в демо-режиме или подключить аккаунт — без лишнего шума.
        </div>

        <div className="mt-4 space-y-3">
          <GlassCard className="p-5">
            <button
              type="button"
              onClick={() => {
                console.log('AUTH BUTTON TOUCH/CLICK')
                dispatch({ type: 'finishOnboarding' })
                nav(ROUTE_APP_TODAY, { replace: true })
              }}
              onTouchStart={() => console.log('AUTH BUTTON TOUCH/CLICK')}
              className="w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold"
            >
              Продолжить в демо-режиме
            </button>
            <div className="mt-2 text-[12px] leading-5 text-ink-700/60">
              Локальный режим. Можно создать аккаунт позже.
            </div>
          </GlassCard>

          <button
            type="button"
            onClick={() => {
              console.log('AUTH BUTTON TOUCH/CLICK')
              nav('/login')
            }}
            onTouchStart={() => console.log('AUTH BUTTON TOUCH/CLICK')}
            className="w-full lumi-card bg-white/60 px-5 py-4 text-[15px] font-semibold text-ink-950"
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('AUTH BUTTON TOUCH/CLICK')
              nav('/signup')
            }}
            onTouchStart={() => console.log('AUTH BUTTON TOUCH/CLICK')}
            className="w-full lumi-card px-5 py-4 text-[15px] font-semibold text-ink-950"
          >
            Создать аккаунт
          </button>

          <GlassCard className="p-5">
            <input
              value={localEntryName}
              onChange={(e) => setLocalEntryName(e.target.value)}
              placeholder="Имя мастера"
              autoComplete="name"
              className="mb-3 w-full lumi-card bg-white/60 px-4 py-3 text-[15px] text-ink-950 outline-none placeholder:text-ink-700/35"
              style={{ touchAction: 'manipulation' }}
            />
            <button
              type="button"
              onClick={() => {
                console.log('AUTH BUTTON TOUCH/CLICK')
                const snap = localMasterSnapshot(undefined, localEntryName.trim() || 'Мастер')
                useAuthStore.getState().setSnapshot(snap)
                nav(ROUTE_APP_TODAY, { replace: true })
              }}
              onTouchStart={() => console.log('AUTH BUTTON TOUCH/CLICK')}
              className="w-full touch-manipulation lumi-card px-5 py-4 text-[15px] font-semibold text-ink-950"
            >
              Войти в локальный режим
            </button>
            <div className="mt-2 text-[12px] leading-5 text-ink-700/60">
              Если облачный вход недоступен в этом браузере — можно продолжить офлайн на этом устройстве.
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

