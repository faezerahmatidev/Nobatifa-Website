-- Nobatifa RLS and least-privilege access (Phase 4).
-- Applies on top of 20261012000000_core_schema.sql.
-- RLS alone is NOT sufficient: integrity already enforced by UNIQUE/CHECK/FK
-- constraints in the core migration; this file adds ownership protection.
-- service_role bypasses RLS by design and is reserved for service-side/admin
-- contexts only. It must NEVER enter browser code.
-- NOT applied to any database (no live project yet).

-- ---------------------------------------------------------------- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON profiles FROM anon, authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE (first_name, last_name) ON profiles TO authenticated;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
-- Mobile is the login identity: users may read it but never change it
-- (no app flow edits mobile; see docs/database.md).
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Auto-create the profile on signup (phone-only product). No user-side
-- INSERT grant exists, so forged profiles are impossible.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, mobile)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------- centers, days, slots (public read)
-- Evidence: home search and center pages are unguarded routes.
ALTER TABLE service_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON service_centers, booking_days, time_slots FROM anon, authenticated;
GRANT SELECT ON service_centers, booking_days, time_slots TO anon, authenticated;

CREATE POLICY service_centers_read ON service_centers
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY booking_days_read ON booking_days
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY time_slots_read ON time_slots
  FOR SELECT TO anon, authenticated USING (true);

-- ---------------------------------------------------------------- vehicles
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON vehicles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicles TO authenticated;

CREATE POLICY vehicles_owner_all ON vehicles
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ------------------------------------------------------------ appointments
-- The user app has no cancel/edit UI: owners get SELECT + INSERT only.
-- Slot-availability enforcement arrives with the reserve transaction (Phase 7);
-- UNIQUE(slot_id) already blocks double booking at the constraint level.
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON appointments FROM anon, authenticated;
GRANT SELECT, INSERT ON appointments TO authenticated;

CREATE POLICY appointments_select_own ON appointments
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY appointments_insert_own ON appointments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ---------------------------------------- invoices + items (owner read only)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON invoices, invoice_items FROM anon, authenticated;
GRANT SELECT ON invoices, invoice_items TO authenticated;

CREATE POLICY invoices_select_own ON invoices
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = invoices.appointment_id
        AND appointments.user_id = auth.uid()
    )
  );
CREATE POLICY invoice_items_select_own ON invoice_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN appointments ON appointments.id = invoices.appointment_id
      WHERE invoices.id = invoice_items.invoice_id
        AND appointments.user_id = auth.uid()
    )
  );
