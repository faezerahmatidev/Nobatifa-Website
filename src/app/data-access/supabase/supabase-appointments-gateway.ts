import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable, switchMap } from 'rxjs';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import type { Appointment, AppointmentStatus } from '../models';
import {
  APPOINTMENTS_GATEWAY,
  type AppointmentsGateway,
} from '../ports/appointments-gateway';

interface AppointmentRow {
  id: string;
  date: string;
  time: string;
  status: string;
  service_centers: {
    id: string;
    code: string;
    name: string;
    address: string | null;
  };
  vehicles: {
    id: string;
    type: string;
    plate_part1: string;
    plate_part2: string;
    plate_letter: string;
    plate_iran_code: string;
  };
}

function toStatus(value: string): AppointmentStatus {
  if (value === 'pending' || value === 'done' || value === 'cancelled') {
    return value;
  }
  throw new Error('وضعیت نوبت معتبر نیست');
}

/** Real `AppointmentsGateway`: current user's bookings, newest first. */
@Injectable()
export class SupabaseAppointmentsGateway implements AppointmentsGateway {
  private readonly supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  list(): Observable<Appointment[]> {
    return from(this.supabase.auth.getUser()).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        const id = data.user?.id;
        if (!id) {
          throw new Error('ابتدا وارد شوید');
        }
        return from(
          this.supabase
            .from('appointments')
            .select(
              'id, date, time, status, ' +
                'service_centers(id, code, name, address), ' +
                'vehicles(id, type, plate_part1, plate_part2, plate_letter, plate_iran_code)',
            )
            .eq('user_id', id)
            .order('created_at', { ascending: false }),
        );
      }),
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return ((data ?? []) as unknown as AppointmentRow[]).map((row) => ({
          id: row.id,
          serviceCenter: {
            id: row.service_centers.id,
            code: row.service_centers.code,
            name: row.service_centers.name,
            address: row.service_centers.address ?? '',
          },
          date: row.date,
          time: row.time,
          vehicle: {
            id: row.vehicles.id,
            type: row.vehicles.type,
            plate: {
              part1: row.vehicles.plate_part1,
              part2: row.vehicles.plate_part2,
              letter: row.vehicles.plate_letter,
              iranCode: row.vehicles.plate_iran_code,
            },
          },
          status: toStatus(row.status),
        }));
      }),
    );
  }
}

export const SUPABASE_APPOINTMENTS_PROVIDER = {
  provide: APPOINTMENTS_GATEWAY,
  useClass: SupabaseAppointmentsGateway,
};
