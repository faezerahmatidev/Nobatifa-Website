import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import {
  APPOINTMENTS_GATEWAY,
  type AppointmentsGateway,
} from '../ports/appointments-gateway';
import { provideMockDataAccess } from './provide-mock-data-access';

describe('MockAppointmentsGateway', () => {
  it('lists appointments with all statuses', async () => {
    TestBed.configureTestingModule({ providers: [...provideMockDataAccess()] });
    const gateway: AppointmentsGateway = TestBed.inject(APPOINTMENTS_GATEWAY);
    const list = await firstValueFrom(gateway.list());
    expect(list.map((item) => item.status).sort()).toEqual(
      ['cancelled', 'done', 'pending'].sort(),
    );
  });
});
