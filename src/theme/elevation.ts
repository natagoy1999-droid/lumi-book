export const z = {
  content: 1,
  floating: 10,
  tabs: 50,
  backdrop: 100,
  modal: 120,
  /** Demo walkthrough sits above shell tabs (tabs stay interactive only when modal closed). */
  walkthroughBackdrop: 9998,
  walkthroughModal: 10000,
  toast: 150,
} as const

export const shadows = {
  soft: '0 10px 28px rgba(30,28,25,0.10), 0 2px 8px rgba(30,28,25,0.06)',
  lift: '0 18px 44px rgba(30,28,25,0.14), 0 6px 18px rgba(30,28,25,0.10)',
  glowGold: '0 0 0 1px rgba(198,160,98,0.28), 0 12px 32px rgba(198,160,98,0.14)',
} as const

