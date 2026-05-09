import type { Booking, Client, Master, Service, SubscriptionState, AppSettings } from '../state/store'
import { hasSupabaseEnv, getSupabaseClient } from './supabaseClient'
import { useAuthStore } from '../store/authStore'

export type StorageAdapter = {
  // Clients
  getClients: () => Promise<Client[]>
  saveClient: (client: Client) => Promise<void>
  deleteClient: (clientId: string) => Promise<void>

  // Bookings
  getBookings: () => Promise<Booking[]>
  saveBooking: (booking: Booking) => Promise<void>
  deleteBooking: (bookingId: string) => Promise<void>

  // Services
  getServices: () => Promise<Service[]>
  saveService: (service: Service) => Promise<void>
  deleteService: (serviceId: string) => Promise<void>

  // Masters
  getMasters: () => Promise<Master[]>
  saveMaster: (master: Master) => Promise<void>
  deleteMaster: (masterId: string) => Promise<void>

  // Settings
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<void>

  // Subscription
  getSubscription: () => Promise<SubscriptionState>
  saveSubscription: (subscription: SubscriptionState) => Promise<void>
}

type StoreShape = {
  v: 1
  state: {
    masters: Master[]
    services: Service[]
    clients: Client[]
    bookings: Booking[]
    events: any[]
    onboardingDone: boolean
    settings: AppSettings
    subscription: SubscriptionState
  }
}

const STORE_KEY = 'lumi_store_v1'

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota/private mode
  }
}

function ensureStore(): StoreShape | null {
  const s = readJson<Partial<StoreShape>>(STORE_KEY)
  if (!s || s.v !== 1 || !s.state) return null
  return s as StoreShape
}

function upsertById<T extends { id: string }>(list: T[], item: T) {
  const exists = list.some((x) => x.id === item.id)
  return exists ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list]
}

export class LocalStorageAdapter implements StorageAdapter {
  async getClients() {
    return ensureStore()?.state.clients ?? []
  }
  async saveClient(client: Client) {
    const s = ensureStore()
    if (!s) return
    s.state.clients = upsertById(s.state.clients, client)
    writeJson(STORE_KEY, s)
  }
  async deleteClient(clientId: string) {
    const s = ensureStore()
    if (!s) return
    s.state.clients = s.state.clients.filter((c) => c.id !== clientId)
    writeJson(STORE_KEY, s)
  }

  async getBookings() {
    return ensureStore()?.state.bookings ?? []
  }
  async saveBooking(booking: Booking) {
    const s = ensureStore()
    if (!s) return
    s.state.bookings = upsertById(s.state.bookings, booking)
    writeJson(STORE_KEY, s)
  }
  async deleteBooking(bookingId: string) {
    const s = ensureStore()
    if (!s) return
    s.state.bookings = s.state.bookings.filter((b) => b.id !== bookingId)
    writeJson(STORE_KEY, s)
  }

  async getServices() {
    return ensureStore()?.state.services ?? []
  }
  async saveService(service: Service) {
    const s = ensureStore()
    if (!s) return
    s.state.services = upsertById(s.state.services, service)
    writeJson(STORE_KEY, s)
  }
  async deleteService(serviceId: string) {
    const s = ensureStore()
    if (!s) return
    s.state.services = s.state.services.filter((x) => x.id !== serviceId)
    writeJson(STORE_KEY, s)
  }

  async getMasters() {
    return ensureStore()?.state.masters ?? []
  }
  async saveMaster(master: Master) {
    const s = ensureStore()
    if (!s) return
    s.state.masters = upsertById(s.state.masters, master)
    writeJson(STORE_KEY, s)
  }
  async deleteMaster(masterId: string) {
    const s = ensureStore()
    if (!s) return
    s.state.masters = s.state.masters.filter((x) => x.id !== masterId)
    writeJson(STORE_KEY, s)
  }

  async getSettings() {
    return ensureStore()?.state.settings as AppSettings
  }
  async saveSettings(settings: AppSettings) {
    const s = ensureStore()
    if (!s) return
    s.state.settings = settings
    writeJson(STORE_KEY, s)
  }

  async getSubscription() {
    return ensureStore()?.state.subscription as SubscriptionState
  }
  async saveSubscription(subscription: SubscriptionState) {
    const s = ensureStore()
    if (!s) return
    s.state.subscription = subscription
    writeJson(STORE_KEY, s)
  }
}

export class SupabaseAdapter implements StorageAdapter {
  // Optional production provider.
  // IMPORTANT: no auth yet, no migration yet — this is a skeleton foundation.
  // TODO(RLS): enable Row Level Security and add policies:
  // - clients: user_id = auth.uid()
  // - bookings: user_id = auth.uid()
  // Keep client ready for TODO queries.
  private sb = getSupabaseClient()
  private local = new LocalStorageAdapter()
  private loggedWorkspace = false

  private currentUserId(): string | null {
    const u = useAuthStore.getState().user
    const id = u?.id ?? null
    if (import.meta.env.DEV && id && !this.loggedWorkspace) {
      this.loggedWorkspace = true
      console.log('Workspace isolated mode active')
      console.log('Workspace user id:', id)
    }
    return id
  }

