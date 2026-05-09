import type { PropsWithChildren } from 'react'

import { Sheet } from '../Sheet'
import type { ModalId } from '../../state/modalManager'

type Props = PropsWithChildren<{
  open: boolean
  title?: string
  onClose: () => void
  variant?: 'bottom' | 'center'
  surface?: 'glass' | 'solid'
  modalId?: ModalId
  className?: string
}>

export function LumiModal({
  open,
  title,
  onClose,
  children,
  variant = 'center',
  surface = 'solid',
  modalId,
  className,
}: Props) {
  return (
    <Sheet
      open={open}
      title={title}
      onClose={onClose}
      variant={variant}
      surface={surface}
      modalId={modalId}
      className={className}
    >
      {children}
    </Sheet>
  )
}

