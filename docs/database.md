# Nobatifa Database Design (Phase 2 — evidence-based)

Date: 2026-10-12. Source of truth: `src/app/data-access/models.ts`, mock gateways, `Nobatifa-UserFlow/website.png`.
No business rules invented; open points are listed in §7.

## 1. Entities and mapping

| Table | Evidence | Purpose |
| ----- | -------- | ------- |
| `profiles` | `User` + `completeProfile` + `Session` | App profile 1:1 with `auth.users`; mobile is the login identity. |
| `service_centers` | `ServiceCenter`, `searchCenter(code)` | Centers found by public `code` (e.g. `1001`). |
| `vehicles` | `Vehicle` + `CarsGateway` list/create/update/remove | User-owned vehicles with 4-part Iranian plate. |
| `booking_days` | `BookingDay`, 14-day strip in mock | Bookable days per center. |
| `time_slots` | `TimeSlot(status)`, slot grid | Bookable times per day; `available\|closed\|reserved`. |
| `appointments` | `Appointment`, reserve creates `pending` | User bookings; statuses `pending\|done\|cancelled` are display-only in this app. |
| `invoices` | `Invoice` per appointment | Immutable service record (snapshot, totals, mileage). |
| `invoice_items` | `InvoiceItem[]` | Line items of an invoice. |

## 2. Key design decisions

1. **Profiles keyed by `auth.users.id`** (`uuid`, PK + FK). The app login identity is the mobile number → `profiles.mobile` is `UNIQUE NOT NULL`; `auth.users.phone` holds the same value.
2. **Jalali date/time stored as `TEXT`** (`booking_days.date` like `01/11`, `appointments.date` like `1404/01/24`, times like `13:20`). The UI displays these strings verbatim (Persian digits are a presentation concern). No Gregorian conversion is evidenced — do not invent one. Zero-padded formats keep lexicographic ordering valid.
3. **Appointments reference + snapshot**: `appointments` holds FKs (`user_id`, `center_id`, `vehicle_id`, `slot_id`) for integrity; `invoices` additionally snapshot customer/center names because an invoice is an immutable record that must survive later profile edits.
4. **Status as `TEXT + CHECK`** (not enum): matches the app's string unions and stays extensible without `ALTER TYPE`.
5. **No user-side appointment mutation evidenced**: the app has no cancel/edit UI, so users get `SELECT` + `INSERT` on appointments only. Status transitions (`pending → done/cancelled`) are owned by the service side (future admin scope) — see §7.

## 3. Ownership and access requirements (enforced via RLS in Phase 4)

- `profiles`: owner read/update own row only (by `auth.uid()`).
- `vehicles`: owner full CRUD on own rows only.
- `appointments`: owner `SELECT` own rows; `INSERT` own rows subject to booking rules (§5). No user `UPDATE`/`DELETE`.
- `invoices` / `invoice_items`: owner `SELECT` via appointment ownership. Inserts by service side only.
- `service_centers` / `booking_days` / `time_slots`: public read; writes service-side only.

## 4. Schema (also in `supabase/migrations/20261012000000_core_schema.sql`)

- `profiles(id uuid PK/FK→auth.users, mobile text UNIQUE NOT NULL, first_name, last_name, created_at, updated_at)`
- `service_centers(id uuid PK, code text UNIQUE NOT NULL, name, address, created_at)`
- `vehicles(id uuid PK, owner_id→profiles, type, plate_part1/2/letter/iran_code, UNIQUE(owner_id, plate_part1, plate_part2, plate_letter, plate_iran_code), created_at)` + index on `owner_id`
- `booking_days(id uuid PK, center_id→service_centers ON DELETE CASCADE, weekday, date text, UNIQUE(center_id, date))` + index on `center_id`
- `time_slots(id uuid PK, day_id→booking_days ON DELETE CASCADE, time text, status TEXT CHECK IN (available,closed,reserved) DEFAULT available, UNIQUE(day_id, time))` + index on `day_id`
- `appointments(id uuid PK, user_id→profiles, center_id→service_centers, vehicle_id→vehicles, slot_id→time_slots UNIQUE, date text, time text, status CHECK IN (pending,done,cancelled) DEFAULT pending, created_at)` + indexes on `(user_id, created_at DESC)`, `center_id`
- `invoices(id uuid PK, appointment_id→appointments UNIQUE, tracking_code UNIQUE, customer_first/last_name, customer_mobile, vehicle_type, plate_* (4 cols), service_center_name, date_time text, mileage_km/next_mileage_km int CHECK ≥0, oil_type, total_rial bigint CHECK ≥0, created_at)`
- `invoice_items(id uuid PK, invoice_id→invoices ON DELETE CASCADE, title, amount_rial bigint CHECK ≥0)` + index on `invoice_id`

