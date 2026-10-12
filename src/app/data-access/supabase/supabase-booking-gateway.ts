import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable, switchMap } from 'rxjs';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import type {
  Appointment,
  AppointmentStatus,
  BookingDay,
  ServiceCenter,
  SlotStatus,
  TimeSlot,
} from '../models';
import { BOOKING_GATEWAY, type BookingGateway } from '../ports/booking-gateway';

interface CenterRow {
  id: string;
  code: string;
  name: string;
  address: string | null;
}

interface DayRow {
  id: string;
  weekday: string;
  date: string;
}

interface SlotRow {
  id: string;
  day_id: string;
  time: string;
  status: string;
}

interface VehicleRow {
  id: string;
  type: string;
  plate_part1: string;
  plate_part2: string;
  plate_letter: string;
  plate_iran_code: string;
}

interface AppointmentRow {
  id: string;
  date: string;
  time: string;
  status: string;
  service_centers: CenterRow;
  vehicles: VehicleRow;
}

const APPOINTMENT_COLUMNS =
  'id, date, time, status, ' +
  'service_centers(id, code, name, address), ' +
  'vehicles(id, type, plate_part1, plate_part2, plate_letter, plate_iran_code)';

function toCenter(row: CenterRow): ServiceCenter {
  return { id: row.id, code: row.code, name: row.name, address: row.address ?? '' };
}

function toVehicle(row: VehicleRow): {
  id: string;
  type: string;
  plate: { part1: string; part2: string; letter: string; iranCode: string };
} {
  return {
    id: row.id,
    type: row.type,
    plate: {
      part1: row.plate_part1,
      part2: row.plate_part2,
      letter: row.plate_letter,
      iranCode: row.plate_iran_code,
    },
  };
}

function toSlotStatus(value: string): SlotStatus {
  if (value === 'available' || value === 'closed' || value === 'reserved') {
    return value;
  }
  throw new Error('وضعیت ساعت معتبر نیست');
}

function toAppointmentStatus(value: string): AppointmentStatus {
  if (value === 'pending' || value === 'done' || value === 'cancelled') {
    return value;
  }
  throw new Error('وضعیت نوبت معتبر نیست');
}

function toAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    serviceCenter: toCenter(row.service_centers),
    date: row.date,
    time: row.time,
    vehicle: toVehicle(row.vehicles),
    status: toAppointmentStatus(row.status),
  };
}

/**
 * Real `BookingGateway` over Supabase tables.
 * `reserve` runs entirely inside the `reserve_appointment` transaction
 * (row lock + ownership checks + insert); the gateway only forwards the
 * call and reads back the created row for the UI model.
 */
@Injectable()
export class SupabaseBookingGateway implements BookingGateway {
  private readonly supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  searchCenter(code: string): Observable<ServiceCenter> {
    return from(
      this.supabase
        .from('service_centers')
        .select('id, code, name, address')
        .eq('code', code.trim())
        .maybeSingle(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('کد اتوسرویس یافت نشد');
        }
        return toCenter(data as unknown as CenterRow);
      }),
    );
  }

  getDays(centerId: string): Observable<BookingDay[]> {
    return this.requireCenter(centerId).pipe(
      switchMap(() =>
        from(
          this.supabase
            .from('booking_days')
            .select('id, weekday, date')
            .eq('center_id', centerId)
            .order('date'),
        ),
      ),
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return ((data ?? []) as unknown as DayRow[]).map((day) => ({
          id: day.id,
          weekday: day.weekday,
          date: day.date,
        }));
      }),
    );
  }

  getSlots(centerId: string, dayId: string): Observable<TimeSlot[]> {
    return this.requireCenter(centerId).pipe(
      switchMap(() =>
        from(
          this.supabase
            .from('booking_days')
            .select('id')
            .eq('id', dayId)
            .eq('center_id', centerId)
            .maybeSingle(),
        ),
      ),
      switchMap(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('روز انتخاب‌شده معتبر نیست');
        }
        return from(
          this.supabase
            .from('time_slots')
            .select('id, day_id, time, status')
            .eq('day_id', dayId)
            .order('time'),
        );
      }),
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return ((data ?? []) as unknown as SlotRow[]).map((slot) => ({
          id: slot.id,
          date: '',
          time: slot.time,
          status: toSlotStatus(slot.status),
        }));
      }),
    );
  }

  reserve(
    centerId: string,
    dayId: string,
    slotId: string,
    vehicleId: string,
  ): Observable<Appointment> {
    return from(
      this.supabase.rpc('reserve_appointment', {
        p_center_id: centerId,
        p_day_id: dayId,
        p_slot_id: slotId,
        p_vehicle_id: vehicleId,
      }),
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        const id = data as unknown as string | null;
        if (!id) {
          throw new Error('رزرو ناموفق بود');
        }
        return from(
          this.supabase
            .from('appointments')
            .select(APPOINTMENT_COLUMNS)
            .eq('id', id)
            .maybeSingle(),
        );
      }),
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('رزرو ناموفق بود');
        }
        return toAppointment(data as unknown as AppointmentRow);
      }),
    );
  }

  private requireCenter(centerId: string): Observable<CenterRow> {
    return from(
      this.supabase
        .from('service_centers')
        .select('id, code, name, address')
        .eq('id', centerId)
        .maybeSingle(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('اتوسرویس یافت نشد');
        }
        return data as unknown as CenterRow;
      }),
    );
  }
}

export const SUPABASE_BOOKING_PROVIDER = {
  provide: BOOKING_GATEWAY,
  useClass: SupabaseBookingGateway,
};
