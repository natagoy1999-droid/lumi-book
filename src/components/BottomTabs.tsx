import { CalendarDays, CreditCard, Home, Settings, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import {
  ROUTE_APP_CALENDAR,
  ROUTE_APP_CLIENTS,
  ROUTE_APP_MONEY,
  ROUTE_APP_SETTINGS,
  ROUTE_APP_TODAY,
} from '../lib/appRoutes'
import { cn } from '../lib/cn'
import { z } from '../theme/elevation'

const tabs = [
  { to: ROUTE_APP_TODAY, label: 'Главная', Icon: Home },
  { to: ROUTE_APP_CALENDAR, label: 'Записи', Icon: CalendarDays },
  { to: ROUTE_APP_CLIENTS, label: 'Клиенты', Icon: Users },
  { to: ROUTE_APP_MONEY, label: 'Деньги', Icon: CreditCard },
  { to: ROUTE_APP_SETTINGS, label: 'Настройки', Icon: Settings },
] as const

export function BottomTabs() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 flex w-full max-w-[520px] -translate-x-1/2 justify-center px-3 pb-[env(safe-area-inset-bottom)] pt-1"
      style={{
        zIndex: z.tabs,
        pointerEvents: 'none',
      }}
    >
      <div
        className="pointer-events-auto w-full rounded-t-[28px] border-[1.5px] border-b-0 border-gold-400/35 bg-[var(--lumi-surface)] pt-2 shadow-dock"
        style={{
          boxShadow:
            '0 -14px 48px rgba(23,23,23,0.12), 0 -6px 22px rgba(198,161,91,0.16), inset 0 1px 0 rgba(255,253,248,0.98)',
        }}
      >
        <div className="mx-auto max-w-[520px] px-1.5 pb-2.5 pt-1">
          <div className="grid grid-cols-5 items-stretch">
            {tabs.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'group flex flex-col items-center justify-center gap-1.5 px-0.5 py-2',
                    'text-[14px] font-medium tracking-tight transition-colors duration-200',
                    isActive ? 'text-ink-950' : 'text-ink-800/58',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        'flex h-11 w-[52px] items-center justify-center rounded-2xl transition-[background-color,box-shadow,transform,border-color] duration-200 ease-out active:scale-[var(--press-scale,0.99)]',
                        isActive
                          ? 'border-[1.5px] border-gold-400/60 bg-gradient-to-b from-gold-200/40 to-[var(--lumi-surface)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_22px_rgba(198,161,91,0.22)]'
                          : 'border-[1.5px] border-transparent bg-transparent group-hover:border-gold-400/20 group-hover:bg-white/40',
                      )}
                    >
                      <Icon
                        size={23}
                        className={cn(
                          'transition-[color,opacity] duration-200 ease-out',
                          isActive ? 'text-gold-400' : 'text-ink-900/78',
                        )}
                        strokeWidth={2}
                      />
                    </div>
                    <span className={cn('leading-none', isActive && 'font-semibold text-ink-950')}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
