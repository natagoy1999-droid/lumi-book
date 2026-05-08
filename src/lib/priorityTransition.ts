import { useEffect, useMemo, useRef, useState } from 'react'

export function useStableValue<T>(value: T, delayMs: number) {
  const [stable, setStable] = useState(value)
  const last = useRef(value)

  useEffect(() => {
    if (Object.is(value, last.current)) return
    last.current = value
    const t = setTimeout(() => setStable(value), delayMs)
    return () => clearTimeout(t)
  }, [delayMs, value])

  return stable
}

export function useStableDockActions<T extends { id: string }>(actions: T[], delayMs: number) {
  // Debounce only when dominant changes — keeps UI calm.
  const dominantId = actions[0]?.id ?? 'none'
  const stableDominantId = useStableValue(dominantId, delayMs)

  return useMemo(() => {
    if (stableDominantId === dominantId) return actions
    // Keep previous dominant at top until the change is stable.
    return actions.slice().sort((a, b) => (a.id === stableDominantId ? -1 : 1) - (b.id === stableDominantId ? -1 : 1))
  }, [actions, dominantId, stableDominantId])
}

