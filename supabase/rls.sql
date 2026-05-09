/*
  LUMI BOOK — Supabase RLS policies (production-ready baseline)

  What this file does
  - Enables Row Level Security (RLS) on:
    - public.clients
    - public.bookings
  - Adds policies so authenticated users can only read/write their own rows:
    rule: user_id = auth.uid()

  How to apply in Supabase
  - Open Supabase Dashboard → SQL Editor
  - Create a new query, paste the whole file, Run
  - Recommended: run in a non-production project first

  Important notes
  - Demo/local mode in the app is unaffected because it uses localStorage fallback when not authenticated.
  - These policies intentionally do NOT allow anonymous access.

  Rollback (if needed)
  - You can drop the policies and disable RLS:
      ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "clients_select_own"  ON public.clients;
      DROP POLICY IF EXISTS "clients_insert_own"  ON public.clients;
      DROP POLICY IF EXISTS "clients_update_own"  ON public.clients;
      DROP POLICY IF EXISTS "clients_delete_own"  ON public.clients;
      DROP POLICY IF EXISTS "bookings_select_own" ON public.bookings;
      DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
      DROP POLICY IF EXISTS "bookings_update_own" ON public.bookings;
      DROP POLICY IF EXISTS "bookings_delete_own" ON public.bookings;

  TODO (future tables)
  - masters: enforce workspace ownership (user_id) and consider sharing within a workspace
  - services: same as masters
  - subscriptions: protect billing state per user/workspace + admin override flow
*/

-- Ensure tables exist before running. If your schema differs, adjust "public" and table/column names.

BEGIN;

-- 1) Enable RLS
ALTER TABLE public.clients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 2) Clients policies
DROP POLICY IF EXISTS "clients_select_own" ON public.clients;
CREATE POLICY "clients_select_own"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "clients_insert_own" ON public.clients;
CREATE POLICY "clients_insert_own"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "clients_update_own" ON public.clients;
CREATE POLICY "clients_update_own"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "clients_delete_own" ON public.clients;
CREATE POLICY "clients_delete_own"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 3) Bookings policies
DROP POLICY IF EXISTS "bookings_select_own" ON public.bookings;
CREATE POLICY "bookings_select_own"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
CREATE POLICY "bookings_insert_own"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "bookings_update_own" ON public.bookings;
CREATE POLICY "bookings_update_own"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "bookings_delete_own" ON public.bookings;
CREATE POLICY "bookings_delete_own"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

COMMIT;

