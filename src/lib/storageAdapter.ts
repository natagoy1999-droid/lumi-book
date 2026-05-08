import type { Booking, Client, Master, Service, SubscriptionState, AppSettings } from '../state/store'

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
  // TODO: wire Supabase client (no keys here)
  // TODO: replace localStorage reads with Supabase tables
  async getClients() { return [] }
  async saveClient(_client: Client) {}
  async deleteClient(_clientId: string) {}

  async getBookings() { return [] }
  async saveBooking(_booking: Booking) {}
  async deleteBooking(_bookingId: string) {}

  async getServices() { return [] }
  async saveService(_service: Service) {}
  async deleteService(_serviceId: string) {}

  async getMasters() { return [] }
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
  return kind === 'supabase' ? new SupabaseAdapter() : new LocalStorageAdapter()
}

