import { CalendarDays, CreditCard, Home, Settings, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '../lib/cn'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'

const tabs = [
  { to: '/today', label: 'Сегодня', Icon: Home },
  { to: '/calendar', label: 'Календарь', Icon: CalendarDays },
  { to: '/clients', label: 'Клиенты', Icon: Users },
  { to: '/money', label: 'Деньги', Icon: CreditCard },
  { to: '/settings', label: 'Настройки', Icon: Settings },
] as const

export function BottomTabs() {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[520px]',
        'px-3 pb-[calc(10px+var(--safe-bottom))] pt-2',
      )}
    >
      <div
        className={cn(
          'rounded-[26px] border shadow-lift',
          'ring-1 ring-black/5',
        )}
        style={{
          backdropFilter: glassBackdropFilter('ambient'),
          backgroundColor: `color-mix(in srgb, rgb(var(--material-temperature, 214 198 140)) calc(var(--ambient-material-warmth, 0.28) * 22%), ${glassFill('ambient')})`,
          borderColor: glassBorderStyle('ambient'),
        }}
      >
        <div className="grid grid-cols-5 items-stretch">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex flex-col items-center justify-center gap-1 px-1 py-3',
                  'text-[11px] tracking-tightish',
                  isActive ? 'text-ink-950' : 'text-ink-700/70',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'flex h-9 w-11 items-center justify-center rounded-2xl transition',
                      isActive
                        ? 'bg-white/60 shadow-glowGold'
                        : 'bg-white/0 group-hover:bg-white/40',
                    )}
                  >
                    <Icon
                      size={20}
                      className={cn(
                        'transition',
                        isActive ? 'text-ink-950' : 'text-ink-700/70',
                      )}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

