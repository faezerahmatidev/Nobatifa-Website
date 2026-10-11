import type { Router } from '@angular/router';
import { MockAppointmentsGateway } from '../../data-access/mock/mock-appointments-gateway';
import { MockDatabase } from '../../data-access/mock/mock-database';
import { AppointmentsFacade } from './appointments-facade';

const navigated: string[][] = [];
const router = {
  navigate: (commands: string[]) => {
    navigated.push(commands);
    return Promise.resolve(true);
  },
} as unknown as Router;

describe('AppointmentsFacade', () => {
  it('loads appointments with all statuses', async () => {
    const facade = new AppointmentsFacade(new MockAppointmentsGateway(new MockDatabase()), router);
    await facade.load();
    expect(facade.state()).toBe('ready');
    expect(facade.appointments().length).toBe(3);
  });

  it('navigates to the invoice page', () => {
    navigated.length = 0;
    const facade = new AppointmentsFacade(new MockAppointmentsGateway(new MockDatabase()), router);
    facade.goToInvoice('inv1');
    expect(navigated).toEqual([[ '/profile/invoice', 'inv1' ]]);
  });
});
