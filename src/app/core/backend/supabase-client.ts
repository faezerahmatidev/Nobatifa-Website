import { InjectionToken } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Central Supabase client for the browser app.
 *
 * SECURITY: this client uses ONLY the public publishable key.
 * NEVER provide `service_role` keys, database passwords, or any
 * privileged secret to this factory — they must never enter browser code.
 */
export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('SupabaseClient');

export function createSupabaseClient(): SupabaseClient {
  const url = environment.supabaseUrl.trim();
  const key = environment.supabasePublishableKey.trim();
  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set supabaseUrl and supabasePublishableKey ' +
        '(see .env.example and docs/supabase-setup.md).',
    );
  }
  return createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export const SUPABASE_CLIENT_PROVIDER = {
  provide: SUPABASE_CLIENT,
  useFactory: createSupabaseClient,
};
