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
import { useMessaging } from '../state/messaging'

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
  const ready = useAppHydration((s) => s.ready)
  const firstPaintDone = useAppHydration((s) => s.firstPaintDone)
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    if (!ready) return
    setShowSplash(true)
    const holdMs = 760
    const exitBudgetMs = 420
    const t = window.setTimeout(() => setShowSplash(false), holdMs + exitBudgetMs)
    return () => window.clearTimeout(t)
  }, [ready])

  const hideTabs =
    loc.pathname.startsWith('/onboarding') ||
    loc.pathname.startsWith('/calendar/new') ||
    loc.pathname.startsWith('/client-booking') ||
    loc.pathname.startsWith('/book')

  return (
    <div
      className="mx-auto max-w-[520px]"
      style={{
        background: '#FAF7EF',
        ['--app-bottom-pad' as any]:
          hideTabs ? '0px' : 'calc(120px + env(safe-area-inset-bottom))',
      }}
    >
      <AppBootOverlay active={!ready} />
      <SplashScreen active={ready && showSplash} />
      <div className={ready ? 'app-ready' : 'app-preparing'}>
        <MotionConfig reducedMotion={firstPaintDone ? 'never' : 'always'}>
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
          {loc.pathname === '/today' ? <InstallPromptCard /> : null}
          {hideTabs ? null : <BottomTabs />}
          <SafeMessageComposerSheet />
          <SafeDemoWalkthrough />
        </MotionConfig>
      </div>
    </div>
  )
}

