import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'

import './index.css'
import './lib/supabaseClient'
import { useAuthStore } from './store/authStore'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

function hidePwaStaticFallback() {
  const el = document.getElementById('pwa-static-fallback')
  if (!el) return
  el.hidden = true
  el.setAttribute('aria-hidden', 'true')
}

registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('PWA READY')
  },
  onRegisteredSW() {
    console.log('SERVICE WORKER READY')
  },
})

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

hidePwaStaticFallback()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

requestAnimationFrame(() => hidePwaStaticFallback())
