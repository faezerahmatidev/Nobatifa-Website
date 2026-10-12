# Nobatifa Backend — Progress Tracker

This file tracks the 9-phase backend implementation. Updated at the end of each phase.

| Phase | Title | Status | Date (UTC) | Notes |
| ----- | ----- | ------ | ---------- | ----- |
| 1 | Discovery and Current-State Audit | Completed | 2026-10-12 | Read-only audit; created `backend-progress.md` + `backend-implementation.md`. No source changes. |
| 2 | Data Model and Database Design | Completed | 2026-10-12 | Created `docs/database.md` + `supabase/migrations/20261012000000_core_schema.sql` (tables/keys/indexes; RLS deferred to Phase 4; not applied anywhere). |
| 3 | Supabase Integration Foundation | Completed | 2026-10-12 | Client + envs + provider + `.env.example` + setup docs. Live verification blocked: no Supabase project URL/key yet. `ng build` has a PRE-EXISTING prerender failure (`center/:code`, proven on clean tree) — not caused by this phase. |
| 4 | Database Migrations and Security | Completed | 2026-10-12 | `20261012000001_rls_policies.sql`: RLS on 8 tables + least-privilege GRANTs/policies + `handle_new_user` trigger. Secret scan clean. NOT applied anywhere (no live project); engine-level test blocked accordingly. |
| 5 | Authentication and Authorization Integration | Completed | 2026-10-12 | `SupabaseAuthGateway` (phone OTP, E.164, profile completion, session, logout) + 8 unit tests with faked client (no network). Mocks stay wired by default; UI/guards untouched; RLS remains the enforcement layer. Live OTP blocked: no Supabase project/SMS provider yet. |
| 6 | Angular Data Access and API Integration | Completed | 2026-10-12 | Real `Supabase*Gateway` for booking/appointments/cars/invoices behind existing ports (same UI error strings, typed row mapping, owner scoping, PGRST116 handling) + 12 unit tests with faked client. Mocks stay wired; no UI changes. Live calls blocked: no project. Atomic `reserve` RPC deferred to Phase 7 (documented limitation in code). |
| 7 | Booking and Business Logic | Completed | 2026-10-12 | Atomic `reserve_appointment` RPC migration + gateway switched to rpc-then-read; same UI errors; concurrency via row lock; no user status transitions evidenced (display-only). NOT applied anywhere (no live project). |
| 8 | Tests and Quality Assurance | Completed | 2026-10-12 | tsc app+spec clean; lint green; 50 files/143 tests green (+4: rpc-miss, bad status, error passthrough, numeric coercion). `ng build` still fails ONLY on the pre-existing prerender error (unchanged). Engine-dependent tests (migrations, RLS, conflicts, live OTP) blocked: no live project. |
| 9 | Documentation, CI, and Final Audit | Completed | 2026-10-12 | README backend + known-issues sections; CI left as-is (lint/test/build appropriate); final diff + secret scan clean; no admin repo; live wiring + prerender fix remain manual. |

## Live onboarding (post-Phase 9, in progress)

- [x] Supabase project created (`nobatifa-website`, eu-central-1, healthy)
- [x] Supabase CLI installed (`2.120.0`)
- [x] Dev seed migration authored (`20261012000003_dev_seed.sql`, idempotent)
- [x] Dev `environment.ts` wired with URL + publishable key (public-safe values)
- [ ] `supabase link` + `supabase db push` (needs DB password — user runs locally)
- [ ] Live verification via public REST reads + RLS denial checks
- [ ] SMS provider for real phone OTP (paid/region-dependent — likely blocked)
- [ ] Switch default providers from mocks to Supabase gateways (after OTP works)

## Rules in force for all phases

- Exactly ONE phase per execution; stop and wait for explicit instruction.
- Existing repo only (`Nobatifa-Website.git`, branch `main`); no new repos, no monorepo, no Admin Dashboard.
- No push and no deploy without explicit authorization.
- No destructive Git operations; preserve uncommitted user work.
- Never commit secrets; `service_role` keys never enter browser code.
- Working tree was clean at Phase 1 start (HEAD `adaa156`).
