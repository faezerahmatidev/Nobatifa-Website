# Supabase Setup (Phase 3 — foundation)

No live Supabase project is connected yet. Everything below that needs one
is marked; local file preparation is complete without it.

## 1. What is already wired

- Dependency: `@supabase/supabase-js` (v2) in `package.json`.
- Central client: `src/app/core/backend/supabase-client.ts` (`SUPABASE_CLIENT`
  token, fail-fast factory). Registered in `app.config.ts`; nothing consumes it yet.
- Environments: `src/environments/environment.ts` (dev) and
  `environment.production.ts` (used via `angular.json` `fileReplacements`).
- Templates: `.env.example` (CLI/local tooling only). `.gitignore` covers
  `.env*` secrets and Supabase CLI local state.

## 2. Remaining prerequisite: create the hosted project (single manual step)

1. Log in at https://supabase.com/dashboard and create a new project (free tier is enough).
2. Open Project Settings → Data API and copy:
   - Project URL (`https://xyzcompany.supabase.co`)
   - `publishable` (anon) key — public, browser-safe.
3. Do NOT copy the `service_role` key into any app file. It stays local-only
   (see `.env.example`) for migrations/admin tasks.

## 3. Connect locally (after step 2)

- Fill `supabaseUrl` / `supabasePublishableKey` in `src/environments/environment.ts`
  for local development (values are public, but prefer keeping real project URLs
  out of commits; production values go through the normal release process).
- Optional CLI (later phases): install Supabase CLI, then
  `supabase link --project-ref <ref>` and `supabase db push` to apply
  `supabase/migrations/`. CLI + local database are NOT required for Phase 3 —
  Docker is intentionally not installed.

## 4. Security rules (enforced from here on)

- Browser code uses the publishable key only (`supabase-client.ts` comment + factory).
- `service_role`, DB passwords: local/admin use only, never committed.
- RLS + policies land in Phase 4 before any user data flows.
