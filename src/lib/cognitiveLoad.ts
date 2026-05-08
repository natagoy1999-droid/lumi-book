import { applyEnergyAwareMaterialLayer, mergeEnergyAwarePolicy } from './energyAware'
import { applyCognitiveContinuity } from './cognitiveContinuity'
import { deriveCognitivePolicy } from './decisionReduction'
import { applyFocusSimplification } from './focusSimplification'
import { applyHighLoadQuietnessVars, deriveAmbientQuietness } from './highLoadQuietness'
import { computeInteractionFatigue } from './interactionFatigue'
import { applyLayoutRebalanceVars, deriveLayoutRebalance } from './layoutRebalance'
import { applySpaceControl } from './spaceControl'
import { applySilentDensity, deriveQuietDensity } from './silentDensity'
import { useCognitiveUI } from '../state/cognitiveUI'
import { useEnergyIntel } from '../state/energyIntel'
import { useInteractionTelemetry } from '../state/interactionTelemetry'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type CognitiveMaterialSignals = {
  pathname: string
  scrollY: number
  remindersCount: number
  pendingCount: number
  bookingsTodayActive: number
  minutesToNext?: number
  activeRecoveryChains: number
  eventsCount: number
  dominantScore: number
  dockPressure: number
  attentionLock: number
}

export type CognitiveDerivedCss = {
  cognitiveLoad: number
  decisionDensity: number
  focusSimplicity: number
  interactionPressure: number
  mentalQuietness: number
}

/** AI estimation of perceived cognitive pressure (0..1). */
export function computeCognitiveLoadScore(
  s: CognitiveMaterialSignals,
  fatigue: number,
  scrollEwma: number,
): number {
  let load = 0
  load += clamp(s.remindersCount / 9, 0, 1) * 0.2
  load += clamp(s.pendingCount / 5, 0, 1) * 0.16
  load += clamp(s.bookingsTodayActive / 11, 0, 1) * 0.12
  load += clamp(s.activeRecoveryChains / 4, 0, 1) * 0.09
  load += clamp(s.eventsCount / 5, 0, 1) * 0.06
  load += clamp((s.dominantScore - 52) / 48, 0, 1) * 0.1
  load += clamp(s.dockPressure, 0, 1) * 0.12
  load += clamp(s.attentionLock, 0, 1) * 0.14

  if (typeof s.minutesToNext === 'number') {
    if (s.minutesToNext <= 25) load += 0.14
    else if (s.minutesToNext <= 45) load += 0.08
    else if (s.minutesToNext <= 70) load += 0.04
  }

  load += fatigue * 0.26
  load += clamp((scrollEwma - 90) / 1500, 0, 1) * 0.08

  if (s.pathname !== '/today') load *= 0.988

  return clamp(load, 0, 1)
}

export function deriveCognitiveCss(load: number, fatigue: number): CognitiveDerivedCss {
  const blended = clamp(load * 0.78 + fatigue * 0.22, 0, 1)
  return {
    cognitiveLoad: blended,
    decisionDensity: clamp(0.36 + blended * 0.54, 0.32, 0.96),
    focusSimplicity: clamp(0.14 + blended * 0.78, 0.12, 0.94),
    interactionPressure: clamp(fatigue, 0, 1),
    mentalQuietness: clamp(blended * 0.62 + fatigue * 0.38, 0, 1),
  }
}

/**
 * Adaptive complexity controller — CSS vars + UI policy + calm simplification.
 */
export function applyCognitiveMaterialLayer(s: CognitiveMaterialSignals) {
  const tel = useInteractionTelemetry.getState()
  tel.decayPipeline()

  const fatigue = computeInteractionFatigue({
    scrollEwma: tel.scrollEwma,
    navBurst: tel.navBurst,
    composerOpens: tel.composerOpens,
  })
  const rawLoad = computeCognitiveLoadScore(s, fatigue, tel.scrollEwma)
  const css = deriveCognitiveCss(rawLoad, fatigue)

  const root = document.documentElement
  root.style.setProperty('--cognitive-load', css.cognitiveLoad.toFixed(3))
  root.style.setProperty('--decision-density', css.decisionDensity.toFixed(3))
  root.style.setProperty('--focus-simplicity', css.focusSimplicity.toFixed(3))
  root.style.setProperty('--interaction-pressure', css.interactionPressure.toFixed(3))
  root.style.setProperty('--mental-quietness', css.mentalQuietness.toFixed(3))

  const quietDensity = deriveQuietDensity(css.cognitiveLoad)
  applySilentDensity(css.cognitiveLoad)

  applyFocusSimplification({
    cognitiveLoad: css.cognitiveLoad,
    mentalQuietness: css.mentalQuietness,
    focusSimplicity: css.focusSimplicity,
    quietDensity,
  })

  const policy = deriveCognitivePolicy(css.cognitiveLoad)
  applyEnergyAwareMaterialLayer({
    cognitiveLoad: css.cognitiveLoad,
    nowMs: Date.now(),
  })
  const energySnap = useEnergyIntel.getState().snapshot
  const mergedPolicy = energySnap ? mergeEnergyAwarePolicy(policy, energySnap) : policy

  const rebalance = deriveLayoutRebalance(css.cognitiveLoad, mergedPolicy.hideRecoveryWidget)
  applyLayoutRebalanceVars(rebalance)
  applySpaceControl(css.cognitiveLoad, css.mentalQuietness)
  applyHighLoadQuietnessVars({
    cognitiveLoad: css.cognitiveLoad,
    mentalQuietness: css.mentalQuietness,
  })

  const ambientQ = deriveAmbientQuietness(css.cognitiveLoad, css.mentalQuietness)

  useCognitiveUI.getState().setPolicy({
    ...mergedPolicy,
    layoutBalance: rebalance.layoutBalance,
    rhythmCompression: rebalance.rhythmCompression,
  })

  applyCognitiveContinuity({
    pathname: s.pathname,
    cognitiveLoad: css.cognitiveLoad,
    mentalQuietness: css.mentalQuietness,
    quietDensity,
    decisionDensity: css.decisionDensity,
    focusSimplicity: css.focusSimplicity,
    ambientQuietness: ambientQ,
  })
}
