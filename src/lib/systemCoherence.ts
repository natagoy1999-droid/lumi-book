import { writeVarNumber } from './coherencePhysics'
import { deriveCrossLayerHarmony } from './crossLayerHarmony'
import { applyGlobalSmoothing } from './globalSmoothing'

/**
 * Invisible System Coherence — synchronizes existing layers into one operational physics.
 * No new UX features; only coherence tokens + gentle global smoothing.
 */
export function applySystemCoherenceEngine() {
  const snap = deriveCrossLayerHarmony()

  writeVarNumber('--system-coherence', snap.systemCoherence)
  writeVarNumber('--behavioral-stability', snap.behavioralStability)
  writeVarNumber('--environment-continuity', snap.environmentContinuity)
  writeVarNumber('--operational-harmony', snap.operationalHarmony)
  writeVarNumber('--coherence-damping', snap.coherenceDamping)

  applyGlobalSmoothing({ coherenceDamping: snap.coherenceDamping })
}

