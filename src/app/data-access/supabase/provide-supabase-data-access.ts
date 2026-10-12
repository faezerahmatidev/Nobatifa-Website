import type { Provider } from '@angular/core';
import { SUPABASE_APPOINTMENTS_PROVIDER } from './supabase-appointments-gateway';
import { SUPABASE_AUTH_PROVIDER } from './supabase-auth-gateway';
import { SUPABASE_BOOKING_PROVIDER } from './supabase-booking-gateway';
import { SUPABASE_CARS_PROVIDER } from './supabase-cars-gateway';
import { SUPABASE_INVOICES_PROVIDER } from './supabase-invoices-gateway';

/**
 * Live Supabase wiring. Replaces `provideMockDataAccess()` in `app.config.ts`
 * when the project is configured (URL + publishable key set). UI stays
 * untouched — same ports, same error strings.
 */
export function provideSupabaseDataAccess(): Provider[] {
  return [
    SUPABASE_APPOINTMENTS_PROVIDER,
    SUPABASE_AUTH_PROVIDER,
    SUPABASE_BOOKING_PROVIDER,
    SUPABASE_CARS_PROVIDER,
    SUPABASE_INVOICES_PROVIDER,
  ];
}
