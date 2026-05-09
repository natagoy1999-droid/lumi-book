export const motion = {
  duration: {
    fast: 0.18,
    normal: 0.24,
    slow: 0.32,
  },
  // Gentle, native-feel curves (no bouncy spring).
  ease: {
    out: [0.16, 1, 0.3, 1] as const,
    inOut: [0.4, 0, 0.2, 1] as const,
    calm: [0.22, 1, 0.36, 1] as const,
  },
  press: {
    scale: 0.992,
    opacity: 0.94,
  },
} as const

