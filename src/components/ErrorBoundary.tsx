import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

import { GlassCard } from './GlassCard'
import { LumiButton } from './ui/LumiButton'

type Layout = 'page' | 'embedded'

type Props = {
  children: ReactNode
  /** Full-screen fallback (root) vs compact block inside shell */
  layout?: Layout
  /** Log and render nothing — use for non-critical overlays */
  recoverSilently?: boolean
}

type State = {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false, error: null, errorInfo: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, error, errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  override render() {
    const layout = this.props.layout ?? 'page'
    const recoverSilently = this.props.recoverSilently ?? false
    const { children } = this.props
    const { hasError, error, errorInfo } = this.state

    if (!hasError) return children

    if (recoverSilently) return null

    const message = error?.message ?? 'Неизвестная ошибка'
    const stack = error?.stack ?? ''
    const componentStack = errorInfo?.componentStack ?? ''

    const debugBody = [
      `message: ${message}`,
      stack ? `\n--- stack ---\n${stack}` : '',
      componentStack ? `\n--- component stack ---\n${componentStack}` : '',
    ].join('')

    const shell = (
      <GlassCard className={layout === 'embedded' ? 'p-4' : 'p-5'}>
        <div className={layout === 'embedded' ? 'lumi-secondary text-[13px]' : 'lumi-card-title'}>
          {layout === 'embedded' ? 'Не удалось показать этот экран.' : 'Что-то пошло не так.'}
        </div>
        <div className="mt-1 text-[13px] leading-5 text-ink-700/70">
          Попробуйте ещё раз — обычно всё возвращается на место.
        </div>

        <details className="mt-4 rounded-2xl border border-white/55 bg-white/45 px-3 py-2 text-left text-[11px] text-ink-800/80 shadow-soft">
          <summary className="cursor-pointer select-none font-semibold text-ink-950/85">
            Технические детали (для отладки)
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] leading-snug text-ink-800/90">
            {debugBody.trim()}
          </pre>
        </details>

        <div className="mt-4 flex flex-wrap gap-2">
          <LumiButton
            variant="secondary"
            size="sm"
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null })
              window.location.reload()
            }}
          >
            Обновить
          </LumiButton>
          <LumiButton
            variant="secondary"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            Попробовать снова
          </LumiButton>
        </div>
      </GlassCard>
    )

    if (layout === 'embedded') {
      return (
        <div className="px-3 pb-4 pt-2" role="alert">
          {shell}
        </div>
      )
    }

    return (
      <div className="lumi-page" style={{ paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))' }}>
        <div className="mx-auto max-w-[520px]">{shell}</div>
      </div>
    )
  }
}
