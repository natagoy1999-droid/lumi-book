import { CalendarDays, CreditCard, Home, Settings, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '../lib/cn'

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
        'fixed bottom-0 z-[9999]',
        'px-3 pb-[env(safe-area-inset-bottom)] pt-2',
      )}
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 520,
        backgroundColor: '#FAF7EF',
        borderTop: '1px solid rgba(20,20,20,0.08)',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
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
                      isActive ? 'bg-white/80 shadow-soft' : 'bg-white/0 group-hover:bg-white/55',
                    )}
                  >
                    <Icon
                      size={20}
                      className={cn('transition', isActive ? 'text-ink-950' : 'text-ink-700/70')}
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

