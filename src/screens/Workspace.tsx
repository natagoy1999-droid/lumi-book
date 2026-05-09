export function Workspace() {
  return (
    <div className="px-5" style={{ paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))' }}>
      <div className="mx-auto max-w-[520px]">
        <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">Пространство</div>
        <div className="mt-1 text-[32px] font-semibold tracking-tightish text-ink-950">Рабочее пространство</div>
        <div className="mt-2 text-[12px] leading-5 text-ink-700/65">
          Структура изоляции данных по мастеру или студии подключится позже — спокойно и без суеты.
        </div>
      </div>
    </div>
  )
}

