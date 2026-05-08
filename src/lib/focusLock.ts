export function applyFocusLock(level: number) {
  const root = document.documentElement
  root.style.setProperty('--focus-lock', Math.max(0, Math.min(1, level)).toFixed(3))
}

