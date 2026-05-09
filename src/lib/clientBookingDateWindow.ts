/**
 * Public / client online booking: dates must fall in [today, today + CLIENT_BOOKING_MAX_OFFSET] (inclusive).
 * ISO strings sort chronologically as strings.
 */
export const CLIENT_BOOKING_MAX_OFFSET = 30

export function addDaysISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + delta)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export function buildClientBookingDateList(fromTodayISO: string): string[] {
  return Array.from({ length: CLIENT_BOOKING_MAX_OFFSET + 1 }, (_, i) => addDaysISO(fromTodayISO, i))
}

export function maxBookableDateISO(fromTodayISO: string): string {
  return addDaysISO(fromTodayISO, CLIENT_BOOKING_MAX_OFFSET)
}

export function isISOInClientBookingWindow(dateISO: string, fromTodayISO: string): boolean {
  const max = maxBookableDateISO(fromTodayISO)
  return dateISO >= fromTodayISO && dateISO <= max
}

export function clampDateToClientBookingWindow(dateISO: string, fromTodayISO: string): string {
  const max = maxBookableDateISO(fromTodayISO)
  if (dateISO < fromTodayISO) return fromTodayISO
  if (dateISO > max) return max
  return dateISO
}
