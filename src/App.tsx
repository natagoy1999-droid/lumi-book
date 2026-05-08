import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { BottomTabs } from './components/BottomTabs'
import { AppBootOverlay } from './components/AppBootOverlay'
import { InstallPromptCard } from './components/InstallPromptCard'
import { MessageComposerSheet } from './components/MessageComposerSheet'
import { DemoWalkthrough } from './components/DemoWalkthrough'
import { cognitiveRoutePresenceY, cognitiveRouteSpring } from './lib/cognitiveRouting'
import { applyMaterialFromStore } from './lib/globalMaterial'
import { hydratePresenceMemory } from './lib/presenceMemory'
import {
  attachVisibilityContinuity,
  hydrateSessionContinuity,
  syncSessionRoute,
} from './lib/sessionContinuity'
import { startGlassBreathing, stopGlassBreathing } from './lib/glassBreathing'
import { useBehavioralIntel } from './state/behavioralIntel'
import { useEnergyIntel } from './state/energyIntel'
import { useCognitiveUI } from './state/cognitiveUI'
import { useFlowIntel } from './state/flowIntel'
import { useInteractionTelemetry } from './state/interactionTelemetry'
import { useMaterialScroll } from './state/materialScroll'
import { useMessaging } from './state/messaging'
import { useRecovery } from './state/recovery'
import { useInstall } from './state/install'
import { useAppHydration } from './state/appHydration'
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
  const load = useCognitiveUI((s) => s.policy.load)
  const flowMom = useFlowIntel((s) => s.bundle?.flowMomentum ?? 0)
  const energySnap = useEnergyIntel((s) => s.snapshot)
  const loc = useLocation()
  const spring = useMemo(
    () =>
      cognitiveRouteSpring(
        load,
        loc.pathname,
        flowMom,
        energySnap
          ? {
              interactionEnergy: energySnap.interactionEnergy,
              fatigueLevel: energySnap.fatigueLevel,
              humanePacing: energySnap.humanePacing,
            }
          : undefined,
      ),
    [energySnap, flowMom, load, loc.pathname],
  )
  const y = useMemo(
    () => cognitiveRoutePresenceY(load, flowMom, energySnap?.fatigueLevel ?? 0.32),
    [energySnap?.fatigueLevel, flowMom, load],
  )

  return (
    <motion.main
      className="min-h-[100svh]"
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -y * 0.65 }}
      transition={spring}
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
      // Mark ready only after material pipeline applied once.
      const raf = requestAnimationFrame(() => setReady(true))
      return () => cancelAnimationFrame(raf)
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
  ])

  return null
}

function Shell() {
  const loc = useLocation()
  const { state } = useStore()
  const ready = useAppHydration((s) => s.ready)

  const hideTabs =
    loc.pathname.startsWith('/onboarding') ||
    loc.pathname.startsWith('/calendar/new') ||
    loc.pathname.startsWith('/client-booking')

  return (
    <div className="mx-auto max-w-[520px]">
      <GlobalMaterialSync />
      <AppBootOverlay active={!ready} />
      <div
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? 'translateY(0px)' : 'translateY(4px)',
          transition: 'opacity 340ms ease, transform 340ms ease',
          pointerEvents: ready ? 'auto' : 'none',
        }}
      >
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
            path="/client-booking"
            element={
              <Page>
                <ClientBooking />
              </Page>
            }
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

      {loc.pathname === '/today' ? <InstallPromptCard /> : null}
      {hideTabs ? null : <BottomTabs />}
      <MessageComposerSheet />
      <DemoWalkthrough />
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
