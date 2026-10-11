import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Appointment, BookingDay, ServiceCenter, TimeSlot } from '../models';
import { BOOKING_GATEWAY, type BookingGateway } from '../ports/booking-gateway';
import { fail, MockDatabase, respond } from './mock-database';

@Injectable()
export class MockBookingGateway implements BookingGateway {
  private readonly db = inject(MockDatabase);

  searchCenter(code: string): Observable<ServiceCenter> {
    const center = this.db.centers.find((item) => item.code === code.trim());
    return center ? respond(center) : fail('کد اتوسرویس یافت نشد');
  }

  getDays(centerId: string): Observable<BookingDay[]> {
    if (!this.db.centers.some((item) => item.id === centerId)) {
      return fail('اتوسرویس یافت نشد');
    }
    const days = this.db.days
      .filter((day) => day.centerId === centerId)
      .map(({ centerId: _ignored, ...day }) => day);
    return respond(days);
  }

  getSlots(centerId: string, dayId: string): Observable<TimeSlot[]> {
    if (!this.db.centers.some((item) => item.id === centerId)) {
      return fail('اتوسرویس یافت نشد');
    }
    const slots = this.db.slotsByDay[dayId];
    return slots ? respond([...slots]) : fail('روز انتخاب‌شده معتبر نیست');
  }

  reserve(
    centerId: string,
    dayId: string,
    slotId: string,
    vehicleId: string,
  ): Observable<Appointment> {
    const center = this.db.centers.find((item) => item.id === centerId);
    const day = this.db.days.find((item) => item.id === dayId);
    const slot = this.db.slotsByDay[dayId]?.find((item) => item.id === slotId);
    const vehicle = this.db.vehicles.find((item) => item.id === vehicleId);
    if (!center || !day || !slot || !vehicle) {
      return fail('اطلاعات رزرو معتبر نیست');
    }
    if (slot.status !== 'available') {
      return fail('این ساعت قابل رزرو نیست');
    }
    slot.status = 'reserved';
    const appointment: Appointment = {
      id: `a-mock-${Date.now()}`,
      serviceCenter: { ...center },
      date: day.date,
      time: slot.time,
      vehicle: { ...vehicle },
      status: 'pending',
    };
    this.db.appointments.unshift(appointment);
    return respond(appointment);
  }
}

export const MOCK_BOOKING_PROVIDER = { provide: BOOKING_GATEWAY, useClass: MockBookingGateway };
