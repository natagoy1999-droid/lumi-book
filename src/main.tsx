import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'

import './index.css'
import './lib/supabaseClient'
import { useAuthStore } from './store/authStore'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Auth bootstrap (demo-safe): does nothing without Supabase env.
void useAuthStore.getState().bootstrap()

/** Temporarily off: service worker + precache caused blank / stale shells on some mobile Safari. Re-enable after stability pass. */
const LUMI_ENABLE_SERVICE_WORKER = false
if (LUMI_ENABLE_SERVICE_WORKER) {
  void registerSW({ immediate: true })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