  async getClients() {
    // Always keep local fallback.
    const localClients = await this.local.getClients()
    const userId = this.currentUserId()
    if (!userId) return localClients
    try {
      const { data, error } = await this.sb
        .from('clients')
        .select('id,user_id,name,phone,notes,total_spent,visits')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      if (error) throw error
      const rows = (data ?? []) as Array<{
        id: string
        user_id: string
        name: string
        phone: string
        notes: string | null
        total_spent: number
        visits: number
      }>
      const clients: Client[] = rows.map((r) => ({
        id: r.id,
        userId: r.user_id ?? undefined,
        name: r.name ?? '',
        phone: r.phone ?? '',
        notes: r.notes ?? undefined,
        totalSpent: Number(r.total_spent ?? 0),
        visits: Number(r.visits ?? 0),
      }))
      if (import.meta.env.DEV) console.log('Supabase clients loaded')
      // Sync local for offline fallback.
      for (const c of clients) {
        // eslint-disable-next-line no-await-in-loop
        await this.local.saveClient(c)
      }
      return clients.length ? clients : localClients
    } catch {
      return localClients
    }
  }
  async saveClient(client: Client) {
    // Always save locally (offline fallback).
    const userId = this.currentUserId()
    const localClient = userId ? { ...client, userId } : client
    await this.local.saveClient(localClient)
    if (!userId) return
    try {
      const payload = {
        id: client.id,
        user_id: userId,
        name: client.name,
        phone: client.phone,
        notes: client.notes ?? null,
        total_spent: client.totalSpent ?? 0,
        visits: client.visits ?? 0,
        updated_at: new Date().toISOString(),
      }
      const { error } = await this.sb.from('clients').upsert(payload, { onConflict: 'id' })
      if (error) throw error
      if (import.meta.env.DEV) console.log('Client saved to Supabase')
    } catch {
      // ignore; local already saved
    }
  }
  async deleteClient(clientId: string) {
    await this.local.deleteClient(clientId)
    const userId = this.currentUserId()
    if (!userId) return
    try {
      const { error } = await this.sb
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', userId)
      if (error) throw error
    } catch {
      // ignore; local already updated
    }
  }

  async getBookings() {
    const localBookings = await this.local.getBookings()
    const userId = this.currentUserId()
    if (!userId) return localBookings
    try {
      const { data, error } = await this.sb
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
        .eq('user_id', userId)
        .order('created_at_ms', { ascending: false })
      if (error) throw error
      const rows = (data ?? []) as Array<Record<string, any>>
      const bookings: Booking[] = rows.map((r) => ({
        id: String(r.id),
        userId: r.user_id ?? undefined,
        clientId: String(r.client_id),
        masterId: String(r.master_id),
        serviceId: String(r.service_id),
        clientName: r.client_name ?? undefined,
        clientPhone: r.client_phone ?? undefined,
        masterName: r.master_name ?? undefined,
        serviceName: r.service_name ?? undefined,
        serviceMinutes: r.service_minutes == null ? undefined : Number(r.service_minutes),
        dateISO: String(r.date_iso),
        time: String(r.time),
        price: Number(r.price ?? 0),
        status: r.status as any,
        comment: r.comment ?? undefined,
        createdAt: Number(r.created_at_ms ?? Date.now()),
        lastNudgedAt: r.last_nudged_at_ms == null ? undefined : Number(r.last_nudged_at_ms),
        reschedule: r.reschedule ?? undefined,
      }))
      if (import.meta.env.DEV) console.log('Supabase bookings loaded')
      for (const b of bookings) {
        // eslint-disable-next-line no-await-in-loop
        await this.local.saveBooking(b)
      }
      return bookings.length ? bookings : localBookings
    } catch {
      return localBookings
    }
  }
  async saveBooking(booking: Booking) {
    const userId = this.currentUserId()
    const localBooking = userId ? { ...booking, userId } : booking
    await this.local.saveBooking(localBooking)
    if (!userId) return
    try {
      const payload: Record<string, any> = {
        id: booking.id,
        user_id: userId,
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
      const { error } = await this.sb.from('bookings').upsert(payload, { onConflict: 'id' })
      if (error) throw error
      if (import.meta.env.DEV) console.log('Booking saved to Supabase')
    } catch {
      // ignore; local already saved
    }
  }
  async deleteBooking(bookingId: string) {
    await this.local.deleteBooking(bookingId)
    const userId = this.currentUserId()
    if (!userId) return
    try {
      const { error } = await this.sb
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', userId)
      if (error) throw error
    } catch {
      // ignore; local already updated
    }
  }

  async getServices() {
    // TODO: return (await this.sb.from('services').select('*')).data
    void this.sb
    return []
  }
  async saveService(_service: Service) {}
  async deleteService(_serviceId: string) {}

  async getMasters() {
    // TODO: return (await this.sb.from('masters').select('*')).data
    void this.sb
    return []
  }
  async saveMaster(_master: Master) {}
  async deleteMaster(_masterId: string) {}

  async getSettings(): Promise<AppSettings> {
    // TODO: load from per-user settings row
    throw new Error('SupabaseAdapter.getSettings not implemented')
  }
  async saveSettings(_settings: AppSettings) {}

  async getSubscription(): Promise<SubscriptionState> {
    // TODO: load from subscription table
    throw new Error('SupabaseAdapter.getSubscription not implemented')
  }
  async saveSubscription(_subscription: SubscriptionState) {}
}

export function getStorageAdapter(kind: 'local' | 'supabase' = 'local'): StorageAdapter {
  // Supabase is enabled only when env vars exist.
  if (kind === 'supabase' && hasSupabaseEnv()) return new SupabaseAdapter()
  if (kind === 'supabase' && !hasSupabaseEnv()) return new LocalStorageAdapter()
  // Auto mode: when keys exist, prefer Supabase.
  if (kind === 'local' && hasSupabaseEnv()) return new SupabaseAdapter()
  return new LocalStorageAdapter()
}

