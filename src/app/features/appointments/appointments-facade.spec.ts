import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { AppointmentsFacade } from './appointments-facade';

const navigated: string[][] = [];

function setup(): AppointmentsFacade {
  TestBed.configureTestingModule({
    providers: [
      AppointmentsFacade,
      ...provideMockDataAccess(),
      {
        provide: Router,
        useValue: {
          navigate: (commands: string[]) => {
            navigated.push(commands);
            return Promise.resolve(true);
          },
        },
      },
    ],
  });
  return TestBed.inject(AppointmentsFacade);
}

describe('AppointmentsFacade', () => {
  it('loads appointments with all statuses', async () => {
    const facade = setup();
    await facade.load();
    expect(facade.state()).toBe('ready');
    expect(facade.appointments().length).toBe(3);
  });

  it('navigates to the invoice page', () => {
    navigated.length = 0;
    const facade = setup();
    facade.goToInvoice('inv1');
    expect(navigated).toEqual([['/profile/invoice', 'inv1']]);
  });
});
