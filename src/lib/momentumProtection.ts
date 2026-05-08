import { computeInterruptionIntensity } from './interruptionControl'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Momentum protection — resist noisy UI churn while a steady workflow is detected.
 */
export function computeMomentumProtection(
  flowMomentum: number,
  navBurst: number,
  scrollEwma: number,
): number {
  const intr = computeInterruptionIntensity(navBurst, scrollEwma)
  return clamp(flowMomentum * (1 - intr * 0.55), 0, 1)
}
