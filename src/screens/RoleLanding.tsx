import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { LumiButton } from '../components/ui/LumiButton'
import { ROUTE_APP_TODAY } from '../lib/appRoutes'
import { motion as motionTokens } from '../theme/motion'
import { useStore } from '../state/store'
import { useAuthStore } from '../store/authStore'

/** Root `/` role picker — replaces legacy multi-step onboarding (single source of truth). */
export function RoleLanding() {
  const { dispatch } = useStore()
  const nav = useNavigate()
  const [logoOk, setLogoOk] = useState(true)
  const mode = useAuthStore((s) => s.mode)

  useEffect(() => {
    if (mode === 'auth') {
      dispatch({ type: 'finishOnboarding' })
      nav(ROUTE_APP_TODAY, { replace: true })
    }
  }, [dispatch, mode, nav])

  const goMaster = () => {
    dispatch({ type: 'finishOnboarding' })
    if (mode === 'auth') {
      nav(ROUTE_APP_TODAY, { replace: true })
    } else {
      nav('/auth', { replace: true })
    }
  }

  const goClient = () => {
    dispatch({ type: 'finishOnboarding' })
    nav('/book', { replace: true })
  }

  return (
    <div
      className="min-h-[100svh] min-w-0 overflow-x-hidden"
      data-lumi-screen="role-landing"
    >
      <div
        className="lumi-app-page-wrap mx-auto flex min-h-[100svh] flex-col"
        style={{
          paddingTop: 'calc(var(--safe-top, 0px) + 1.75rem)',
          paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.slow,
            ease: motionTokens.ease.out,
          }}
          className="flex min-w-0 flex-1 flex-col items-center justify-center px-0 pt-2"
        >
          <div className="flex w-full max-w-full justify-center">
            {logoOk ? (
              <img
                src="/lumi-logo-transparent.png"
                alt=""
                className="h-auto max-h-[min(42vh,320px)] w-auto max-w-[min(88vw,280px)] object-contain object-center select-none"
                draggable={false}
                onError={() => setLogoOk(false)}
              />
            ) : (
              <div
                className="flex h-[min(42vh,320px)] w-[min(88vw,280px)] items-center justify-center"
                aria-hidden
              >
                <Sparkles className="text-gold-400/75" size={72} strokeWidth={1.35} />
              </div>
            )}
          </div>

          <p className="mt-8 max-w-[26rem] text-center text-[16px] leading-[1.6] text-ink-900/72">
            Запись для мастеров и клиентов — без суеты и лишних экранов.
          </p>
        </motion.div>

        <div className="mt-10 w-full min-w-0 space-y-3">
          <LumiButton
            type="button"
            variant="primary"
            size="md"
            fullWidth
            className="min-h-[56px]"
            onClick={goClient}
          >
            Я клиент — онлайн-запись
          </LumiButton>
          <LumiButton
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            className="min-h-[56px]"
            onClick={goMaster}
          >
            Я мастер — управление записью
          </LumiButton>

          <p className="pt-8 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600/90">
            ONBOARDING UPDATED
          </p>
        </div>
      </div>
    </div>
  )
}
