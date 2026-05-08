import type { DockAction } from './actionEngine'
import type { WorkflowIntentModel } from './workflowIntent'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function alignmentWeight(model: WorkflowIntentModel, action: DockAction): number {
  switch (model.primary) {
    case 'reschedule_ops':
      if (action.kind.kind === 'open_reschedule') return 1
      if (action.kind.kind === 'nudge_pending') return 0.38
      return 0.14
    case 'pending_confirm_close':
      if (action.kind.kind === 'nudge_pending') return 1
      if (action.kind.kind === 'open_reschedule') return 0.28
      return 0.16
    case 'schedule_tomorrow':
      if (action.kind.kind === 'offer_slot') return 0.82
      if (action.kind.kind === 'nudge_pending') return 0.42
      return 0.18
    case 'clients_deep':
      if (action.kind.kind === 'write_client') return 1
      return 0.15
    case 'followup_compose':
      if (action.kind.kind === 'write_client') return 1
      return 0.2
    case 'slot_seek':
      if (action.kind.kind === 'offer_slot') return 1
      if (action.kind.kind === 'nudge_pending') return 0.35
      return 0.18
    case 'neutral':
    default:
      return 0.16
  }
}

/**
 * Intent-aligned dock emphasis — tiny score lift, capped; skipped when confidence is low.
 */
export function applyIntentAwareDockBoost(
  actions: DockAction[],
  model: WorkflowIntentModel,
): DockAction[] {
  if (!actions.length) return actions
  if (model.confidence < 0.32 || model.primary === 'neutral') return actions

  const amp = clamp(model.confidence * model.stability * 0.052, 0, 0.062)
  return actions
    .map((a) => ({
      ...a,
      score: Math.min(
        108,
        Math.round(a.score * (1 + amp * alignmentWeight(model, a)) * 10) / 10,
      ),
    }))
    .sort((x, y) => y.score - x.score)
}
