function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type LayoutRebalanceDerived = {
  /** 0 organic / airy grid bias, 1 balanced filled rhythm (e.g. after Recovery slot hides). */
  layoutBalance: number
  /** 0 calm elongated rhythm, ~0.5 tighter vertical scanning without cramped UI. */
  rhythmCompression: number
}

/**
 * Adaptive layout rebalance — shifts grid bias when secondary tiles disappear so nothing feels “missing”.
 */
export function deriveLayoutRebalance(
  cognitiveLoad: number,
  recoverySlotHidden: boolean,
): LayoutRebalanceDerived {
  const load = clamp(cognitiveLoad, 0, 1)
  const layoutBalance = clamp(
    0.26 + load * 0.52 + (recoverySlotHidden ? 0.16 : 0),
    0,
    1,
  )
  const rhythmCompression = clamp(load * 0.36 + (recoverySlotHidden ? 0.09 : 0), 0, 0.5)
  return { layoutBalance, rhythmCompression }
}

export function applyLayoutRebalanceVars(d: LayoutRebalanceDerived) {
  const root = document.documentElement
  root.style.setProperty('--layout-balance', d.layoutBalance.toFixed(3))
  root.style.setProperty('--rhythm-compression', d.rhythmCompression.toFixed(3))
}
