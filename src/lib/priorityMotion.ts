export type MotionProfile = {
  stiffness: number
  damping: number
  mass: number
  breathe?: boolean
}

export function motionFor(args: { role: 'dominant' | 'secondary'; compactness: 'normal' | 'ultra' }): MotionProfile {
  const { role, compactness } = args

  if (role === 'dominant') {
    return {
      stiffness: compactness === 'ultra' ? 620 : 520,
      damping: compactness === 'ultra' ? 46 : 44,
      mass: 0.9,
      breathe: true,
    }
  }

  return {
    stiffness: compactness === 'ultra' ? 720 : 680,
    damping: compactness === 'ultra' ? 52 : 48,
    mass: 0.75,
    breathe: false,
  }
}

export function breatheAnim(amplitudePx?: number) {
  if (!amplitudePx || amplitudePx <= 0) return undefined
  return {
    y: [0, -amplitudePx, 0],
    transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' as const },
  }
}

