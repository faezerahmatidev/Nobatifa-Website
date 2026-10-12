/**
 * Development environment values.
 * Real Supabase credentials MUST NOT be committed here.
 * Copy `.env.example` guidance: keep local values in your own untracked
 * `environment.local.ts` (see README in this folder) or inject them at
 * build time; production values come from `environment.production.ts`
 * via `fileReplacements` (safe values only — publishable key, never secrets).
 */
export const environment = {
  production: false,
  supabaseUrl: '',
  supabasePublishableKey: '',
};
