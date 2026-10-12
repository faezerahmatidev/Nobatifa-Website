import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable, switchMap, throwError } from 'rxjs';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import type { PlateNumber, Vehicle } from '../models';
import { CARS_GATEWAY, type CarsGateway } from '../ports/cars-gateway';

interface VehicleRow {
  id: string;
  owner_id: string;
  type: string;
  plate_part1: string;
  plate_part2: string;
  plate_letter: string;
  plate_iran_code: string;
}

const COLUMNS = 'id, owner_id, type, plate_part1, plate_part2, plate_letter, plate_iran_code';

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

function isComplete(type: string, plate: PlateNumber): boolean {
  return Boolean(type.trim() && plate.part1 && plate.part2 && plate.letter && plate.iranCode);
}

function isNoRows(error: { code?: string } | null): boolean {
  return error?.code === 'PGRST116';
}

/** Real `CarsGateway`: owner-scoped CRUD with the same UI error strings. */
@Injectable()
export class SupabaseCarsGateway implements CarsGateway {
  private readonly supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  list(): Observable<Vehicle[]> {
    return this.currentUserId().pipe(
      switchMap((ownerId) =>
        from(
          this.supabase.from('vehicles').select(COLUMNS).eq('owner_id', ownerId).order('created_at'),
        ),
      ),
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return ((data ?? []) as unknown as VehicleRow[]).map(toVehicle);
      }),
    );
  }

  create(type: string, plate: PlateNumber): Observable<Vehicle> {
    if (!isComplete(type, plate)) {
      return throwError(() => new Error('اطلاعات خودرو کامل نیست'));
    }
    return this.currentUserId().pipe(
      switchMap((ownerId) =>
        from(
          this.supabase
            .from('vehicles')
            .insert({
              owner_id: ownerId,
              type: type.trim(),
              plate_part1: plate.part1,
              plate_part2: plate.part2,
              plate_letter: plate.letter,
              plate_iran_code: plate.iranCode,
            })
            .select(COLUMNS)
            .single(),
        ),
      ),
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return toVehicle(data as unknown as VehicleRow);
      }),
    );
  }

  update(id: string, type: string, plate: PlateNumber): Observable<Vehicle> {
    if (!isComplete(type, plate)) {
      return throwError(() => new Error('اطلاعات خودرو کامل نیست'));
    }
    return this.currentUserId().pipe(
      switchMap((ownerId) =>
        from(
          this.supabase
            .from('vehicles')
            .update({
              type: type.trim(),
              plate_part1: plate.part1,
              plate_part2: plate.part2,
              plate_letter: plate.letter,
              plate_iran_code: plate.iranCode,
            })
            .eq('id', id)
            .eq('owner_id', ownerId)
            .select(COLUMNS)
            .single(),
        ),
      ),
      map(({ data, error }) => {
        if (isNoRows(error)) {
          throw new Error('خودرو یافت نشد');
        }
        if (error) {
          throw new Error(error.message);
        }
        return toVehicle(data as unknown as VehicleRow);
      }),
    );
  }

  remove(id: string): Observable<void> {
    return this.currentUserId().pipe(
      switchMap((ownerId) =>
        from(
          this.supabase
            .from('vehicles')
            .delete()
            .eq('id', id)
            .eq('owner_id', ownerId)
            .select('id'),
        ),
      ),
      map(({ data, error }) => {
        // A no-rows delete reports PGRST116 on some clients; normalize it
        // to an empty result so only genuine failures surface as errors.
        if (error && !isNoRows(error)) {
          throw new Error(error.message);
        }
        const rows = (data ?? []) as unknown[];
        if (rows.length === 0) {
          throw new Error('خودرو یافت نشد');
        }
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

export const SUPABASE_CARS_PROVIDER = { provide: CARS_GATEWAY, useClass: SupabaseCarsGateway };
