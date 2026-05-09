import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/supabaseClient'
import { useAuthStore } from './store/authStore'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Auth bootstrap (demo-safe): does nothing without Supabase env.
void useAuthStore.getState().bootstrap()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
