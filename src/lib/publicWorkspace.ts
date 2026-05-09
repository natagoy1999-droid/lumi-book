import type { Booking, Client, Master, Service } from '../state/store'
import { hasSupabaseEnv, getSupabaseClient } from './supabaseClient'

/** Matches slot grid used in app store `freeSlots`. */
export const DEFAULT_PUBLIC_WORK_SLOTS = [
  '10:00',
  '11:30',
  '13:00',
  '14:30',
  '16:00',
  '17:30',
  '19:00',
] as const

export type WorkspaceSnapshot = {
  masters: Master[]
  services: Service[]
  bookings: Booking[]
  clients: Client[]
}

export function parseWorkspaceParam(raw: string): { kind: 'local' } | { kind: 'remote'; ownerUserId: string } {
  const decoded = decodeURIComponent(raw).trim()
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!decoded || decoded === 'local' || decoded === 'demo') return { kind: 'local' }
  if (uuidRe.test(decoded)) return { kind: 'remote', ownerUserId: decoded }
  return { kind: 'local' }
}

export function computeFreeSlots(dateISO: string, masterId: string, bookings: Booking[]): string[] {
  const taken = new Set(
    bookings
      .filter(
        (b) =>
          b.dateISO === dateISO &&
          b.masterId === masterId &&
          b.status !== 'cancelled',
      )
      .map((b) => b.time),
  )
  return DEFAULT_PUBLIC_WORK_SLOTS.filter((t) => !taken.has(t))
}

export async function fetchWorkspaceSnapshot(ownerUserId: string): Promise<WorkspaceSnapshot | null> {
  if (!hasSupabaseEnv()) return null
  try {
    const sb = getSupabaseClient()
    const [mastersRes, servicesRes, bookingsRes, clientsRes] = await Promise.all([
      sb.from('masters').select('id,name,color,user_id').eq('user_id', ownerUserId),
      sb.from('services').select('id,name,minutes,price,user_id').eq('user_id', ownerUserId),
      sb
        .from('bookings')
        .select(
          [
            'id',
            'user_id',
            'client_id',
            'master_id',
            'service_id',
            'client_name',
            'client_phone',
            'master_name',
            'service_name',
            'service_minutes',
            'date_iso',
            'time',
            'price',
            'status',
            'comment',
            'created_at_ms',
            'last_nudged_at_ms',
            'reschedule',
          ].join(','),
        )
        .eq('user_id', ownerUserId),
      sb.from('clients').select('id,user_id,name,phone,notes,total_spent,visits').eq('user_id', ownerUserId),
    ])

    if (mastersRes.error || servicesRes.error || bookingsRes.error || clientsRes.error) {
      if (import.meta.env.DEV) {
        console.warn('fetchWorkspaceSnapshot:', mastersRes.error, servicesRes.error, bookingsRes.error, clientsRes.error)
      }
      return null
    }

    const masterRows = (mastersRes.data ?? []) as Array<{ id: string; name: string; color?: string; user_id?: string }>
    const serviceRows = (servicesRes.data ?? []) as Array<{
      id: string
      name: string
      minutes: number
      price: number
      user_id?: string
    }>
    const bookingRows = (bookingsRes.data ?? []) as unknown as Array<Record<string, unknown>>
    const clientRows = (clientsRes.data ?? []) as Array<{
      id: string
      user_id?: string
      name: string
      phone: string
      notes: string | null
      total_spent: number
      visits: number
    }>

    const masters: Master[] = masterRows.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ''),
      color: r.color === 'ink' ? 'ink' : 'gold',
    }))
    const services: Service[] = serviceRows.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ''),
      minutes: Number(r.minutes ?? 0),
      price: Number(r.price ?? 0),
    }))
    const bookings: Booking[] = bookingRows.map((r) => ({
      id: String(r.id),
      userId: r.user_id == null ? undefined : String(r.user_id),
      clientId: String(r.client_id),
      masterId: String(r.master_id),
      serviceId: String(r.service_id),
      clientName: r.client_name == null ? undefined : String(r.client_name),
      clientPhone: r.client_phone == null ? undefined : String(r.client_phone),
      masterName: r.master_name == null ? undefined : String(r.master_name),
      serviceName: r.service_name == null ? undefined : String(r.service_name),
      serviceMinutes: r.service_minutes == null ? undefined : Number(r.service_minutes),
      dateISO: String(r.date_iso),
      time: String(r.time),
      price: Number(r.price ?? 0),
      status: r.status as Booking['status'],
      comment: r.comment == null ? undefined : String(r.comment),
      createdAt: Number(r.created_at_ms ?? Date.now()),
      lastNudgedAt: r.last_nudged_at_ms == null ? undefined : Number(r.last_nudged_at_ms),
      reschedule: (r.reschedule ?? undefined) as Booking['reschedule'],
    }))
    const clients: Client[] = clientRows.map((r) => ({
      id: String(r.id),
      userId: r.user_id ?? undefined,
      name: String(r.name ?? ''),
      phone: String(r.phone ?? ''),
      notes: r.notes ?? undefined,
      totalSpent: Number(r.total_spent ?? 0),
      visits: Number(r.visits ?? 0),
    }))

    if (!masters.length || !services.length) return null
    return { masters, services, bookings, clients }
  } catch (e) {
    if (import.meta.env.DEV) console.warn('fetchWorkspaceSnapshot failed', e)
    return null
  }
}
