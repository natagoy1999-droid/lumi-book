/**
 * Аварийный экран: без стора, auth, анимаций и тяжёлой оболочки — только статичная разметка.
 */
export function EmergencyMasterHome() {
  return (
    <main
      className="lumi-page"
      style={{
        boxSizing: 'border-box',
        maxWidth: 520,
        margin: '0 auto',
        padding: 'max(1.25rem, env(safe-area-inset-top)) 1.25rem max(2rem, env(safe-area-inset-bottom))',
        minHeight: 'auto',
      }}
    >
      <h1 className="lumi-page-title">Главная мастера</h1>
      <p className="lumi-secondary mt-4">
        LUMI BOOK открыт в упрощённом режиме для стабильной работы на телефоне.
      </p>
    </main>
  )
}
