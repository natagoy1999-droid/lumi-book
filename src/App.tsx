import { AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AppShell } from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { applyMaterialFromStore } from './lib/globalMaterial'
import { hydratePresenceMemory } from './lib/presenceMemory'
import {
  attachVisibilityContinuity,
  hydrateSessionContinuity,
  syncSessionRoute,
} from './lib/sessionContinuity'
import { startGlassBreathing, stopGlassBreathing } from './lib/glassBreathing'
import { useBehavioralIntel } from './state/behavioralIntel'
import { useCognitiveUI } from './state/cognitiveUI'
import { useInteractionTelemetry } from './state/interactionTelemetry'
import { useMaterialScroll } from './state/materialScroll'
import { useMessaging } from './state/messaging'
import { useRecovery } from './state/recovery'
import { useInstall } from './state/install'
import { useAppHydration } from './state/appHydration'
import { useDemoMode } from './state/demoMode'
import { Calendar } from './screens/Calendar'
import { Clients } from './screens/Clients'
import { Money } from './screens/Money'
import { NewBooking } from './screens/NewBooking'
import { RoleLanding } from './screens/RoleLanding'
import { Reschedule } from './screens/Reschedule'
import { Settings } from './screens/Settings'
import { Today } from './screens/Today'
import { ClientBooking } from './screens/ClientBooking'
import { PublicBooking } from './screens/PublicBooking'
import { Pricing } from './screens/Pricing'
import { Login } from './screens/Login'
import { Signup } from './screens/Signup'
import { AuthEntry } from './screens/AuthEntry'
import { Workspace } from './screens/Workspace'
import { isLocalMasterAuthed } from './lib/localMasterAuth'
import { useAuthStore } from './store/authStore'
import {
  ROUTE_APP_CALENDAR,
  ROUTE_APP_CALENDAR_NEW,
  ROUTE_APP_CLIENTS,
  ROUTE_APP_MONEY,
  ROUTE_APP_RESCHEDULE,
  ROUTE_APP_SETTINGS,
  ROUTE_APP_TODAY,
  ROUTE_BOOK,
  isMasterTodayPath,
} from './lib/appRoutes'
import { StoreProvider, todayISO, useStore } from './state/store'
function Page({ children }: { children: ReactNode }) {
  // keep reading cognitive policy so UI density stays correct; no motion coupling here
  useCognitiveUI((s) => s.policy.load)

  return (
    <main
      className="min-h-[100dvh] min-h-[100svh]"
      style={{
        paddingBottom: 'var(--app-bottom-pad, 0px)',
      }}
    >
      {children}
    </main>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const initializing = useAuthStore((s) => s.initializing)
  const mode = useAuthStore((s) => s.mode)
  const hasUser = useAuthStore((s) => Boolean(s.user))

  // Avoid blank screen on Safari while auth restores (never hang forever — bootstrap uses timeout).
  if (initializing) {
    return (
      <div className="px-5 pt-10 text-center text-[14px] font-medium text-ink-700/70">
        Загрузка…
      </div>
    )
  }
  console.log('AUTH STORE MODE', mode)
  if (isLocalMasterAuthed()) return <>{children}</>
  if (mode !== 'auth' || !hasUser) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function GlobalMaterialSync() {
  const loc = useLocation()
  const prevPathRef = useRef('')
  const scrollY = useMaterialScroll((s) => s.scrollY)
  const setScrollY = useMaterialScroll((s) => s.setScrollY)
  const { state, freeSlots, moneyForDay } = useStore()
  const sent = useMessaging((s) => s.sent)
  const activeChains = useRecovery((s) => s.chains.filter((c) => c.status === 'active').length)
  const setDeferred = useInstall((s) => s.setDeferred)
  const markInstalled = useInstall((s) => s.markInstalled)
  const setReady = useAppHydration((s) => s.setReady)
  const setFirstPaintDone = useAppHydration((s) => s.setFirstPaintDone)

  // Safari / mobile: do not keep the app at opacity:0 behind "app-preparing" waiting for rAF/material.
  useEffect(() => {
    setReady(true)
    setFirstPaintDone(true)
  }, [setReady, setFirstPaintDone])

  const masterId = state.masters[0]?.id ?? ''
  const dateISO = todayISO()
  const slots = useMemo(
    () => (masterId ? freeSlots(dateISO, masterId) : []),
    [dateISO, freeSlots, masterId, state.bookings],
  )
  const income = useMemo(() => moneyForDay(dateISO), [dateISO, moneyForDay, state.bookings])

  useEffect(() => {
    if (!isMasterTodayPath(loc.pathname)) {
      setScrollY(0)
    }
  }, [loc.pathname, setScrollY])

  useEffect(() => {
    useInteractionTelemetry.getState().recordNavigation(loc.pathname)
  }, [loc.pathname])

  useEffect(() => {
    hydrateSessionContinuity()
  }, [])

  useEffect(() => {
    hydratePresenceMemory()
  }, [])

  useEffect(() => {
    return attachVisibilityContinuity()
  }, [])

  useEffect(() => {
    syncSessionRoute(loc.pathname)
  }, [loc.pathname])

  useEffect(() => {
    const prev = prevPathRef.current
    if (prev) useBehavioralIntel.getState().recordTransition(prev, loc.pathname)
    prevPathRef.current = loc.pathname
  }, [loc.pathname])

  useEffect(() => {
    startGlassBreathing()
    return () => stopGlassBreathing()
  }, [])

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as never)
    }
    const onInstalled = () => markInstalled()
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [markInstalled, setDeferred])

  useEffect(() => {
    try {
      applyMaterialFromStore({
        pathname: loc.pathname,
        scrollY,
        bookings: state.bookings,
        clients: state.clients,
        events: state.events,
        services: state.services,
        masters: state.masters,
        sent,
        activeRecoveryChains: activeChains,
        freeSlotsToday: slots,
        incomeToday: income,
      })
    } catch (e) {
      console.error('[material] applyMaterialFromStore failed', e)
    }
  }, [
    activeChains,
    income,
    loc.pathname,
    scrollY,
    sent,
    slots,
    state.bookings,
    state.clients,
    state.events,
    state.masters,
    state.services,
  ])

  return null
}

