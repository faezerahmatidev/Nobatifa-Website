import type { Provider } from '@angular/core';
import { MOCK_APPOINTMENTS_PROVIDER } from './mock-appointments-gateway';
import { MOCK_AUTH_PROVIDER } from './mock-auth-gateway';
import { MOCK_BOOKING_PROVIDER } from './mock-booking-gateway';
import { MOCK_CARS_PROVIDER } from './mock-cars-gateway';
import { MOCK_INVOICES_PROVIDER } from './mock-invoices-gateway';

/**
 * Swapping the mock backend with a real API only requires
 * replacing these providers. UI stays untouched.
 */
export function provideMockDataAccess(): Provider[] {
  return [
    MOCK_APPOINTMENTS_PROVIDER,
    MOCK_AUTH_PROVIDER,
    MOCK_BOOKING_PROVIDER,
    MOCK_CARS_PROVIDER,
    MOCK_INVOICES_PROVIDER,
  ];
}
