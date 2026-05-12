import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import './lib/supabaseClient'
import { useAuthStore } from './store/authStore'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

/** Не блокируем первый кадр: сессия восстанавливается после paint (Safari / мобильные). */
function scheduleAuthBootstrap() {
  const run = () => void useAuthStore.getState().bootstrap()
  if (typeof window === 'undefined') return
  const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(run, { timeout: 4000 })
  } else {
    window.setTimeout(run, 0)
  }
}
scheduleAuthBootstrap()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
