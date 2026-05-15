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

/** Минимальный fallback без сторонних UI-компонентов (на случай ошибки внутри них). */
function EmergencyErrorFallback({ onReload }: { onReload: () => void }) {
  return (
    <div
      role="alert"
      style={{
        boxSizing: 'border-box',
        minHeight: '50vh',
        padding: 'max(2rem, env(safe-area-inset-top)) 1.25rem max(2rem, env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily:
          'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        background: '#f6f2ea',
        color: '#171717',
      }}
    >
      <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.5, maxWidth: 320 }}>
        LUMI BOOK загружается. Обновите страницу.
      </p>
      <button
        type="button"
        onClick={onReload}
        style={{
          marginTop: '1.25rem',
          padding: '12px 22px',
          fontSize: '16px',
          fontWeight: 600,
          border: 'none',
          borderRadius: 9999,
          background: '#171717',
          color: '#fffdf8',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Обновить
      </button>
    </div>
  )
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

    if (layout === 'page') {
      return (
        <EmergencyErrorFallback
          onReload={() => {
            this.setState({ hasError: false, error: null, errorInfo: null })
            window.location.reload()
          }}
        />
      )
    }

    const message = error?.message ?? 'Неизвестная ошибка'
    const stack = error?.stack ?? ''
    const componentStack = errorInfo?.componentStack ?? ''

    const debugBody = [
      `message: ${message}`,
      stack ? `\n--- stack ---\n${stack}` : '',
      componentStack ? `\n--- component stack ---\n${componentStack}` : '',
    ].join('')

    const shell = (
      <GlassCard className="p-4">
        <div className="lumi-secondary text-[13px]">Не удалось показать этот экран.</div>
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

    return (
      <div className="px-3 pb-4 pt-2" role="alert">
        {shell}
      </div>
    )
  }
}
