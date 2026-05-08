/**
 * Operational workflow intents — advisory labels only, no autonomous routing.
 */
export type OperationalIntent =
  | 'reschedule_ops'
  | 'pending_confirm_close'
  | 'schedule_tomorrow'
  | 'clients_deep'
  | 'followup_compose'
  | 'slot_seek'
  | 'neutral'

export type WorkflowIntentScores = Record<OperationalIntent, number>

export type WorkflowIntentModel = {
  primary: OperationalIntent
  scores: WorkflowIntentScores
  /** Separation from runner-up — drives low-confidence guard */
  confidence: number
  /** Route clustering — preserves hierarchy when stable */
  stability: number
  /** Scalar strength of primary hypothesis */
  activeIntentStrength: number
}
