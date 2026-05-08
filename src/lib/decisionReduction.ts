import type { CognitiveUIPolicy } from '../state/cognitiveUI'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Decision pressure manager — fewer parallel choices under overload (almost invisible).
 */
export function deriveCognitivePolicy(blendedLoad: number): CognitiveUIPolicy {
  const x = clamp(blendedLoad, 0, 1)

  const reminderCap =
    x < 0.34 ? 12 : x < 0.48 ? 8 : x < 0.6 ? 5 : x < 0.74 ? 3 : 2

  const assistantCap = x < 0.38 ? 4 : x < 0.55 ? 3 : x < 0.7 ? 2 : 1

  const ctasPerReminder = x < 0.52 ? 4 : x < 0.68 ? 2 : 1

  return {
    load: x,
    reminderCap,
    assistantCap,
    ctasPerReminder,
    showQuickBar: x < 0.5,
    hideSecondaryPinned: x > 0.58,
    dockActionsCap: x > 0.72 ? 1 : 2,
    miniWidgetsCompact: x > 0.44,
    hideRecoveryWidget: x > 0.6,
    hideBusyHeavyBlocks: x > 0.74,
    freeSlotChips: x > 0.55 ? 3 : 5,
    layoutBalance: 0.26,
    rhythmCompression: 0,
    showClientAIInsight: x < 0.56,
    analyticsServiceRowsCap: x < 0.44 ? 3 : x < 0.62 ? 2 : 1,
    showAmbientHints: x < 0.53,
  }
}
