/** Публичная онлайн-запись (без shell мастера) */
export const ROUTE_BOOK = '/book'

/** Основное приложение мастера (нижние вкладки) */
export const ROUTE_APP = '/app'

export const ROUTE_APP_TODAY = `${ROUTE_APP}/today`
export const ROUTE_APP_CALENDAR = `${ROUTE_APP}/calendar`
export const ROUTE_APP_CALENDAR_NEW = `${ROUTE_APP}/calendar/new`
export const ROUTE_APP_CLIENTS = `${ROUTE_APP}/clients`
export const ROUTE_APP_MONEY = `${ROUTE_APP}/money`
export const ROUTE_APP_SETTINGS = `${ROUTE_APP}/settings`
export const ROUTE_APP_RESCHEDULE = `${ROUTE_APP}/reschedule`

/** Экран «Сегодня» — учитываем редирект со старых ссылок */
export function isMasterTodayPath(pathname: string): boolean {
  return pathname === ROUTE_APP_TODAY || pathname === '/today'
}

export function isMasterCalendarPath(pathname: string): boolean {
  return pathname.startsWith(`${ROUTE_APP}/calendar`) || pathname.startsWith('/calendar')
}

export function isMasterClientsPath(pathname: string): boolean {
  return pathname.startsWith(ROUTE_APP_CLIENTS) || pathname === '/clients'
}

export function isMasterMoneyPath(pathname: string): boolean {
  return pathname.startsWith(ROUTE_APP_MONEY) || pathname === '/money'
}

export function isMasterReschedulePath(pathname: string): boolean {
  return pathname.startsWith(ROUTE_APP_RESCHEDULE) || pathname.startsWith('/reschedule')
}
