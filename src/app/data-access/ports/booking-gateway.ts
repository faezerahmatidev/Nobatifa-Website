import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Appointment, BookingDay, ServiceCenter, TimeSlot } from '../models';

export interface BookingGateway {
  searchCenter(code: string): Observable<ServiceCenter>;
  getDays(centerId: string): Observable<BookingDay[]>;
  getSlots(centerId: string, dayId: string): Observable<TimeSlot[]>;
  reserve(
    centerId: string,
    dayId: string,
    slotId: string,
    vehicleId: string,
  ): Observable<Appointment>;
}

export const BOOKING_GATEWAY = new InjectionToken<BookingGateway>('BookingGateway');
