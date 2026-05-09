import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  isISOInClientBookingWindow,
  maxBookableDateISO,
} from '../lib/clientBookingDateWindow'
import { cn } from '../lib/cn'

const WEEKDAYS_MON_FIRST = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

function toDateISO(year: number, monthIndex: number, day: number): string {
  const mm = String(monthIndex + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function parseISOToParts(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m: m - 1, d }
}

function monthMeta(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const mondayOffset = (first.getDay() + 6) % 7
  return { daysInMonth, mondayOffset }
}

function firstDayISOOfNextMonth(year: number, monthIndex: number): string {
  const nm = monthIndex + 1
  if (nm > 11) return toDateISO(year + 1, 0, 1)
  return toDateISO(year, nm, 1)
}

function ymOrder(y: number, m: number): number {
  return y * 12 + m
}

type Props = {
  /** «Сегодня» для окна записи и подсветки текущего дня */
  anchorTodayISO: string
  selectedDateISO: string
  onSelectDate: (iso: string) => void
  className?: string
}

export function BookingMonthCalendar({
  anchorTodayISO,
  selectedDateISO,
  onSelectDate,
  className,
}: Props) {
  const maxISO = useMemo(() => maxBookableDateISO(anchorTodayISO), [anchorTodayISO])
  const todayParts = useMemo(() => parseISOToParts(anchorTodayISO), [anchorTodayISO])

  const [viewY, setViewY] = useState(() => parseISOToParts(selectedDateISO).y)
  const [viewM, setViewM] = useState(() => parseISOToParts(selectedDateISO).m)

  useEffect(() => {
    const { y, m } = parseISOToParts(selectedDateISO)
    setViewY(y)
    setViewM(m)
  }, [selectedDateISO])

  const monthTitle = useMemo(() => {
    const raw = new Date(viewY, viewM, 1).toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric',
    })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }, [viewY, viewM])

  const canGoPrev = ymOrder(viewY, viewM) > ymOrder(todayParts.y, todayParts.m)

  const firstNextMonthISO = useMemo(
    () => firstDayISOOfNextMonth(viewY, viewM),
    [viewY, viewM],
  )
  const canGoNext = firstNextMonthISO <= maxISO

  const cells = useMemo(() => {
    const { daysInMonth, mondayOffset } = monthMeta(viewY, viewM)
    const list: (number | null)[] = []
    for (let i = 0; i < mondayOffset; i++) list.push(null)
    for (let day = 1; day <= daysInMonth; day++) list.push(day)
    while (list.length % 7 !== 0) list.push(null)
    return list
  }, [viewY, viewM])

  const goPrev = () => {
    if (!canGoPrev) return
    if (viewM === 0) {
      setViewY((y) => y - 1)
      setViewM(11)
    } else {
      setViewM((m) => m - 1)
    }
  }

  const goNext = () => {
    if (!canGoNext) return
    if (viewM === 11) {
      setViewY((y) => y + 1)
      setViewM(0)
    } else {
      setViewM((m) => m + 1)
    }
  }

  return (
    <div
      className={cn('mx-auto w-full max-w-[340px] lumi-card p-4 rounded-[24px]', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Предыдущий месяц"
          disabled={!canGoPrev}
          onClick={goPrev}
          className={cn(
            'inline-flex h-11 min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-2xl border border-white/60 bg-white/75 text-ink-900 shadow-soft transition',
            canGoPrev
              ? 'hover:border-white/75 hover:bg-white/92 active:scale-[var(--press-scale,0.98)]'
              : 'cursor-not-allowed opacity-35',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-surface)]',
          )}
        >
          <ChevronLeft size={20} strokeWidth={2} className="text-gold-500/90" />
        </button>
        <div className="min-w-0 flex-1 text-center text-[15px] font-semibold tracking-tight text-ink-950">
          {monthTitle}
        </div>
        <button
          type="button"
          aria-label="Следующий месяц"
          disabled={!canGoNext}
          onClick={goNext}
          className={cn(
            'inline-flex h-11 min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-2xl border border-white/60 bg-white/75 text-ink-900 shadow-soft transition',
            canGoNext
              ? 'hover:border-white/75 hover:bg-white/92 active:scale-[var(--press-scale,0.98)]'
              : 'cursor-not-allowed opacity-35',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-surface)]',
          )}
        >
          <ChevronRight size={20} strokeWidth={2} className="text-gold-500/90" />
        </button>
      </div>

      <div
        className="mt-4 grid grid-cols-7 gap-y-1 gap-x-0.5 text-center"
        role="grid"
        aria-label="Календарь"
      >
        {WEEKDAYS_MON_FIRST.map((w) => (
          <div
            key={w}
            className="pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-700/45"
            role="columnheader"
          >
            {w}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day == null) {
            return <div key={`e-${idx}`} className="min-h-[44px]" aria-hidden />
          }
          const iso = toDateISO(viewY, viewM, day)
          const inWindow = isISOInClientBookingWindow(iso, anchorTodayISO)
          const isToday = iso === anchorTodayISO
          const isSelected = iso === selectedDateISO

          if (!inWindow) {
            return (
              <div
                key={iso}
                className="flex min-h-[44px] items-center justify-center rounded-xl text-[14px] font-medium text-ink-700/28"
                aria-disabled
              >
                {day}
              </div>
            )
          }

          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              aria-pressed={isSelected}
              aria-label={`${day}, ${iso}`}
              onClick={() => onSelectDate(iso)}
              className={cn(
                'flex min-h-[44px] touch-manipulation items-center justify-center rounded-xl text-[14px] font-medium transition-[transform,box-shadow,background-color,border-color] duration-200',
                isSelected &&
                  'border-[1.5px] border-gold-400/65 bg-gradient-to-b from-gold-200/42 to-[var(--lumi-surface)] text-ink-950 shadow-[0_10px_28px_rgba(198,161,91,0.22)]',
                !isSelected &&
                  'border border-transparent bg-white/35 text-ink-950 hover:border-white/50 hover:bg-white/65 active:scale-[var(--press-scale,0.98)]',
                isToday &&
                  !isSelected &&
                  'ring-2 ring-gold-400/48 ring-offset-2 ring-offset-[var(--lumi-surface)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-surface)]',
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
