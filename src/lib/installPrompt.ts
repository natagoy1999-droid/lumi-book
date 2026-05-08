export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function isStandalone() {
  const mm =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  // @ts-expect-error iOS Safari legacy
  const ios = typeof navigator !== 'undefined' && Boolean(navigator.standalone)
  return mm || ios
}

