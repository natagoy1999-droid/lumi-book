import type { CognitiveUIPolicy } from '../state/cognitiveUI'
import { useEnergyIntel, type EnergyDerivedSnapshot } from '../state/energyIntel'
import { computeFatigueLevel, computeChaoticBurstPressure } from './fatigueDetection'
import { deriveHumanePacing } from './humanePacing'
import { deriveInteractionEnergy, computeFocusRecoveryInstant } from './interactionEnergy'
import { useInteractionTelemetry } from '../state/interactionTelemetry'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type EnergyAwareMaterialInput = {
  cognitiveLoad: number
  nowMs: number
}

function applyEnergyTokens(s: EnergyDerivedSnapshot) {
  const root = document.documentElement
  root.style.setProperty('--interaction-energy', s.interactionEnergy.toFixed(3))
  root.style.setProperty('--fatigue-level', s.fatigueLevel.toFixed(3))
  root.style.setProperty('--humane-pacing', s.humanePacing.toFixed(3))
  root.style.setProperty('--energy-quietness', s.energyQuietness.toFixed(3))
  root.style.setProperty('--focus-recovery', s.focusRecovery.toFixed(3))
}

/**
 * Softer assistant + steadier dock under fatigue / chaos — still luxury OS, not wellness copy.
 */
export function mergeEnergyAwarePolicy(base: CognitiveUIPolicy, snap: EnergyDerivedSnapshot): CognitiveUIPolicy {
  const f = snap.fatigueLevel
  const e = snap.interactionEnergy
  const q = snap.energyQuietness

  let assistantCap = base.assistantCap
  if (f > 0.52 || q > 0.55) assistantCap = Math.max(1, assistantCap - 1)
  if (e > 0.72 && f < 0.38 && q < 0.42) assistantCap = Math.min(4, assistantCap + 1)

  let dockActionsCap = base.dockActionsCap
  if (f > 0.55 || snap.focusRecovery > 0.55) dockActionsCap = 1
  else if (e > 0.68 && f < 0.35) dockActionsCap = Math.min(2, Math.max(dockActionsCap, 2))

  let showAmbientHints = base.showAmbientHints
  if (f > 0.48 || q > 0.48) showAmbientHints = false

  let hideSecondaryPinned = base.hideSecondaryPinned
  if (f > 0.5 || q > 0.45) hideSecondaryPinned = true

  let miniWidgetsCompact = base.miniWidgetsCompact
  if (f > 0.42) miniWidgetsCompact = true

  return {
    ...base,
    assistantCap,
    dockActionsCap,
    showAmbientHints,
    hideSecondaryPinned,
    miniWidgetsCompact,
  }
}

/**
 * Single entry from material pipeline — derives passive energy/fatigue/pacing and writes CSS variables.
 */
export function applyEnergyAwareMaterialLayer(input: EnergyAwareMaterialInput) {
  const tel = useInteractionTelemetry.getState()
  const chaos = computeChaoticBurstPressure(tel.eventTimestampsMs, input.nowMs)
  const fatigueLevel = computeFatigueLevel({
    scrollEwma: tel.scrollEwma,
    navBurst: tel.navBurst,
    composerOpens: tel.composerOpens,
    eventTimestampsMs: tel.eventTimestampsMs,
    nowMs: input.nowMs,
  })

  const interactionEnergy = deriveInteractionEnergy({
    eventTimestampsMs: tel.eventTimestampsMs,
    typingIntervalsEwmaMs: tel.typingIntervalsEwmaMs,
    composerToggleTimestampsMs: tel.composerToggleTimestampsMs,
    navBurst: tel.navBurst,
    fatigueLevel,
    lastInteractionTs: tel.lastInteractionTs,
    nowMs: input.nowMs,
  })

  const humanePacing = deriveHumanePacing({
    cognitiveLoad: input.cognitiveLoad,
    fatigueLevel,
    chaoticBurst: chaos,
    humaneFloor: clamp(input.cognitiveLoad * 0.14 + chaos * 0.08, 0, 0.22),
  })

  const instantRecovery = computeFocusRecoveryInstant(tel.navBurst, chaos)
  const prevFr = useEnergyIntel.getState().snapshot?.focusRecovery ?? 0
  const focusRecovery = clamp(prevFr * 0.88 + instantRecovery * 0.12 + chaos * 0.05, 0, 1)

  const energyQuietness = clamp(fatigueLevel * 0.48 + chaos * 0.28 + humanePacing * 0.24, 0, 1)

  const snap: EnergyDerivedSnapshot = {
    interactionEnergy,
    fatigueLevel,
    humanePacing,
    energyQuietness,
    focusRecovery,
  }

  applyEnergyTokens(snap)
  useEnergyIntel.getState().setSnapshot(snap)
}
