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
      className={cn(
        'fixed bottom-0',
        'px-3 pb-[env(safe-area-inset-bottom)] pt-2',
      )}
      style={{
        zIndex: z.tabs,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 520,
        backgroundColor: 'rgba(250, 247, 239, 0.94)',
        borderTop: '1px solid rgba(198, 165, 106, 0.14)',
        boxShadow:
          '0 -12px 40px rgba(17, 17, 17, 0.08), 0 -1px 0 rgba(198, 165, 106, 0.1), inset 0 1px 0 rgba(255, 253, 248, 0.85)',
      }}
    >
      <div className="mx-auto max-w-[520px]">
        <div className="grid grid-cols-5 items-stretch">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex flex-col items-center justify-center gap-1 px-1 py-3',
                  'text-[13px] tracking-tightish transition-colors duration-200',
                  isActive ? 'text-ink-950' : 'text-ink-700/52',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'flex h-9 w-11 items-center justify-center rounded-2xl transition-[background-color,box-shadow,transform] duration-200 ease-out active:scale-[var(--press-scale,0.99)]',
                      isActive
                        ? 'bg-[#FFFCF8] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_6px_20px_rgba(17,17,17,0.07)] ring-1 ring-gold-300/45'
                        : 'bg-white/0 group-hover:bg-white/50',
                    )}
                  >
                    <Icon
                      size={21}
                      className={cn(
                        'transition-[color,transform,opacity] duration-200 ease-out',
                        isActive ? 'text-ink-950' : 'text-ink-700/55',
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

