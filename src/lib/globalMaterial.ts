import type { SentMessage } from '../state/messaging'
import type { Booking, Client, EngagementEvent, Master, Service } from '../state/store'
import { todayISO } from '../state/store'

import { applyAttentionLock, computeAttentionLock } from './attentionLock'
import { applyAttentionStability, computeAttentionStability } from './attentionStabilizer'
import { buildDockActions } from './actionEngine'
import { applyDensityVars, densityVars } from './densityEngine'
import { decideDockDensity } from './densityAutoMode'
import { applyFocusMaterial } from './focusMaterial'
import { buildWidgets, computeHomeMode } from './homeEngine'
import { applyLayoutPhysics, layoutPhysics } from './layoutPhysics'
import { applyMassVars, massVars } from './massPhysics'
import { applyPremiumStillness } from './premiumStillness'
import { applyRhythm, verticalRhythm } from './verticalRhythm'
import { applyScrollVars, computeScrollVars } from './scrollMotion'
import { computeMaterialHierarchy } from './materialHierarchy'
import { applyMaterialTokens } from './materialTokens'
import { applySystemStillness } from './systemStillness'
import { applyLightEnvironment } from './lightEnvironment'
import { applyTemporalUI } from './temporalUI'
import { applyBehavioralTokens } from './anticipatoryUI'
import { applyHabitAwareDockBoost, computeBehavioralSnapshot } from './behavioralEngine'
import { applyCognitiveMaterialLayer } from './cognitiveLoad'
import { applyFlowStateLayer } from './flowStateLayer'
import { applyEmotionalSafetyLayer } from './emotionalSafety'
import { applyTrustLayerTokens } from './trustLayer'
import { applyContextMemoryLayer } from './contextMemory'
import { applyContextAwareDockBoost } from './interruptionRecovery'
import { tomorrowISO } from './assistantEngine'
import { applyAmbientPresenceLayer } from './ambientPresence'
import { applyDecisionSimplicityLayer } from './decisionSimplicity'
import { applyIntentAwarenessLayer } from './intentAwareness'
import { applyRelationshipAwarenessLayer } from './relationshipAwareness'
import { applyCommunicationCalmSurfaces } from './communicationCalm'
import { buildPresenceObservationFromContext, tickPresenceMemory } from './presenceMemory'
import { applyPersonalizedCalmnessLayer } from './personalizedCalmness'
import { applySystemCoherenceEngine } from './systemCoherence'
import { applyPredictiveCalmLayer } from './predictivePreparation'
import { applyTemporalIntelligenceLayer } from './temporalIntelligence'
import { applyIntentAwareDockBoost } from './intentContinuity'
import { deriveWorkflowIntent } from './intentDetection'
import { useBehavioralIntel } from '../state/behavioralIntel'
import { useCognitiveUI } from '../state/cognitiveUI'
import { useInteractionTelemetry } from '../state/interactionTelemetry'
import { useEmotionalSafetyIntel } from '../state/emotionalSafetyIntel'
import { useTrustIntel } from '../state/trustIntel'
import { useEnergyIntel } from '../state/energyIntel'
import { useMessaging } from '../state/messaging'
import { useSessionContinuity } from '../state/sessionContinuity'

export type MaterialFromStoreInput = {
  pathname: string
  scrollY: number
  bookings: Booking[]
  clients: Client[]
  events: EngagementEvent[]
  services: Service[]
  masters: Master[]
  sent: SentMessage[]
  activeRecoveryChains: number
  freeSlotsToday: string[]
  incomeToday: number
}

/**
 * Single global material pipeline: scroll → density → attention → depth tokens → system stillness.
 * Call from Shell (route + store) and rely on scroll store on Home for compression.
 */
