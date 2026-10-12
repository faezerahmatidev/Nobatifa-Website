# Nobatifa Backend — Implementation Plan (Phase 1, evidence-based)

Date: 2026-10-12. Status: planning only — no backend code, migrations, or installs in Phase 1.

## 1. Current state (verified)

- App: Angular 22.1 + TypeScript ~6.0 + Tailwind v4, npm (`npm@11.19.0`), SSR enabled (`outputMode: server`, `provideClientHydration`, `npm start` = `ng serve`).
- Routes: ``, `about`, `center/:code`, `profile/appointments`, `profile/cars`, `profile/invoice/:id` (guarded by `authGuard`), `** → ''`.
- Data-access rule (`src/app/data-access/README.md`): UI → `ports/` interfaces → `mock/` implementations; datasets only in `mock-data/`. Real backend = new `ports` implementations, UI untouched.
- Gateway ports (all currently mock-backed, ~150ms simulated latency):
  - `AuthGateway`: `requestOtp`, `verifyOtp → {isNewUser}`, `completeProfile`, `currentSession`, `logout`.
  - `BookingGateway`: `searchCenter`, `getDays`, `getSlots`, `reserve(centerId, dayId, slotId, vehicleId)`.
  - `AppointmentsGateway`: `list`.
  - `CarsGateway`: `list`, `create`, `update`, `remove`.
  - `InvoicesGateway`: `getByAppointmentId`.
- Domain models (`models.ts`): `User`, `PlateNumber`, `Vehicle`, `ServiceCenter`, `TimeSlot(status: available|closed|reserved)`, `BookingDay`, `Appointment(status: pending|done|cancelled)`, `Invoice` + `InvoiceItem`.
- Auth is frontend-mock: fixed OTP `1234`, demo center `1001`, demo user. No Supabase dependency, no `supabase/` config, no `.env*` files, no `docs/` before Phase 1.
- Quality: vitest (46 files / 115 tests green), `ng lint` clean, `ng build` green; CI (`.github/workflows/ci.yml`) runs `npm ci` + lint + test + build on push/PR to `main`.
- `.gitignore` already ignores `.env`, `.env.local`, `.env.*.local` and allows `.env.example` (which does not exist yet).
- SSR caveat (verified live): router navigations during SSR become HTTP redirects — auth deep-links must be SSR-safe (see `home-page.ts` browser-guarded param cleanup).

## 2. User journeys needing persistence (from UserFlow + code)

1. Login/registration: mobile → OTP → new users complete profile (name, family) → session.
2. Center search by code → day strip (14 consecutive days in mock) → slot grid → reserve with chosen vehicle.
3. Profile: appointments list (statuses), vehicles CRUD (type + Iranian plate), invoice detail per appointment.
4. Logout + guarded profile routes.

## 3. Likely database entities (Phase 2 to confirm)

`profiles` (1:1 with `auth.users`), `service_centers`, `vehicles` (owner + plate parts), `appointments` (+ status lifecycle), `invoices` + `invoice_items`. Open design point: whether days/slots are stored rows or generated from center schedule rules — decide in Phase 2 from evidence, do not invent opening hours/capacity.

## 4. Security outline (Phase 4 to implement)

- RLS on all user-data tables; ownership via `auth.uid()`; centers/days/slots readable appropriately; writes (reserve, cars, profile) owner-scoped.
- `service_role` key never in Angular; browser uses publishable key only; authoritative checks (conflict prevention, status transitions) in DB constraints/functions.

## 5. Proposed technical sequence

- Phase 3: add `@supabase/supabase-js`, central client, `.env.example`, `.gitignore` check, `supabase/migrations/` folder + local workflow docs.
- Phase 4: versioned migrations + RLS + tests (needs live project only for apply/verify, not for authoring).
- Phase 5: Supabase Auth integration preserving current UI/UserFlow.
- Phase 6: real gateway implementations behind existing `ports` (+ keep mocks separated).
- Phase 7: authoritative booking rules. Phase 8: full QA. Phase 9: docs + CI + audit.

## 6. Uncertainties / missing prerequisites (no fabrication)

1. **Supabase project**: no project URL or publishable key available → live apply/verify blocked; migration authoring and client wiring can still proceed in Phases 3–4.
2. **OTP delivery**: mock uses fixed code `1234`. Real SMS OTP needs a provider decision (Supabase Auth phone + SMS provider, cost/region implications) — product decision required in Phase 5; do not invent.
3. **Business rules**: slot generation, capacity, conflicting-booking definition, price source, appointment cancellation/transition rules are not fully evidenced — confirm in Phase 2/7, do not invent.
4. **Seed data**: demo center `1001` and demo user exist only in mocks; real seed strategy TBD (non-destructive).
