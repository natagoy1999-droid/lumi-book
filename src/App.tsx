import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { EmergencyMasterHome } from './screens/EmergencyMasterHome'
import { ROUTE_APP_TODAY } from './lib/appRoutes'

/**
 * Аварийный стабильный режим: без StoreProvider, auth, AppShell, GlobalMaterialSync и ожидания сессии.
 * Главные URL сразу показывают один простой экран.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmergencyMasterHome />} />
        <Route path={ROUTE_APP_TODAY} element={<EmergencyMasterHome />} />
        <Route path="/book" element={<EmergencyMasterHome />} />
        <Route path="/book/:workspace" element={<EmergencyMasterHome />} />
        <Route path="/app" element={<Navigate to={ROUTE_APP_TODAY} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
