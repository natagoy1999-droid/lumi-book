import type { ReactNode } from 'react'
import { Component } from 'react'

import { GlassCard } from './GlassCard'
import { LumiButton } from './ui/LumiButton'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  override componentDidCatch() {
    // Intentionally quiet in UI; keep console for dev.
  }

  override render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="lumi-page" style={{ paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))' }}>
        <div className="mx-auto max-w-[520px]">
          <GlassCard className="p-5">
            <div className="lumi-card-title">Что-то пошло не так.</div>
            <div className="mt-1 lumi-secondary">Попробуйте ещё раз — обычно всё возвращается на место.</div>
            <div className="mt-4">
              <LumiButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  this.setState({ hasError: false })
                  window.location.reload()
                }}
              >
                Обновить
              </LumiButton>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }
}

