import type { SentMessage } from '../state/messaging'
import {
  todayISO,
  type Booking,
  type Client,
  type EngagementEvent,
} from '../state/store'

import { deriveAggregateClientSensitivity } from './clientSensitivity'
import { deriveFollowupDelicacy } from './humaneFollowups'
import { deriveAggregateSocialRhythm } from './socialRhythm'

import { useSocialIntel } from '../state/socialIntel'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type RelationshipAwarenessLayerInput = {
  bookings: Booking[]
  clients: Client[]
  sent: SentMessage[]
  events: EngagementEvent[]
  pendingConfirm: number
  reschedulePending: number
  remindersCount: number
  workflowContinuity: number
  stressPressure: number
  fatigueLevel: number
}

function cancellationPulse(events: EngagementEvent[], dateISO: string): number {
  const n = events.filter((e) => e.type === 'booking_cancelled' && e.dateISO === dateISO).length
  return clamp(n / 5, 0, 1)
}

/**
 * Relationship & communication awareness — tokens only, no CRM dashboards.
 */
export function applyRelationshipAwarenessLayer(input: RelationshipAwarenessLayerInput) {
  const dayISO = todayISO()

  const socialRhythm = deriveAggregateSocialRhythm({
    bookings: input.bookings,
    clients: input.clients,
    sent: input.sent,
    pendingConfirm: input.pendingConfirm,
    reschedulePending: input.reschedulePending,
    remindersCount: input.remindersCount,
  })

  const clientSensitivity = deriveAggregateClientSensitivity({
    clients: input.clients,
    bookings: input.bookings,
    sent: input.sent,
  })

  const pendingPressure = clamp(
    (input.pendingConfirm + input.reschedulePending * 0.88) / 8,
    0,
    1,
  )

  const cancelPulse = cancellationPulse(input.events, dayISO)

  const followupDelicacy = deriveFollowupDelicacy({
    socialRhythm,
    clientSensitivity,
    stressPressure: input.stressPressure + cancelPulse * 0.12,
    fatigueLevel: input.fatigueLevel,
    pendingPressure,
  })

  const relationshipContinuity = clamp(
    input.workflowContinuity * 0.42 + socialRhythm * 0.38 + (1 - cancelPulse) * 0.2,
    0,
    1,
  )

  const communicationSoftness = clamp(
    0.34 +
      followupDelicacy * 0.34 +
      (1 - clientSensitivity) * 0.22 +
      (1 - input.stressPressure) * 0.18 -
      pendingPressure * 0.14,
    0,
    1,
  )

  const root = document.documentElement
  root.style.setProperty('--relationship-continuity', relationshipContinuity.toFixed(3))
  root.style.setProperty('--communication-softness', communicationSoftness.toFixed(3))
  root.style.setProperty('--social-rhythm', socialRhythm.toFixed(3))
  root.style.setProperty('--client-sensitivity', clientSensitivity.toFixed(3))
  root.style.setProperty('--followup-delicacy', followupDelicacy.toFixed(3))

  useSocialIntel.getState().setSnapshot({
    relationshipContinuity,
    communicationSoftness,
    socialRhythm,
    clientSensitivity,
    followupDelicacy,
  })
}
