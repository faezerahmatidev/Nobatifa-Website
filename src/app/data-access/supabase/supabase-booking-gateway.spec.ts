import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import { SupabaseBookingGateway } from './supabase-booking-gateway';

type Result = { data: unknown; error: { message: string } | null };

function setup(respond: (table: string) => Result): SupabaseBookingGateway {
  const chain = (table: string) => {
    const q = {
      select: () => q,
      eq: () => q,
      order: () => q,
      update: () => q,
      insert: () => q,
      // PostgREST builders are thenable; the gateway awaits some
      // queries without a terminal single()/maybeSingle() call.
      then: (resolve: (value: Result) => void) =>
        Promise.resolve(respond(table)).then(resolve),
      single: () => Promise.resolve(respond(table)),
      maybeSingle: () => Promise.resolve(respond(table)),
    };
    return q;
  };
  const fake = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'u1' } }, error: null }),
    },
    from: (table: string) => chain(table),
  };
  TestBed.configureTestingModule({
    providers: [
      SupabaseBookingGateway,
      { provide: SUPABASE_CLIENT, useValue: fake as unknown as SupabaseClient },
    ],
  });
  return TestBed.inject(SupabaseBookingGateway);
}

const CENTER = { id: 'c1', code: '1001', name: 'اتوسرویس محمد', address: 'x' };
const DAY = { id: 'd1', center_id: 'c1', weekday: 'یکشنبه', date: '01/11' };
const SLOT = { id: 's1', day_id: 'd1', time: '13:20', status: 'available' };
const VEHICLE = {
  id: 'v1',
  type: 'پراید',
  plate_part1: '11',
  plate_part2: '365',
  plate_letter: 'س',
  plate_iran_code: '45',
};

describe('SupabaseBookingGateway', () => {
  it('finds a center by code', async () => {
    const gateway = setup(() => ({ data: CENTER, error: null }));
    await expect(firstValueFrom(gateway.searchCenter('1001'))).resolves.toEqual({
      id: 'c1',
      code: '1001',
      name: 'اتوسرویس محمد',
      address: 'x',
    });
  });

  it('reports unknown center codes', async () => {
    const gateway = setup(() => ({ data: null, error: null }));
    await expect(firstValueFrom(gateway.searchCenter('0000'))).rejects.toThrow(
      'کد اتوسرویس یافت نشد',
    );
  });

  it('loads days and slots', async () => {
    const gateway = setup((table) => {
      if (table === 'booking_days') return { data: [DAY], error: null };
      if (table === 'time_slots') return { data: [SLOT], error: null };
      return { data: CENTER, error: null };
    });
    const days = await firstValueFrom(gateway.getDays('c1'));
    expect(days).toEqual([{ id: 'd1', weekday: 'یکشنبه', date: '01/11' }]);
    const slots = await firstValueFrom(gateway.getSlots('c1', 'd1'));
    expect(slots).toEqual([{ id: 's1', date: '', time: '13:20', status: 'available' }]);
  });

  it('rejects slots of an unknown day', async () => {
    const gateway = setup((table) =>
      table === 'booking_days' ? { data: null, error: null } : { data: CENTER, error: null },
    );
    await expect(firstValueFrom(gateway.getSlots('c1', 'nope'))).rejects.toThrow(
      'روز انتخاب‌شده معتبر نیست',
    );
  });

  it('reserves an available slot as pending', async () => {
    const gateway = setup((table) => {
      if (table === 'time_slots') return { data: SLOT, error: null };
      if (table === 'vehicles') return { data: VEHICLE, error: null };
      if (table === 'booking_days') return { data: DAY, error: null };
      if (table === 'service_centers') return { data: CENTER, error: null };
      return {
        data: {
          id: 'a9',
          date: '01/11',
          time: '13:20',
          status: 'pending',
          service_centers: CENTER,
          vehicles: VEHICLE,
        },
        error: null,
      };
    });
    const appointment = await firstValueFrom(gateway.reserve('c1', 'd1', 's1', 'v1'));
    expect(appointment.status).toBe('pending');
    expect(appointment.vehicle.type).toBe('پراید');
    expect(appointment.serviceCenter.code).toBe('1001');
  });

  it('rejects already-taken slots', async () => {
    const gateway = setup((table) =>
      table === 'time_slots' ? { data: null, error: null } : { data: CENTER, error: null },
    );
    await expect(firstValueFrom(gateway.reserve('c1', 'd1', 's1', 'v1'))).rejects.toThrow(
      'این ساعت قابل رزرو نیست',
    );
  });
});
