import { deriveActionClarityBundle } from './actionClarity'
import { computeChoicePressure } from './choiceReduction'
import { deriveFocusLinearity } from './focusPaths'

export type DecisionSimplicityLayerInput = {
  pathname: string
  cognitiveLoad: number
  pendingConfirm: number
  reschedulePending: number
  remindersCount: number
  navBurst: number
  scrollEwma: number
  dockActionCount: number
  dominantScore: number
  stressPressure: number
  workflowCalm: number
  flowMomentum: number
}

function applyDecisionTokens(args: {
  decisionClarity: number
  actionFocus: number
  secondaryQuietness: number
  choicePressure: number
  focusLinearity: number
}) {
  const root = document.documentElement
  root.style.setProperty('--decision-clarity', args.decisionClarity.toFixed(3))
  root.style.setProperty('--action-focus', args.actionFocus.toFixed(3))
  root.style.setProperty('--secondary-quietness', args.secondaryQuietness.toFixed(3))
  root.style.setProperty('--choice-pressure', args.choicePressure.toFixed(3))
  root.style.setProperty('--focus-linearity', args.focusLinearity.toFixed(3))
}

/**
 * Decision simplicity layer — passive prioritization signals only (no forced flows).
 */
export function applyDecisionSimplicityLayer(input: DecisionSimplicityLayerInput) {
  const choicePressure = computeChoicePressure({
    cognitiveLoad: input.cognitiveLoad,
    pendingConfirm: input.pendingConfirm,
    reschedulePending: input.reschedulePending,
    remindersCount: input.remindersCount,
    navBurst: input.navBurst,
    scrollEwma: input.scrollEwma,
    dockActionCount: input.dockActionCount,
    stressPressure: input.stressPressure,
  })

  const clarity = deriveActionClarityBundle({
    choicePressure,
    cognitiveLoad: input.cognitiveLoad,
    stressPressure: input.stressPressure,
    dominantScore: input.dominantScore,
    workflowCalm: input.workflowCalm,
    flowMomentum: input.flowMomentum,
  })

  const focusLinearity = deriveFocusLinearity({
    cognitiveLoad: input.cognitiveLoad,
    stressPressure: input.stressPressure,
    choicePressure,
    workflowCalm: input.workflowCalm,
    pathname: input.pathname,
  })

  applyDecisionTokens({
    decisionClarity: clarity.decisionClarity,
    actionFocus: clarity.actionFocus,
    secondaryQuietness: clarity.secondaryQuietness,
    choicePressure,
    focusLinearity,
  })
}
