import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import { SupabaseAppointmentsGateway } from './supabase-appointments-gateway';
import { SupabaseCarsGateway } from './supabase-cars-gateway';
import { SupabaseInvoicesGateway } from './supabase-invoices-gateway';

type Result = { data: unknown; error: { message: string; code?: string } | null };

function chain(
  table: string,
  respond: (table: string) => Result,
  respondOne: (table: string) => Result,
) {
  const q = {
    select: () => q,
    eq: () => q,
    order: () => q,
    update: () => q,
    insert: () => q,
    delete: () => q,
    // PostgREST builders are thenable; some gateway queries rely on it.
    then: (resolve: (value: Result) => void) => Promise.resolve(respond(table)).then(resolve),
    single: () => Promise.resolve(respondOne(table)),
    maybeSingle: () => Promise.resolve(respondOne(table)),
  };
  return q;
}

function providers(
  respond: (table: string) => Result,
  userId: string | null = 'u1',
  respondOne: (table: string) => Result = respond,
) {
  return [
    SupabaseAppointmentsGateway,
    SupabaseCarsGateway,
    SupabaseInvoicesGateway,
    {
      provide: SUPABASE_CLIENT,
      useValue: {
        auth: {
          getUser: () =>
            Promise.resolve({ data: { user: userId ? { id: userId } : null }, error: null }),
        },
        from: (table: string) => chain(table, respond, respondOne),
      } as unknown as SupabaseClient,
    },
  ];
}

const APPOINTMENT_ROW = {
  id: 'a1',
  date: '1404/01/24',
  time: '9:20',
  status: 'pending',
  service_centers: { id: 'c1', code: '1001', name: 'اتوسرویس محمد', address: 'x' },
  vehicles: {
    id: 'v1',
    type: 'پراید',
    plate_part1: '11',
    plate_part2: '365',
    plate_letter: 'س',
    plate_iran_code: '45',
  },
};

const VEHICLE_ROW = {
  id: 'v1',
  owner_id: 'u1',
  type: 'پراید',
  plate_part1: '11',
  plate_part2: '365',
  plate_letter: 'س',
  plate_iran_code: '45',
};

const INVOICE_ROW = {
  id: 'inv1',
  appointment_id: 'a2',
  tracking_code: '000085752257',
  customer_first_name: 'فائزه',
  customer_last_name: 'رحمتی',
  customer_mobile: '09227521450',
  vehicle_type: 'پراید',
  plate_part1: '11',
  plate_part2: '365',
  plate_letter: 'س',
  plate_iran_code: '45',
  service_center_name: 'اتوسرویس محمد',
  date_time: '1403/10/16، 9:50',
  mileage_km: 30000,
  next_mileage_km: 36000,
  oil_type: 'سوپر پایا 10W40',
  total_rial: 12000000,
  invoice_items: [{ title: 'تعویض روغن', amount_rial: 6500000 }],
};

const PLATE = { part1: '11', part2: '365', letter: 'س', iranCode: '45' };

describe('SupabaseAppointmentsGateway', () => {
  it('lists the current user appointments newest first', async () => {
    TestBed.configureTestingModule({ providers: providers(() => ({ data: [APPOINTMENT_ROW], error: null })) });
    const gateway = TestBed.inject(SupabaseAppointmentsGateway);
    const list = await firstValueFrom(gateway.list());
    expect(list.length).toBe(1);
    expect(list[0].vehicle.plate.letter).toBe('س');
    expect(list[0].status).toBe('pending');
  });

  it('requires login', async () => {
    TestBed.configureTestingModule({ providers: providers(() => ({ data: [], error: null }), null) });
    const gateway = TestBed.inject(SupabaseAppointmentsGateway);
    await expect(firstValueFrom(gateway.list())).rejects.toThrow('ابتدا وارد شوید');
  });
});

describe('SupabaseCarsGateway', () => {
  it('lists, creates, updates and removes own vehicles', async () => {
    TestBed.configureTestingModule({
      providers: [
        ...providers(
          () => ({ data: [VEHICLE_ROW], error: null }),
          'u1',
          () => ({ data: VEHICLE_ROW, error: null }),
        ),
      ],
    });
    const gateway = TestBed.inject(SupabaseCarsGateway);
    const list = await firstValueFrom(gateway.list());
    expect(list[0].plate.iranCode).toBe('45');
    const created = await firstValueFrom(gateway.create('پراید', PLATE));
    expect(created.type).toBe('پراید');
    const updated = await firstValueFrom(gateway.update('v1', 'کوییک', PLATE));
    expect(updated.id).toBe('v1');
    await expect(firstValueFrom(gateway.remove('v1'))).resolves.toBeUndefined();
  });

  it('rejects incomplete cars and unknown ids', async () => {
    TestBed.configureTestingModule({
      providers: [
        ...providers(
          () => ({ data: [], error: null }),
          'u1',
          () => ({ data: null, error: { message: 'none', code: 'PGRST116' } }),
        ),
      ],
    });
    const gateway = TestBed.inject(SupabaseCarsGateway);
    await expect(
      firstValueFrom(gateway.create('', { part1: '', part2: '', letter: '', iranCode: '' })),
    ).rejects.toThrow('اطلاعات خودرو کامل نیست');
    await expect(firstValueFrom(gateway.update('nope', 'پراید', PLATE))).rejects.toThrow(
      'خودرو یافت نشد',
    );
    await expect(firstValueFrom(gateway.remove('nope'))).rejects.toThrow('خودرو یافت نشد');
  });
});

describe('SupabaseInvoicesGateway', () => {
  it('reads the invoice with items and totals', async () => {
    TestBed.configureTestingModule({ providers: providers(() => ({ data: INVOICE_ROW, error: null })) });
    const gateway = TestBed.inject(SupabaseInvoicesGateway);
    const invoice = await firstValueFrom(gateway.getByAppointmentId('a2'));
    expect(invoice.trackingCode).toBe('000085752257');
    expect(invoice.totalRial).toBe(12000000);
    expect(invoice.items).toEqual([{ title: 'تعویض روغن', amountRial: 6500000 }]);
  });

  it('reports missing invoices', async () => {
    TestBed.configureTestingModule({ providers: providers(() => ({ data: null, error: null })) });
    const gateway = TestBed.inject(SupabaseInvoicesGateway);
    await expect(firstValueFrom(gateway.getByAppointmentId('nope'))).rejects.toThrow(
      'فاکتور یافت نشد',
    );
  });
});