function Shell() {
  const loc = useLocation()

  useEffect(() => {
    const t = window.setTimeout(() => {
      const demoActive = useDemoMode.getState().active
      if (demoActive) {
        const hasModal = Boolean(
          document.querySelector('[data-demo-walkthrough-modal="1"]'),
        )
        if (!hasModal) useDemoMode.getState().stop()
      }

      const composer = useMessaging.getState().composer
      if (composer.open && (!('draft' in composer) || !composer.draft)) {
        useMessaging.getState().closeComposer()
      }

      // If something still left body scroll locked, unlock it.
      const anyOverlay =
        useDemoMode.getState().active ||
        (useMessaging.getState().composer.open &&
          ('draft' in useMessaging.getState().composer) &&
          Boolean(useMessaging.getState().composer.draft))
      if (!anyOverlay && document.body.style.overflow === 'hidden') {
        document.body.style.overflow = ''
      }
    }, 0)
    return () => window.clearTimeout(t)
  }, [loc.pathname, loc.search])

  return (
    <>
      <GlobalMaterialSync />
      <AppShell
        screenContent={
          <AnimatePresence mode="wait" initial={false}>
          <ErrorBoundary key={`${loc.pathname}${loc.search}`} layout="embedded">
          <Routes location={loc} key={loc.pathname + loc.search}>
          <Route
            path="/"
            element={
              <Page>
                <RoleLanding />
              </Page>
            }
          />
          <Route
            path="/onboarding"
            element={
              <Page>
                <RoleLanding />
              </Page>
            }
          />
          <Route
            path="/auth"
            element={
              <Page>
                <AuthEntry />
              </Page>
            }
          />
          <Route
            path="/login"
            element={
              <Page>
                <Login />
              </Page>
            }
          />
          <Route
            path="/signup"
            element={
              <Page>
                <Signup />
              </Page>
            }
          />
          <Route
            path="/workspace"
            element={
              <Page>
                <Workspace />
              </Page>
            }
          />
          <Route
            path="/book/:workspace"
            element={
              <Page>
                <PublicBooking />
              </Page>
            }
          />
          <Route
            path="/book"
            element={
              <Page>
                <ClientBooking />
              </Page>
            }
          />
          <Route path="/app" element={<Navigate to={ROUTE_APP_TODAY} replace />} />
          <Route
            path={ROUTE_APP_TODAY}
            element={
              <Page>
                <RequireAuth>
                  <Today />
                </RequireAuth>
              </Page>
            }
          />
          <Route
            path={ROUTE_APP_CALENDAR}
            element={
              <Page>
                <RequireAuth>
                  <Calendar />
                </RequireAuth>
              </Page>
            }
          />
          <Route
            path={ROUTE_APP_CALENDAR_NEW}
            element={
              <Page>
                <RequireAuth>
                  <NewBooking />
                </RequireAuth>
              </Page>
            }
          />
          <Route
            path={ROUTE_APP_RESCHEDULE}
            element={
              <Page>
                <RequireAuth>
                  <Reschedule />
                </RequireAuth>
              </Page>
            }
          />
          <Route
            path={ROUTE_APP_CLIENTS}
            element={
              <Page>
                <RequireAuth>
                  <Clients />
                </RequireAuth>
              </Page>
            }
          />
          <Route
            path={ROUTE_APP_MONEY}
            element={
              <Page>
                <RequireAuth>
                  <Money />
                </RequireAuth>
              </Page>
            }
          />
          <Route
            path={ROUTE_APP_SETTINGS}
            element={
              <Page>
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              </Page>
            }
          />
          <Route
            path="/pricing"
            element={
              <Page>
                <Pricing />
              </Page>
            }
          />
          <Route path="/today" element={<Navigate to={ROUTE_APP_TODAY} replace />} />
          <Route path="/calendar/new" element={<Navigate to={ROUTE_APP_CALENDAR_NEW} replace />} />
          <Route path="/calendar" element={<Navigate to={ROUTE_APP_CALENDAR} replace />} />
          <Route path="/reschedule" element={<Navigate to={ROUTE_APP_RESCHEDULE} replace />} />
          <Route path="/clients" element={<Navigate to={ROUTE_APP_CLIENTS} replace />} />
          <Route path="/money" element={<Navigate to={ROUTE_APP_MONEY} replace />} />
          <Route path="/settings" element={<Navigate to={ROUTE_APP_SETTINGS} replace />} />
          <Route path="/client-booking" element={<Navigate to={ROUTE_BOOK} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
          </AnimatePresence>
        }
      />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </StoreProvider>
  )
}
