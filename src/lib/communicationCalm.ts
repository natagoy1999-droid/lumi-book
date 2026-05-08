import {
  useCommunicationCalmIntel,
  type CommunicationCalmSnapshot,
} from '../state/communicationCalmIntel'

export type { CommunicationCalmSnapshot } from '../state/communicationCalmIntel'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

/**
 * Derives calm surface tokens from relationship awareness CSS variables.
 * Call immediately after `applyRelationshipAwarenessLayer` each material tick.
 */
export function applyCommunicationCalmSurfaces() {
  const soft = readVar('--communication-softness', 0.52)
  const delicacy = readVar('--followup-delicacy', 0.55)
  const sensitivity = readVar('--client-sensitivity', 0.38)
  const rhythm = readVar('--social-rhythm', 0.45)
  const continuity = readVar('--relationship-continuity', 0.5)

  const socialQuietness = clamp(0.16 + sensitivity * 0.46 + delicacy * 0.38, 0, 1)

  const communicationCalm = clamp(0.32 + soft * 0.34 + delicacy * 0.34 + rhythm * 0.12, 0, 1)

  const advisoryDelicacy = clamp(0.38 + soft * 0.31 + delicacy * 0.31, 0, 1)

  const relationshipSoftness = clamp(0.3 + continuity * 0.36 + soft * 0.34, 0, 1)

  const clientCardCalm = clamp(0.34 + delicacy * 0.33 + soft * 0.27 + rhythm * 0.18, 0, 1)

  const snap: CommunicationCalmSnapshot = {
    communicationCalm,
    advisoryDelicacy,
    socialQuietness,
    relationshipSoftness,
    clientCardCalm,
  }

  const root = document.documentElement
  root.style.setProperty('--communication-calm', communicationCalm.toFixed(3))
  root.style.setProperty('--advisory-delicacy', advisoryDelicacy.toFixed(3))
  root.style.setProperty('--social-quietness', socialQuietness.toFixed(3))
  root.style.setProperty('--relationship-softness', relationshipSoftness.toFixed(3))
  root.style.setProperty('--client-card-calm', clientCardCalm.toFixed(3))

  useCommunicationCalmIntel.getState().setSnapshot(snap)
}
