import { computeFlowMomentum, type FlowMomentumInput } from './flowMomentum'
import { computeFrictionReduction } from './frictionReduction'
import { computeFocusContinuity } from './focusContinuity'
import { computeMomentumProtection } from './momentumProtection'

import { useFlowIntel, type FlowStateBundle } from '../state/flowIntel'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export type { FlowStateBundle }

/**
 * Interaction smoothness — complements flow momentum (inverse harsh churn).
 */
export function computeInteractionFlow(navBurst: number, scrollEwma: number): number {
  return clamp(
    (1 - clamp(navBurst / 8.5, 0, 1)) * 0.55 + (1 - clamp((scrollEwma - 70) / 2700, 0, 1)) * 0.45,
    0,
    1,
  )
}

/** Calm productivity feel — no gamification, no “boost” language. */
export function computeWorkflowCalm(flowMomentum: number, stressPressure: number): number {
  return clamp(flowMomentum * (1 - stressPressure * 0.42), 0, 1)
}

export function deriveFlowStateBundle(input: FlowMomentumInput): FlowStateBundle {
  const flowMomentum = computeFlowMomentum(input)
  const focusContinuity = computeFocusContinuity(
    flowMomentum,
    input.stressPressure,
    input.cognitiveLoad,
  )
  const interactionFlow = computeInteractionFlow(input.navBurst, input.scrollEwma)
  const workflowCalm = computeWorkflowCalm(flowMomentum, input.stressPressure)
  const momentumProtection = computeMomentumProtection(
    flowMomentum,
    input.navBurst,
    input.scrollEwma,
  )
  const frictionReduction = computeFrictionReduction(flowMomentum, focusContinuity)

  return {
    flowMomentum,
    focusContinuity,
    interactionFlow,
    workflowCalm,
    momentumProtection,
    frictionReduction,
  }
}

/**
 * Flow state layer — applies tokens + gently compounds presence (high flow → fewer interruptions).
 */
export function applyFlowStateLayer(input: FlowMomentumInput) {
  const b = deriveFlowStateBundle(input)
  const root = document.documentElement

  root.style.setProperty('--flow-momentum', b.flowMomentum.toFixed(3))
  root.style.setProperty('--focus-continuity', b.focusContinuity.toFixed(3))
  root.style.setProperty('--interaction-flow', b.interactionFlow.toFixed(3))
  root.style.setProperty('--workflow-calm', b.workflowCalm.toFixed(3))
  root.style.setProperty('--momentum-protection', b.momentumProtection.toFixed(3))

  const fm = b.flowMomentum
  const mp = b.momentumProtection
  const fr = b.frictionReduction

  let ap = readVar('--assistant-presence', 0.55)
  ap *= 1 - fm * 0.36
  ap *= 1 - mp * 0.12
  root.style.setProperty('--assistant-presence', clamp(ap, 0.05, 0.96).toFixed(3))

  let pred = readVar('--predictive-opacity', 0.72)
  pred *= 1 - fm * 0.24
  pred *= 1 - fr * 0.08
  root.style.setProperty('--predictive-opacity', clamp(pred, 0.08, 0.92).toFixed(3))

  let mq = readVar('--motion-quietness', 0)
  mq = clamp(mq + fm * 0.055 + mp * 0.035, 0, 1)
  root.style.setProperty('--motion-quietness', mq.toFixed(3))

  let stag = readVar('--stagger-reduction', 0)
  stag = clamp(stag + fm * 0.045 + mp * 0.03, 0, 1)
  root.style.setProperty('--stagger-reduction', stag.toFixed(3))

  let secFade = readVar('--secondary-fade', 0)
  secFade = clamp(secFade + fm * 0.06 + fr * 0.05, 0, 1)
  root.style.setProperty('--secondary-fade', secFade.toFixed(3))

  useFlowIntel.getState().setBundle(b)

  return b
}
