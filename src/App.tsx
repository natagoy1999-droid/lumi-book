import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { BottomTabs } from './components/BottomTabs'
import { AppBootOverlay } from './components/AppBootOverlay'
import { InstallPromptCard } from './components/InstallPromptCard'
import { MessageComposerSheet } from './components/MessageComposerSheet'
import { DemoWalkthrough } from './components/DemoWalkthrough'
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
import { Onboarding } from './screens/Onboarding'
import { Reschedule } from './screens/Reschedule'
import { Settings } from './screens/Settings'
import { Today } from './screens/Today'
import { ClientBooking } from './screens/ClientBooking'
import { StoreProvider, todayISO, useStore } from './state/store'

function Page({ children }: { children: ReactNode }) {
  const firstPaintDone = useAppHydration((s) => s.firstPaintDone)
  // keep reading cognitive policy so UI density stays correct; no motion coupling here
  useCognitiveUI((s) => s.policy.load)

  return (
    <motion.main
      className="min-h-[100svh]"
      initial={firstPaintDone ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        paddingBottom: 'var(--app-bottom-pad, 0px)',
      }}
    >
      {children}
    </motion.main>
  )
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
  const ready = useAppHydration((s) => s.ready)
  const setReady = useAppHydration((s) => s.setReady)
  const setFirstPaintDone = useAppHydration((s) => s.setFirstPaintDone)

  const masterId = state.masters[0]?.id ?? ''
  const dateISO = todayISO()
  const slots = useMemo(
    () => (masterId ? freeSlots(dateISO, masterId) : []),
    [dateISO, freeSlots, masterId, state.bookings],
  )
  const income = useMemo(() => moneyForDay(dateISO), [dateISO, moneyForDay, state.bookings])

  useEffect(() => {
    if (loc.pathname !== '/today') {
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

    if (!ready) {
      // Strict gate: material applied + 2 animation frames.
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setReady(true)
          setFirstPaintDone(true)
        })
        return () => cancelAnimationFrame(raf2)
      })
      return () => cancelAnimationFrame(raf1)
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
    ready,
    setReady,
    setFirstPaintDone,
  ])

  return null
}

function Shell() {
  const loc = useLocation()
  const { state } = useStore()
  const ready = useAppHydration((s) => s.ready)
  const firstPaintDone = useAppHydration((s) => s.firstPaintDone)

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

  const hideTabs =
    loc.pathname.startsWith('/onboarding') ||
    loc.pathname.startsWith('/calendar/new') ||
    loc.pathname.startsWith('/client-booking') ||
    loc.pathname.startsWith('/book')

  return (
    <div
      className="mx-auto max-w-[520px]"
      style={{
        // Global reserve so content never hides under BottomTabs.
        ['--app-bottom-pad' as any]:
          hideTabs ? '0px' : 'calc(110px + env(safe-area-inset-bottom))',
      }}
    >
      <GlobalMaterialSync />
      <AppBootOverlay active={!ready} />
      <div className={ready ? 'app-ready' : 'app-preparing'}>
      <MotionConfig reducedMotion={firstPaintDone ? 'never' : 'always'}>
      {ready ? (
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={loc} key={loc.pathname + loc.search}>
          <Route
            path="/"
            element={
              state.onboardingDone ? (
                <Navigate to="/today" replace />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            }
          />
          <Route
            path="/onboarding"
            element={
              <Page>
                <Onboarding />
              </Page>
            }
          />
          <Route
            path="/today"
            element={
              <Page>
                <Today />
              </Page>
            }
          />
          <Route
            path="/calendar"
            element={
              <Page>
                <Calendar />
              </Page>
            }
          />
          <Route
            path="/calendar/new"
            element={
              <Page>
                <NewBooking />
              </Page>
            }
          />
          <Route
            path="/reschedule"
            element={
              <Page>
                <Reschedule />
              </Page>
            }
          />
          <Route
            path="/clients"
            element={
              <Page>
                <Clients />
              </Page>
            }
          />
          <Route
            path="/money"
            element={
              <Page>
                <Money />
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
          <Route
            path="/client-booking"
            element={<Navigate to="/book" replace />}
          />
          <Route
            path="/settings"
            element={
              <Page>
                <Settings />
              </Page>
            }
          />
          <Route path="*" element={<Navigate to="/today" replace />} />
          </Routes>
        </AnimatePresence>
      ) : null}

      {loc.pathname === '/today' ? <InstallPromptCard /> : null}
      {hideTabs ? null : <BottomTabs />}
      <MessageComposerSheet />
      <DemoWalkthrough />
      </MotionConfig>
      </div>
    </div>
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
