import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Optional production provider.
// App must work without keys; only enable Supabase when env vars exist.

export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined

export function hasSupabaseEnv(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase env vars missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      // IMPORTANT: no auth integration yet
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
  if (import.meta.env.DEV) {
    console.log(
      'Supabase connected:',
      Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    )
  }
  return _client
}

// Database table type stubs (for future Supabase queries)
export type DbClientRow = {
  id: string
  name: string
  phone: string
  notes: string | null
  total_spent: number
  visits: number
  created_at: string
  updated_at: string
}

export type DbMasterRow = {
  id: string
  name: string
  color: 'gold' | 'ink'
  created_at: string
  updated_at: string
}

export type DbServiceRow = {
  id: string
  name: string
  minutes: number
  price: number
  created_at: string
  updated_at: string
}

export type DbBookingRow = {
  id: string
  client_id: string
  master_id: string
  service_id: string
  date_iso: string
  time: string
  price: number
  status: string
  comment: string | null
  created_at_ms: number
  // snapshots
  client_name: string | null
  client_phone: string | null
  master_name: string | null
  service_name: string | null
  service_minutes: number | null
}

export type DbMessageRow = {
  id: string
  client_id: string
  booking_id: string | null
  channel: 'sms' | 'whatsapp' | 'max'
  kind: string
  title: string
  text: string
  meta: Record<string, string> | null
  created_at_ms: number
  sent_at_ms: number
}

export type DbSettingsRow = {
  id: string
  // TODO: tie to user/org later
  work_hours: unknown
  channels: unknown
  reminders: unknown
  templates: unknown
  payments: unknown
  updated_at: string
}

export type DbSubscriptionRow = {
  id: string
  plan: string
  status: string
  trial_ends_at_ms: number | null
  selected_at_ms: number | null
  updated_at: string
}

