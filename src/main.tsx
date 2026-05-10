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

/** workbox-window: discover updates early; SW uses skipWaiting + clientsClaim (see vite.config). */
void registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
