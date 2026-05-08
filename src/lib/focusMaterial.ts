import type { AttentionLockVars } from './attentionLock'
import { applyAttentionDepth } from './attentionDepth'

export function applyFocusMaterial(lock: AttentionLockVars) {
  applyAttentionDepth({
    attentionLock: lock.on,
    focusContrast: lock.focusContrast,
    secondaryFade: lock.secondaryFade,
    depthPriority: lock.depthPriority,
  })
}

