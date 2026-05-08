function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type InteractionFatigueInput = {
  scrollEwma: number
  navBurst: number
  composerOpens: number[]
}

/** Interaction fatigue 0..1 from scroll churn + navigation bursts + composer churn. */
export function computeInteractionFatigue(s: InteractionFatigueInput): number {
  const t = Date.now()
  const recentComposer = s.composerOpens.filter((x) => t - x < 45_000).length

  const scrollFatigue = clamp((s.scrollEwma - 120) / 1400, 0, 1)
  const navFatigue = clamp(s.navBurst / 5.5, 0, 1)
  const composerFatigue = clamp(recentComposer / 7, 0, 1)

  return clamp(scrollFatigue * 0.42 + navFatigue * 0.35 + composerFatigue * 0.23, 0, 1)
}
