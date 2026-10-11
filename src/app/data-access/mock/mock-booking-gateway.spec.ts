import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { BOOKING_GATEWAY, type BookingGateway } from '../ports/booking-gateway';
import { provideMockDataAccess } from './provide-mock-data-access';

function setup(): BookingGateway {
  TestBed.configureTestingModule({ providers: [...provideMockDataAccess()] });
  return TestBed.inject(BOOKING_GATEWAY);
}

describe('MockBookingGateway', () => {
  it('finds a center by code and loads its days', async () => {
    const gateway = setup();
    const center = await firstValueFrom(gateway.searchCenter('1001'));
    expect(center.name).toBe('اتوسرویس محمد');
    const days = await firstValueFrom(gateway.getDays(center.id));
    expect(days.length).toBe(14);
  });

  it('rejects unknown center codes', async () => {
    const gateway = setup();
    await expect(firstValueFrom(gateway.searchCenter('0000'))).rejects.toThrow(
      'کد اتوسرویس یافت نشد',
    );
  });

  it('reserves an available slot and marks it reserved', async () => {
    const gateway = setup();
    const before = await firstValueFrom(gateway.getSlots('c1', 'day-01'));
    const slot = before.find((item) => item.status === 'available');
    expect(slot).toBeDefined();
    const appointment = await firstValueFrom(gateway.reserve('c1', 'day-01', slot!.id, 'v1'));
    expect(appointment.status).toBe('pending');
    const after = await firstValueFrom(gateway.getSlots('c1', 'day-01'));
    expect(after.find((item) => item.id === slot!.id)?.status).toBe('reserved');
  });

  it('rejects reserving a closed slot', async () => {
    const gateway = setup();
    const slots = await firstValueFrom(gateway.getSlots('c1', 'day-01'));
    const closed = slots.find((item) => item.status === 'closed');
    expect(closed).toBeDefined();
    await expect(
      firstValueFrom(gateway.reserve('c1', 'day-01', closed!.id, 'v1')),
    ).rejects.toThrow('این ساعت قابل رزرو نیست');
  });
});
