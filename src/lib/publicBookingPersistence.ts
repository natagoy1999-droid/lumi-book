import type { Booking, Client } from '../state/store'
import { useAuthStore } from '../store/authStore'
import { hasSupabaseEnv, getSupabaseClient } from './supabaseClient'
import { getStorageAdapter } from './storageAdapter'

const FALLBACK_KEY = 'lumi_public_booking_fallback_v1'

type FallbackBucket = {
  v: 1
  entries: Array<{ ownerUserId: string; at: number; booking: Booking; client: Client }>
}

function readFallback(): FallbackBucket {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY)
    if (!raw) return { v: 1, entries: [] }
    const p = JSON.parse(raw) as FallbackBucket
    if (!p || p.v !== 1 || !Array.isArray(p.entries)) return { v: 1, entries: [] }
    return p
  } catch {
    return { v: 1, entries: [] }
  }
}

function writeFallback(bucket: FallbackBucket) {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(bucket))
  } catch {
    // quota / private mode
  }
}

/** Visitor-safe: queues writes when cloud insert is unavailable or fails. */
export function appendPublicBookingFallback(ownerUserId: string, booking: Booking, client: Client) {
  const b = readFallback()
  b.entries.unshift({ ownerUserId, at: Date.now(), booking, client })
  writeFallback(b)
}

function bookingPayload(booking: Booking, ownerUserId: string) {
  return {
    id: booking.id,
    user_id: ownerUserId,
    client_id: booking.clientId,
    master_id: booking.masterId,
    service_id: booking.serviceId,
    client_name: booking.clientName ?? null,
    client_phone: booking.clientPhone ?? null,
    master_name: booking.masterName ?? null,
    service_name: booking.serviceName ?? null,
    service_minutes: booking.serviceMinutes ?? null,
    date_iso: booking.dateISO,
    time: booking.time,
    price: booking.price ?? 0,
    status: booking.status,
    comment: booking.comment ?? null,
    created_at_ms: booking.createdAt ?? Date.now(),
    last_nudged_at_ms: booking.lastNudgedAt ?? null,
    reschedule: booking.reschedule ?? null,
    updated_at: new Date().toISOString(),
  }
}

function clientPayload(client: Client, ownerUserId: string) {
  return {
    id: client.id,
    user_id: ownerUserId,
    name: client.name,
    phone: client.phone,
    notes: client.notes ?? null,
    total_spent: client.totalSpent ?? 0,
    visits: client.visits ?? 0,
    updated_at: new Date().toISOString(),
  }
}

/** Writes booking + client for a workspace owner (anonymous visitor OK). Supabase may reject without RLS; fallback always records locally. */
export async function persistBookingForRemoteWorkspace(opts: {
  ownerUserId: string
  booking: Booking
  client: Client
}): Promise<void> {
  const { ownerUserId, booking, client } = opts

  if (!hasSupabaseEnv()) {
    appendPublicBookingFallback(ownerUserId, booking, client)
    return
  }

  try {
    const sb = getSupabaseClient()
    const cp = clientPayload(client, ownerUserId)
    const bp = bookingPayload(booking, ownerUserId)
    const { error: ce } = await sb.from('clients').upsert(cp, { onConflict: 'id' })
    const { error: be } = await sb.from('bookings').upsert(bp, { onConflict: 'id' })
    if (ce || be) throw ce ?? be
  } catch {
    appendPublicBookingFallback(ownerUserId, booking, client)
  }
}

/** Uses logged-in workspace via StorageAdapter (local + Supabase when configured). */
export async function persistIntegratedBooking(client: Client, booking: Booking): Promise<void> {
  try {
    const adapter = getStorageAdapter()
    await adapter.saveClient(client)
    await adapter.saveBooking(booking)
  } catch {
    const uid = useAuthStore.getState().user?.id
    if (uid) appendPublicBookingFallback(uid, booking, client)
  }
}
