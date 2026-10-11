import type { Router } from '@angular/router';
import type { Session } from '../../core/services/session';
import { MockAuthGateway } from '../../data-access/mock/mock-auth-gateway';
import { MockBookingGateway } from '../../data-access/mock/mock-booking-gateway';
import { MockCarsGateway } from '../../data-access/mock/mock-cars-gateway';
import { MockDatabase } from '../../data-access/mock/mock-database';
import { BookingFacade } from './booking-facade';

const router = { navigate: () => Promise.resolve(true) } as unknown as Router;
const session = { refresh: () => Promise.resolve() } as unknown as Session;

function setup(): BookingFacade {
  const db = new MockDatabase();
  return new BookingFacade(
    new MockBookingGateway(db),
    new MockAuthGateway(db),
    new MockCarsGateway(db),
    router,
    session,
  );
}

describe('BookingFacade', () => {
  it('searches a center and loads days and slots', async () => {
    const facade = setup();
    facade.code.setValue('1001');
    await facade.search();
    expect(facade.center()?.name).toBe('اتوسرویس محمد');
    expect(facade.days().length).toBe(13);
    expect(facade.slotsState()).toBe('ready');
    expect(facade.slots().length).toBeGreaterThan(0);
  });

  it('shows an error for unknown codes', async () => {
    const facade = setup();
    facade.code.setValue('0000');
    await facade.search();
    expect(facade.searchError()).toBe('کد اتوسرویس یافت نشد');
    expect(facade.center()).toBeNull();
  });

  it('switches days', async () => {
    const facade = setup();
    facade.code.setValue('1001');
    await facade.search();
    const second = facade.days()[1].id;
    await facade.selectDay(second);
    expect(facade.selectedDayId()).toBe(second);
    expect(facade.slotsState()).toBe('ready');
  });

  it(
    'completes a guest reservation end to end',
    async () => {
      const facade = setup();
      facade.code.setValue('1001');
      await facade.search();
      const slot = facade.slots().find((item) => item.status === 'available');
      expect(slot).toBeDefined();
      await facade.requestReserve(slot!);
      expect(facade.authStep()).toBe('login');
      await facade.sendOtp('09120000000');
      expect(facade.authStep()).toBe('otp');
      await facade.verifyOtp('1234');
      expect(facade.authStep()).toBe('profile');
      await facade.completeProfile('تست', 'کاربر');
      expect(facade.authStep()).toBeNull();
      expect(facade.carModalOpen()).toBe(true);
      expect(facade.cars().length).toBeGreaterThan(0);
      facade.selectedCarId.set(facade.cars()[0].id);
      await facade.confirmReserve();
      expect(facade.reservation()?.status).toBe('pending');
      expect(facade.carModalOpen()).toBe(false);
    },
    15000,
  );

  it('adds a new car and selects it', async () => {
    const facade = setup();
    await facade.loadCars();
    const before = facade.cars().length;
    await facade.addCar('پراید', { part1: '11', part2: '365', letter: 'س', iranCode: '45' });
    expect(facade.cars().length).toBe(before + 1);
    expect(facade.selectedCarId()).toBe(facade.cars()[facade.cars().length - 1].id);
  });

  it(
    'logs in an existing user without opening the car modal',
    async () => {
      const facade = setup();
      facade.openLogin();
      expect(facade.authStep()).toBe('login');
      await facade.sendOtp('09128573449');
      expect(facade.authStep()).toBe('otp');
      await facade.verifyOtp('1234');
      expect(facade.authStep()).toBeNull();
      expect(facade.carModalOpen()).toBe(false);
    },
    15000,
  );
});
