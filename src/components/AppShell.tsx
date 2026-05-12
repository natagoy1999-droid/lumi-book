import type { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { ErrorBoundary } from './ErrorBoundary'
import { AppBootOverlay } from './AppBootOverlay'
import { BottomTabs } from './BottomTabs'
import { DemoWalkthrough } from './DemoWalkthrough'
import { InstallPromptCard } from './InstallPromptCard'
import { MessageComposerSheet } from './MessageComposerSheet'
import { SplashScreen } from './SplashScreen'
import { OfflineNotice } from './OfflineNotice'
import { useAppHydration } from '../state/appHydration'
import { useDemoMode } from '../state/demoMode'
import { ROUTE_APP_CALENDAR_NEW, isMasterTodayPath } from '../lib/appRoutes'
import { useMessaging } from '../state/messaging'
import { useAuthStore } from '../store/authStore'

function SafeMessageComposerSheet() {
  const composer = useMessaging((s) => s.composer)
  const k =
    composer.open && 'draft' in composer && composer.draft ? composer.draft.id : 'closed'
  return (
    <ErrorBoundary key={k} layout="embedded" recoverSilently>
      <MessageComposerSheet />
    </ErrorBoundary>
  )
}

/** If shell/auth still blocked after 1s (Safari / slow network), offer reload. */
function SafariStuckFallback() {
  const loc = useLocation()
  const ready = useAppHydration((s) => s.ready)
  const authInitializing = useAuthStore((s) => s.initializing)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setArmed(true), 1000)
    return () => window.clearTimeout(t)
  }, [])

  const onApp = loc.pathname.startsWith('/app/')
  const stuck = armed && (!ready || (onApp && authInitializing))
  if (!stuck) return null

  return (
    <div
      className="fixed inset-0 z-[20000] flex flex-col items-center justify-center gap-4 px-6 text-center"
      style={{
        background: 'color-mix(in srgb, var(--lumi-bg) 92%, white)',
        WebkitBackdropFilter: 'blur(10px)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="text-[16px] font-semibold tracking-tight text-ink-950">LUMI BOOK загружается…</div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-3xl bg-ink-950 px-6 py-3 text-[14px] font-semibold text-paper-50 shadow-glowGold"
        style={{ touchAction: 'manipulation' }}
      >
        Обновить страницу
      </button>
    </div>
  )
}

function SafeDemoWalkthrough() {
  const step = useDemoMode((s) => s.step)
  const active = useDemoMode((s) => s.active)
  return (
    <ErrorBoundary key={`${active}_${step}`} layout="embedded" recoverSilently>
      <DemoWalkthrough />
    </ErrorBoundary>
  )
}

export function AppShell({
  topArea,
  screenContent,
  modalLayer,
  floatingLayers,
}: {
  topArea?: ReactNode
  screenContent: ReactNode
  floatingLayers?: ReactNode
  modalLayer?: ReactNode
}) {
  const loc = useLocation()

  const hideTabs =
    loc.pathname.startsWith('/onboarding') ||
    loc.pathname.startsWith('/auth') ||
    loc.pathname.startsWith('/login') ||
    loc.pathname.startsWith('/signup') ||
    loc.pathname.startsWith('/workspace') ||
    loc.pathname.startsWith('/client-booking') ||
    loc.pathname.startsWith('/book') ||
    loc.pathname.startsWith('/pricing') ||
    !loc.pathname.startsWith('/app/') ||
    loc.pathname.startsWith(ROUTE_APP_CALENDAR_NEW)

  return (
    <div
      className="mx-auto max-w-[520px]"
      style={{
        background: 'transparent',
        ['--app-bottom-pad' as any]:
          hideTabs ? '0px' : 'calc(116px + env(safe-area-inset-bottom))',
      }}
    >
      {/* Temporarily off: boot overlay + splash hid the app on some mobile Safari / webview cases */}
      <AppBootOverlay active={false} />
      <SplashScreen active={false} />
      <div className="app-ready">
        <MotionConfig reducedMotion="always">
          {topArea}
          <div>{screenContent}</div>
          <div className="mt-3">
            <OfflineNotice />
          </div>

          {/* FloatingLayers: non-blocking overlays (optional) */}
          {floatingLayers}

          {/* ModalLayer: centralized modal surfaces (optional) */}
          {modalLayer}

          {/* Global built-in layers (kept isolated) */}
          {isMasterTodayPath(loc.pathname) ? <InstallPromptCard /> : null}
          {hideTabs ? null : <BottomTabs />}
          <SafeMessageComposerSheet />
          <SafeDemoWalkthrough />
        </MotionConfig>
      </div>
      <SafariStuckFallback />
    </div>
  )
}

