import { Injectable } from '@angular/core';
import { delay, of, throwError, type Observable } from 'rxjs';
import type {
  Appointment,
  AuthSession,
  ServiceCenter,
  TimeSlot,
  User,
  Vehicle,
} from '../models';
import { MOCK_APPOINTMENTS } from '../mock-data/appointments';
import { MOCK_DAYS, MOCK_SLOTS_BY_DAY, type MockBookingDay } from '../mock-data/booking';
import { MOCK_CENTERS } from '../mock-data/service-centers';
import { MOCK_USERS } from '../mock-data/users';
import { MOCK_VEHICLES } from '../mock-data/vehicles';

export const MOCK_LATENCY_MS = 150;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneArray<T>(items: readonly T[]): T[] {
  return JSON.parse(JSON.stringify(items)) as T[];
}

/** In-memory store seeded from mock-data. Call reset() to restore fixtures. */
@Injectable({ providedIn: 'root' })
export class MockDatabase {
  users: User[] = [];
  centers: ServiceCenter[] = [];
  days: MockBookingDay[] = [];
  slotsByDay: Record<string, TimeSlot[]> = {};
  vehicles: Vehicle[] = [];
  appointments: Appointment[] = [];
  session: AuthSession | null = null;
  pendingMobile: string | null = null;
  lastOtp: string | null = null;
  private vehicleSeq = 0;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.users = cloneArray(MOCK_USERS);
    this.centers = cloneArray(MOCK_CENTERS);
    this.days = cloneArray(MOCK_DAYS);
    this.slotsByDay = clone(MOCK_SLOTS_BY_DAY);
    this.vehicles = cloneArray(MOCK_VEHICLES);
    this.appointments = cloneArray(MOCK_APPOINTMENTS);
    this.session = null;
    this.pendingMobile = null;
    this.lastOtp = null;
    this.vehicleSeq = this.vehicles.length;
  }

  nextVehicleId(): string {
    this.vehicleSeq += 1;
    return `v-mock-${this.vehicleSeq}`;
  }
}

export function respond<T>(value: T): Observable<T> {
  return of(value).pipe(delay(MOCK_LATENCY_MS));
}

export function fail(message: string): Observable<never> {
  return throwError(() => new Error(message)).pipe(delay(MOCK_LATENCY_MS));
}