export function applyMaterialFromStore(input: MaterialFromStoreInput) {
  const master = input.masters[0]
  if (!master) return

  const dateISO = todayISO()
  const scroll = input.pathname === '/today' ? input.scrollY : 0

  const bookingsToday = input.bookings.filter((b) => b.dateISO === dateISO)
  const remindersCount = input.bookings.filter(
    (b) => b.status === 'pending_confirm' || b.status === 'reschedule_pending',
  ).length
  const pendingCount = input.bookings.filter((b) => b.status === 'pending_confirm').length
  const reschedulePendingCount = input.bookings.filter((b) => b.status === 'reschedule_pending').length
  const tomorrowDayISO = tomorrowISO()
  const tomorrowBookingCount = input.bookings.filter(
    (b) => b.dateISO === tomorrowDayISO && b.status !== 'cancelled',
  ).length

  const homeMode = computeHomeMode({
    todayBookings: bookingsToday.filter((b) => b.status !== 'cancelled').length,
    remindersCount,
    eventsCount: input.events.length,
  })

  const widgets = buildWidgets({
    todayBookings: bookingsToday,
    freeSlotsToday: input.freeSlotsToday,
    incomeToday: input.incomeToday,
    clients: input.clients,
    bookings: input.bookings,
  })

  let minutesToNext: number | undefined
  if (widgets.nextTime) {
    const [h, m] = widgets.nextTime.split(':').map(Number)
    const now = new Date()
    minutesToNext = h * 60 + m - (now.getHours() * 60 + now.getMinutes())
  }

  const behavioral = useBehavioralIntel.getState()
  const trust = useTrustIntel.getState()
  trust.pruneOld(Date.now())

  const behavioralSnap = computeBehavioralSnapshot({
    pathname: input.pathname,
    transitions: behavioral.transitions,
    composerOpens: behavioral.composerOpens,
    bookings: input.bookings,
    sent: input.sent,
  })
  behavioral.setLastSnapshot(behavioralSnap)
  applyBehavioralTokens(behavioralSnap)

  const trustOut = applyTrustLayerTokens({
    behavioral: behavioralSnap,
    cognitiveLoad: useCognitiveUI.getState().policy.load,
    trustSuppression: trust.trustSuppression(),
  })

  const sessionSnap = useSessionContinuity.getState()
  const ctxDerived = applyContextMemoryLayer({
    pathname: input.pathname,
    bookings: input.bookings,
    dateISO,
    lastScenario: sessionSnap.lastScenario,
    lastPrimaryPath: sessionSnap.lastPrimaryPath,
    transitions: behavioral.transitions,
    abandonedComposerAt: sessionSnap.abandonedComposerAt,
    now: Date.now(),
  })

  const intentModel = deriveWorkflowIntent({
    pathname: input.pathname,
    transitions: behavioral.transitions,
    pendingConfirm: pendingCount,
    reschedulePending: reschedulePendingCount,
    remindersCount,
    tomorrowBookingCount,
    sessionScenario: sessionSnap.lastScenario,
    composerOpens: behavioral.composerOpens,
    composerOpen: useMessaging.getState().composer.open,
    navBurst: useInteractionTelemetry.getState().navBurst,
  })

  let dockActs = applyHabitAwareDockBoost(
    buildDockActions({
      bookings: input.bookings,
      clients: input.clients,
      events: input.events,
      sent: input.sent,
      masterId: master.id,
    }),
    behavioralSnap,
    trustOut.dockBoostMultiplier,
  )
  dockActs = applyContextAwareDockBoost(
    dockActs,
    ctxDerived.unfinishedPressure,
    ctxDerived.contextMemoryScore,
  )
  dockActs = applyIntentAwareDockBoost(dockActs, intentModel)
  const dominantScore = dockActs[0]?.score ?? 0

  applyScrollVars(computeScrollVars(scroll))

  const decision = decideDockDensity({
    scrollY: scroll,
    signals: {
      mode: homeMode,
      remindersCount,
      pendingCount,
      activeRecoveryChains: input.activeRecoveryChains,
      minutesToNext,
      hasUrgent: dominantScore >= 85,
    },
  })

  applyDensityVars(densityVars({ density: decision.density, mode: homeMode }))
  applyLayoutPhysics(layoutPhysics({ dominantScore, density: decision.density }))
  applyRhythm(verticalRhythm({ mode: homeMode, density: decision.density }))
  applyMassVars(massVars({ pressure: decision.pressure, mode: homeMode, density: decision.density }))

  applyAttentionStability(computeAttentionStability({ dominantScore, pressure: decision.pressure }))
  applyPremiumStillness({ minutesToNext, dominantScore, pressure: decision.pressure })

  const lock = computeAttentionLock({
    minutesToNext,
    dominantScore,
    pressure: decision.pressure,
  })
  applyAttentionLock(lock)
  applyFocusMaterial(lock)

  const hierarchy = computeMaterialHierarchy({
    homeMode,
    attentionLock: lock.on,
    motionFreeze: lock.motionFreeze,
    pathname: input.pathname,
  })
  applyMaterialTokens(hierarchy, { attentionLock: lock.on })

  applySystemStillness()

  const lightEnv = applyLightEnvironment({
    homeMode,
    attentionLock: lock.on,
    motionFreeze: lock.motionFreeze,
    pathname: input.pathname,
  })

  applyTemporalUI({
    homeMode,
    pressure: decision.pressure,
    remindersCount,
  })

  applyCognitiveMaterialLayer({
    pathname: input.pathname,
    scrollY: scroll,
    remindersCount,
    pendingCount,
    bookingsTodayActive: bookingsToday.filter((b) => b.status !== 'cancelled').length,
    minutesToNext,
    activeRecoveryChains: input.activeRecoveryChains,
    eventsCount: input.events.length,
    dominantScore,
    dockPressure: decision.pressure,
    attentionLock: lock.on,
  })

  const telSnap = useInteractionTelemetry.getState()
  const cancellationsToday = input.events.filter(
    (e) => e.type === 'booking_cancelled' && e.dateISO === dateISO,
  ).length

  applyEmotionalSafetyLayer({
    stressInput: {
      bookingsTodayActive: bookingsToday.filter((b) => b.status !== 'cancelled').length,
      pendingCount,
      reschedulePendingCount,
      cancellationsToday,
      navBurst: telSnap.navBurst,
      scrollEwma: telSnap.scrollEwma,
      cognitiveLoad: useCognitiveUI.getState().policy.load,
      trustSuppression: trust.trustSuppression(),
      activeRecoveryChains: input.activeRecoveryChains,
    },
    trustAssistantPresence: trustOut.assistantPresence,
    trustPredictiveOpacity: trustOut.predictiveOpacity,
  })

  const stressAfter =
    useEmotionalSafetyIntel.getState().bundle?.stressPressure ?? 0

  const flowBundle = applyFlowStateLayer({
    transitions: behavioral.transitions,
    navBurst: telSnap.navBurst,
    scrollEwma: telSnap.scrollEwma,
    stressPressure: stressAfter,
    cognitiveLoad: useCognitiveUI.getState().policy.load,
    reschedulePending: reschedulePendingCount,
    pendingConfirm: pendingCount,
  })

  applyDecisionSimplicityLayer({
    pathname: input.pathname,
    cognitiveLoad: useCognitiveUI.getState().policy.load,
    pendingConfirm: pendingCount,
    reschedulePending: reschedulePendingCount,
    remindersCount,
    navBurst: telSnap.navBurst,
    scrollEwma: telSnap.scrollEwma,
    dockActionCount: dockActs.length,
    dominantScore,
    stressPressure: stressAfter,
    workflowCalm: flowBundle.workflowCalm,
    flowMomentum: flowBundle.flowMomentum,
  })

  applyIntentAwarenessLayer(intentModel)

  applyRelationshipAwarenessLayer({
    bookings: input.bookings,
    clients: input.clients,
    sent: input.sent,
    events: input.events,
    pendingConfirm: pendingCount,
    reschedulePending: reschedulePendingCount,
    remindersCount,
    workflowContinuity: ctxDerived.workflowContinuity,
    stressPressure: stressAfter,
    fatigueLevel: useEnergyIntel.getState().snapshot?.fatigueLevel ?? 0.34,
  })

  applyCommunicationCalmSurfaces()

  applyPredictiveCalmLayer({
    intentModel,
    workflowContinuity: ctxDerived.workflowContinuity,
    pathnameMatchesSessionPrimary: input.pathname === sessionSnap.lastPrimaryPath,
    cognitiveLoad: useCognitiveUI.getState().policy.load,
    aiConfidence: useTrustIntel.getState().lastAIConfidence,
    workflowCalm: flowBundle.workflowCalm,
    navBurst: telSnap.navBurst,
    scrollEwma: telSnap.scrollEwma,
    stressPressure: stressAfter,
    trustSuppression: trust.trustSuppression(),
  })

  applyTemporalIntelligenceLayer({
    flowBundle,
    navBurst: telSnap.navBurst,
    scrollEwma: telSnap.scrollEwma,
    eventTimestampsMs: telSnap.eventTimestampsMs,
    lastInteractionTs: telSnap.lastInteractionTs,
    cognitiveLoad: useCognitiveUI.getState().policy.load,
    fatigueLevel: useEnergyIntel.getState().snapshot?.fatigueLevel ?? 0.34,
    stressPressure: stressAfter,
    trustSuppression: trust.trustSuppression(),
    intentModel,
    dominantScore,
    minutesToNext,
  })

  applyAmbientPresenceLayer({
    environmentSoftnessBase: lightEnv.environmentSoftness,
  })

  tickPresenceMemory(
    buildPresenceObservationFromContext({
      tel: {
        navBurst: telSnap.navBurst,
        scrollEwma: telSnap.scrollEwma,
        typingIntervalsEwmaMs: telSnap.typingIntervalsEwmaMs,
      },
      stressPressure: stressAfter,
      flow: {
        workflowCalm: flowBundle.workflowCalm,
        flowMomentum: flowBundle.flowMomentum,
      },
      trustSuppression: trust.trustSuppression(),
    }),
  )
  applyPersonalizedCalmnessLayer()
  applySystemCoherenceEngine()
}
