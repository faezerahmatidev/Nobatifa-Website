-- Nobatifa core schema (Phase 2).
-- Evidence: src/app/data-access/models.ts + mock gateways + UserFlow.
-- Tables, keys, constraints, indexes only. RLS/policies arrive in Phase 4.
-- NOT applied to any database. Requires PostgreSQL 14+ (Supabase-managed).

-- Profiles: 1:1 with auth.users(id). Mobile is the login identity.
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  mobile text NOT NULL UNIQUE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Service centers, found publicly by code (e.g. 1001).
CREATE TABLE service_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User-owned vehicles with 4-part Iranian plate.
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  type text NOT NULL,
  plate_part1 text NOT NULL,
  plate_part2 text NOT NULL,
  plate_letter text NOT NULL,
  plate_iran_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicles_plate_complete CHECK (
    plate_part1 <> '' AND plate_part2 <> '' AND plate_letter <> '' AND plate_iran_code <> ''
  ),
  CONSTRAINT vehicles_owner_plate_unique UNIQUE (
    owner_id, plate_part1, plate_part2, plate_letter, plate_iran_code
  )
);
CREATE INDEX vehicles_owner_id_idx ON vehicles (owner_id);

-- Bookable days per center. Dates are Jalali display strings (see docs/database.md §2).
CREATE TABLE booking_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES service_centers (id) ON DELETE CASCADE,
  weekday text NOT NULL,
  date text NOT NULL,
  CONSTRAINT booking_days_center_date_unique UNIQUE (center_id, date)
);
CREATE INDEX booking_days_center_id_idx ON booking_days (center_id);

-- Bookable times per day.
CREATE TABLE time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES booking_days (id) ON DELETE CASCADE,
  time text NOT NULL,
  status text NOT NULL DEFAULT 'available'
    CONSTRAINT time_slots_status_check CHECK (status IN ('available', 'closed', 'reserved')),
  CONSTRAINT time_slots_day_time_unique UNIQUE (day_id, time)
);
CREATE INDEX time_slots_day_id_idx ON time_slots (day_id);

-- User bookings. One booking per slot; status is read-only for the user app.
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  center_id uuid NOT NULL REFERENCES service_centers (id),
  vehicle_id uuid NOT NULL REFERENCES vehicles (id),
  slot_id uuid NOT NULL UNIQUE REFERENCES time_slots (id),
  date text NOT NULL,
  time text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CONSTRAINT appointments_status_check CHECK (status IN ('pending', 'done', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX appointments_user_id_created_at_idx ON appointments (user_id, created_at DESC);
CREATE INDEX appointments_center_id_idx ON appointments (center_id);

-- Immutable service record per appointment (snapshots survive later profile edits).
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL UNIQUE REFERENCES appointments (id) ON DELETE CASCADE,
  tracking_code text NOT NULL UNIQUE,
  customer_first_name text NOT NULL,
  customer_last_name text NOT NULL,
  customer_mobile text NOT NULL,
  vehicle_type text NOT NULL,
  plate_part1 text NOT NULL,
  plate_part2 text NOT NULL,
  plate_letter text NOT NULL,
  plate_iran_code text NOT NULL,
  service_center_name text NOT NULL,
  date_time text NOT NULL,
  mileage_km integer NOT NULL CONSTRAINT invoices_mileage_check CHECK (mileage_km >= 0),
  next_mileage_km integer NOT NULL CONSTRAINT invoices_next_mileage_check CHECK (next_mileage_km >= 0),
  oil_type text NOT NULL,
  total_rial bigint NOT NULL CONSTRAINT invoices_total_check CHECK (total_rial >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
  title text NOT NULL,
  amount_rial bigint NOT NULL CONSTRAINT invoice_items_amount_check CHECK (amount_rial >= 0)
);
CREATE INDEX invoice_items_invoice_id_idx ON invoice_items (invoice_id);
