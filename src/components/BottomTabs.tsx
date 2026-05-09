import { CalendarDays, CreditCard, Home, Settings, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '../lib/cn'
import { z } from '../theme/elevation'

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
      className="fixed bottom-0 left-1/2 flex w-full max-w-[520px] -translate-x-1/2 justify-center px-3 pb-[env(safe-area-inset-bottom)] pt-1"
      style={{
        zIndex: z.tabs,
        pointerEvents: 'none',
      }}
    >
      <div
        className="pointer-events-auto w-full rounded-t-[26px] border border-b-0 pt-2 shadow-dock"
        style={{
          backgroundColor: 'var(--lumi-bg)',
          borderColor: 'var(--lumi-border)',
          boxShadow:
            '0 -14px 42px rgba(23, 23, 23, 0.07), inset 0 1px 0 rgba(255, 253, 248, 0.95)',
        }}
      >
        <div className="mx-auto max-w-[520px] px-1 pb-2">
          <div className="grid grid-cols-5 items-stretch">
            {tabs.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'group flex flex-col items-center justify-center gap-1.5 px-1 py-2.5',
                    'text-[14px] font-medium tracking-tight transition-colors duration-200',
                    isActive ? 'text-ink-950' : 'text-ink-700/58',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        'flex h-10 w-12 items-center justify-center rounded-2xl transition-[background-color,box-shadow,transform,border-color] duration-200 ease-out active:scale-[var(--press-scale,0.99)]',
                        isActive
                          ? 'border border-gold-300/50 bg-[var(--lumi-surface)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_8px_22px_rgba(23,23,23,0.06)]'
                          : 'border border-transparent bg-transparent group-hover:bg-white/50',
                      )}
                    >
                      <Icon
                        size={22}
                        className={cn(
                          'transition-[color,opacity] duration-200 ease-out',
                          isActive ? 'text-gold-400' : 'text-ink-800/72',
                        )}
                        strokeWidth={1.85}
                      />
                    </div>
                    <span className="leading-none">{label}</span>
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
