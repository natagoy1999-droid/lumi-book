import { useMemo } from 'react'

import { varsToStyle, computeAttentionVars } from '../lib/attentionPhysics'
import type { FocusCardModel } from '../lib/homeEngine'
import type { SmartPinnedItem } from '../lib/pinningEngine'
import type { CompactPill } from './CompactPills'
import type { ActionPill } from './ActionPills'
import { FocusDock } from './FocusDock'

export function MagneticDock({
  visible,
  model,
  onAction,
  pills,
  secondary,
  actions,
  dominantScore,
}: {
  visible: boolean
  model: FocusCardModel
  onAction: (action: NonNullable<FocusCardModel['cta']>['action']) => void
  pills: CompactPill[]
  secondary?: SmartPinnedItem | null
  actions: ActionPill[]
  dominantScore: number
}) {
  const style = useMemo(() => {
    const v = computeAttentionVars({ dominantScore, compactness: 'ultra' })
    return varsToStyle(v)
  }, [dominantScore])

  return (
    <div style={style}>
      <FocusDock
        visible={visible}
        model={model}
        onAction={onAction}
        pills={pills}
        secondary={secondary}
        actions={actions}
        ultra
      />
    </div>
  )
}

