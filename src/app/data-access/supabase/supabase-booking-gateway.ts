import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import type {
  Appointment,
  AppointmentStatus,
  BookingDay,
  ServiceCenter,
  SlotStatus,
  TimeSlot,
  Vehicle,
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
  center_id: string;
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

function toCenter(row: CenterRow): ServiceCenter {
  return { id: row.id, code: row.code, name: row.name, address: row.address ?? '' };
}

function toVehicle(row: VehicleRow): Vehicle {
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

/**
 * Real `BookingGateway` over Supabase tables.
 * Mirrors mock behavior and UI error strings; row locking for `reserve`
 * is intentionally left to Phase 7 (atomic RPC) — see method note.
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
            .select('id, center_id, weekday, date')
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
    return this.currentUserId().pipe(
      switchMap((userId) =>
        forkJoin({
          userId: of(userId),
          slot: this.claimSlot(slotId),
          refs: this.loadReserveRefs(centerId, dayId, vehicleId),
        }),
      ),
      switchMap(({ userId, slot, refs }) =>
        from(
          this.supabase
            .from('appointments')
            .insert({
              user_id: userId,
              center_id: refs.center.id,
              vehicle_id: refs.vehicle.id,
              slot_id: slot.id,
              date: refs.day.date,
              time: slot.time,
            })
            .select(
              'id, date, time, status, ' +
                'service_centers(id, code, name, address), ' +
                'vehicles(id, type, plate_part1, plate_part2, plate_letter, plate_iran_code)',
            )
            .single(),
        ),
      ),
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        const row = data as unknown as AppointmentRow;
        return {
          id: row.id,
          serviceCenter: toCenter(row.service_centers),
          date: row.date,
          time: row.time,
          vehicle: toVehicle(row.vehicles),
          status: toAppointmentStatus(row.status),
        };
      }),
    );
  }

  /**
   * Best-effort claim: marks the slot reserved only when still available.
   * NOT fully atomic (claim + insert are separate round trips; a failed
   * insert can orphan a reserved slot). Phase 7 replaces this with a
   * single-transaction RPC: lock slot → conditional update → insert.
   */
  private claimSlot(slotId: string): Observable<SlotRow> {
    return from(
      this.supabase
        .from('time_slots')
        .update({ status: 'reserved' })
        .eq('id', slotId)
        .eq('status', 'available')
        .select('id, day_id, time, status')
        .maybeSingle(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('این ساعت قابل رزرو نیست');
        }
        return data as unknown as SlotRow;
      }),
    );
  }

  private loadReserveRefs(
    centerId: string,
    dayId: string,
    vehicleId: string,
  ): Observable<{ center: CenterRow; day: DayRow; vehicle: VehicleRow }> {
    return forkJoin({
      center: from(
        this.supabase
          .from('service_centers')
          .select('id, code, name, address')
          .eq('id', centerId)
          .maybeSingle(),
      ),
      day: from(
        this.supabase
          .from('booking_days')
          .select('id, center_id, weekday, date')
          .eq('id', dayId)
          .maybeSingle(),
      ),
      vehicle: from(
        this.supabase
          .from('vehicles')
          .select('id, type, plate_part1, plate_part2, plate_letter, plate_iran_code')
          .eq('id', vehicleId)
          .maybeSingle(),
      ),
    }).pipe(
      map(({ center, day, vehicle }) => {
        if (center.error || day.error || vehicle.error) {
          throw new Error(
            center.error?.message ?? day.error?.message ?? vehicle.error?.message ?? 'خطایی رخ داد',
          );
        }
        if (!center.data || !day.data || !vehicle.data) {
          throw new Error('اطلاعات رزرو معتبر نیست');
        }
        return {
          center: center.data as unknown as CenterRow,
          day: day.data as unknown as DayRow,
          vehicle: vehicle.data as unknown as VehicleRow,
        };
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

  private currentUserId(): Observable<string> {
    return from(this.supabase.auth.getUser()).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        const id = data.user?.id;
        if (!id) {
          throw new Error('ابتدا وارد شوید');
        }
        return id;
      }),
    );
  }
}

export const SUPABASE_BOOKING_PROVIDER = {
  provide: BOOKING_GATEWAY,
  useClass: SupabaseBookingGateway,
};