## 5. Conflict-prevention strategy (authoritative layer)

`reserve` must be atomic. Enforced in SQL (Phase 7), not just UI:

1. `UNIQUE(time_slots.day_id, time)` — one row per slot; `UNIQUE(appointments.slot_id)` — one booking per slot.
2. Reservation runs in a single transaction: lock the slot row (`SELECT … FOR UPDATE`), proceed only if `status = 'available'`, set it to `'reserved'`, insert the `pending` appointment. Conditional-update failure or unique violation → user-facing “unavailable” error.
3. Concurrent attempts serialize on the row lock; the loser gets a conflict, never a double booking.

## 6. Status lifecycle (as evidenced)

`pending → done | cancelled`. The user app only reads status; no transition is triggered by any evidenced screen. Transition authority and any re-booking-after-cancel policy belong to the service side (out of scope for the user app).

## 7. Assumptions and unresolved items (do NOT treat as decided)

1. Day/slot rows are stored (not generated). Generation/rollover rules (holidays, working hours, capacity) are unevidenced — confirm before building any generator.
2. Invoice/price source (who creates invoices, price lists) is unevidenced — service-side concern.
3. Re-booking a slot whose appointment was `cancelled` is undecided (current `UNIQUE(slot_id)` blocks it; revisit when a cancel flow exists).
4. Seed data (demo center `1001`, demo user) exists only in mocks; real seed strategy TBD, non-destructive.
5. Migrations authored but NOT applied anywhere (no Supabase project yet); engine-level verification still blocked — see Phase 4 report.

## 8. RLS implementation (Phase 4)

Implemented in `supabase/migrations/20261012000001_rls_policies.sql` (applies after the core schema; NOT applied anywhere yet):

- `ENABLE ROW LEVEL SECURITY` on all 8 tables; explicit `REVOKE ALL` + minimal `GRANT`s per table (policies alone do not grant access).
- Owners-only access via `auth.uid()` on `profiles` (read + first/last-name update only — mobile immutable), `vehicles` (full CRUD own), `appointments` (select + insert own; no user update/delete — no cancel UI evidenced).
- Public (anon + authenticated) read on centers/days/slots — matches the unguarded home/center routes.
- Invoices/items: owner read through appointment ownership; no user writes.
- `handle_new_user()` trigger (`SECURITY DEFINER`, locked `search_path`, `EXECUTE` revoked) auto-creates `profiles` on signup; no user-side `INSERT` grant, so forged profiles are impossible. Phone-only assumption documented in the migration.
- Deferred to Phase 7: atomic `reserve` transaction/RPC (slot lock + conditional update) and any status-transition enforcement. `UNIQUE(slot_id)` already blocks double booking at the constraint level.

## 9. Atomic reservation + time and validation notes (Phase 7)

- Implemented in `supabase/migrations/20261012000002_reserve_rpc.sql`: `reserve_appointment(...)` (`SECURITY DEFINER`, locked `search_path`, `EXECUTE` for authenticated only) locks the slot (`FOR UPDATE`), verifies availability/refs/vehicle ownership via `auth.uid()`, marks it reserved, and inserts the `pending` appointment in one transaction. Same Persian UI error strings. `SupabaseBookingGateway.reserve` now calls the RPC and reads back the row.
- Timezones: booking dates/times are Jalali display `TEXT` passed through verbatim — no conversion exists or is needed. `created_at` is system UTC metadata, never displayed as booking time.
- Validation split (unchanged): frontend validates formats/completeness (mobile pattern, full plate, required names); the database enforces FKs, `UNIQUE`, `CHECK`s, ownership, and the RPC preconditions.
